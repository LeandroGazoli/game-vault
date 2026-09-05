"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Lightbulb,
  Bell,
  History,
  Settings,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  {
    href: "/admin",
    label: "Visão Geral",
    icon: LayoutDashboard,
    badge: null,
    exact: true,
  },
  {
    href: "/admin/users",
    label: "Usuários & Planos",
    icon: Users,
    badge: null,
  },
  {
    href: "/admin/plans",
    label: "Stripe & Preços",
    icon: CreditCard,
    badge: "PROD",
  },
  {
    href: "/admin/feedback",
    label: "Ideias & Bugs",
    icon: Lightbulb,
    badge: "BOUNTY",
  },
  {
    href: "/admin/notifications",
    label: "Notificações",
    icon: Bell,
    badge: "PUSH",
  },
  {
    href: "/admin/audit",
    label: "Logs de Auditoria",
    icon: History,
    badge: "SEGURANÇA",
  },
  {
    href: "/admin/settings",
    label: "Configurações",
    icon: Settings,
    badge: null,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Navegação Desktop Lateral */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 rounded-[32px] bg-[#14161d] border border-white/10 p-5 space-y-6 shadow-2xl h-fit sticky top-24">
        <div className="flex items-center gap-3 px-2 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-white tracking-wider font-mono">
              Command Center
            </div>
            <div className="text-[10px] text-amber-400 font-bold">Admin Master</div>
          </div>
        </div>

        <nav className="space-y-1.5">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  active
                    ? "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? "text-black" : "text-gray-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                      active
                        ? "bg-black/20 text-black"
                        : "bg-white/10 text-gray-300 border border-white/5"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Links Rápidos de Infraestrutura */}
        <div className="pt-4 border-t border-white/5 space-y-2 text-[11px]">
          <div className="text-[10px] uppercase font-bold text-gray-400 px-2 font-mono">
            Atalhos Diretos
          </div>
          <a
            href="https://dashboard.stripe.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-gray-400 hover:text-indigo-300 hover:bg-white/5 transition-colors"
          >
            <span>Stripe Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-2 rounded-xl text-gray-400 hover:text-orange-300 hover:bg-white/5 transition-colors"
          >
            <span>Firebase Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </aside>

      {/* Navegação Mobile / Tablet Superior em Barra com Scroll Horizontal */}
      <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex items-center gap-2 min-w-max">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all min-h-[44px] ${
                  active
                    ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20"
                    : "bg-[#14161d] text-gray-300 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-black" : "text-gray-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
