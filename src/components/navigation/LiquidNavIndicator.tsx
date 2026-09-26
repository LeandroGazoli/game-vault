"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface LiquidNavIndicatorProps {
  activeIndex: number;
  tabRefs: React.MutableRefObject<(HTMLElement | null)[]>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function LiquidNavIndicator({
  activeIndex,
  tabRefs,
  containerRef,
}: LiquidNavIndicatorProps) {
  const mainOrbRef = useRef<HTMLDivElement>(null);
  const trailOrbRef = useRef<HTMLDivElement>(null);
  const rippleOrbRef = useRef<HTMLDivElement>(null);
  const orbRingRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const prevIndexRef = useRef<number>(activeIndex);
  const isInitializedRef = useRef<boolean>(false);

  // Calcula a coordenada X relativa ao container onde o círculo de 48px deve ficar centrado
  const getTargetX = useCallback(
    (index: number): number | null => {
      const container = containerRef.current;
      const tab = tabRefs.current[index];
      if (!container || !tab) return null;

      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const tabCenterX = tabRect.left - containerRect.left + tabRect.width / 2;
      const orbWidth = 48;

      return tabCenterX - orbWidth / 2;
    },
    [containerRef, tabRefs]
  );

  // Animação GSAP com efeito líquido, metaball stretch, lag de rastro e spring landing
  useEffect(() => {
    const targetX = getTargetX(activeIndex);
    if (targetX === null) return;

    const prevIndex = prevIndexRef.current;
    const mainOrb = mainOrbRef.current;
    const trailOrb = trailOrbRef.current;
    const rippleOrb = rippleOrbRef.current;
    const orbRing = orbRingRef.current;
    const glow = glowRef.current;

    if (!mainOrb || !orbRing) return;

    // Primeira renderização: posiciona sem animação de transição para não cruzar a tela
    if (!isInitializedRef.current) {
      gsap.set([mainOrb, orbRing], { x: targetX, scaleX: 1, scaleY: 1, rotation: 0 });
      if (trailOrb) gsap.set(trailOrb, { x: targetX, scale: 0, opacity: 0 });
      if (rippleOrb) gsap.set(rippleOrb, { x: targetX, scale: 0, opacity: 0 });
      if (glow) gsap.set(glow, { x: targetX, opacity: 0.6 });

      isInitializedRef.current = true;
      prevIndexRef.current = activeIndex;
      return;
    }

    if (prevIndex === activeIndex) return;

    const diff = activeIndex - prevIndex;
    const distance = Math.abs(diff);
    const direction = Math.sign(diff); // 1 = direita, -1 = esquerda
    const prevX = getTargetX(prevIndex) ?? targetX;

    // Fatores orgânicos de squash e stretch de acordo com a distância
    const duration = Math.min(0.42 + distance * 0.07, 0.65);
    const stretchFactor = Math.min(1 + distance * 0.16, 1.45);
    const squashY = Math.max(1 - distance * 0.1, 0.78);

    // Cancela tweens em andamento nos elementos do indicador
    gsap.killTweensOf([mainOrb, orbRing, trailOrb, rippleOrb, glow]);

    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        prevIndexRef.current = activeIndex;
      },
    });

    // 1. Deslocamento do Círculo Principal e Anel Exterior
    tl.to([mainOrb, orbRing], {
      x: targetX,
      duration: duration,
      ease: "power3.inOut",
    }, 0);

    if (glow) {
      tl.to(glow, {
        x: targetX,
        duration: duration,
        ease: "power3.inOut",
      }, 0);
    }

    // 2. Física Líquida: Estica na largada, achata no impacto e oscila elasticamente
    tl.to([mainOrb, orbRing], {
      scaleX: stretchFactor,
      scaleY: squashY,
      rotation: direction * Math.min(distance * 5, 14),
      duration: duration * 0.42,
      ease: "power2.in",
    }, 0)
    .to([mainOrb, orbRing], {
      scaleX: 0.84,
      scaleY: 1.16,
      rotation: -direction * 4,
      duration: duration * 0.28,
      ease: "power2.out",
    }, duration * 0.42)
    .to([mainOrb, orbRing], {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      duration: duration * 0.42,
      ease: "elastic.out(1.2, 0.45)",
    }, duration * 0.68);

    // 3. Gota de Rastro Líquido (Metaball com filtro Gooey)
    if (trailOrb) {
      // Inicia a gota de rastro próxima à posição de partida com leve recuo
      gsap.set(trailOrb, {
        x: prevX + (direction > 0 ? -4 : 4),
        scale: 0.75,
        opacity: 0.95,
      });

      // A gota de rastro segue com atraso, criando a ponte líquida que se estica
      tl.to(trailOrb, {
        x: targetX,
        duration: duration * 0.75,
        delay: duration * 0.1,
        ease: "power2.inOut",
      }, 0);

      // A gota é reabsorvida pela gota principal antes do pouso
      tl.to(trailOrb, {
        scale: 0.15,
        opacity: 0,
        duration: duration * 0.45,
        ease: "power2.in",
      }, duration * 0.35);
    }

    // 4. Efeito de Respingo / Ondulação Líquida no Pouso
    if (rippleOrb) {
      gsap.set(rippleOrb, { x: targetX });
      tl.fromTo(
        rippleOrb,
        { scale: 0.8, opacity: 0.6 },
        { scale: 1.4, opacity: 0, duration: 0.45, ease: "power2.out" },
        duration * 0.65
      );
    }

    prevIndexRef.current = activeIndex;
  }, [activeIndex, getTargetX]);

  // Recalcula a posição em redimensionamentos de tela ou giro de orientação
  useEffect(() => {
    const handleResize = () => {
      const targetX = getTargetX(activeIndex);
      if (targetX === null) return;
      if (mainOrbRef.current) gsap.set(mainOrbRef.current, { x: targetX });
      if (orbRingRef.current) gsap.set(orbRingRef.current, { x: targetX });
      if (glowRef.current) gsap.set(glowRef.current, { x: targetX });
      if (trailOrbRef.current) gsap.set(trailOrbRef.current, { x: targetX });
      if (rippleOrbRef.current) gsap.set(rippleOrbRef.current, { x: targetX });
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, [activeIndex, getTargetX]);

  return (
    <>
      {/* Definição do Filtro SVG Gooey (Metaball Shader) */}
      <svg className="fixed w-0 h-0 pointer-events-none -z-50" aria-hidden="true">
        <defs>
          <filter id="liquid-nav-goo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 19 -8
              "
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Halo de Brilho Neon Ambiente */}
      <div
        ref={glowRef}
        className="absolute -top-3 left-0 w-12 h-12 rounded-full bg-emerald-400/40 blur-xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Camada com Filtro Gooey Líquido (Metaballs ativas) */}
      <div
        className="absolute inset-0 pointer-events-none z-0 overflow-visible"
        style={{ filter: "url(#liquid-nav-goo)" }}
        aria-hidden="true"
      >
        {/* Gota Secundária de Rastro Líquido */}
        <div
          ref={trailOrbRef}
          className="absolute -top-1.5 left-0 w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 opacity-0"
        />

        {/* Corpo Líquido do Círculo Principal */}
        <div
          ref={mainOrbRef}
          className="absolute -top-3 left-0 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300"
        />
      </div>

      {/* Onda de Respingo Líquido ao Pousar */}
      <div
        ref={rippleOrbRef}
        className="absolute -top-3 left-0 w-12 h-12 rounded-full border-2 border-emerald-400/60 pointer-events-none z-0 opacity-0"
        aria-hidden="true"
      />

      {/* Borda Nítida, Sombra e Brilho Especular 3D de Vidro Líquido */}
      <div
        ref={orbRingRef}
        className="absolute -top-3 left-0 w-12 h-12 rounded-full border-[3px] border-[#090b0f] shadow-[0_4px_22px_rgba(16,185,129,0.55)] pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Reflexo Especular Orgânico */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0.15)_35%,transparent_65%)] pointer-events-none" />
      </div>
    </>
  );
}
