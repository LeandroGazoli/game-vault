"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import Link from "next/link";
import { Sparkles, Compass, Shield, Sword, Flame, ChevronRight, Zap } from "lucide-react";

interface HeroCharacter {
  id: string;
  name: string;
  role: string;
  saga: string;
  query: string;
  image: string;
  color: string;
  hexColor: number;
  badge: string;
  description: string;
}

const HEROES: HeroCharacter[] = [
  {
    id: "kratos",
    name: "Kratos",
    role: "O Fantasma de Esparta",
    saga: "God of War",
    query: "God of War",
    image: "/characters/kratos.jpg",
    color: "from-cyan-500/20 to-blue-600/20 text-cyan-400 border-cyan-500/40",
    hexColor: 0x00e5ff,
    badge: "Mitologia Nórdica",
    description: "Empunhando o Machado Leviatã e as Lâminas do Caos.",
  },
  {
    id: "geralt",
    name: "Geralt de Rívia",
    role: "O Lobo Branco",
    saga: "The Witcher",
    query: "The Witcher",
    image: "/characters/geralt.jpg",
    color: "from-amber-500/20 to-orange-600/20 text-amber-300 border-amber-500/40",
    hexColor: 0xffb800,
    badge: "Caçador de Monstros",
    description: "Mestre da espada de prata, sinais arcanos e poções.",
  },
  {
    id: "elden",
    name: "Maculado (Tarnished)",
    role: "Lorde Prístino",
    saga: "Elden Ring",
    query: "Elden Ring",
    image: "/characters/elden.jpg",
    color: "from-yellow-500/20 to-amber-700/20 text-yellow-300 border-yellow-500/40",
    hexColor: 0xffd700,
    badge: "Graça Dourada",
    description: "Desbravador das Terras Intermédias guiado pela Grande Runa.",
  },
  {
    id: "cyberpunk",
    name: "V // Mercenário",
    role: "Lenda de Night City",
    saga: "Cyberpunk 2077",
    query: "Cyberpunk 2077",
    image: "/characters/cyberpunk.jpg",
    color: "from-teal-500/20 to-cyan-700/20 text-teal-300 border-teal-500/40",
    hexColor: 0x06b6d4,
    badge: "Cyberware Avançado",
    description: "Katana térmica e reflexos aprimorados no submundo futurista.",
  },
];

export default function ParallaxCharactersSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [activeHero, setActiveHero] = useState<HeroCharacter>(HEROES[0]);
  const [isHovered, setIsHovered] = useState(false);

  // Referência para sincronizar foco no Three.js
  const focusTargetRef = useRef<number>(0);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let width = container.clientWidth || 900;
    let height = container.clientHeight || 460;

    // 1. Setup Three.js
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0c10, 0.04);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 2. Luzes de Ambientação
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00e5ff, 4, 18);
    pointLight.position.set(0, 2, 6);
    scene.add(pointLight);

    const goldPointLight = new THREE.PointLight(0xffb800, 3, 14);
    goldPointLight.position.set(-4, -2, 4);
    scene.add(goldPointLight);

    // 3. Carregar Texturas dos Personagens em Planos 3D
    const textureLoader = new THREE.TextureLoader();
    const characterMeshes: THREE.Group[] = [];

    // Posições em camadas de profundidade Z para parallax estéreo
    const positionsConfig = [
      { x: -3.6, y: 0.2, z: 0.5, rotY: 0.18 },   // Kratos
      { x: -1.2, y: -0.1, z: 1.8, rotY: 0.08 },  // Geralt
      { x: 1.2, y: 0.1, z: 1.2, rotY: -0.08 },   // Elden Knight
      { x: 3.6, y: -0.2, z: 0.2, rotY: -0.18 },  // Cyberpunk
    ];

    const cardGeo = new THREE.PlaneGeometry(2.1, 2.8);
    const borderGeo = new THREE.EdgesGeometry(cardGeo);

    HEROES.forEach((hero, index) => {
      const charGroup = new THREE.Group();
      const cfg = positionsConfig[index];
      charGroup.position.set(cfg.x, cfg.y, cfg.z);
      charGroup.rotation.y = cfg.rotY;

      // Textura da arte 3D do personagem
      const texture = textureLoader.load(hero.image);
      texture.colorSpace = THREE.SRGBColorSpace;

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.25,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95,
      });

      const mesh = new THREE.Mesh(cardGeo, mat);
      charGroup.add(mesh);

      // Borda Neon Wireframe Iluminada
      const borderMat = new THREE.LineBasicMaterial({
        color: hero.hexColor,
        linewidth: 2,
      });
      const wireframe = new THREE.LineSegments(borderGeo, borderMat);
      charGroup.add(wireframe);

      // Cristal / Runa 3D Flutuante sobre o personagem
      const crystalGeo = new THREE.OctahedronGeometry(0.18, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: hero.hexColor,
        emissive: hero.hexColor,
        emissiveIntensity: 0.8,
        wireframe: true,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.set(0, 1.6, 0.2);
      charGroup.add(crystal);

      scene.add(charGroup);
      characterMeshes.push(charGroup);
    });

    // 4. Campo de Partículas de Poeira Estelar / Faíscas
    const particleCount = 160;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;

      const col = new THREE.Color(
        i % 2 === 0 ? 0x00e5ff : 0xffb800
      );
      particleColors[i] = col.r;
      particleColors[i + 1] = col.g;
      particleColors[i + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interação com o Mouse (Parallax 3D com amortecimento elástico)
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
      targetCameraX = x * 1.8;
      targetCameraY = -y * 1.2;
      pointLight.position.x = x * 6;
      pointLight.position.y = -y * 4;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. Sincronização de ScrollTrigger (Parallax de Scroll)
    let scrollProgress = 0;
    let st: ScrollTrigger | null = null;

    if (sectionRef.current) {
      st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: 1.2,
        onUpdate: (self) => {
          scrollProgress = self.progress - 0.5; // -0.5 a 0.5
        },
      });
    }

    // 7. Loop de Animação 60fps com IntersectionObserver
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Suavização da câmera com mouse lerp
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Movimento de Parallax nos personagens guiado pelo scroll e tempo
      characterMeshes.forEach((meshGroup, idx) => {
        const speedMultiplier = (idx + 1) * 0.4;
        const floatOffset = idx * 1.5;

        // Flutuação orgânica
        meshGroup.position.y =
          positionsConfig[idx].y + Math.sin(time * 1.6 + floatOffset) * 0.12;

        // Parallax de scroll em Z e X
        const scrollShift = scrollProgress * speedMultiplier * 1.5;
        meshGroup.position.x = positionsConfig[idx].x + scrollShift;

        // Giro leve da runa flutuante
        const crystal = meshGroup.children[2];
        if (crystal) {
          crystal.rotation.y = time * 2;
          crystal.rotation.x = time * 1.5;
        }
      });

      // Partículas cósmicas rotacionam suavemente
      particles.rotation.y = time * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      st?.kill();

      cardGeo.dispose();
      borderGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.forceContextLoss?.();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f131a] via-[#090b10] to-[#07080b] p-6 sm:p-10 shadow-2xl space-y-6"
    >
      {/* Luzes de Fundo Atmosféricas */}
      <div className="pointer-events-none absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-[130px]" />

      {/* Cabeçalho da Seção */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              IMERSÃO 3D PARALLAX // HEROES & LEGENDS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-display">
            Personagens &amp; Universos Lendários
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl">
            Mova o mouse ou role a página para sentir a profundidade tridimensional dos maiores protagonistas dos games.
          </p>
        </div>

        {/* Indicador de Controle */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
          <span>Parallax Multicamadas Ativo</span>
        </div>
      </div>

      {/* Palco 3D WebGL Three.js com Parallax */}
      <div
        ref={canvasContainerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full h-[360px] sm:h-[420px] lg:h-[460px] rounded-2xl overflow-hidden border border-white/10 bg-[#07090e]/90 cursor-grab active:cursor-grabbing select-none shadow-inner"
        title="Mova o mouse para inclinar os personagens em 3D"
      >
        {/* Indicador de Instrução Flutuante */}
        <div
          className={`absolute bottom-3 right-4 px-3 py-1.5 rounded-full border border-cyan-500/30 bg-[#090c12]/85 backdrop-blur-md text-[11px] font-mono text-cyan-300 transition-opacity duration-300 pointer-events-none flex items-center gap-2 ${
            isHovered ? "opacity-100" : "opacity-60"
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
          <span>Mova o cursor para navegar em 3D</span>
        </div>
      </div>

      {/* Grid de Cards dos Heróis com Ações Rápidas */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
        {HEROES.map((hero) => (
          <Link
            key={hero.id}
            href={`/search?q=${encodeURIComponent(hero.query)}`}
            onMouseEnter={() => setActiveHero(hero)}
            className={`group relative rounded-2xl border p-4 bg-gradient-to-b transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between min-h-[140px] ${
              activeHero.id === hero.id
                ? `${hero.color} shadow-lg shadow-cyan-500/10`
                : "border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                  {hero.badge}
                </span>
                <span className="text-xs text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
              <h3 className="text-base font-black text-white group-hover:text-cyan-300 transition-colors">
                {hero.name}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-1">
                {hero.role} • <strong className="text-neutral-300">{hero.saga}</strong>
              </p>
            </div>

            <p className="text-[11px] text-neutral-400 pt-2 border-t border-white/5 line-clamp-2">
              {hero.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
