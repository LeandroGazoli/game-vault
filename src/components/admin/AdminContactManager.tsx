"use client";

import React, { useState, useEffect } from "react";
import { ContactMessage, CONTACT_SUBJECT_LABELS, ContactStatus } from "@/lib/types/contact.types";
import { useAuth } from "@/context/AuthContext";
import ContactReplyModal from "./ContactReplyModal";
import {
  Inbox,
  Mail,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Reply,
  Archive,
  Clock,
  Filter,
  User,
  CheckCheck,
} from "lucide-react";
import { triggerSelectionHaptic, triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";

export default function AdminContactManager() {
  const { getIdToken } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState<ContactMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/contatos?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao carregar mensagens.");
      const data = await res.json();
      setMessages(data.messages || []);
      if (data.messages?.length && !activeMessage) {
        setActiveMessage(data.messages[0]);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Não foi possível carregar as mensagens.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: ContactStatus) => {
    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch("/api/admin/contatos", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
        if (activeMessage?.id === id) {
          setActiveMessage((prev) => (prev ? { ...prev, status } : null));
        }
        triggerSuccessHaptic();
        showToast(`Status atualizado para: ${status}`);
      }
    } catch (err) {
      console.error(err);
      triggerWarningHaptic();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente remover esta mensagem do histórico?")) return;

    try {
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/admin/contatos?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (activeMessage?.id === id) {
          const remaining = messages.filter((m) => m.id !== id);
          setActiveMessage(remaining[0] || null);
        }
        triggerSuccessHaptic();
        showToast("Mensagem excluída com sucesso.");
      }
    } catch (err) {
      console.error(err);
      triggerWarningHaptic();
    }
  };

  const filtered = messages.filter((m) => {
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (subjectFilter !== "all" && m.assunto !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.nome.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchMsg = m.mensagem.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchMsg) return false;
    }
    return true;
  });

  const novosCount = messages.filter((m) => m.status === "novo").length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Filter & Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-[#141822] border border-white/10 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400">Mensagens Recebidas</div>
            <div className="text-2xl font-black text-white">{messages.length}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300">
            <Inbox className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-3xl bg-[#141822] border border-white/10 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400">Novos Leads Pendentes</div>
            <div className="text-2xl font-black text-emerald-400">{novosCount}</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Mail className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-3xl bg-[#141822] border border-white/10 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-gray-400">Respondidos</div>
            <div className="text-2xl font-black text-cyan-400">
              {messages.filter((m) => m.status === "respondido").length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CheckCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, e-mail ou conteúdo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Status</option>
            <option value="novo">Novo</option>
            <option value="lido">Lido</option>
            <option value="respondido">Respondido</option>
            <option value="arquivado">Arquivado</option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Assuntos</option>
            <option value="duvida">Dúvidas &amp; Suporte</option>
            <option value="imprensa">Imprensa &amp; Parcerias</option>
            <option value="bug">Problema Técnico / Bug</option>
            <option value="sugestao">Sugestão de Recurso</option>
            <option value="privacidade">Privacidade (LGPD)</option>
          </select>

          <button
            onClick={fetchMessages}
            title="Atualizar lista"
            className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Inbox Layout (2 Colunas Desktop, Compacto Mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Coluna 1: Lista de Mensagens */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141822] border border-white/10 p-3 sm:p-4 space-y-2 overflow-y-auto max-h-[700px] custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <Inbox className="w-8 h-8 mx-auto opacity-40" />
              <p>Nenhuma mensagem encontrada.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = activeMessage?.id === item.id;
              const subjectMeta = CONTACT_SUBJECT_LABELS[item.assunto] || {
                label: item.assunto,
                color: "text-gray-400 bg-white/5 border-white/10",
              };

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveMessage(item);
                    triggerSelectionHaptic();
                    if (item.status === "novo") {
                      handleUpdateStatus(item.id, "lido");
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg"
                      : "bg-black/30 border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-white truncate">{item.nome}</span>
                    <span className="text-[10px] text-gray-500 shrink-0 font-mono">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subjectMeta.color}`}
                    >
                      {subjectMeta.label}
                    </span>
                    {item.canal === "email_direto" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        E-MAIL DIRETO ({item.destinatario?.split("@")[0] || "inbox"})
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === "novo"
                          ? "bg-emerald-500 text-black font-extrabold"
                          : item.status === "respondido"
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                          : "bg-white/5 text-gray-400"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {item.mensagem}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Coluna 2: Detalhes da Mensagem Ativa */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141822] border border-white/10 p-5 sm:p-7 flex flex-col justify-between space-y-6">
          {activeMessage ? (
            <div className="space-y-6 flex-1">
              {/* Header do Remetente */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{activeMessage.nome}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        (CONTACT_SUBJECT_LABELS[activeMessage.assunto] || {}).color || ""
                      }`}
                    >
                      {(CONTACT_SUBJECT_LABELS[activeMessage.assunto] || {}).label ||
                        activeMessage.assunto}
                    </span>
                    {activeMessage.canal === "email_direto" && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400">
                        Recebido em: {activeMessage.destinatario || "contato@mygameslist.com.br"}
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${activeMessage.email}`}
                    className="text-xs font-semibold text-emerald-400 hover:underline block"
                  >
                    {activeMessage.email}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReplyMessage(activeMessage)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" /> Responder
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        activeMessage.id,
                        activeMessage.status === "arquivado" ? "lido" : "arquivado"
                      )
                    }
                    title="Arquivar/Desarquivar"
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(activeMessage.id)}
                    title="Excluir mensagem"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detalhes de Data e Dispositivo */}
              <div className="text-[11px] text-gray-500 flex flex-wrap gap-4 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  Enviado em:{" "}
                  {new Date(activeMessage.createdAt).toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  })}
                </span>
                {activeMessage.ip && <span>IP: {activeMessage.ip}</span>}
              </div>

              {/* Mensagem Enviada */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Conteúdo da Mensagem:
                </span>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {activeMessage.mensagem}
                </div>
              </div>

              {/* Histórico de Resposta (Se houver) */}
              {activeMessage.responseMessage && (
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <CheckCheck className="w-4 h-4" />
                    <span>Respondido em {new Date(activeMessage.respondedAt || "").toLocaleString("pt-BR")}</span>
                    {activeMessage.respondedBy && (
                      <span className="text-gray-500">por {activeMessage.respondedBy}</span>
                    )}
                  </div>
                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-gray-300 space-y-1.5">
                    <div className="font-semibold text-white">
                      {activeMessage.responseSubject}
                    </div>
                    <div className="whitespace-pre-wrap">{activeMessage.responseMessage}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-24 text-center text-xs text-gray-500 flex-1 flex flex-col items-center justify-center space-y-2">
              <Mail className="w-10 h-10 opacity-30 text-gray-400" />
              <p>Selecione uma mensagem à esquerda para visualizar e responder.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Resposta */}
      <ContactReplyModal
        message={replyMessage}
        onClose={() => setReplyMessage(null)}
        getIdToken={getIdToken}
        onReplied={({ id, responseSubject, responseMessage }) => {
          const nowIso = new Date().toISOString();
          setMessages((prev) =>
            prev.map((m) =>
              m.id === id
                ? {
                    ...m,
                    status: "respondido",
                    respondedAt: nowIso,
                    responseSubject,
                    responseMessage,
                  }
                : m
            )
          );
          if (activeMessage?.id === id) {
            setActiveMessage((prev) =>
              prev
                ? {
                    ...prev,
                    status: "respondido",
                    respondedAt: nowIso,
                    responseSubject,
                    responseMessage,
                  }
                : null
            );
          }
          showToast("Resposta enviada com sucesso via Resend!");
        }}
      />
    </div>
  );
}
