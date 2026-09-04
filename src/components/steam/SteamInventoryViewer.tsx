"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  SteamInventoryItem,
  SteamInventoryResponse,
  SteamSupportedAppId,
  STEAM_SUPPORTED_APPS,
} from "@/lib/types";
import SteamItemModal from "./SteamItemModal";
import {
  Search,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Save,
  Check,
  Crosshair,
  SlidersHorizontal,
  XCircle,
  Package,
} from "lucide-react";

interface SteamInventoryViewerProps {
  initialSteamId?: string;
  isOwner?: boolean;
  onSaveSteamToProfile?: (steamId: string) => Promise<void>;
  className?: string;
}

export default function SteamInventoryViewer({
  initialSteamId = "",
  isOwner = false,
  onSaveSteamToProfile,
  className = "",
}: SteamInventoryViewerProps) {
  const [selectedAppId, setSelectedAppId] = useState<SteamSupportedAppId>(730);
  const [steamInput, setSteamInput] = useState(initialSteamId);
  const [currentSteamId, setCurrentSteamId] = useState(initialSteamId);
  const [items, setItems] = useState<SteamInventoryItem[]>([]);
  const [profile, setProfile] = useState<SteamInventoryResponse["profile"]>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SteamInventoryItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [exteriorFilter, setExteriorFilter] = useState("all");

  const loadInventory = useCallback(
    async (steamId: string, appId: SteamSupportedAppId) => {
      if (!steamId.trim()) {
        setItems([]);
        setProfile(undefined);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("appId", String(appId));
        params.set("steamId", steamId.trim());

        const res = await fetch(`/api/steam/inventory?${params.toString()}`);
        const data: SteamInventoryResponse = await res.json();

        if (data.success) {
          setItems(data.items || []);
          setProfile(data.profile);
          if (data.steamId64) {
            setCurrentSteamId(data.steamId64);
          }
        } else {
          setItems([]);
          setError(data.error || "Não foi possível carregar o inventário.");
        }
      } catch (err) {
        console.error("Erro ao carregar inventário:", err);
        setError("Erro de conexão ao carregar inventário da Steam.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Carrega inventário se houver um Steam ID inicial
  useEffect(() => {
    if (initialSteamId) {
      setSteamInput(initialSteamId);
      loadInventory(initialSteamId, selectedAppId);
    }
  }, [initialSteamId, loadInventory, selectedAppId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamInput.trim()) {
      loadInventory(steamInput.trim(), selectedAppId);
    }
  };

  const handleSaveToProfile = async () => {
    if (!onSaveSteamToProfile || !steamInput.trim()) return;
    setIsSaving(true);
    try {
      await onSaveSteamToProfile(steamInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Erro ao salvar Steam no perfil:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Extrai lista única de raridades presentes para o filtro
  const availableRarities = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.rarity) set.add(item.rarity);
    });
    return Array.from(set);
  }, [items]);

  // Aplica filtros de busca, raridade e exterior
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.marketName.toLowerCase().includes(q) || item.name.toLowerCase().includes(q);
        const matchesWeapon = item.weapon && item.weapon.toLowerCase().includes(q);
        const matchesType = item.type && item.type.toLowerCase().includes(q);
        if (!matchesName && !matchesWeapon && !matchesType) return false;
      }

      if (rarityFilter !== "all" && item.rarity !== rarityFilter) {
        return false;
      }

      if (exteriorFilter !== "all" && item.exterior !== exteriorFilter) {
        return false;
      }

      return true;
    });
  }, [items, searchQuery, rarityFilter, exteriorFilter]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Barra Seletora de Jogos da Steam */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STEAM_SUPPORTED_APPS.map((app) => {
          const isSelected = selectedAppId === app.id;
          return (
            <button
              key={app.id}
              onClick={() => {
                setSelectedAppId(app.id);
                loadInventory(steamInput, app.id);
              }}
              className={`flex-shrink-0 min-h-[46px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 select-none active:scale-95 border ${
                isSelected
                  ? "bg-white text-black border-white shadow-lg shadow-white/10"
                  : "bg-[#18191c] text-gray-400 hover:text-white hover:bg-[#22242a] border-white/5"
              }`}
            >
              <span className="text-base">{app.icon}</span>
              <span>{app.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isSelected ? "bg-black/15 text-black" : "bg-white/10 text-gray-300"
                }`}
              >
                {app.shortName}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Barra de Busca de Perfil */}
      <div className="rounded-[28px] bg-[#14161a] border border-white/10 p-4 sm:p-6 space-y-4 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Digite SteamID64 ou URL personalizada (ex: gaben ou link)..."
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#1c1e24] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial h-11 px-5 rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
              ) : (
                <Search className="w-4 h-4 text-black" />
              )}
              <span>Buscar</span>
            </button>


            {isOwner && onSaveSteamToProfile && steamInput.trim() && steamInput !== initialSteamId && (
              <button
                type="button"
                onClick={handleSaveToProfile}
                disabled={isSaving}
                className="h-11 px-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
                title="Salvar esta conta Steam no seu perfil do GameVault"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden md:inline">Salvo!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Vincular</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Informações do Perfil Conectado / Vitrine */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            {profile?.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt="Steam Avatar"
                className="w-10 h-10 rounded-xl border border-white/20 shadow-md object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  {profile?.personaname || "Perfil Steam"}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                {items.length} itens encontrados neste inventário
              </p>
            </div>
          </div>

          {profile?.profileUrl && (
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Ver perfil na Comunidade Steam</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-200">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-red-300">Atenção ao buscar inventário:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 3. Filtros na Lista de Itens */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar skins ou armas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-7 rounded-xl bg-[#18191c] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Filtro de Raridade */}
          {availableRarities.length > 0 && (
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#18191c] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todas as Raridades</option>
              {availableRarities.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Filtro de Exterior (para CS2) */}
          {selectedAppId === 730 && (
            <select
              value={exteriorFilter}
              onChange={(e) => setExteriorFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#18191c] border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todos os Desgastes</option>
              <option value="Nova de Fábrica">Nova de Fábrica (FN)</option>
              <option value="Pouco Usada">Pouco Usada (MW)</option>
              <option value="Testada em Campo">Testada em Campo (FT)</option>
              <option value="Bem Desgastada">Bem Desgastada (WW)</option>
              <option value="Veterana de Guerra">Veterana de Guerra (BS)</option>
            </select>
          )}
        </div>
      </div>

      {/* 4. Grade de Itens do Inventário */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-[#18191c] border border-white/5" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-[#18191c] p-10 text-center space-y-3">
          <Package className="w-10 h-10 text-gray-500 mx-auto" />
          <h3 className="text-sm sm:text-base font-bold text-white">
            {!steamInput.trim() ? "Conecte sua conta Steam" : "Nenhum item encontrado"}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {!steamInput.trim()
              ? "Digite seu SteamID64 ou link de perfil no campo de busca acima para carregar suas skins e inventário."
              : searchQuery || rarityFilter !== "all"
              ? "Tente ajustar os filtros ou o termo de busca para visualizar seus itens."
              : "Este usuário não possui itens neste jogo ou seu inventário está configurado como privado na Steam."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const hex = item.rarityColor || "#00E5FF";
            return (
              <div
                key={item.assetId}
                onClick={() => setSelectedItem(item)}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#16181d] border border-white/5 hover:border-white/20 p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer select-none"
                style={{
                  boxShadow: `0 4px 20px -2px ${hex}15`,
                }}
              >
                {/* Linha superior de Badges */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  {item.exterior ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-gray-300 truncate">
                      {item.exterior.replace("Nova de Fábrica", "FN").replace("Pouco Usada", "MW").replace("Testada em Campo", "FT")}
                    </span>
                  ) : item.weapon ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 truncate">
                      {item.weapon}
                    </span>
                  ) : <span />}

                  {item.amount > 1 && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
                      x{item.amount}
                    </span>
                  )}
                </div>

                {/* Imagem do Item com Efeito Glow */}
                <div className="relative aspect-square w-full flex items-center justify-center p-2 my-1 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity blur-xl rounded-full"
                    style={{ backgroundColor: hex }}
                  />
                  {item.iconUrl ? (
                    <img
                      src={item.iconUrl}
                      alt={item.marketName}
                      className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <Crosshair className="w-8 h-8 text-gray-600" />
                  )}
                </div>

                {/* Nome e Indicador de Raridade */}
                <div className="space-y-1 pt-1.5 border-t border-white/5">
                  <div className="h-1 w-full rounded-full" style={{ backgroundColor: hex }} />
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors" title={item.marketName}>
                    {item.marketName}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    {item.rarity || item.type}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal de Inspeção de Item */}
      <SteamItemModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
