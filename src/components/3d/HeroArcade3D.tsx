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
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Grupo Principal: Cartucho Gamer 3D
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Corpo do Cartucho (Chassis)
    const bodyGeo = new THREE.BoxGeometry(2.4, 3.2, 0.45);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x12151c,
      roughness: 0.35,
      metalness: 0.7,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    mainGroup.add(bodyMesh);

    // Ranhuras e chanfros do Cartucho (Detalhes Mecânicos)
    const slotGeo = new THREE.BoxGeometry(1.9, 1.4, 0.5);
    const slotMat = new THREE.MeshStandardMaterial({
      color: 0x080a0e,
      roughness: 0.6,
      metalness: 0.3,
    });
    const slotMesh = new THREE.Mesh(slotGeo, slotMat);
    slotMesh.position.set(0, -0.4, 0.02);
    mainGroup.add(slotMesh);

    // Borda metálica do Cartucho (Wireframe accent)
    const edges = new THREE.EdgesGeometry(bodyGeo);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x363e50,
      linewidth: 1,
    });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    mainGroup.add(wireframe);

    // Etiqueta Holográfica do Cartucho
    const labelGeo = new THREE.PlaneGeometry(1.7, 1.2);
    const labelMat = new THREE.MeshStandardMaterial({
      color: 0x171b24,
      roughness: 0.2,
      metalness: 0.9,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.6, 0.23);
    mainGroup.add(labelMesh);

    // Chip de ouro / Conectores inferiores
    const pinGeo = new THREE.BoxGeometry(1.8, 0.2, 0.15);
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.2,
      metalness: 0.95,
    });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.position.set(0, -1.65, 0);
    mainGroup.add(pinMesh);

    // 4. Campo de Micro-Partículas Orbitais (Poeira de Arcade)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 8;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Iluminação Dinâmica
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Luz que segue o mouse
    const mouseLight = new THREE.PointLight(0x00e5ff, 4, 12);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // Luz secundária quente (Volt Amber)
    const rimLight = new THREE.DirectionalLight(0xffb800, 1.5);
    rimLight.position.set(-4, 3, -2);
    scene.add(rimLight);

    // 6. Rastreamento de Mouse & Interação
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0.2;
    let targetRotationY = -0.3;
    let spinVelocity = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      mouseX = x;
      mouseY = y;

      targetRotationY = x * 1.2;
      targetRotationX = -y * 0.9 + 0.15;

      // Luz acompanha o cursor
      mouseLight.position.x = x * 6;
      mouseLight.position.y = -y * 6;
    };

    const handleClick = () => {
      // Impulso de giro arcade (360° spin)
      spinVelocity = Math.PI * 3;
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    // 7. Pausa de renderização quando fora da tela (IntersectionObserver)
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 8. Responsividade do Canvas
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 9. Loop de Animação a 60fps com amortecimento (Lerp)
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Flutuação orbital sutil
      const floatingY = Math.sin(elapsedTime * 1.5) * 0.12;
      mainGroup.position.y = floatingY;

      // Giro suave ou impulso por clique
      if (spinVelocity > 0.01) {
        mainGroup.rotation.y += spinVelocity * delta;
        spinVelocity *= 0.94; // desaceleração elástica
      } else {
        // Amortecimento em direção ao cursor
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.07;
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.07;
      }

      // Rotação sutil do campo de partículas
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = Math.sin(elapsedTime * 0.02) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 10. Limpeza completa no unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("click", handleClick);

      bodyGeo.dispose();
      bodyMat.dispose();
      slotGeo.dispose();
      slotMat.dispose();
      edges.dispose();
      lineMat.dispose();
      labelGeo.dispose();
      labelMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
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
      className="relative w-full h-[260px] sm:h-[320px] lg:h-[350px] flex items-center justify-center cursor-pointer select-none"
      title="Clique para girar o cartucho 3D do GameVault"
      aria-hidden="true"
    >
      {/* Rótulo discreto de interação */}
      <div
        className={`absolute bottom-2 right-4 px-2.5 py-1 rounded border border-[#242a36] bg-[#0c0e13]/80 backdrop-blur text-[10px] font-mono text-neutral-400 transition-opacity duration-300 pointer-events-none ${
          isHovered ? "opacity-100" : "opacity-40"
        }`}
      >
        <span>[3D INTERACTIVE // CLIQUE PARA GIRAR]</span>
      </div>
    </div>
  );
}
