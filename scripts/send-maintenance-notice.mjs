/**
 * Aviso único de manutenção para todos os usuários.
 *
 * Os destinatários vêm do Firebase Auth, não do Firestore — **zero leitura de banco**.
 * (E o campo `email` nem existe mais nos docs públicos desde a migração de PII.)
 *
 * Uso:
 *   node scripts/send-maintenance-notice.mjs            # simula: lista quem receberia
 *   node scripts/send-maintenance-notice.mjs --send     # envia de verdade
 *
 * Requer FIREBASE_SERVICE_ACCOUNT_KEY e RESEND_API_KEY no ambiente.
 */
import admin from "firebase-admin";

const SEND = process.argv.includes("--send");
const RETURN_TIME = "18h";

/**
 * Excluídos do disparo:
 * - orkut.com: domínio morto desde 2014. Gera hard bounce, e bounce penaliza a reputação
 *   do domínio remetente no Resend — com base pequena, um único endereço morto pesa muito.
 * - contas do próprio administrador, a pedido dele.
 */
const EXCLUDE = new Set([
  "mosqueteiro@orkut.com",
  "leandrox.gazoli@gmail.com",
  "leandro.gazoli@outlook.com",
  "leandro.gazolig@gmail.com",
]);

const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const resendKey = process.env.RESEND_API_KEY;
if (!saRaw) { console.error("FIREBASE_SERVICE_ACCOUNT_KEY ausente."); process.exit(1); }
if (SEND && !resendKey) { console.error("RESEND_API_KEY ausente."); process.exit(1); }

let sa = saRaw.trim();
if (!sa.startsWith("{")) sa = Buffer.from(sa, "base64").toString("utf8");
const parsed = JSON.parse(sa);
if (typeof parsed.private_key === "string") parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
admin.initializeApp({ credential: admin.credential.cert(parsed) });

const FROM = process.env.RESEND_FROM_EMAIL || "MyGameList <contato@mygameslist.com.br>";
const SUBJECT = "MyGameList em manutenção — voltamos hoje às " + RETURN_TIME;

/** Escapa entrada do usuário antes de interpolar no HTML (o nome vem do perfil). */
const esc = (s) => String(s || "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

function html(name) {
  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0b0d12;color:#fff;padding:32px;border-radius:16px;max-width:580px;margin:0 auto;border:1px solid #222736;">
  <div style="font-size:20px;font-weight:900;color:#10B981;letter-spacing:-0.5px;margin-bottom:20px;">🎮 MyGameList</div>
  <h2 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 16px;">Estamos em manutenção</h2>
  <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin:0 0 14px;">Olá${name ? ", " + esc(name) : ""}!</p>
  <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin:0 0 14px;">
    Estamos migrando o MyGameList para uma nova infraestrutura, mais rápida e estável.
    Durante a mudança o site fica temporariamente fora do ar.
  </p>
  <p style="font-size:15px;line-height:1.6;color:#fff;margin:0 0 14px;">
    <strong>Previsão de retorno: hoje até as ${RETURN_TIME}.</strong>
  </p>
  <p style="font-size:14px;line-height:1.6;color:#d1d5db;margin:0 0 14px;">
    Sua conta, sua biblioteca e seu progresso estão seguros — nada foi perdido.
    Assim que a migração terminar, é só acessar normalmente.
  </p>
  <p style="font-size:13px;line-height:1.6;color:#9ca3af;margin:0 0 14px;">
    Se depois do horário previsto o site ainda não abrir para você, aguarde alguns minutos e
    tente de novo: a mudança de endereço leva um tempo para chegar a todos os provedores.
  </p>
  <hr style="border:none;border-top:1px solid #1e2330;margin:28px 0 16px;" />
  <p style="font-size:11px;color:#6b7280;margin:0;">Obrigado pela paciência — Equipe MyGameList</p>
</div>`.trim();
}

// Destinatários: Firebase Auth (fonte autoritativa do e-mail).
const recipients = [];
const excluded = [];
let pageToken;
do {
  const page = await admin.auth().listUsers(1000, pageToken);
  for (const u of page.users) {
    if (!u.email) continue;
    if (EXCLUDE.has(u.email.toLowerCase())) { excluded.push(u.email); continue; }
    recipients.push({ email: u.email, name: u.displayName || "" });
  }
  pageToken = page.pageToken;
} while (pageToken);

console.log(`Destinatários: ${recipients.length}${SEND ? "" : "   (SIMULAÇÃO — nada será enviado)"}`);
if (excluded.length) console.log(`Excluídos (${excluded.length}): ${excluded.join(", ")}`);
console.log(`Assunto: ${SUBJECT}`);
console.log(`Remetente: ${FROM}\n`);
recipients.forEach((r, i) => console.log(`  ${String(i + 1).padStart(2)}. ${r.email}${r.name ? "  (" + r.name + ")" : ""}`));

if (!SEND) {
  console.log("\nNada enviado. Rode com --send para disparar.");
  process.exit(0);
}

console.log("\nEnviando...");
let ok = 0, fail = 0;
for (const r of recipients) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [r.email], subject: SUBJECT, html: html(r.name) }),
    });
    if (res.ok) { ok++; console.log(`  ✓ ${r.email}`); }
    else { fail++; console.log(`  ✗ ${r.email} — ${res.status} ${(await res.text()).slice(0, 120)}`); }
  } catch (e) {
    fail++; console.log(`  ✗ ${r.email} — ${e?.message || e}`);
  }
  // Respeita o rate limit do Resend (2 req/s no plano gratuito).
  await new Promise((s) => setTimeout(s, 600));
}
console.log(`\nEnviados: ${ok}   Falhas: ${fail}`);
