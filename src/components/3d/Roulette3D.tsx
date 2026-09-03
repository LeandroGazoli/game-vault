"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";

interface Roulette3DProps {
  isSpinning: boolean;
  onSpinEnd?: () => void;
}

export default function Roulette3D({ isSpinning }: Roulette3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSpinningRef = useRef(isSpinning);
  const velocityRef = useRef({ val: 0.8 });
  const meshRef = useRef<THREE.Mesh | null>(null);
  const light1Ref = useRef<THREE.PointLight | null>(null);
  const light2Ref = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    isSpinningRef.current = isSpinning;

    if (isSpinning) {
      // Aceleração rápida ao girar
      gsap.to(velocityRef.current, {
        val: 14.0,
        duration: 0.35,
        ease: "power2.in",
        overwrite: true,
      });
      if (light1Ref.current) gsap.to(light1Ref.current, { intensity: 10, duration: 0.3 });
      if (light2Ref.current) gsap.to(light2Ref.current, { intensity: 8, duration: 0.3 });
    } else {
      // Desaceleração dramática com suspense cinemático ("slow-mo")
      gsap.to(velocityRef.current, {
        val: 0.8,
        duration: 1.4,
        ease: "power4.out",
        overwrite: true,
      });
      if (light1Ref.current) gsap.to(light1Ref.current, { intensity: 5, duration: 0.8, ease: "power2.out" });
      if (light2Ref.current) gsap.to(light2Ref.current, { intensity: 4, duration: 0.8, ease: "power2.out" });
      if (meshRef.current) {
        gsap.fromTo(
          meshRef.current.scale,
          { x: 1.25, y: 1.25, z: 1.25 },
          { x: 1, y: 1, z: 1, duration: 0.5, ease: "back.out(2)" }
        );
      }
    }
  }, [isSpinning]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 240;

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
      camera.position.set(0, 0, 5.5);

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // Dado D20 / Arcade Core
    const geometry = new THREE.IcosahedronGeometry(1.4, 0);

    // Faces metálicas translúcidas
    const material = new THREE.MeshStandardMaterial({
      color: 0x121622,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Wireframe Neon Dourado sobre o D20
    const edgeGeo = new THREE.EdgesGeometry(geometry);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffb800,
      linewidth: 2,
    });
    const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(wireframe);

    // Núcleo de Energia Interno (Esfera pulsante)
    const innerGeo = new THREE.SphereGeometry(0.7, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      wireframe: true,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // Anel orbital de partículas
    const ringGeo = new THREE.TorusGeometry(2.0, 0.03, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    // Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const light1 = new THREE.PointLight(0x00e5ff, 5, 10);
    light1.position.set(3, 3, 3);
    scene.add(light1);
    light1Ref.current = light1;

    const light2 = new THREE.PointLight(0xec4899, 4, 10);
    light2.position.set(-3, -2, 2);
    scene.add(light2);
    light2Ref.current = light2;

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const speed = velocityRef.current.val;

      mesh.rotation.x += speed * delta;
      mesh.rotation.y += speed * 1.3 * delta;

      wireframe.rotation.x = mesh.rotation.x;
      wireframe.rotation.y = mesh.rotation.y;

      innerMesh.rotation.y -= speed * 2 * delta;
      const pulse = Math.sin(time * 6) * 0.15 + 0.7;
      innerMesh.scale.set(pulse, pulse, pulse);

      ring.rotation.x = Math.PI / 2 + Math.sin(time * 2) * 0.3;
      ring.rotation.y = time * Math.max(1.5, speed * 0.5);

      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.forceContextLoss?.();
      renderer.dispose();
      meshRef.current = null;
      light1Ref.current = null;
      light2Ref.current = null;
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-44 sm:h-52 flex items-center justify-center my-2 select-none pointer-events-none"
    />
  );
}
