"use client";

import React, { useState } from "react";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import { auth } from "@/lib/firebase";
import { UserPlan, UserProfile } from "@/lib/types";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AtSign,
  Eye,
  EyeOff,
  Wand2,
  Copy,
  Check,
  Crown,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: UserProfile) => void;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [plan, setPlan] = useState<UserPlan>("free");
  const [isAdmin, setIsAdmin] = useState(false);
  const [sendVerificationEmail, setSendVerificationEmail] = useState(true);
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Gerador de senha forte aleatória
  const generateRandomPassword = () => {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const resetForm = () => {
    setDisplayName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setPlan("free");
    setIsAdmin(false);
    setSendVerificationEmail(true);
    setBio("");
    setErrorMessage(null);
    setCopiedPassword(false);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMessage("O nome de usuário deve ter no mínimo 3 caracteres.");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Digite um endereço de e-mail válido.");
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrorMessage("Sessão de administrador expirada. Faça login novamente.");
        setIsLoading(false);
        return;
      }

      const idToken = await currentUser.getIdToken();

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          displayName: displayName.trim() || cleanUsername,
          username: cleanUsername,
          email: cleanEmail,
          password,
          plan,
          isAdmin,
          sendVerificationEmail,
          bio: bio.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Não foi possível criar o usuário.");
        setIsLoading(false);
        return;
      }

      if (data.user) {
        onUserCreated(data.user);
        resetForm();
        onClose();
      }
    } catch (err: any) {
      console.error("Erro ao criar usuário:", err);
      setErrorMessage("Erro de comunicação ao enviar dados ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Criar Novo Usuário"
      subtitle="Cadastre uma conta diretamente no Firebase Auth e Firestore"
      icon={<UserPlus className="w-5 h-5 text-[#00E5FF]" />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Banner de Erro */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Linha 1: Nome e Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nome de Exibição
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ex: Lucas Oliveira"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Nome de Usuário <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="lucas_gamer"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "")
                  )
                }
                disabled={isLoading}
                required
                className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
              />
            </div>
            {username && (
              <p className="text-[10px] text-gray-500 mt-1 pl-1">
                Perfil: mygameslist.com.br/perfil/@{username.replace(/^@/, "")}
              </p>
            )}
          </div>
        </div>

        {/* Linha 2: E-mail */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5">
            Endereço de E-mail <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              placeholder="lucas@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            />
          </div>
        </div>

        {/* Linha 3: Senha Inicial com Gerador e Cópia */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Senha Inicial <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={generateRandomPassword}
                disabled={isLoading}
                className="text-[11px] font-bold text-[#00E5FF] hover:underline flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                <span>Gerar Senha Segura</span>
              </button>

              {password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="text-[11px] font-bold text-gray-400 hover:text-white flex items-center gap-1"
                  title="Copiar senha"
                >
                  {copiedPassword ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              className="w-full bg-[#0b0c10] border border-white/10 rounded-2xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#00E5FF] font-mono min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Linha 4: Seleção do Plano Inicial */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-2">
            Plano Inicial
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Free */}
            <button
              type="button"
              onClick={() => setPlan("free")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[64px] ${
                plan === "free"
                  ? "bg-white/10 border-white/40 shadow-lg"
                  : "bg-white/5 border-white/10 hover:border-white/20 text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Free</span>
                {plan === "free" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                )}
              </div>
              <span className="text-[10px] text-gray-400">Gratuito Padrão</span>
            </button>

            {/* PRO */}
            <button
              type="button"
              onClick={() => setPlan("pro")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[64px] ${
                plan === "pro"
                  ? "bg-amber-500/20 border-amber-500/50 shadow-lg shadow-amber-500/10"
                  : "bg-white/5 border-white/10 hover:border-amber-500/30 text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> PRO
                </span>
                {plan === "pro" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>
              <span className="text-[10px] text-amber-300/80">Sem Anúncios</span>
            </button>

            {/* VIP */}
            <button
              type="button"
              onClick={() => setPlan("vip")}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[64px] ${
                plan === "vip"
                  ? "bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10"
                  : "bg-white/5 border-white/10 hover:border-purple-500/30 text-gray-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> VIP
                </span>
                {plan === "vip" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                )}
              </div>
              <span className="text-[10px] text-purple-300/80">Acesso Total</span>
            </button>
          </div>
        </div>

        {/* Linha 5: Cargo de Administrador & Verificação */}
        <div className="space-y-3 pt-1">
          {/* Admin Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#00E5FF] focus:ring-[#00E5FF] bg-[#0d0f14]"
            />
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                <span>Conceder acesso de Administrador</span>
              </div>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Permite acesso às telas de gestão administrativa (/admin).
              </p>
            </div>
          </label>

          {/* Enviar E-mail Checkbox */}
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
            <input
              type="checkbox"
              checked={sendVerificationEmail}
              onChange={(e) => setSendVerificationEmail(e.target.checked)}
              disabled={isLoading}
              className="mt-0.5 w-4 h-4 rounded border-gray-600 text-[#00E5FF] focus:ring-[#00E5FF] bg-[#0d0f14]"
            />
            <div className="text-xs">
              <div className="font-bold text-white">
                Disparar e-mail de verificação oficial
              </div>
              <p className="text-gray-400 text-[11px] mt-0.5">
                O usuário receberá no e-mail um link oficial do Firebase para confirmar o endereço.
              </p>
            </div>
          </label>
        </div>

        {/* Footer com Ações */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors min-h-[44px]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#00E5FF] to-cyan-500 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 min-h-[44px]"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Criando Usuário...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Cadastrar Usuário</span>
              </>
            )}
          </button>
        </div>
      </form>
    </AdaptiveModal>
  );
}
