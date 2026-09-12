"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";
import { useAuth } from "@/context/AuthContext";
import { trackSignUpSuccess } from "@/lib/analytics";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

// Client ID público gerado automaticamente pelo projeto Firebase/Google Cloud
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "310412819391-r4dfmao4ouaef9vu5qvc0e5a2cpg0j9b.apps.googleusercontent.com";

export default function GoogleOneTap() {
  const { user, isLoading, signInWithGoogleCredential } = useAuth();
  const scriptLoadedRef = useRef(false);
  const promptAttemptedRef = useRef(false);

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;

    try {
      await signInWithGoogleCredential(response.credential);
      trackSignUpSuccess("google");
    } catch (err) {
      console.warn("[GoogleOneTap] Erro ao autenticar credencial do One Tap:", err);
    }
  };

  const initOneTap = () => {
    if (!window.google?.accounts?.id || !GOOGLE_CLIENT_ID) return;
    if (user || isLoading || promptAttemptedRef.current) return;

    promptAttemptedRef.current = true;

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        itp_support: true,
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          // O Google pode não exibir se o usuário fechou recentemente ou em ambiente não elegível
          console.debug("[GoogleOneTap] Prompt não exibido:", notification.getNotDisplayedReason());
        } else if (notification.isSkippedMoment()) {
          console.debug("[GoogleOneTap] Usuário ignorou prompt:", notification.getSkippedReason());
        }
      });
    } catch (e) {
      console.warn("[GoogleOneTap] Falha ao inicializar One Tap:", e);
    }
  };

  useEffect(() => {
    // Se o usuário logou, cancela qualquer prompt pendente
    if (user && window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
      return;
    }

    if (!user && !isLoading && scriptLoadedRef.current) {
      initOneTap();
    }
  }, [user, isLoading]);

  // Se já está logado, não carrega nem renderiza nada
  if (user) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => {
        scriptLoadedRef.current = true;
        initOneTap();
      }}
    />
  );
}
