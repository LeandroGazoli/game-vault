import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameLibraryProvider } from "@/context/GameLibraryContext";
import Navbar from "@/components/Navbar";
import PwaRegister from "@/components/PwaRegister";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";
import GoogleAdScript from "@/components/ads/GoogleAdScript";

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
            <PwaInstallPrompt />
            <footer className="border-t border-white/10 bg-[#0a0b0d] py-8 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-300">GameVault</span>
                  <span>— Catálogo Vivo IGDB, Metacritic &amp; HowLongToBeat</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>PWA &amp; Offline Ready</span>
                  <span>•</span>
                  <span>Cloud Firestore &amp; Firebase Auth</span>
                </div>
              </div>
            </footer>
          </GameLibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
