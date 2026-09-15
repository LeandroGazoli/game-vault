"use client";

import React from "react";
import { NotificationCategory } from "@/lib/types";
import { Sparkles, Gamepad2, Zap, Trophy, Bell } from "lucide-react";

interface AdminNotificationCategorySelectorProps {
  category: NotificationCategory;
  setCategory: (cat: NotificationCategory) => void;
}

const CATEGORY_ITEMS: Array<{
  id: NotificationCategory;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "feature", label: "Novo Recurso", icon: Sparkles },
  { id: "content", label: "Novo Conteúdo", icon: Gamepad2 },
  { id: "update", label: "Atualização", icon: Zap },
  { id: "reward", label: "Recompensa", icon: Trophy },
  { id: "general", label: "Aviso Geral", icon: Bell },
];

export default function AdminNotificationCategorySelector({
  category,
  setCategory,
}: AdminNotificationCategorySelectorProps) {
  return (
    <div className="space-y-1.5 pt-1">
      <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
        Tipo da Notificação
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = category === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                isSelected
                  ? "bg-emerald-500 text-black font-black"
                  : "bg-white/5 border-white/10 text-neutral-300 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
