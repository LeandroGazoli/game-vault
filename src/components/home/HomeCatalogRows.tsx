"use client";

import React from "react";
import { Game } from "@/lib/types";
import CatalogRow, { CatalogRowSkeleton } from "@/components/CatalogRow";
import { Trophy, Sparkles, Flame, Languages, Timer, Calendar as CalendarIcon } from "lucide-react";

interface HomeCatalogRowsProps {
  loading: boolean;
  topTenGames: Game[];
  gtaGames: Game[];
  releases: Game[];
  ptbrGames: Game[];
  shortGames: Game[];
  upcoming: Game[];
}

export default function HomeCatalogRows({
  loading,
  topTenGames,
  gtaGames,
  releases,
  ptbrGames,
  shortGames,
  upcoming,
}: HomeCatalogRowsProps) {
  return (
    <>
      {/* 1. Mais Populares na Comunidade */}
      {loading ? (
        <CatalogRowSkeleton
          title="Mais Populares na Comunidade"
          subtitle="Os títulos mais aclamados e jogados pelos membros do MGL"
          icon={Trophy}
        />
      ) : topTenGames.length > 0 ? (
        <CatalogRow
          title="Mais Populares na Comunidade"
          subtitle="Os títulos mais aclamados e jogados pelos membros do MGL"
          icon={Trophy}
          games={topTenGames.slice(0, 10)}
          actionHref="/rankings"
          actionText="Mostrar Tudo"
        />
      ) : null}

      {/* 2. Saga Grand Theft Auto & Rockstar */}
      {loading ? (
        <CatalogRowSkeleton
          title="🌴 Saga Grand Theft Auto & Rockstar"
          subtitle="Prepare-se para Vice City: confira notas e horas para zerar cada clássico"
          icon={Sparkles}
        />
      ) : gtaGames.length > 0 ? (
        <CatalogRow
          title="🌴 Saga Grand Theft Auto & Rockstar"
          subtitle="Prepare-se para Vice City: confira notas e horas para zerar cada clássico"
          icon={Sparkles}
          games={gtaGames}
          actionHref="/search?q=Grand+Theft+Auto"
          actionText="Mostrar Tudo"
        />
      ) : null}

      {/* 3. Lançamentos Recentes */}
      {loading ? (
        <CatalogRowSkeleton
          title="Lançamentos Recentes"
          subtitle="Jogos recém-lançados disponíveis para jogar agora"
          icon={Flame}
        />
      ) : releases.length > 0 ? (
        <CatalogRow
          title="Lançamentos Recentes"
          subtitle="Os títulos recém-lançados mais relevantes para jogar agora"
          icon={Flame}
          games={releases.slice(0, 10)}
          actionHref="/calendar"
          actionText="Ver Todos"
        />
      ) : null}

      {/* 4. Dublados em Português (Brasil) */}
      {loading ? (
        <CatalogRowSkeleton
          title="Dublados em Português"
          subtitle="Títulos consagrados com dublagem oficial em português do Brasil"
          icon={Languages}
        />
      ) : ptbrGames.length > 0 ? (
        <CatalogRow
          title="🇧🇷 Dublados em Português"
          subtitle="Títulos consagrados com dublagem oficial em português do Brasil"
          icon={Languages}
          games={ptbrGames.slice(0, 10)}
          actionHref="/colecoes/dublados-ptbr"
          actionText="Ver Todos"
        />
      ) : null}

      {/* 5. Zere no Fim de Semana (Até 10 Horas) */}
      {loading ? (
        <CatalogRowSkeleton
          title="Zere no Fim de Semana"
          subtitle="Obras-primas curtas de até 10 horas para você zerar sem enrolação"
          icon={Timer}
        />
      ) : shortGames.length > 0 ? (
        <CatalogRow
          title="⏱️ Zere no Fim de Semana"
          subtitle="Obras-primas curtas de até 10 horas para você zerar sem enrolação"
          icon={Timer}
          games={shortGames.slice(0, 10)}
          actionHref="/colecoes/fim-de-semana"
          actionText="Ver Todos"
        />
      ) : null}

      {/* 6. Em Breve nos Games */}
      {loading ? (
        <CatalogRowSkeleton
          title="Em Breve nos Games"
          subtitle="Títulos aguardados que serão lançados nos próximos meses"
          icon={CalendarIcon}
        />
      ) : upcoming.length > 0 ? (
        <CatalogRow
          title="Em Breve nos Games"
          subtitle="Títulos aguardados que serão lançados nos próximos meses"
          icon={CalendarIcon}
          games={upcoming.slice(0, 10)}
          actionHref="/calendar"
          actionText="Ver Todos"
        />
      ) : null}
    </>
  );
}
