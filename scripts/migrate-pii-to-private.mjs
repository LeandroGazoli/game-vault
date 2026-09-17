/**
 * Migra `email` e `birthDate` de `users/{uid}` para `users/{uid}/private/data`.
 *
 * Por que: `users/{uid}` é `allow read: if true` (o perfil público depende disso), e em
 * Firestore `read` cobre `get` E `list` — qualquer um exportava a base inteira de e-mails e
 * datas de nascimento usando só a API key pública, que está no bundle do site.
 *
 * O código já lê do doc privado com FALLBACK para o público, então rodar isto não quebra
 * nada. É a REMOÇÃO dos campos do doc público (fase 2) que fecha de fato a exposição.
 *
 * Uso:
 *   FIREBASE_SERVICE_ACCOUNT_KEY='<json>' node scripts/migrate-pii-to-private.mjs          # simula
 *   FIREBASE_SERVICE_ACCOUNT_KEY='<json>' node scripts/migrate-pii-to-private.mjs --apply  # copia
 *   FIREBASE_SERVICE_ACCOUNT_KEY='<json>' node scripts/migrate-pii-to-private.mjs --apply --purge
 *
 * `--purge` só remove do doc público o que JÁ estiver confirmado no privado.
 * Rode sem --purge primeiro, confira o site, e só então purgue.
 *
 * Custo: 1 leitura por usuário + 1 escrita por usuário (e mais 1 escrita com --purge).
 * Atenção à cota diária do plano Spark (50k leituras / 20k escritas).
 */
import admin from "firebase-admin";

const APPLY = process.argv.includes("--apply");
const PURGE = process.argv.includes("--purge");

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY não definida.");
  process.exit(1);
}

let sa = raw.trim();
if (!sa.startsWith("{")) sa = Buffer.from(sa, "base64").toString("utf8");
const parsed = JSON.parse(sa);
if (typeof parsed.private_key === "string") {
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({ credential: admin.credential.cert(parsed) });
const db = admin.firestore();

const stats = { total: 0, comPii: 0, copiados: 0, purgados: 0, erros: 0 };

const snap = await db.collection("users").get();
stats.total = snap.size;
console.log(`Usuários: ${stats.total}${APPLY ? "" : "  (SIMULAÇÃO — nada será gravado)"}`);

for (const doc of snap.docs) {
  const d = doc.data() || {};
  const email = d.email ?? null;
  const birthDate = d.birthDate ?? null;

  if (email == null && birthDate == null) continue;
  stats.comPii++;

  try {
    if (APPLY) {
      await doc.ref
        .collection("private")
        .doc("data")
        .set(
          { email, birthDate, migratedAt: new Date().toISOString() },
          { merge: true }
        );
      stats.copiados++;

      if (PURGE) {
        // Relê o privado antes de apagar: nunca remover sem confirmar o destino.
        const check = await doc.ref.collection("private").doc("data").get();
        const ok = check.exists &&
          (check.data()?.email ?? null) === email &&
          (check.data()?.birthDate ?? null) === birthDate;

        if (ok) {
          await doc.ref.update({
            email: admin.firestore.FieldValue.delete(),
            birthDate: admin.firestore.FieldValue.delete(),
          });
          stats.purgados++;
        } else {
          console.warn(`  ! ${doc.id}: privado não confere, NÃO purgado`);
        }
      }
    } else {
      stats.copiados++;
    }
  } catch (e) {
    stats.erros++;
    console.error(`  x ${doc.id}: ${e?.message || e}`);
  }
}

console.log("\nResultado:");
console.log(`  com PII no doc público : ${stats.comPii}`);
console.log(`  copiados para privado  : ${stats.copiados}`);
console.log(`  purgados do público    : ${stats.purgados}`);
console.log(`  erros                  : ${stats.erros}`);
if (!APPLY) console.log("\nNada foi gravado. Rode com --apply para executar.");
else if (!PURGE) console.log("\nCampos AINDA presentes no doc público. Confira o site e rode com --purge para remover.");
