"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import {
  auth,
  db,
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebase";
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  upgradePlan: (plan: UserPlan, hideAds?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Somente leandro.gazolig@gmail.com com e-mail devidamente verificado no Firebase Auth é admin
  const isAdmin = Boolean(
    firebaseUser &&
      firebaseUser.email &&
      firebaseUser.emailVerified &&
      ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
  );

  // VIP / PRO baseado estritamente no plano atual (ou se for o Admin Master verificado)
  const isPremium = Boolean(
    isAdmin || (user && (user.plan === "pro" || user.plan === "vip"))
  );

  useEffect(() => {
    if (auth && db) {
      let unsubscribeDoc: (() => void) | null = null;
      const syncedAdminUids = new Set<string>();

      const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);

        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }

        if (fbUser) {
          const userIsAdmin = Boolean(
            fbUser.email &&
              fbUser.emailVerified &&
              ADMIN_EMAILS.includes(fbUser.email.toLowerCase())
          );

          // Escuta alterações em tempo real no Firestore
          const userDocRef = doc(db, "users", fbUser.uid);
          unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
            if (docSnap.exists()) {
              let profile = docSnap.data() as UserProfile;
              if (userIsAdmin && !syncedAdminUids.has(fbUser.uid) && (profile.plan !== "vip" || !profile.isAdmin)) {
                syncedAdminUids.add(fbUser.uid);
                profile = {
                  ...profile,
                  plan: "vip",
                  isPremium: true,
                  isAdmin: true,
                  hideAds: true,
                };
                await saveUserProfile(fbUser.uid, profile);
              } else if (userIsAdmin) {
                // Assegura privilégios de admin em memória caso ainda não gravados
                profile = {
                  ...profile,
                  isAdmin: true,
                };
              }
              setUser(profile);
            } else {
              const cleanUsername = fbUser.displayName
                ? fbUser.displayName
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "_")
                    .replace(/_+/g, "_")
                    .replace(/^_|_$/g, "")
                : (fbUser.email ? fbUser.email.split("@")[0] : "jogador");

              const newProfile: UserProfile = {
                uid: fbUser.uid,
                username: cleanUsername || "jogador",
                displayName: fbUser.displayName || "Jogador",
                email: fbUser.email || "",
                photoURL: fbUser.photoURL || null,
                bio: userIsAdmin ? "Administrador & Membro VIP MyGameList." : "Apaixonado por games.",
                plan: userIsAdmin ? "vip" : "free",
                isPremium: userIsAdmin,
                isAdmin: userIsAdmin,
                hideAds: userIsAdmin,
                createdAt: new Date().toISOString(),
              };
              await saveUserProfile(fbUser.uid, newProfile);
              setUser(newProfile);
            }
            setIsLoading(false);
          });
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => {
        unsubscribeAuth();
        if (unsubscribeDoc) unsubscribeDoc();
      };
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Captura o resultado de redirecionamento no caso de login via redirect no PWA móvel
  useEffect(() => {
    if (auth) {
      getRedirectResult(auth)
        .then((result) => {
          if (result && result.user) {
            setFirebaseUser(result.user);
          }
        })
        .catch((err) => {
          const code = err?.code || "";
          if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
            console.warn("[Auth] Informação ao processar redirect:", err);
          }
        });
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setFirebaseUser(result.user);
      }
    } catch (err: any) {
      const code = err?.code || "";
      // Se o popup foi expressamente bloqueado pelo navegador ou dispositivo, usa redirect como fallback
      if (
        code === "auth/popup-blocked" ||
        code === "auth/operation-not-supported-in-this-environment"
      ) {
        console.warn("[Auth] Popup bloqueado ou não suportado. Tentando redirecionamento com proxy...");
        await signInWithRedirect(auth, provider);
        return;
      }
      throw err;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, pass: string) => {
    if (!auth) return;
    const result = await signInWithEmailAndPassword(auth, email, pass);
    if (result.user) {
      setFirebaseUser(result.user);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, pass: string, username: string) => {
    if (!auth) return;
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const userIsAdmin = Boolean(
      cred.user.emailVerified && ADMIN_EMAILS.includes(email.toLowerCase())
    );
    const newProfile: UserProfile = {
      uid: cred.user.uid,
      username,
      displayName: username,
      email,
      photoURL: null,
      bio: userIsAdmin ? "Administrador & Membro VIP MyGameList." : "Novo jogador no MyGameList!",
      plan: userIsAdmin ? "vip" : "free",
      isPremium: userIsAdmin,
      isAdmin: userIsAdmin,
      hideAds: userIsAdmin,
      createdAt: new Date().toISOString(),
    };
    setFirebaseUser(cred.user);
    setUser(newProfile);
    await saveUserProfile(cred.user.uid, newProfile);
  }, []);

  const logout = useCallback(async () => {
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setFirebaseUser(null);
  }, []);

  const updateUserBio = useCallback(async (bio: string, favoriteGame?: string) => {
    if (!user) return;
    const updated = { ...user, bio, ...(favoriteGame ? { favoriteGame } : {}) };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
  }, [user]);

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
  }, [user]);

  const upgradePlan = useCallback(async (plan: UserPlan, hideAds = true) => {
    if (!user) return;
    const isPlanPremium = plan === "pro" || plan === "vip" || isAdmin;
    const updated: UserProfile = {
      ...user,
      plan,
      isPremium: isPlanPremium,
      hideAds: isPlanPremium ? hideAds : false,
      updatedAt: new Date().toISOString(),
    };
    setUser(updated);
    await saveUserProfile(user.uid, updated);
  }, [user, isAdmin]);

  const contextValue = useMemo(
    () => ({
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
      updateUserProfile,
      upgradePlan,
    }),
    [
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
      updateUserProfile,
      upgradePlan,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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
