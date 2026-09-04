"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

export default function SpaceDustCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detectar preferência por movimento reduzido ou dispositivo móvel / touch / PWA
    const isMobileOrTouch =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 ||
        window.matchMedia("(hover: none)").matches ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(display-mode: standalone)").matches);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Em mobile, telas pequenas ou modo standalone PWA, não inicializa Three.js para poupar 100% de GPU/bateria e evitar tela preta
    if (isMobileOrTouch || prefersReducedMotion) {
      canvas.style.display = "none";
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let animationFrameId: number | null = null;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
      camera.position.z = 380;
      camera.position.y = 0;

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: "default",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    } catch {
      return;
    }

    // Tratamento defensivo contra perda de contexto WebGL
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost, false);

    // ============================================================
    // 1. CAMADA DE LUZES ATMOSFÉRICAS REATIVAS AO CURSOR
    // ============================================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    // Luz pontual suave que segue o cursor pelo site
    const cursorLight = new THREE.PointLight(0x00e5ff, 2.5, 650);
    cursorLight.position.set(0, 0, 200);
    scene.add(cursorLight);

    const accentLight = new THREE.PointLight(0x10b981, 1.8, 550);
    accentLight.position.set(-200, -100, 150);
    scene.add(accentLight);

    // ============================================================
    // 2. CAMADA 1: CAMPO DE POEIRA ESTELAR (Deep Starfield)
    // ============================================================
    const particleCount = 240;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyanCol = new THREE.Color(0x00e5ff);
    const amberCol = new THREE.Color(0xffb800);
    const emeraldCol = new THREE.Color(0x10b981);
    const slateCol = new THREE.Color(0x475569);

    const randomRange = gsap.utils.random;

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 1100;
      positions[i + 1] = (Math.random() - 0.5) * 1800; // Estendido no eixo Y para cobrir scroll
      positions[i + 2] = (Math.random() - 0.5) * 700;

      const r = Math.random();
      const col =
        r > 0.75
          ? cyanCol
          : r > 0.5
          ? emeraldCol
          : r > 0.3
          ? amberCol
          : slateCol;

      colors[i] = col.r;
      colors[i + 1] = col.g;
      colors[i + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const starfield = new THREE.Points(particleGeo, particleMat);
    scene.add(starfield);

    // ============================================================
    // 3. CAMADA 2: ARTEFATOS GEOMÉTRICOS FLUTUANTES (Gamer Glyphs)
    // ============================================================
    // D20s (Icosaedros), prismas e anéis cibernéticos em wireframe discreto
    const floatingGroup = new THREE.Group();
    scene.add(floatingGroup);

    const glyphMeshes: {
      mesh: THREE.Mesh | THREE.LineSegments;
      baseY: number;
      speedY: number;
      rotSpeedX: number;
      rotSpeedY: number;
    }[] = [];

    // Geometrias reutilizadas para economia de memória
    const icoGeo = new THREE.IcosahedronGeometry(22, 0);
    const tetraGeo = new THREE.TetrahedronGeometry(18, 0);
    const torusGeo = new THREE.TorusGeometry(26, 0.8, 6, 24);

    const edgeIco = new THREE.EdgesGeometry(icoGeo);
    const edgeTetra = new THREE.EdgesGeometry(tetraGeo);
    const edgeTorus = new THREE.EdgesGeometry(torusGeo);

    // 8 artefatos sutis espalhados ao longo da profundidade e altura da página
    const glyphConfigs = [
      { geo: edgeIco, color: 0x00e5ff, x: -320, y: 150, z: -100, rotSpeed: 0.004 },
      { geo: edgeTetra, color: 0xffb800, x: 340, y: -100, z: -80, rotSpeed: 0.005 },
      { geo: edgeTorus, color: 0x10b981, x: -280, y: -450, z: -150, rotSpeed: 0.003 },
      { geo: edgeIco, color: 0x00e5ff, x: 310, y: -800, z: -120, rotSpeed: 0.004 },
      { geo: edgeTetra, color: 0x38bdf8, x: -350, y: -1200, z: -90, rotSpeed: 0.005 },
      { geo: edgeTorus, color: 0xf59e0b, x: 290, y: -1600, z: -140, rotSpeed: 0.003 },
      { geo: edgeIco, color: 0x10b981, x: -270, y: -2000, z: -110, rotSpeed: 0.004 },
      { geo: edgeTetra, color: 0x00e5ff, x: 330, y: -2400, z: -100, rotSpeed: 0.005 },
    ];

    glyphConfigs.forEach((cfg) => {
      const mat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.22,
      });

      const line = new THREE.LineSegments(cfg.geo, mat);
      line.position.set(cfg.x, cfg.y, cfg.z);
      floatingGroup.add(line);

      glyphMeshes.push({
        mesh: line,
        baseY: cfg.y,
        speedY: (Math.random() + 0.5) * 0.4,
        rotSpeedX: cfg.rotSpeed,
        rotSpeedY: cfg.rotSpeed * 1.3,
      });
    });

    // ============================================================
    // 4. GSAP QUICKTO PARA MOVIMENTO DO MOUSE EM ALTA PERFORMANCE
    // ============================================================
    const mousePos = { x: 0, y: 0 };
    const clampMouse = gsap.utils.clamp(-1, 1);

    // quickTo evita criar novos tweens por evento de mousemove (padrão oficial gsap-performance)
    const quickCameraRotX = gsap.quickTo(camera.rotation, "x", {
      duration: 0.8,
      ease: "power2.out",
    });
    const quickCameraRotY = gsap.quickTo(camera.rotation, "y", {
      duration: 0.8,
      ease: "power2.out",
    });
    const quickLightX = gsap.quickTo(cursorLight.position, "x", {
      duration: 0.5,
      ease: "power1.out",
    });
    const quickLightY = gsap.quickTo(cursorLight.position, "y", {
      duration: 0.5,
      ease: "power1.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;

      const normX = clampMouse((e.clientX / window.innerWidth) * 2 - 1);
      const normY = clampMouse(-(e.clientY / window.innerHeight) * 2 + 1);

      mousePos.x = normX;
      mousePos.y = normY;

      // Inclinação sutil estereoscópica da câmera
      quickCameraRotY(-normX * 0.08);
      quickCameraRotX(normY * 0.06);

      // Posicionamento do ponto de luz
      quickLightX(normX * 300);
      quickLightY(normY * 200 + camera.position.y);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ============================================================
    // 5. PARALLAX CONTÍNUO AO LONGO DO SITE (Passivo e Ultraleve)
    // ============================================================
    let targetCameraY = 0;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
      targetCameraY = -2200 * Math.min(Math.max(progress, 0), 1);
    };

    if (!prefersReducedMotion) {
      window.addEventListener("scroll", handleScroll, { passive: true });
      handleScroll();
    }

    // ============================================================
    // 6. LOOP DE ANIMAÇÃO 60FPS (Otimizado com VisibilityChange)
    // ============================================================
    let clock = new THREE.Clock();
    let isVisible = true;

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Translação suave da câmera no eixo Y pelo scroll (lerp amortecido)
      if (!prefersReducedMotion) {
        camera.position.y += (targetCameraY - camera.position.y) * 0.06;
      }

      // Rotação sutil e contínua do campo estelar
      starfield.rotation.y += 0.0003;
      starfield.rotation.x += 0.0001;

      // Animação dos artefatos geométricos flutuantes
      glyphMeshes.forEach((item, idx) => {
        item.mesh.rotation.x += item.rotSpeedX;
        item.mesh.rotation.y += item.rotSpeedY;

        // Flutuação orgânica senoidal
        const floatDelta = Math.sin(time * 1.5 + idx) * 0.15;
        item.mesh.position.y = item.baseY + floatDelta * 12;
      });

      // Pulso suave do ponto de luz secundário
      accentLight.intensity = 1.6 + Math.sin(time * 2) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    // ============================================================
    // 7. RESIZE HANDLER (Debounced)
    // ============================================================
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // ============================================================
    // 8. CLEANUP RIGOROSO (Prevenção de Memory Leaks)
    // ============================================================
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibility);

      particleGeo.dispose();
      particleMat.dispose();

      icoGeo.dispose();
      tetraGeo.dispose();
      torusGeo.dispose();
      edgeIco.dispose();
      edgeTetra.dispose();
      edgeTorus.dispose();

      glyphMeshes.forEach((item) => {
        if ("material" in item.mesh && item.mesh.material instanceof THREE.Material) {
          item.mesh.material.dispose();
        }
      });

      renderer.forceContextLoss?.();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10 w-full h-full opacity-70"
      aria-hidden="true"
    />
  );
}
