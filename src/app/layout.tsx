import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameLibraryProvider } from "@/context/GameLibraryContext";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import CookieConsent from "@/components/CookieConsent";
import GoogleAdScript from "@/components/ads/GoogleAdScript";
import Link from "next/link";
import { Heart, ShieldCheck } from "lucide-react";

export const viewport: Viewport = {
  themeColor: "#0e0f12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://game-vault-smoky-eta.vercel.app"),
  title: "GameVault • Plataforma de Perfil, Lançamentos & Rastreamento de Jogos",
  description:
    "Organize seus jogos zerados, lista de desejos e acompanhe notas do Metacritic, tempos do HowLongToBeat e calendário de lançamentos ao vivo.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GameVault",
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
    title: "GameVault • Plataforma de Jogos",
    description: "Seu acervo gamer com lançamentos, rankings e catálogo ao vivo.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <GoogleAdScript />
      </head>
      <body className="bg-[#0e0f12] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-[#00E5FF] selection:text-black">
        <AuthProvider>
          <GameLibraryProvider>
            <PwaRegister />
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>

            {/* Banner de Instalação PWA & Consentimento de Cookies */}
            <PwaInstallPrompt />
            <CookieConsent />

            {/* Footer Completo e Institucional */}
            <footer className="border-t border-white/10 bg-[#0a0b0d] pt-12 pb-8 text-xs text-gray-400">
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
                      <span>Cloud Firestore &amp; PWA Ready</span>
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
                          Sobre o GameVault
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

                {/* Linha Final de Copyright */}
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px] text-gray-500">
                  <div>
                    © {new Date().getFullYear()} GameVault. Todos os direitos reservados.
                  </div>
                  <div className="flex items-center gap-4">
                    <Link href="/privacidade" className="hover:text-gray-300">
                      Privacidade
                    </Link>
                    <span>•</span>
                    <Link href="/termos" className="hover:text-gray-300">
                      Termos
                    </Link>
                    <span>•</span>
                    <Link href="/cookies" className="hover:text-gray-300">
                      Cookies
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </GameLibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
