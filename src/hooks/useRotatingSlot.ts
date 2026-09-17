"use client";

import { useEffect, useState } from "react";

/**
 * Escolhe em qual "vaga" da página uma chamada (CTA) deve aparecer, alternando a cada visita.
 *
 * POR QUE NÃO `Math.random()` DIRETO NO RENDER: todo componente `"use client"` também é
 * renderizado no servidor. Sortear durante o render faria o HTML do servidor divergir do
 * cliente e o React descartaria a árvore inteira — é o erro #418 que já nos custou caro.
 * Por isso o sorteio acontece só depois da montagem, e o primeiro render (servidor e
 * hidratação) usa sempre a vaga 0.
 *
 * POR QUE RODÍZIO E NÃO SORTEIO: aleatório puro repete. Um visitante pode ver a mesma vaga
 * cinco vezes seguidas, que é justamente o que queremos evitar. O rodízio guarda a última
 * posição no `localStorage` e anda uma casa por visita, então a variação é garantida.
 * Sem `localStorage` (aba anônima, storage bloqueado) cai no sorteio simples.
 *
 * @param chave  identificador do CTA, para cada um ter seu próprio rodízio
 * @param total  quantas vagas existem na página
 */
export function useRotatingSlot(chave: string, total: number): number {
  const [vaga, setVaga] = useState(0);

  useEffect(() => {
    if (total <= 1) return;

    let proxima: number;
    try {
      const bruto = localStorage.getItem(chave);
      const anterior = bruto === null ? -1 : Number(bruto);
      proxima = Number.isInteger(anterior) ? (anterior + 1) % total : 0;
      localStorage.setItem(chave, String(proxima));
    } catch {
      proxima = Math.floor(Math.random() * total);
    }

    setVaga(proxima);
  }, [chave, total]);

  return vaga;
}
