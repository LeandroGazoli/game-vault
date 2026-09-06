import React from "react";
import { Gamepad2, Languages, Clock, Trophy } from "lucide-react";

const pillars = [
  {
    icon: Gamepad2,
    label: "150.000+ Jogos",
    sublabel: "no acervo",
    color: "text-emerald-400",
  },
  {
    icon: Languages,
    label: "PT-BR Oficial",
    sublabel: "dublagens registradas",
    color: "text-teal-400",
  },
  {
    icon: Clock,
    label: "HowLongToBeat",
    sublabel: "tempo para zerar",
    color: "text-sky-400",
  },
  {
    icon: Trophy,
    label: "Metacritic",
    sublabel: "notas & rankings",
    color: "text-amber-400",
  },
];

export default function IdentityBar() {
  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-between gap-4 px-5 sm:px-8 py-4 rounded-2xl bg-[#1a1a1a] border border-white/[0.06]">
      {pillars.map(({ icon: Icon, label, sublabel, color }) => (
        <div key={label} className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 shrink-0 ${color}`} />
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-bold text-white">{label}</span>
            <span className="text-[10px] text-neutral-500">{sublabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
