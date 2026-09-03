"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  Search,
  Calendar as CalendarIcon,
  Trophy,
  Crown,
  Star,
  User,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isPremium } = useAuth();

  const navItems = [
    { href: "/", label: "Início", icon: Flame, color: "text-orange-400" },
    { href: "/search", label: "Buscar", icon: Search, color: "text-[#00E5FF]" },
    { href: "/calendar", label: "Lançamentos", icon: CalendarIcon, color: "text-cyan-400" },
    { href: "/perfil", label: "Meus Jogos", icon: Trophy, color: "text-emerald-400" },
    ...(isPremium
      ? [{ href: "/rankings", label: "Rankings", icon: Star, color: "text-yellow-400" }]
      : [{ href: "/planos", label: "PRO", icon: Crown, color: "text-amber-400" }]),
  ];

  return (
    <nav
      aria-label="Navegação móvel"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0c0e13]/95 backdrop-blur-2xl border-t border-[#242a36] shadow-[0_-8px_30px_rgba(0,0,0,0.7)] pt-1.5 pb-[max(env(safe-area-inset-bottom,0px)+4px,14px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
    >
      <div className="max-w-md mx-auto px-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-h-[50px] flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
                isActive
                  ? "text-white font-bold bg-[#181c25] border border-[#2b3342]"
                  : "text-neutral-400 hover:text-neutral-200 border border-transparent"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? `${item.color} scale-110 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]` : "text-neutral-400"
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? "text-white font-bold" : "text-neutral-400"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
