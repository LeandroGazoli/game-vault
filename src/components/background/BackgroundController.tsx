"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { BackgroundConfig, DEFAULT_BACKGROUND_CONFIG } from "@/lib/types/background.types";
import { getSystemSettings } from "@/lib/firebase";

export type BackgroundTheme = "parallax" | "sprites" | "dust" | "minimal";

const ParallaxBackground = dynamic(() => import("./ParallaxBackground"), { ssr: false });
const SpriteAnimationBackground = dynamic(() => import("./SpriteAnimationBackground"), { ssr: false });
const SpaceDustCanvas = dynamic(() => import("@/components/3d/SpaceDustCanvas"), { ssr: false });

export const BG_THEME_STORAGE_KEY = "gv_background_theme";

export default function BackgroundController() {
  const { user, isPremium, isAdmin } = useAuth();
  const [config, setConfig] = useState<BackgroundConfig>(DEFAULT_BACKGROUND_CONFIG);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const resolveBackground = async () => {
      // 1. Prioridade Máxima: Personalização do Usuário VIP/PRO (ou Admin)
      const isVipOrPro = Boolean(isPremium || user?.plan === "vip" || user?.plan === "pro" || isAdmin);
      if (isVipOrPro && user?.customBackground) {
        setConfig(user.customBackground as BackgroundConfig);
        return;
      }

      // 2. Segunda Prioridade: Preferência local rápida de teste em homologação (se alterada pelo switcher)
      const localTheme = localStorage.getItem(BG_THEME_STORAGE_KEY);
      if (localTheme && ["parallax", "sprites", "dust", "minimal"].includes(localTheme)) {
        setConfig({
          type: "animated",
          value: localTheme,
          animationId: localTheme as any,
        });
        return;
      }

      // 3. Terceira Prioridade: Configuração padrão do sistema definida pelo Administrador no Firestore
      try {
        const sys = await getSystemSettings();
        if (sys?.defaultBackground) {
          setConfig(sys.defaultBackground as BackgroundConfig);
          return;
        }
      } catch (err) {
        console.warn("Erro ao buscar defaultBackground do sistema:", err);
      }

      // 4. Fallback padrão: Imagem oficial da cidade com overlay escuro
      setConfig(DEFAULT_BACKGROUND_CONFIG);
    };

    resolveBackground();

    // Ouvinte para trocas dinâmicas em tempo real (disparadas pelo Switcher ou Perfil)
    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundTheme>;
      if (customEvent.detail) {
        setConfig({
          type: "animated",
          value: customEvent.detail,
          animationId: customEvent.detail,
        });
      }
    };

    const handleConfigChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      }
    };

    window.addEventListener("gv-background-theme-change", handleThemeChange);
    window.addEventListener("gv-background-config-change", handleConfigChange);

    return () => {
      window.removeEventListener("gv-background-theme-change", handleThemeChange);
      window.removeEventListener("gv-background-config-change", handleConfigChange);
    };
  }, [user, isPremium, isAdmin]);

  if (!mounted) return null;

  // Renderização baseada no tipo de background configurado:
  if (config.type === "solid_color") {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-10 transition-colors duration-500"
        style={{ backgroundColor: config.value || "#0e0f12" }}
        aria-hidden="true"
      />
    );
  }

  if (config.type === "preset" || config.type === "custom_image") {
    return (
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        {/* Camada de Imagem com Fallback Elegante */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 transform scale-105"
          style={{
            backgroundImage: `url('${config.value}')`,
            opacity: config.opacity ?? 0.35,
          }}
        />
        {/* Camada de gradiente escuro e vinheta para preservar 100% da legibilidade dos cards */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f12]/80 via-[#0e0f12]/60 to-[#0e0f12]/95" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0e0f12]/30 to-[#0e0f12]/80" />
      </div>
    );
  }

  // Tipo "animated"
  const animation = config.animationId || (config.value as BackgroundTheme) || "parallax";

  return (
    <>
      {animation === "parallax" && <ParallaxBackground />}
      {animation === "sprites" && <SpriteAnimationBackground />}
      {animation === "dust" && <SpaceDustCanvas />}
      {animation === "minimal" && null}
    </>
  );
}
