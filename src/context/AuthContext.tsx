"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  isFirebaseConfigured,
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  loginAsDemoUser: () => void;
  logout: () => Promise<void>;
  updateUserBio: (bio: string, favoriteGame?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = "game_vault_demo_user";

const DEFAULT_DEMO_USER: UserProfile = {
  uid: "demo-gamer-123",
  username: "gamer_pro",
  displayName: "Alex Gamer",
  email: "gamer@exemplo.com",
  photoURL: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
  bio: "Apaixonado por RPGs, soulslikes e aventuras épicas. Zerando tudo que posso!",
  favoriteGame: "Elden Ring",
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              username: fbUser.email ? fbUser.email.split("@")[0] : "jogador",
              displayName: fbUser.displayName || "Jogador",
              email: fbUser.email || "",
              photoURL: fbUser.photoURL || null,
              bio: "Explorador de novos mundos nos games.",
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(fbUser.uid, newProfile);
            setUser(newProfile);
          }
          setIsDemoMode(false);
        } else {
          // Checa se há um demo user ativo salvo
          checkStoredDemoUser();
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Local / Demo
      checkStoredDemoUser();
      setIsLoading(false);
    }
  }, []);

  const checkStoredDemoUser = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DEMO_USER_KEY);
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(DEFAULT_DEMO_USER);
        }
      } else {
        // Inicializa com o usuário demo padrão para pronta utilização
        setUser(DEFAULT_DEMO_USER);
        localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
      }
      setIsDemoMode(true);
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      loginAsDemoUser();
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      // Simula login local
      const demoUser: UserProfile = {
        ...DEFAULT_DEMO_USER,
        email,
        username: email.split("@")[0],
        displayName: email.split("@")[0],
      };
      setUser(demoUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, username: string) => {
    if (!isFirebaseConfigured || !auth) {
      const demoUser: UserProfile = {
        ...DEFAULT_DEMO_USER,
        email,
        username,
        displayName: username,
      };
      setUser(demoUser);
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      return;
    }
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      username,
      displayName: username,
      email,
      photoURL: null,
      bio: "Novo jogador na plataforma!",
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(cred.user.uid, newProfile);
    setUser(newProfile);
  };

  const loginAsDemoUser = () => {
    setUser(DEFAULT_DEMO_USER);
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
    }
    setIsDemoMode(true);
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth && firebaseUser) {
      await signOut(auth);
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_USER_KEY);
    }
  };

  const updateUserBio = async (bio: string, favoriteGame?: string) => {
    if (!user) return;
    const updated = { ...user, bio, ...(favoriteGame ? { favoriteGame } : {}) };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
    if (isDemoMode && typeof window !== "undefined") {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        loginAsDemoUser,
        logout,
        updateUserBio,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }
  return context;
}
