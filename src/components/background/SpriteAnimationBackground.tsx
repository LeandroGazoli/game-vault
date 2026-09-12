"use client";

import React, { useEffect, useRef } from "react";

/**
 * SpriteAnimationBackground
 * Renderiza personagens e mascotes retrô pixel art (caminhantes, naves espaciais e orbes de luz)
 * com animação fluida baseada em Canvas 2D ultraleve (< 1% CPU), com estética pura de videogame.
 */
interface SpriteWalker {
  x: number;
  y: number;
  speed: number;
  scale: number;
  type: "pixel-hero" | "spaceship" | "ghost" | "coin";
  frame: number;
  frameTimer: number;
  direction: 1 | -1;
  color: string;
}

export default function SpriteAnimationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let animationFrameId: number;

    const walkers: SpriteWalker[] = [
      {
        x: -50,
        y: height - 120,
        speed: 0.9,
        scale: 2.2,
        type: "pixel-hero",
        frame: 0,
        frameTimer: 0,
        direction: 1,
        color: "#10b981",
      },
      {
        x: width + 50,
        y: height - 160,
        speed: 1.2,
        scale: 2.0,
        type: "ghost",
        frame: 0,
        frameTimer: 0,
        direction: -1,
        color: "#00e5ff",
      },
      {
        x: width * 0.2,
        y: 140,
        speed: 0.6,
        scale: 1.8,
        type: "spaceship",
        frame: 0,
        frameTimer: 0,
        direction: 1,
        color: "#a855f7",
      },
      {
        x: width * 0.8,
        y: 220,
        speed: 0.4,
        scale: 1.5,
        type: "coin",
        frame: 0,
        frameTimer: 0,
        direction: 1,
        color: "#fbbf24",
      },
    ];

    const drawPixelArtHero = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      frame: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.fillStyle = color;

      // Desenho procedural em blocos estilo 8-bit
      const legOffset = frame % 2 === 0 ? 0 : 2;
      // Cabeça / Elmo
      c.fillRect(3, 0, 6, 4);
      // Viseira
      c.fillStyle = "#ffffff";
      c.fillRect(6, 1, 3, 2);
      // Corpo
      c.fillStyle = color;
      c.fillRect(2, 4, 8, 6);
      // Detalhe Peitoral
      c.fillStyle = "#ffffff";
      c.fillRect(4, 5, 2, 2);
      // Pernas animadas
      c.fillStyle = "#0f172a";
      c.fillRect(3, 10, 2, 3 - legOffset);
      c.fillRect(7, 10, 2, 1 + legOffset);

      c.restore();
    };

    const drawSpaceship = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.fillStyle = color;
      // Fuselagem
      c.fillRect(0, 4, 12, 4);
      c.fillRect(4, 2, 6, 2);
      c.fillRect(8, 0, 2, 2);
      // Propulsor néon
      c.fillStyle = "#00e5ff";
      c.fillRect(-3, 5, 3, 2);
      c.restore();
    };

    const drawGhost = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.fillStyle = color;
      c.fillRect(2, 0, 8, 3);
      c.fillRect(0, 3, 12, 7);
      // Olhos
      c.fillStyle = "#ffffff";
      c.fillRect(2, 4, 3, 3);
      c.fillRect(7, 4, 3, 3);
      c.fillStyle = "#090d16";
      c.fillRect(2, 5, 2, 2);
      c.fillRect(7, 5, 2, 2);
      c.restore();
    };

    const drawCoin = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      frame: number,
      color: string
    ) => {
      c.save();
      c.translate(x, y);
      c.scale(scale, scale);
      c.fillStyle = color;
      const coinWidth = [6, 4, 2, 4][frame % 4];
      const coinOffset = (6 - coinWidth) / 2;
      c.fillRect(coinOffset, 0, coinWidth, 8);
      c.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Linha sutil de chão pixelado no rodapé
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(0, height - 100, width, 1);

      walkers.forEach((walker) => {
        walker.frameTimer++;
        if (walker.frameTimer > 12) {
          walker.frameTimer = 0;
          walker.frame = (walker.frame + 1) % 4;
        }

        walker.x += walker.speed * walker.direction;

        // Reset ao sair da tela
        if (walker.direction === 1 && walker.x > width + 80) {
          walker.x = -80;
        } else if (walker.direction === -1 && walker.x < -80) {
          walker.x = width + 80;
        }

        if (walker.type === "pixel-hero") {
          drawPixelArtHero(ctx, walker.x, walker.y, walker.scale, walker.frame, walker.color);
        } else if (walker.type === "spaceship") {
          drawSpaceship(ctx, walker.x, walker.y, walker.scale, walker.color);
        } else if (walker.type === "ghost") {
          drawGhost(ctx, walker.x, walker.y, walker.scale, walker.color);
        } else if (walker.type === "coin") {
          drawCoin(ctx, walker.x, walker.y, walker.scale, walker.frame, walker.color);
        }
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize, { passive: true });
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full opacity-60"
      aria-hidden="true"
    />
  );
}
