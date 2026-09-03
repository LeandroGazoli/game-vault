import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  where,
  limit,
  Firestore
} from "firebase/firestore";
import { UserGame, UserProfile } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCBeWB14tmyQZZddMia62SpzQ5iTRio8TI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gamevault-profile.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamevault-profile",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gamevault-profile.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "310412819391",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:310412819391:web:b61a5616735ef4c3fdbf0a",
};

export const isFirebaseConfigured = true;

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// ==========================================
// FUNÇÕES DE PERSISTÊNCIA (FIRESTORE)
// ==========================================

export async function getUserLibrary(userId: string): Promise<UserGame[]> {
  if (!userId || !db) return [];

  try {
    const q = query(collection(db, "users", userId, "games"));
    const snapshot = await getDocs(q);
    const games: UserGame[] = [];
    snapshot.forEach((docSnap) => {
      games.push(docSnap.data() as UserGame);
    });
    return games;
  } catch (e) {
    console.error("Erro ao carregar jogos do Firestore:", e);
    return [];
  }
}

export async function saveUserGame(userId: string, game: UserGame): Promise<void> {
  if (!userId || !db) return;
  const gameDocId = String(game.gameId);
  const updatedGame = {
    ...game,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, "users", userId, "games", gameDocId), updatedGame, { merge: true });
  } catch (e) {
    console.error("Erro ao salvar jogo no Firestore:", e);
  }
}

export async function removeUserGame(userId: string, gameId: string | number): Promise<void> {
  if (!userId || !db) return;
  const gameDocId = String(gameId);

  try {
    await deleteDoc(doc(db, "users", userId, "games", gameDocId));
  } catch (e) {
    console.error("Erro ao remover no Firestore:", e);
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId || !db) return null;

  try {
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (e) {
    console.error("Erro ao buscar perfil no Firestore:", e);
  }
  return null;
}

export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  if (!username || !db) return null;

  try {
    const clean = username.toLowerCase().trim();
    const q = query(
      collection(db, "users"),
      where("username", "==", clean),
      limit(1)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data() as UserProfile;
    }
  } catch (e) {
    console.error("Erro ao buscar perfil por username no Firestore:", e);
  }
  return null;
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (!userId || !db) return;

  try {
    await setDoc(doc(db, "users", userId), profile, { merge: true });
  } catch (e) {
    console.error("Erro ao salvar perfil no Firestore:", e);
  }
}

// ==========================================
// FUNÇÕES DE ADMINISTRAÇÃO DA PLATAFORMA
// ==========================================

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "users"));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      users.push(docSnap.data() as UserProfile);
    });
    return users;
  } catch (e) {
    console.error("Erro ao listar usuários para o admin:", e);
    return [];
  }
}

export async function updateUserPlanByAdmin(
  targetUserId: string,
  newPlan: "free" | "pro" | "vip"
): Promise<void> {
  if (!targetUserId || !db) return;
  try {
    const isPremium = newPlan === "pro" || newPlan === "vip";
    await setDoc(
      doc(db, "users", targetUserId),
      {
        plan: newPlan,
        isPremium,
        hideAds: isPremium,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("Erro ao atualizar plano pelo admin:", e);
  }
}
