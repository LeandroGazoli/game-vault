"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, ShieldAlert, Mail, Lock, User, Loader2, Sparkles, Calendar, AtSign, HelpCircle } from "lucide-react";
import Logo from "./Logo";
import AdaptiveModal from "./ui/AdaptiveModal";
import SyncExplainerModal from "./auth/SyncExplainerModal";
import { trackSignUpSuccess } from "@/lib/analytics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAMER_PREFIXES = ["pixel", "cyber", "shadow", "retro", "ninja", "hyper", "neon", "astro", "titan", "phantom"];
const GAMER_SUFFIXES = ["hunter", "slayer", "runner", "knight", "vault", "master", "gamer", "strider", "pilot", "phantom"];

function generateGamerUsername(): string {
  const p = GAMER_PREFIXES[Math.floor(Math.random() * GAMER_PREFIXES.length)];
  const s = GAMER_SUFFIXES[Math.floor(Math.random() * GAMER_SUFFIXES.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return `${p}_${s}_${n}`;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [showSyncInfo, setShowSyncInfo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Sempre que o modal abrir, reseta erros e estados de loading
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRandomizeUsername = () => {
    setUsername(generateGamerUsername());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
        if (!cleanUser || cleanUser.length < 3) {
          setError("O nome de usuário deve conter no mínimo 3 caracteres alfanuméricos ou sublinhado.");
          setLoading(false);
          return;
        }
        if (!birthDate) {
          setError("Por favor, informe sua data de nascimento (exigido para proteção de menores).");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("A senha deve conter no mínimo 8 caracteres.");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, cleanUser, {
          birthDate,
          referredByUsername: referredBy.replace(/^@/, "").trim() || undefined,
        });
        trackSignUpSuccess("email");
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      const code = err?.code || "";
      if (isSignUp) {
        if (code === "auth/email-already-in-use") {
          setError("Não foi possível concluir o cadastro com este e-mail.");
        } else if (code === "auth/weak-password") {
          setError("Senha muito fraca. Escolha uma senha mais segura com no mínimo 8 caracteres.");
        } else {
          setError("Falha ao criar conta. Verifique os dados informados.");
        }
      } else {
        // Prevenção de enumeração de contas (User Enumeration Defense)
        if (
          code === "auth/user-not-found" ||
          code === "auth/wrong-password" ||
          code === "auth/invalid-credential" ||
          code === "auth/invalid-email"
        ) {
          setError("E-mail ou senha incorretos. Por favor, tente novamente.");
        } else if (code === "auth/too-many-requests") {
          setError("Muitas tentativas consecutivas. Aguarde alguns instantes antes de tentar novamente.");
        } else {
          setError("Falha na autenticação. Verifique os dados e tente novamente.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);

    const safetyTimer = setTimeout(() => {
      setGoogleLoading(false);
    }, 20000);

    try {
      await signInWithGoogle();
      clearTimeout(safetyTimer);
      trackSignUpSuccess("google");
      onClose();
    } catch (err: any) {
      clearTimeout(safetyTimer);
      const code = err?.code || "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return;
      }
      if (code === "auth/popup-blocked") {
        setError("O popup foi bloqueado pelo seu navegador. Por favor, permita popups para este site.");
      } else {
        setError("Não foi possível conectar com o Google. Tente novamente.");
      }
    } finally {
      clearTimeout(safetyTimer);
      setGoogleLoading(false);
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-6">

        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isSignUp ? "Criar Perfil Gamer" : "Acessar sua Conta"}
          </h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Organize seus jogos zerados, favoritos e acompanhe seu tempo de jogo na sua biblioteca
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-white/15 bg-white/5 hover:bg-white/15 text-sm font-semibold text-white transition-all shadow-md hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
          )}
          <span>{googleLoading ? "Conectando ao Google..." : "Continuar com Google"}</span>
        </button>

        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#18191c] px-3 text-gray-500 uppercase font-mono">ou com e-mail</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              {/* Nome de Usuário com Gerador Aleatório */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Nome de Usuário (@handle)
                  </label>
                  <button
                    type="button"
                    onClick={handleRandomizeUsername}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gerar Aleatório</span>
                  </button>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="ex: shadow_runner_42"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-transparent focus:border-emerald-400 text-xs text-white focus:outline-none transition-all font-mono"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Seu @handle exclusivo no Game Vault (pode ser editado 1 vez após o cadastro).
                </p>
              </div>

              {/* Data de Nascimento (Idade & Proteção de Menores) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-transparent focus:border-emerald-400 text-xs text-white focus:outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Utilizada para conformidade de idade e proteção infantil (ECA / COPPA).
                </p>
              </div>

              {/* Quem Indicou (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Quem te indicou? <span className="text-gray-500 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="username do amigo"
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/10 border border-transparent focus:border-emerald-400 text-xs text-white focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 border border-transparent focus:border-[#00E5FF] text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white/10 border border-transparent focus:border-[#00E5FF] text-xs text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-3 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs sm:text-sm transition-all shadow-xl hover:scale-[1.01] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>Processando...</span>
              </>
            ) : isSignUp ? (
              "Criar Conta"
            ) : (
              "Entrar no MyGameList"
            )}
          </button>
        </form>

        {/* Alternar entre login e cadastro */}
        <div className="text-center pt-1 space-y-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-emerald-400 hover:underline font-medium block mx-auto"
          >
            {isSignUp ? "Já tem uma conta? Entrar" : "Ainda não tem conta? Cadastre-se"}
          </button>

          <button
            type="button"
            onClick={() => setShowSyncInfo(true)}
            className="text-[11px] text-gray-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Como funciona a sincronização de contas?</span>
          </button>
        </div>
      </div>

      {/* Modal Educativo de Sincronização */}
      <SyncExplainerModal
        isOpen={showSyncInfo}
        onClose={() => setShowSyncInfo(false)}
      />
    </AdaptiveModal>
  );
}
