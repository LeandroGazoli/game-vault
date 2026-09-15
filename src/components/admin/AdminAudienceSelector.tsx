"use client";

import React from "react";
import { Users, Crown, Zap, Gamepad2, UserCheck, Loader2 } from "lucide-react";
import { GroupNotificationInput } from "@/lib/notificationsService";

interface AdminAudienceSelectorProps {
  targetType: GroupNotificationInput["targetType"];
  setTargetType: (type: GroupNotificationInput["targetType"]) => void;
  customUserIds: string;
  setCustomUserIds: (val: string) => void;
  audienceEstimate: number | null;
  isLoadingEstimate: boolean;
}

const AUDIENCE_OPTIONS: Array<{
  id: GroupNotificationInput["targetType"];
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  { id: "all", label: "Toda a Base", desc: "Todos os usuários", icon: Users },
  { id: "vip", label: "Membros VIP", desc: "Assinantes VIP ativos", icon: Crown },
  { id: "pro", label: "Membros PRO", desc: "Assinantes PRO ativos", icon: Zap },
  { id: "steam_linked", label: "Steam Conectada", desc: "Contas com Steam", icon: Gamepad2 },
  { id: "custom_users", label: "Específicos", desc: "Lista personalizada", icon: UserCheck },
];

export default function AdminAudienceSelector({
  targetType,
  setTargetType,
  customUserIds,
  setCustomUserIds,
  audienceEstimate,
  isLoadingEstimate,
}: AdminAudienceSelectorProps) {
  const customCount = customUserIds
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
          Público-Alvo do Disparo <span className="text-emerald-400">*</span>
        </label>

        {/* Live Audience Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono">
          {isLoadingEstimate ? (
            <>
              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
              <span className="text-gray-400">Calculando alcance...</span>
            </>
          ) : targetType === "custom_users" ? (
            <span className="text-emerald-300 font-bold">
              {customCount} {customCount === 1 ? "destinatário" : "destinatários"}
            </span>
          ) : (
            <>
              <span className="text-gray-400">Alcance estimado:</span>
              <span className="text-emerald-400 font-black">
                {audienceEstimate !== null ? audienceEstimate : "--"} usuários
              </span>
            </>
          )}
        </div>
      </div>

      {/* Grid de Seleção de Público */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {AUDIENCE_OPTIONS.map((opt) => {
          const isSelected = targetType === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTargetType(opt.id)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-gray-400"}`} />
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <div>
                <span className={`text-xs font-bold block ${isSelected ? "text-emerald-300" : "text-white"}`}>
                  {opt.label}
                </span>
                <span className="text-[10px] text-gray-400 block truncate">
                  {opt.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Input para Lista de Usuários Específicos */}
      {targetType === "custom_users" && (
        <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#121316] border border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="font-semibold">IDs ou E-mails dos Destinatários</span>
            <span className="text-gray-500 text-[11px] font-mono">Separados por vírgula ou nova linha</span>
          </div>
          <textarea
            rows={3}
            value={customUserIds}
            onChange={(e) => setCustomUserIds(e.target.value)}
            placeholder="usr_123456, leandro@exemplo.com&#10;usr_789012"
            className="w-full bg-[#18191c] border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>
      )}
    </div>
  );
}
