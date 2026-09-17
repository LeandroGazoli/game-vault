"use client";

/**
 * PII do PRÓPRIO usuário, lida do cliente (`users/{uid}/private/data`).
 *
 * Existe porque `email` e `birthDate` saíram do doc público: `users/{uid}` é
 * `allow read: if true` (o perfil público depende disso), e em Firestore `read` cobre `get`
 * E `list` — ou seja, qualquer um exportava a base inteira de e-mails e datas de nascimento
 * com a API key pública, que está no bundle.
 *
 * A verificação de maioridade continua intacta porque `birthDate` só é consultada para o
 * próprio usuário, nunca para terceiros. As rules liberam este doc para o dono e o admin.
 */
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface UserPrivateData {
  /**
   * Só `birthDate` mora aqui. `email` NÃO é guardado no Firestore: a fonte autoritativa é o
   * Firebase Auth, que o cliente já tem via `fbUser.email` e o servidor lê pelo Identity
   * Toolkit — sem consumir cota do Firestore e sem risco de cópia defasada.
   */
  birthDate?: string | null;
}

const PRIVATE_DOC = "data";

export async function fetchOwnPrivateData(uid: string): Promise<UserPrivateData | null> {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, "users", uid, "private", PRIVATE_DOC));
    return snap.exists() ? (snap.data() as UserPrivateData) : null;
  } catch {
    // Sem permissão ou offline: quem chama usa o fallback do doc público.
    return null;
  }
}

export async function saveOwnPrivateData(
  uid: string,
  data: UserPrivateData
): Promise<void> {
  if (!db || !uid) return;
  await setDoc(
    doc(db, "users", uid, "private", PRIVATE_DOC),
    { ...data, updatedAt: new Date().toISOString() },
    { merge: true }
  );
}
