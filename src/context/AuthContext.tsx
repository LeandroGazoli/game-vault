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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBio: (bio: string, favoriteGame?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const profile = await getUserProfile(fbUser.uid);
            if (profile) {
              setUser(profile);
            } else {
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                username: fbUser.displayName ? fbUser.displayName.toLowerCase().replace(/\s+/g, "_") : (fbUser.email ? fbUser.email.split("@")[0] : "jogador"),
                displayName: fbUser.displayName || "Jogador",
                email: fbUser.email || "",
                photoURL: fbUser.photoURL || null,
                bio: "Apaixonado por games.",
                createdAt: new Date().toISOString(),
              };
              await saveUserProfile(fbUser.uid, newProfile);
              setUser(newProfile);
            }
          } catch (err) {
            console.error("Erro ao carregar perfil do Firebase:", err);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });
      return () => unsubscribe();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Firebase Auth não está configurado.");
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error("Firebase Auth não está configurado.");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, username: string) => {
    if (!auth) throw new Error("Firebase Auth não está configurado.");
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      username,
      displayName: username,
      email,
      photoURL: null,
      bio: "Novo jogador no GameVault!",
      createdAt: new Date().toISOString(),
    };
    await saveUserProfile(cred.user.uid, newProfile);
    setUser(newProfile);
  };

  const logout = async () => {
    if (auth && firebaseUser) {
      await signOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const updateUserBio = async (bio: string, favoriteGame?: string) => {
    if (!user) return;
    const updated = { ...user, bio, ...(favoriteGame ? { favoriteGame } : {}) };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
