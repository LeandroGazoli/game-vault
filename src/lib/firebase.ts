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
  Firestore
} from "firebase/firestore";
import { UserGame, UserProfile } from "./types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_firebase_api_key" &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined" && isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn("Firebase init warning (using LocalStorage fallback):", err);
  }
}

export { app, auth, db };

// ==========================================
// FUNÇÕES DE PERSISTÊNCIA (FIRESTORE + LOCALSTORAGE)
// ==========================================

const LOCAL_STORAGE_LIBRARY_KEY = "game_vault_user_library";
const LOCAL_STORAGE_PROFILE_KEY = "game_vault_user_profile";

function isRealAuthUser(userId: string): boolean {
  return Boolean(
    isFirebaseConfigured &&
    db &&
    auth?.currentUser &&
    userId !== "demo-gamer-123" &&
    auth.currentUser.uid === userId
  );
}

export async function getUserLibrary(userId: string): Promise<UserGame[]> {
  if (isRealAuthUser(userId) && db) {
    try {
      const q = query(collection(db, "users", userId, "games"));
      const snapshot = await getDocs(q);
      const games: UserGame[] = [];
      snapshot.forEach((docSnap) => {
        games.push(docSnap.data() as UserGame);
      });
      if (games.length > 0) return games;
    } catch (e) {
      console.warn("Aviso ao carregar do Firestore, usando cache local:", e);
    }
  }

  // Fallback para LocalStorage
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(`${LOCAL_STORAGE_LIBRARY_KEY}_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
  }
  return [];
}

export async function saveUserGame(userId: string, game: UserGame): Promise<void> {
  const gameDocId = String(game.gameId);
  const updatedGame = {
    ...game,
    updatedAt: new Date().toISOString(),
  };

  // Salva no Firestore apenas se o usuário estiver autenticado no Firebase
  if (isRealAuthUser(userId) && db) {
    try {
      await setDoc(doc(db, "users", userId, "games", gameDocId), updatedGame, { merge: true });
    } catch (e) {
      console.warn("Não foi possível sincronizar com o Firestore neste momento:", e);
    }
  }

  // Sincroniza sempre com LocalStorage para velocidade e redundância
  if (typeof window !== "undefined") {
    const key = `${LOCAL_STORAGE_LIBRARY_KEY}_${userId}`;
    const raw = localStorage.getItem(key);
    let list: UserGame[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((g) => String(g.gameId) === gameDocId);
    if (index >= 0) {
      list[index] = updatedGame;
    } else {
      list.push(updatedGame);
    }
    localStorage.setItem(key, JSON.stringify(list));
  }
}

export async function removeUserGame(userId: string, gameId: string | number): Promise<void> {
  const gameDocId = String(gameId);

  if (isRealAuthUser(userId) && db) {
    try {
      await deleteDoc(doc(db, "users", userId, "games", gameDocId));
    } catch (e) {
      console.warn("Erro ao remover no Firestore:", e);
    }
  }

  if (typeof window !== "undefined") {
    const key = `${LOCAL_STORAGE_LIBRARY_KEY}_${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      let list: UserGame[] = JSON.parse(raw);
      list = list.filter((g) => String(g.gameId) !== gameDocId);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isRealAuthUser(userId) && db) {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (e) {
      console.warn("Erro ao buscar perfil no Firestore:", e);
    }
  }

  if (typeof window !== "undefined") {
    const data = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_KEY}_${userId}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (isRealAuthUser(userId) && db) {
    try {
      await setDoc(doc(db, "users", userId), profile, { merge: true });
    } catch (e) {
      console.warn("Erro ao salvar perfil no Firestore:", e);
    }
  }

  if (typeof window !== "undefined") {
    const key = `${LOCAL_STORAGE_PROFILE_KEY}_${userId}`;
    const current = localStorage.getItem(key);
    const updated = {
      ...(current ? JSON.parse(current) : {}),
      ...profile,
      uid: userId,
    };
    localStorage.setItem(key, JSON.stringify(updated));
  }
}
