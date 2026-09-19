"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Gamepad2 } from "lucide-react";

export default function PwaSplashScreen() {
  const [isRendered, setIsRendered] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const spinnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Se o usuário preferir movimento reduzido, desativa animações pesadas
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Timeout mínimo de exibição para permitir uma transição estética fluida
    const startTime = Date.now();
    const MIN_DISPLAY_MS = 800;
    const MAX_TIMEOUT_MS = 3000;

    let pulseTween: gsap.core.Tween | null = null;

    if (!prefersReducedMotion && badgeRef.current) {
      pulseTween = gsap.to(badgeRef.current, {
        scale: 1.04,
        boxShadow: "0 0 50px rgba(16, 185, 129, 0.45), 0 0 80px rgba(0, 229, 255, 0.25)",
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    let dismissTimer: NodeJS.Timeout | null = null;

    const dismissSplash = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_MS - elapsed);

      dismissTimer = setTimeout(() => {
        if (!containerRef.current) return;

        if (pulseTween) pulseTween.kill();

        if (prefersReducedMotion) {
          setIsRendered(false);
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            setIsRendered(false);
          },
        });

        tl.to([badgeRef.current, spinnerRef.current, textRef.current], {
          opacity: 0,
          scale: 0.92,
          y: -15,
          duration: 0.35,
          stagger: 0.05,
          ease: "power2.in",
        }).to(
          containerRef.current,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "-=0.15"
        );
      }, remainingTime);
    };

    // Aguarda o carregamento completo da janela ou aciona pelo timer de segurança
    if (document.readyState === "complete") {
      dismissSplash();
    } else {
      window.addEventListener("load", dismissSplash, { once: true });
    }

    const maxTimer = setTimeout(dismissSplash, MAX_TIMEOUT_MS);

    return () => {
      window.removeEventListener("load", dismissSplash);
      if (dismissTimer) clearTimeout(dismissTimer);
      clearTimeout(maxTimer);
      if (pulseTween) pulseTween.kill();
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div
      ref={containerRef}
      id="pwa-splash-screen"
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-[#0b0d11] text-gray-100 select-none pointer-events-auto"
      style={{
        backgroundColor: "#0b0d11",
      }}
      aria-hidden="true"
    >
      {/* Luz ambiente de fundo (Glow radial gamer) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] rounded-full bg-gradient-to-tr from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Badge / Ícone Gamer com iluminação */}
        <div
          ref={badgeRef}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#181d28] to-[#10131a] border border-emerald-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6 transition-transform"
        >
          {/* Anel de destaque com gradiente sutil */}
          <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-b from-emerald-400/40 via-transparent to-cyan-400/20 pointer-events-none" />
          
          <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
        </div>

        {/* Cyber Spinner */}
        <div
          ref={spinnerRef}
          className="relative w-8 h-8 mb-5"
        >
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400 border-r-cyan-400 animate-spin" />
        </div>

        {/* Tipografia da Marca e Status */}
        <div ref={textRef} className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono">
            GAME<span className="text-emerald-400">VAULT</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
            Carregando sua biblioteca gamer...
          </p>
        </div>
      </div>
    </div>
  );
}
