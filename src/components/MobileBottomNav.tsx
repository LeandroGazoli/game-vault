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
  User,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Início", icon: Flame, color: "text-orange-400" },
    { href: "/search", label: "Buscar", icon: Search, color: "text-[#00E5FF]" },
    { href: "/calendar", label: "Lançamentos", icon: CalendarIcon, color: "text-cyan-400" },
    { href: "/profile", label: "Meus Jogos", icon: Trophy, color: "text-emerald-400" },
    { href: "/planos", label: "PRO", icon: Crown, color: "text-amber-400" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pt-1 pb-[max(env(safe-area-inset-bottom,0px)+8px,12px)] pointer-events-none">
      <nav
        aria-label="Navegação móvel"
        className="pointer-events-auto max-w-md mx-auto rounded-3xl bg-[#121316]/95 backdrop-blur-2xl border border-white/15 px-2 py-1.5 shadow-2xl shadow-black/90 flex items-center justify-around"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[54px] px-2 py-1 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? "text-white font-bold bg-white/10"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive ? `${item.color} scale-110 drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]` : ""
                }`}
              />
              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                  isActive ? "text-white font-bold" : "text-gray-400"
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
      </nav>
    </div>
  );
}
