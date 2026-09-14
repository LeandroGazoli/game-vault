"use client";

import React, { useRef } from "react";
import {
  User,
  ChevronDown,
  Upload,
  Dices,
  Lock,
  Copy,
  Sparkles,
  Cake,
} from "lucide-react";
import { calculateAge } from "@/lib/gameUtils";

interface IdentityAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  displayName: string;
  setDisplayName: (val: string) => void;
  username: string;
  photoURL: string;
  setPhotoURL: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  birthDate: string;
  setBirthDate: (val: string) => void;
  showAge: boolean;
  setShowAge: (val: boolean) => void;
  randomAvatar: () => void;
  suggestBio: () => void;
  copyHandle: () => void;
}

export default function IdentityAccordion({
  isOpen,
  onToggle,
  displayName,
  setDisplayName,
  username,
  photoURL,
  setPhotoURL,
  bio,
  setBio,
  birthDate,
  setBirthDate,
  showAge,
  setShowAge,
  randomAvatar,
  suggestBio,
  copyHandle,
}: IdentityAccordionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatedAge = birthDate ? calculateAge(birthDate) : null;

  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-[#4edea3]/40 ring-1 ring-[#4edea3]/20" : "border-white/10"
    }`}>
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center shrink-0 border border-[#4edea3]/20">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              1. Dados do Perfil &amp; Identidade
            </h3>
            <p className="text-[11px] text-gray-400">
              Avatar, apelido, handle, bio curta e idade
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#4edea3]" : ""
          }`}
        />
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-white/5 animate-fadeIn">
          {/* Avatar Upload / URL */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Foto do Jogador (Avatar)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-[#1a2130] overflow-hidden ring-2 ring-white/10 shrink-0">
                <img
                  src={photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2130] hover:bg-[#1e2433] text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4edea3]" />
                    <span>Fazer Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={randomAvatar}
                    className="px-3 py-1.5 rounded-lg bg-[#1a2130] hover:bg-[#1e2433] text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Dices className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Aleatório</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="Cole a URL direta da imagem (.png/.webp)"
                  className="w-full bg-[#1a2130] text-xs rounded-lg px-2.5 py-1.5 border border-white/10 text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-[#4edea3]"
                />
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Nome de Exibição
              </label>
              <span className="font-mono text-[10px] text-gray-400">
                {displayName.length} / 40
              </span>
            </div>
            <input
              type="text"
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#1a2130] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white border border-white/10 focus:border-[#4edea3] focus:outline-none transition-colors"
            />
          </div>

          {/* @username Handle */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Nome de Usuário (@handle)
              </label>
              <span className="px-1.5 py-0.5 rounded bg-[#1a2130] text-[9px] font-mono font-bold text-gray-400">
                BLOQUEADO
              </span>
            </div>
            <div className="flex items-center gap-2 bg-[#1a2130]/70 rounded-xl px-3.5 py-2.5 border border-white/10">
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="font-mono text-sm font-semibold text-[#00E5FF] flex-1 truncate">
                @{username || "jogador"}
              </span>
              <button
                type="button"
                onClick={copyHandle}
                className="px-2.5 py-1 rounded-lg bg-[#1e2433] hover:bg-[#1a2130] text-xs font-semibold text-gray-200 flex items-center gap-1 active:scale-95 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar</span>
              </button>
            </div>
          </div>

          {/* Bio Curta */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Bio Curta / Apresentação
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={suggestBio}
                  className="text-xs font-semibold text-[#4edea3] flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Sugerir IA
                </button>
                <span className="font-mono text-[10px] text-gray-400">
                  {bio.length} / 280
                </span>
              </div>
            </div>
            <textarea
              rows={2}
              maxLength={280}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Fale um pouco sobre você e seus games favoritos..."
              className="w-full bg-[#1a2130] rounded-xl p-3 text-xs leading-relaxed text-white border border-white/10 focus:border-[#4edea3] focus:outline-none resize-none transition-colors"
            />
          </div>

          {/* Nascimento & Idade */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center">
                <Cake className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">
                  {birthDate ? `${birthDate} (${calculatedAge} anos)` : "Definir Data de Nascimento"}
                </span>
                <span className="text-[10px] text-gray-400">Exibir idade publicamente</span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAge}
                onChange={(e) => setShowAge(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#1e2433] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]" />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
