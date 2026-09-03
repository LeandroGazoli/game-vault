"use client";

import React, { useState, useMemo } from "react";
import { UserGame, GameStatus } from "@/lib/types";
import { filterGamesForExport, downloadCsv, downloadJson } from "@/lib/exportUtils";
import {
  X,
  Download,
  FileSpreadsheet,
  FileCode,
  Filter,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Layers,
  Star,
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: UserGame[];
  username: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  games,
  username,
}: ExportModalProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyRated, setOnlyRated] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [copiedLink, setCopiedLink] = useState(false);

  // Lista todas as plataformas presentes na biblioteca
  const availablePlatforms = useMemo(() => {
    const plats = new Set<string>();
    games.forEach((g) => {
      if (g.platformsPlayed) {
        g.platformsPlayed.forEach((p) => plats.add(p));
      } else if (g.platformPlayed) {
        plats.add(g.platformPlayed);
      }
    });
    return Array.from(plats);
  }, [games]);

  // Aplica filtros em tempo real
  const filteredGames = useMemo(() => {
    return filterGamesForExport(games, {
      status: statusFilter,
      onlyFavorites,
      onlyRated,
      platform: platformFilter,
    });
  }, [games, statusFilter, onlyFavorites, onlyRated, platformFilter]);

  // Constrói a URL da API de exportação dinâmica em JSON puro
  const dynamicApiUrl = useMemo(() => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://mygameslist.com.br";
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (onlyFavorites) params.set("favorites", "true");
    if (platformFilter !== "all") params.set("platform", platformFilter);

    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return `${origin}/api/user/${encodeURIComponent(username || "perfil")}/export${queryStr}`;
  }, [username, statusFilter, onlyFavorites, platformFilter]);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(dynamicApiUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleExportExcel = () => {
    const filename = `mygamelist-${username || "jogos"}-${statusFilter}.csv`;
    downloadCsv(filteredGames, filename);
  };

  const handleExportJson = () => {
    const filename = `mygamelist-${username || "jogos"}-${statusFilter}.json`;
    downloadJson(filteredGames, filename);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Modal */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
            <Download className="w-3.5 h-3.5" />
            Exportar Biblioteca
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Exportar Dados e Jogos do Perfil
          </h3>
          <p className="text-xs text-gray-400">
            Filtre os jogos que deseja baixar ou gere um link de API pública com feed JSON dinâmico.
          </p>
        </div>

        {/* Seção 1: Filtros de Exportação */}
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 sm:p-5 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#00E5FF]" /> 1. Filtros de Seleção
          </h4>

          {/* Filtro por Status */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-medium">Status do Jogo:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Todos os Jogos" },
                { id: "completed", label: "Zerados" },
                { id: "playing", label: "Jogando" },
                { id: "backlog", label: "Quero Jogar" },
                { id: "dropped", label: "Dropados" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    statusFilter === s.id
                      ? "bg-white text-black font-bold shadow-md"
                      : "bg-white/5 hover:bg-white/10 text-gray-300"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opções de Checkbox e Plataforma */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={onlyFavorites}
                onChange={(e) => setOnlyFavorites(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-neutral-900 text-[#00E5FF] focus:ring-[#00E5FF]"
              />
              <span className="text-xs text-gray-200 font-medium flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Apenas Favoritos
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                checked={onlyRated}
                onChange={(e) => setOnlyRated(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-neutral-900 text-[#00E5FF] focus:ring-[#00E5FF]"
              />
              <span className="text-xs text-gray-200 font-medium">
                Apenas com Avaliação / Nota
              </span>
            </label>
          </div>

          {/* Filtro por Plataforma se houver */}
          {availablePlatforms.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs text-gray-400 font-medium">Plataforma:</label>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="all">Todas as Plataformas</option>
                {availablePlatforms.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Contador de Jogos Selecionados */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-gray-400">Jogos selecionados com os filtros atuais:</span>
            <span className="font-mono font-bold text-[#00E5FF] px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              {filteredGames.length} de {games.length} jogos
            </span>
          </div>
        </div>

        {/* Seção 2: Botões de Download */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300">
            2. Baixar Arquivo
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Download Excel CSV */}
            <button
              onClick={handleExportExcel}
              disabled={filteredGames.length === 0}
              className="p-4 rounded-2xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="p-2 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <Download className="w-4 h-4 text-[#00E5FF] group-hover:translate-y-0.5 transition-transform" />
              </div>
              <h5 className="text-sm font-bold text-white">Planilha Excel (.CSV)</h5>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Compatível com Microsoft Excel, Google Planilhas e LibreOffice com acentuação corrigida.
              </p>
            </button>

            {/* Download JSON */}
            <button
              onClick={handleExportJson}
              disabled={filteredGames.length === 0}
              className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all group disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <Download className="w-4 h-4 text-purple-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <h5 className="text-sm font-bold text-white">Arquivo JSON (.JSON)</h5>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Estrutura pura de dados para desenvolvedores, backup completo ou integrações externas.
              </p>
            </button>
          </div>
        </div>

        {/* Seção 3: Link de Exportação em JSON Puro (Feed Dinâmico) */}
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> 3. Feed JSON Puro Cacheado (API Pública)
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Cache: 60s
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Use esta URL direta para integrar seus jogos em outros sites, automações no Notion, Obsidian ou scripts externos. Os dados são atualizados dinamicamente:
          </p>

          <div className="flex items-center gap-2 bg-black/60 border border-white/10 p-2.5 rounded-xl font-mono text-xs overflow-hidden">
            <span className="text-gray-300 truncate flex-1 select-all">{dynamicApiUrl}</span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-xs font-sans font-semibold transition-colors flex-shrink-0"
              title="Copiar Link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
            <a
              href={dynamicApiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors flex-shrink-0"
              title="Abrir JSON em Nova Aba"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
