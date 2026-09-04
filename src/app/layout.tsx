import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameLibraryProvider } from "@/context/GameLibraryContext";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import SpotlightSearchModal from "@/components/SpotlightSearchModal";
import MobileBottomNav from "@/components/MobileBottomNav";
import GoogleAdScript from "@/components/ads/GoogleAdScript";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ClientSpaceDustCanvas from "@/components/3d/ClientSpaceDustCanvas";

import JsonLd from "@/components/seo/JsonLd";
import CapacitorInit from "@/components/CapacitorInit";
import SecurityTokenInterceptor from "@/components/SecurityTokenInterceptor";
import ViewTransitionsProvider from "@/providers/ViewTransitionsProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const viewport: Viewport = {
  themeColor: "#0e0f12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MyGameList • Catálogo de Jogos, Lançamentos & Backlog Gamer",
    template: "%s | MyGameList",
  },
  description:
    "Organize seus jogos zerados, lista de desejos e acompanhe notas do Metacritic, tempos do HowLongToBeat e catálogo completo de games em PT-BR.",
  keywords: [
    "jogos",
    "backlog gamer",
    "howlongtobeat pt-br",
    "metacritic jogos",
    "lançamentos games 2026",
    "jogos dublados",
    "catálogo de jogos",
    "meu gamer log",
    "my game list",
    "mygamelist",
    "mgl",
    "organizador de jogos",
  ],
  authors: [{ name: "Leandro Gazoli" }],
  creator: "Leandro Gazoli",
  publisher: "MyGameList",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "1DCEVYrBhAZ-w02hcc6ym1KKojqWyvoRHuEN9W6biyg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MyGameList",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: SITE_URL,
    siteName: "MyGameList",
    title: "MyGameList • Catálogo de Jogos, Lançamentos & Backlog Gamer",
    description:
      "Organize seus jogos zerados, lista de desejos e acompanhe notas do Metacritic, tempos do HowLongToBeat e catálogo de games em PT-BR.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MyGameList • Catálogo e Backlog Gamer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyGameList • Catálogo de Jogos, Lançamentos & Backlog Gamer",
    description:
      "Organize seus jogos zerados, lista de desejos e acompanhe notas do Metacritic, tempos do HowLongToBeat e catálogo de games em PT-BR.",
    images: ["/og-image.jpg"],
    creator: "@mygamelist",
  },
};

const globalStructuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MyGameList",
    alternateName: ["MGL", "Meu Gamer Log", "My Game List"],
    url: SITE_URL,
    description:
      "Plataforma completa para registrar jogos zerados, acompanhar notas do Metacritic, tempos do HowLongToBeat e lançamentos.",
    inLanguage: "pt-BR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MyGameList",
    alternateName: ["MGL", "Meu Gamer Log", "My Game List"],
    url: SITE_URL,
    logo: `${SITE_URL}/logo-mgl.png`,
    sameAs: [],
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <GoogleAdScript />
        <JsonLd data={globalStructuredData} />
      </head>
      <body className="bg-[#0e0f12] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-[#00E5FF] selection:text-black">
        <ClientSpaceDustCanvas />
        <ViewTransitionsProvider>
          <AuthProvider>
            <CapacitorInit />
            <GameLibraryProvider>
              <PwaRegister />
              <Navbar />
              <main className="vt-main flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-8 pb-32 md:pb-8 overflow-x-clip">
                {children}
              </main>

            {/* Barra de Navegação Flutuante Mobile */}
            <MobileBottomNav />

            {/* Modais Globais: Busca Spotlight, Instalação PWA & Consentimento de Cookies */}
            <SpotlightSearchModal />
            <PwaInstallPrompt />
            <CookieConsent />

            {/* Footer Completo e Institucional */}
            <footer className="border-t border-white/10 bg-[#0a0b0d] pt-12 pb-[max(env(safe-area-inset-bottom,0px)+6.5rem,7.5rem)] md:pb-12 text-xs text-gray-400">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Coluna 1: Marca e Resumo */}
                  <div className="space-y-3 md:col-span-1">
                    <Logo size="md" />
                    <p className="text-xs text-gray-400 leading-relaxed pt-1">
                      A plataforma definitiva para gamers registrarem jogos zerados, acompanharem lançamentos e consultarem notas do Metacritic e tempos do HowLongToBeat.
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>PWA &amp; Offline Ready</span>
                    </div>
                  </div>

                  {/* Coluna 2: Navegação & Catálogo */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Explorar Catálogo
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link href="/" className="hover:text-white transition-colors">
                          Início &amp; Destaques
                        </Link>
                      </li>
                      <li>
                        <Link href="/calendar" className="hover:text-white transition-colors">
                          Calendário de Lançamentos
                        </Link>
                      </li>
                      <li>
                        <Link href="/rankings" className="hover:text-white transition-colors">
                          Rankings da Comunidade
                        </Link>
                      </li>
                      <li>
                        <Link href="/search" className="hover:text-white transition-colors">
                          Buscar Jogos
                        </Link>
                      </li>
                      <li>
                        <Link href="/feedback" className="hover:text-[#00E5FF] transition-colors font-semibold text-amber-300">
                          💡 Ideias &amp; Votação (Bugs)
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Coluna 3: Institucional & Legal */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Institucional &amp; Legal
                    </h4>
                    <ul className="space-y-2 text-xs">
                      <li>
                        <Link href="/sobre" className="hover:text-white transition-colors">
                          Sobre o MyGameList
                        </Link>
                      </li>
                      <li>
                        <Link href="/termos" className="hover:text-white transition-colors">
                          Termos de Uso
                        </Link>
                      </li>
                      <li>
                        <Link href="/privacidade" className="hover:text-white transition-colors">
                          Política de Privacidade
                        </Link>
                      </li>
                      <li>
                        <Link href="/cookies" className="hover:text-white transition-colors">
                          Política de Cookies
                        </Link>
                      </li>
                    </ul>
                  </div>

                  {/* Coluna 4: Parceiros & Dados */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                      Fontes &amp; Parceiros
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-500">
                      <li>Metadados: IGDB API (Twitch)</li>
                      <li>Avaliações: Metacritic</li>
                      <li>Estatísticas: HowLongToBeat</li>
                      <li>Monetização: Google AdSense</li>
                    </ul>
                  </div>
                </div>

                {/* Linha Final de Copyright, Créditos & Game Data */}
                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-[11px] text-gray-400">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-300">
                      © {new Date().getFullYear()} MyGameList. Todos os direitos reservados.
                    </p>
                    <p className="text-gray-500">
                      Design por <strong className="text-gray-300">MyGameList Studio</strong> • Desenvolvido por <strong className="text-gray-300">Leandro Gazoli</strong>
                    </p>
                    <p className="text-gray-500">
                      Game data: <span className="text-gray-400 font-mono">IGDB (Twitch), HowLongToBeat &amp; Metacritic</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400 font-medium">
                    <Link href="/sobre" className="hover:text-white transition-colors">
                      Sobre
                    </Link>
                    <span>•</span>
                    <Link href="/termos" className="hover:text-white transition-colors">
                      Termos de Uso
                    </Link>
                    <span>•</span>
                    <Link href="/privacidade" className="hover:text-white transition-colors">
                      Privacidade
                    </Link>
                    <span>•</span>
                    <Link href="/cookies" className="hover:text-white transition-colors">
                      Cookies
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </GameLibraryProvider>
        </AuthProvider>
      </ViewTransitionsProvider>
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId="G-G7QH1XG25C" />
        <SecurityTokenInterceptor />
      </body>
    </html>
  );
}
