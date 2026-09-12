"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";

export default function ContatoForm() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("duvida");
  const [mensagem, setMensagem] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !mensagem.trim()) {
      setStatus("error");
      triggerWarningHaptic();
      return;
    }

    setStatus("loading");
    // Simula envio com fallback para mailto se desejado
    setTimeout(() => {
      setStatus("success");
      triggerSuccessHaptic();
      setNome("");
      setEmail("");
      setMensagem("");
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 space-y-5 shadow-2xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-emerald-400" />
          Envie sua Mensagem
        </h2>
        <p className="text-xs text-gray-400">
          Preencha os campos abaixo. Retornamos diretamente para seu e-mail cadastrado.
        </p>
      </div>

      {status === "success" && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Mensagem recebida com sucesso! Responderemos em até 24 horas úteis.</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Por favor, preencha todos os campos obrigatórios antes de enviar.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Seu Nome *</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex.: Lucas Silva"
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Seu E-mail *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-300">Finalidade do Contato</label>
        <select
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
        >
          <option value="duvida">Dúvida ou Suporte Geral</option>
          <option value="sugestao">Sugestão de Recurso / Novo Jogo</option>
          <option value="bug">Relato de Problema Técnico</option>
          <option value="imprensa">Imprensa, Mídia ou Parcerias</option>
          <option value="privacidade">Privacidade &amp; Dados (LGPD)</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-300">Mensagem *</label>
        <textarea
          rows={4}
          required
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Descreva detalhadamente sua dúvida, sugestão ou solicitação..."
          className="w-full px-4 py-3 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Enviar Mensagem
          </>
        )}
      </button>
    </form>
  );
}
