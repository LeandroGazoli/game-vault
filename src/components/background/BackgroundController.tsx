"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

export type BackgroundTheme = "parallax" | "sprites" | "dust" | "minimal";

const ParallaxBackground = dynamic(() => import("./ParallaxBackground"), { ssr: false });
const SpriteAnimationBackground = dynamic(() => import("./SpriteAnimationBackground"), { ssr: false });
const SpaceDustCanvas = dynamic(() => import("@/components/3d/SpaceDustCanvas"), { ssr: false });

export const BG_THEME_STORAGE_KEY = "gv_background_theme";

export default function BackgroundController() {
  const [theme, setTheme] = useState<BackgroundTheme>("parallax");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(BG_THEME_STORAGE_KEY) as BackgroundTheme | null;
    if (saved && ["parallax", "sprites", "dust", "minimal"].includes(saved)) {
      setTheme(saved);
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<BackgroundTheme>;
      if (customEvent.detail) {
        setTheme(customEvent.detail);
      }
    };

    window.addEventListener("gv-background-theme-change", handleThemeChange);
    return () => {
      window.removeEventListener("gv-background-theme-change", handleThemeChange);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {theme === "parallax" && <ParallaxBackground />}
      {theme === "sprites" && <SpriteAnimationBackground />}
      {theme === "dust" && <SpaceDustCanvas />}
      {theme === "minimal" && null}
    </>
  );
}
