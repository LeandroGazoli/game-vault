"use client";

import React, { useState } from "react";
import { Heart, ChevronDown, Plus, Trash2, User } from "lucide-react";
import { FavoriteCharacter } from "@/lib/types/profile.types";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface FavoriteCharactersAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  characters: FavoriteCharacter[];
  setCharacters: React.Dispatch<React.SetStateAction<FavoriteCharacter[]>>;
}

export default function FavoriteCharactersAccordion({
  isOpen,
  onToggle,
  characters,
  setCharacters,
}: FavoriteCharactersAccordionProps) {
  const [name, setName] = useState("");
  const [gameTitle, setGameTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    if (characters.length >= 5) return;

    triggerSuccessHaptic();
    const newChar: FavoriteCharacter = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      gameTitle: gameTitle.trim() || "Jogo Favorito",
      imageUrl: imageUrl.trim() || "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
    };

    setCharacters((prev) => [...prev, newChar]);
    setName("");
    setGameTitle("");
    setImageUrl("");
  };

  const handleRemove = (id: string) => {
    triggerSelectionHaptic();
    setCharacters((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div
      className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
        isOpen ? "border-rose-400/40 ring-1 ring-rose-400/20" : "border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Heart className="w-5 h-5 fill-rose-500/20" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              Personagens Favoritos
            </h3>
            <p className="text-[11px] text-gray-400">
              Escolha até 5 personagens marcantes dos videogames
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-rose-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-white/5 animate-fadeIn">
          <p className="text-xs text-gray-300">
            Personalize os personagens favoritos do seu perfil. Se a lista estiver vazia, este quadro não será exibido.
          </p>

          {/* Lista de Personagens Configurados */}
          {characters.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Personagens Cadastrados ({characters.length}/5)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {characters.map((c, idx) => (
                  <div
                    key={c.id || idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e121a] border border-white/10 gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        className="w-9 h-9 rounded-lg object-cover bg-black/50 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-gray-400 block truncate">
                          {c.gameTitle}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(c.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors"
                      title="Remover personagem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Adicionar Novo Personagem */}
          {characters.length < 5 && (
            <div className="p-3.5 rounded-2xl bg-[#0e121a] border border-white/5 space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Adicionar Personagem</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">
                    Nome do Personagem
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Geralt of Rivia / Cloud Strife"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs focus:border-rose-400 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">
                    Jogo de Origem
                  </label>
                  <input
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="Ex: The Witcher 3 / Final Fantasy VII"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs focus:border-rose-400 outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] text-gray-400 font-bold block mb-1">
                    URL da Imagem / Avatar
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... (URL pública de avatar do personagem)"
                    className="w-full px-3 py-1.5 rounded-xl bg-[#141822] border border-white/10 text-white text-xs focus:border-rose-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!name.trim()}
                  className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 disabled:opacity-40 text-black text-xs font-bold transition-all"
                >
                  Adicionar à Lista
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
