"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function HeroArcade3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Verificação de suporte a WebGL
    try {
      const canvasTest = document.createElement("canvas");
      const gl = canvasTest.getContext("webgl") || canvasTest.getContext("experimental-webgl");
      if (!gl) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    // 2. Setup do Three.js
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 380;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 3. Grupo Principal: Cartucho Gamer 3D + Elementos Orbitais
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- A. Chassis do Cartucho (Titânio Grafite com Emissive Neon) ---
    const bodyGeo = new THREE.BoxGeometry(2.3, 3.1, 0.42);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.25,
      metalness: 0.85,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    mainGroup.add(bodyMesh);

    // Borda Neon Wireframe Iluminada em Ciano
    const edges = new THREE.EdgesGeometry(bodyGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    mainGroup.add(wireframe);

    // --- B. Slot Interno e Tela Holográfica Central ---
    const screenGeo = new THREE.PlaneGeometry(1.8, 1.3);
    const screenMat = new THREE.MeshStandardMaterial({
      color: 0x091422,
      emissive: 0x005577,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.55, 0.22);
    mainGroup.add(screenMesh);

    // Grid do Holograma na Tela
    const gridHelper = new THREE.GridHelper(1.6, 8, 0x00e5ff, 0x007799);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(0, 0.55, 0.23);
    mainGroup.add(gridHelper);

    // --- C. Núcleo Holográfico Giratório (Cristal D20 no Centro) ---
    const coreGeo = new THREE.IcosahedronGeometry(0.38, 0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      emissive: 0xff8800,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, 0.55, 0.35);
    mainGroup.add(coreMesh);

    // --- D. Conectores Dourados Inferiores do Cartucho ---
    const pinGeo = new THREE.BoxGeometry(1.9, 0.25, 0.16);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      emissive: 0xd97706,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.95,
    });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.set(0, -1.6, 0);
    mainGroup.add(pinMesh);

    // Ranhuras de ventilação mecânicas
    for (let i = 0; i < 4; i++) {
      const ventGeo = new THREE.BoxGeometry(1.6, 0.05, 0.08);
      const ventMat = new THREE.MeshStandardMaterial({
        color: 0x0a0d14,
        roughness: 0.8,
      });
      const ventMesh = new THREE.Mesh(ventGeo, ventMat);
      ventMesh.position.set(0, -0.4 - i * 0.2, 0.22);
      mainGroup.add(ventMesh);
    }

    // --- E. Elementos Orbitais (Satélites Holográficos Flutuantes) ---
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Satélite 1: Diamante Ciano em Órbita
    const sat1Geo = new THREE.OctahedronGeometry(0.22, 0);
    const sat1Mat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00b4d8,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1,
    });
    const sat1 = new THREE.Mesh(sat1Geo, sat1Mat);
    orbitGroup.add(sat1);

    // Satélite 2: Anel Dourado Flutuante
    const sat2Geo = new THREE.TorusGeometry(0.24, 0.04, 8, 24);
    const sat2Mat = new THREE.MeshStandardMaterial({
      color: 0xffb800,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const sat2 = new THREE.Mesh(sat2Geo, sat2Mat);
    orbitGroup.add(sat2);

    // Satélite 3: Tetraedro Esmeralda
    const sat3Geo = new THREE.TetrahedronGeometry(0.2, 0);
    const sat3Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: 0.9,
      metalness: 0.9,
      roughness: 0.1,
    });
    const sat3 = new THREE.Mesh(sat3Geo, sat3Mat);
    orbitGroup.add(sat3);

    // --- F. Campo de Partículas Estelares Vivas (220 Partículas) ---
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x00e5ff);
    const goldColor = new THREE.Color(0xffb800);
    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 9;
      particlePositions[i + 1] = (Math.random() - 0.5) * 9;
      particlePositions[i + 2] = (Math.random() - 0.5) * 7;

      const choice = Math.random();
      const col = choice > 0.6 ? cyanColor : choice > 0.3 ? goldColor : whiteColor;
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- G. Iluminação Dinâmica Forte ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Luz Ciano Principal que segue o cursor do mouse
    const mouseLight = new THREE.PointLight(0x00e5ff, 6, 15);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // Luz Dourada de Realce
    const goldLight = new THREE.PointLight(0xffb800, 4.5, 12);
    goldLight.position.set(-3, 2, 2);
    scene.add(goldLight);

    // Luz Direcional Superior
    const topLight = new THREE.DirectionalLight(0xffffff, 1.8);
    topLight.position.set(3, 5, 4);
    scene.add(topLight);

    // --- H. Interatividade & Eventos de Mouse ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.15;
    let targetRotationY = -0.25;
    let spinVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX = x;
      mouseY = y;

      targetRotationY = x * 1.5;
      targetRotationX = -y * 1.1 + 0.15;

      // Luzes acompanham o cursor
      mouseLight.position.x = x * 7;
      mouseLight.position.y = -y * 7;
      goldLight.position.x = -x * 5 - 2;
    };

    const handleClick = () => {
      // Impulso arcade 720° ao clicar
      spinVelocity = Math.PI * 5;
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    // --- I. Pausa quando fora de visão ---
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // --- J. Resize ---
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- K. Loop a 60fps ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Flutuação vertical orgânica
      mainGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.16;

      // Giro contínuo do núcleo D20
      coreMesh.rotation.x = elapsedTime * 1.5;
      coreMesh.rotation.y = elapsedTime * 2.0;

      // Rotação dos Satélites orbitais em 3D
      const r1 = 2.4;
      sat1.position.set(Math.cos(elapsedTime * 1.4) * r1, Math.sin(elapsedTime * 1.2) * 0.8, Math.sin(elapsedTime * 1.4) * r1);
      sat1.rotation.y = elapsedTime * 3;

      const r2 = 2.8;
      sat2.position.set(Math.sin(elapsedTime * 0.9 + 2) * r2, Math.cos(elapsedTime * 1.1) * 1.0, Math.cos(elapsedTime * 0.9 + 2) * r2);
      sat2.rotation.x = elapsedTime * 2;
      sat2.rotation.z = elapsedTime * 1.5;

      const r3 = 2.2;
      sat3.position.set(Math.cos(elapsedTime * 1.6 + 4) * r3, Math.sin(elapsedTime * 1.5) * 1.2, Math.sin(elapsedTime * 1.6 + 4) * r3);
      sat3.rotation.x = elapsedTime * 2.5;

      // Giro suave do cartucho ou impulso de rotação arcade
      if (spinVelocity > 0.01) {
        mainGroup.rotation.y += spinVelocity * delta;
        spinVelocity *= 0.95; // desaceleração elástica
      } else {
        // Amortecimento lerp
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.08;
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.08;
      }

      // Rotação das partículas
      particles.rotation.y = elapsedTime * 0.05;
      particles.rotation.x = Math.sin(elapsedTime * 0.03) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // --- L. Limpeza Completa ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("click", handleClick);

      bodyGeo.dispose();
      bodyMat.dispose();
      edges.dispose();
      lineMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      sat1Geo.dispose();
      sat1Mat.dispose();
      sat2Geo.dispose();
      sat2Mat.dispose();
      sat3Geo.dispose();
      sat3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (!isSupported) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[320px] sm:h-[360px] lg:h-[400px] flex items-center justify-center cursor-pointer select-none"
      title="Clique para girar o cartucho 3D do GameVault"
      aria-label="Cena 3D interativa do GameVault"
    >
      {/* Halo de luz neon sob o cartucho */}
      <div className="absolute inset-0 bg-gradient-radial from-cyan-500/15 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

      {/* Rótulo de instrução tátil */}
      <div
        className={`absolute bottom-3 right-4 px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-[#0c0e13]/90 backdrop-blur text-[11px] font-mono text-cyan-300 transition-all duration-300 pointer-events-none shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 ${
          isHovered ? "opacity-100 scale-105 border-cyan-400" : "opacity-70"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>[3D INTERATIVO // CLIQUE PARA GIRAR]</span>
      </div>
    </div>
  );
}
