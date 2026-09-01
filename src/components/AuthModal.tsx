"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, Gamepad2, ShieldAlert, Sparkles, Mail, Lock, User } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { isDemoMode, signInWithGoogle, signInWithEmail, signUpWithEmail, loginAsDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError("Digite seu nome de usuário");
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, username);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Falha na autenticação. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o Google");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    loginAsDemoUser();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md rounded-2xl bg-surface-100 border border-gray-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">
            {isSignUp ? "Criar Perfil Gamer" : "Acessar sua Conta"}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Organize seus jogos zerados, em andamento e acompanhe seu tempo
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full mb-3 flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-700 bg-surface-50 hover:bg-surface-200 text-sm font-semibold text-white transition-all shadow-sm"
        >
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
          Entrar com Google
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface-100 px-3 text-gray-500 uppercase font-mono">ou com e-mail</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Nome de Usuário</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="ex: shadow_gamer"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-50 border border-gray-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-50 border border-gray-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface-50 border border-gray-700 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
          </button>
        </form>

        {/* Alternar entre login e cadastro */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            {isSignUp ? "Já tem uma conta? Entrar" : "Ainda não tem conta? Cadastre-se"}
          </button>
        </div>

        {/* Acesso rápido Demo */}
        <div className="mt-5 pt-4 border-t border-gray-800 text-center">
          <button
            type="button"
            onClick={handleDemo}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold py-1 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Entrar como Usuário Demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
