"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseDragScrollOptions {
  /**
   * Distância mínima em pixels para considerar como arrasto (evita bloquear cliques acidentais).
   * Default: 5px
   */
  threshold?: number;
}

/**
 * Hook utilitário para permitir rolagem horizontal por clique e arrasto (drag to scroll)
 * no mouse (Desktop/PC) sem interferir no touch nativo de dispositivos móveis.
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>(options: UseDragScrollOptions = {}) {
  const { threshold = 5 } = options;
  const ref = useRef<T | null>(null);

  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback((e: React.MouseEvent<T>) => {
    // Apenas clique com o botão primário (esquerdo)
    if (e.button !== 0 || !ref.current) return;

    isPointerDownRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX - ref.current.offsetLeft;
    scrollLeftRef.current = ref.current.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!isPointerDownRef.current || !ref.current) return;

    const currentX = e.pageX - ref.current.offsetLeft;
    const walk = currentX - startXRef.current;

    if (!hasMovedRef.current && Math.abs(walk) > threshold) {
      hasMovedRef.current = true;
      setIsDragging(true);
    }

    if (hasMovedRef.current) {
      e.preventDefault();
      ref.current.scrollLeft = scrollLeftRef.current - walk;
    }
  }, [threshold]);

  const endDrag = useCallback(() => {
    isPointerDownRef.current = false;
    // Pequeno timeout para permitir que o onClickCapture capture e impeça cliques se estava arrastando
    setTimeout(() => {
      hasMovedRef.current = false;
      setIsDragging(false);
    }, 0);
  }, []);

  const onClickCapture = useCallback((e: React.MouseEvent<T>) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (isPointerDownRef.current) {
        endDrag();
      }
    };

    window.addEventListener("mouseup", handleWindowMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleWindowMouseUp);
    };
  }, [endDrag]);

  return {
    ref,
    isDragging,
    dragProps: {
      onMouseDown,
      onMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onClickCapture,
    },
  };
}
