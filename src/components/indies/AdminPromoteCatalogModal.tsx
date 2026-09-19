"use client";

import React, { useState, useRef } from "react";
import { Game } from "@/lib/types";
import { IndieSpotlightLocation, IndieSubmissionForm } from "@/lib/types/indie.types";
import { submitIndieGame } from "@/lib/indieService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import {
  Search,
  Loader2,
  X,
  Gamepad2,
  Star,
  Check,
} from "lucide-react";

interface AdminPromoteCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function AdminPromoteCatalogModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: AdminPromoteCatalogModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [customTagline, setCustomTagline] = useState("");
  const [locations, setLocations] = useState<IndieSpotlightLocation[]>([
    "home",
    "search",
    "game_detail",
  ]);
  const [priority, setPriority] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const performSearch = async (term: string) => {
    const query = term.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=8`);
      if (res.ok) {
        const data = (await res.json()) as { games?: Game[] };
        setSearchResults(data.games || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Erro na busca de jogos para destacar:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  };

  const handleSelectGame = async (game: Game) => {
    setSelectedGame(game);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/games/${game.id}`);
      if (res.ok) {
        const details = (await res.json()) as Game;
        setSelectedGame(details);
        const desc = details.description_raw || (details as any).summary || "";
        setCustomTagline(
          desc ? desc.slice(0, 110) + "..." : "Indie em destaque no acervo!"
        );
      } else {
        setCustomTagline("Indie em destaque no acervo!");
      }
    } catch (err) {
      console.warn("Erro ao buscar detalhes adicionais do jogo:", err);
      setCustomTagline("Indie em destaque no acervo!");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const toggleLocation = (loc: IndieSpotlightLocation) => {
    if (locations.includes(loc)) {
      setLocations(locations.filter((l) => l !== loc));
    } else {
      setLocations([...locations, loc]);
    }
  };

  const handleConfirmPromote = async () => {
    if (!selectedGame) return;
    setIsSubmitting(true);

    try {
      const fullGame = selectedGame as any;
      const devName =
        fullGame.developers?.[0]?.name ||
        fullGame.publishers?.[0]?.name ||
        "Estúdio Independente";

      const genresList =
        fullGame.genres?.map((g: any) => g.name).filter(Boolean) || ["Indie"];
      const platformsList =
        fullGame.parent_platforms?.map((p: any) => p.platform?.name || p.name).filter(Boolean) || [
          "PC",
        ];

      const formData: IndieSubmissionForm = {
        title: fullGame.name,
        tagline: customTagline.trim() || fullGame.name,
        description: fullGame.summary || fullGame.description || "Destaque do catálogo oficial.",
        developerName: devName,
        developerEmail: "contato@mygameslist.com.br",
        coverImage: fullGame.background_image || "",
        platforms: platformsList.length > 0 ? platformsList : ["Multiplataforma"],
        genres: genresList.length > 0 ? genresList : ["Indie"],
        releaseDate: fullGame.released ? fullGame.released.slice(0, 10) : undefined,
        linkedGameId: fullGame.id,
        linkedGameName: fullGame.name,
        linkedGameSlug: fullGame.slug,
        isCatalogGame: true,
      };

      await submitIndieGame(formData, userId, {
        initialStatus: "approved",
        isSpotlight: locations.length > 0,
        spotlightLocations: locations,
      });

      triggerSuccessHaptic();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao destacar jogo do catálogo:", err);
      triggerWarningHaptic();
      alert("Falha ao salvar destaque do jogo. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#141822] border border-white/10 shadow-2xl overflow-hidden">
        {/* Topo do Modal */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Destacar Jogo do Catálogo IGDB</h3>
              <p className="text-[11px] text-gray-400">
                Promova um jogo já existente para rodízio nos banners sem duplicidade de dados.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {!selectedGame ? (
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Buscar jogo no acervo IGDB (ex.: Celeste, Hollow Knight, Tunic)..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                {isSearching && (
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin absolute right-3.5 top-3.5" />
                )}
              </div>

              {/* Lista de Resultados */}
              {searchResults.length > 0 ? (
                <div className="divide-y divide-white/5 rounded-2xl bg-black/20 border border-white/10 overflow-hidden max-h-72 overflow-y-auto">
                  {searchResults.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {game.background_image ? (
                          <img
                            src={game.background_image}
                            alt={game.name}
                            className="w-10 h-14 rounded-xl object-cover border border-white/10 shrink-0 shadow"
                          />
                        ) : (
                          <div className="w-10 h-14 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            <Gamepad2 className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{game.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            ID: {game.id} •{" "}
                            {game.released ? new Date(game.released).getFullYear() : "N/A"}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black font-bold text-xs transition-colors shrink-0"
                      >
                        Selecionar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                searchTerm.trim().length >= 2 &&
                !isSearching && (
                  <p className="text-xs text-gray-500 italic text-center py-6">
                    Nenhum jogo encontrado no catálogo para &quot;{searchTerm}&quot;.
                  </p>
                )
              )}
            </div>
          ) : (
            /* Jogo Selecionado & Configuração do Destaque */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {selectedGame.background_image ? (
                    <img
                      src={selectedGame.background_image}
                      alt={selectedGame.name}
                      className="w-12 h-16 rounded-xl object-cover border border-white/10 shrink-0 shadow"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <Gamepad2 className="w-5 h-5 text-gray-500" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                      Jogo Selecionado do Acervo
                    </span>
                    <h4 className="text-sm font-black text-white truncate">{selectedGame.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">
                      ID IGDB: {selectedGame.id}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGame(null)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  Trocar Jogo
                </button>
              </div>

              {isLoadingDetails ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Obtendo dados complementares da API...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-300">
                      Frase de Efeito no Banner (Tagline) *
                    </label>
                    <input
                      type="text"
                      value={customTagline}
                      onChange={(e) => setCustomTagline(e.target.value)}
                      placeholder="Ex.: Uma emocionante jornada no espaço profundo que você precisa jogar."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300">
                      Exibir Banner de Destaque em:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "home", label: "Página Inicial (Home)" },
                        { id: "search", label: "Página de Busca" },
                        { id: "game_detail", label: "Páginas de Detalhes dos Jogos" },
                      ].map((loc) => {
                        const isChecked = locations.includes(loc.id as any);
                        return (
                          <button
                            key={loc.id}
                            type="button"
                            onClick={() => toggleLocation(loc.id as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isChecked
                                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                : "bg-black/30 border-white/10 text-gray-500 hover:text-white"
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${isChecked ? "opacity-100" : "opacity-0"}`} />
                            <span>{loc.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-300">
                      Prioridade no Rodízio de Destaques:
                    </label>
                    <div className="flex items-center gap-2">
                      {[
                        { val: 0, label: "Normal (Padrão)" },
                        { val: 1, label: "Alta (Recomendado)" },
                        { val: 2, label: "Máxima (Fixo no topo)" },
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => setPriority(p.val)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            priority === p.val
                              ? "bg-amber-500 text-black border-amber-500 font-extrabold"
                              : "bg-black/30 border-white/10 text-gray-400 hover:text-white"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2 bg-black/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {selectedGame && (
            <button
              type="button"
              disabled={isSubmitting || isLoadingDetails}
              onClick={handleConfirmPromote}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Destacando...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 fill-black" /> Ativar Destaque no Catálogo
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
