"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
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
import { UserProfile, UserPlan, ADMIN_EMAILS } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isPremium: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBio: (bio: string, favoriteGame?: string) => Promise<void>;
  upgradePlan: (plan: UserPlan, hideAds?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = Boolean(
    user && user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );

  const isPremium = Boolean(
    isAdmin || (user && (user.plan === "pro" || user.plan === "vip" || user.isPremium))
  );

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const userIsAdmin = Boolean(
              fbUser.email && ADMIN_EMAILS.includes(fbUser.email.toLowerCase())
            );

            let profile = await getUserProfile(fbUser.uid);
            if (profile) {
              // Se for admin, garante automaticamente plano VIP e permissões de admin
              if (userIsAdmin && (profile.plan !== "vip" || !profile.isAdmin)) {
                profile = {
                  ...profile,
                  plan: "vip",
                  isPremium: true,
                  isAdmin: true,
                  hideAds: true,
                };
                await saveUserProfile(fbUser.uid, profile);
              }
              setUser(profile);
            } else {
              const newProfile: UserProfile = {
                uid: fbUser.uid,
                username: fbUser.displayName
                  ? fbUser.displayName.toLowerCase().replace(/\s+/g, "_")
                  : (fbUser.email ? fbUser.email.split("@")[0] : "jogador"),
                displayName: fbUser.displayName || "Jogador",
                email: fbUser.email || "",
                photoURL: fbUser.photoURL || null,
                bio: userIsAdmin ? "Administrador & Membro VIP GameVault." : "Apaixonado por games.",
                plan: userIsAdmin ? "vip" : "free",
                isPremium: userIsAdmin,
                isAdmin: userIsAdmin,
                hideAds: userIsAdmin,
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
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      const userIsAdmin = Boolean(
        result.user.email && ADMIN_EMAILS.includes(result.user.email.toLowerCase())
      );

      const immediateProfile: UserProfile = {
        uid: result.user.uid,
        username: result.user.displayName
          ? result.user.displayName.toLowerCase().replace(/\s+/g, "_")
          : (result.user.email ? result.user.email.split("@")[0] : "jogador"),
        displayName: result.user.displayName || "Jogador",
        email: result.user.email || "",
        photoURL: result.user.photoURL || null,
        bio: userIsAdmin ? "Administrador & Membro VIP GameVault." : "Apaixonado por games.",
        plan: userIsAdmin ? "vip" : "free",
        isPremium: userIsAdmin,
        isAdmin: userIsAdmin,
        hideAds: userIsAdmin,
        createdAt: new Date().toISOString(),
      };
      setFirebaseUser(result.user);
      setUser(immediateProfile);

      getUserProfile(result.user.uid).then((prof) => {
        if (prof) {
          if (userIsAdmin) {
            const updated = { ...prof, plan: "vip" as const, isPremium: true, isAdmin: true, hideAds: true };
            saveUserProfile(result.user.uid, updated);
            setUser(updated);
          } else {
            setUser(prof);
          }
        } else {
          saveUserProfile(result.user.uid, immediateProfile);
        }
      });
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      const userIsAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
      const immediateProfile: UserProfile = {
        uid: result.user.uid,
        username: email.split("@")[0],
        displayName: email.split("@")[0],
        email: result.user.email || email,
        photoURL: null,
        bio: userIsAdmin ? "Administrador & Membro VIP GameVault." : "Apaixonado por games.",
        plan: userIsAdmin ? "vip" : "free",
        isPremium: userIsAdmin,
        isAdmin: userIsAdmin,
        hideAds: userIsAdmin,
        createdAt: new Date().toISOString(),
      };
      setFirebaseUser(result.user);
      setUser(immediateProfile);

      getUserProfile(result.user.uid).then((prof) => {
        if (prof) {
          if (userIsAdmin) {
            const updated = { ...prof, plan: "vip" as const, isPremium: true, isAdmin: true, hideAds: true };
            saveUserProfile(result.user.uid, updated);
            setUser(updated);
          } else {
            setUser(prof);
          }
        } else {
          saveUserProfile(result.user.uid, immediateProfile);
        }
      });
    }
  };

  const signUpWithEmail = async (email: string, pass: string, username: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userIsAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      username,
      displayName: username,
      email,
      photoURL: null,
      bio: userIsAdmin ? "Administrador & Membro VIP GameVault." : "Novo jogador no GameVault!",
      plan: userIsAdmin ? "vip" : "free",
      isPremium: userIsAdmin,
      isAdmin: userIsAdmin,
      hideAds: userIsAdmin,
      createdAt: new Date().toISOString(),
    };
    setFirebaseUser(cred.user);
    setUser(newProfile);
    await saveUserProfile(cred.user.uid, newProfile);
  };

  const logout = async () => {
    if (auth) {
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

  const upgradePlan = async (plan: UserPlan, hideAds = true) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      plan,
      isPremium: plan === "pro" || plan === "vip" || isAdmin,
      hideAds: plan === "pro" || plan === "vip" || isAdmin ? hideAds : false,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isPremium,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        updateUserBio,
        upgradePlan,
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
