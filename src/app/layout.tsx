import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameLibraryProvider } from "@/context/GameLibraryContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://game-vault-smoky-eta.vercel.app"),
  title: "GameVault • Plataforma de Perfil, Lançamentos & Rastreamento de Jogos",
  description:
    "Organize seus jogos zerados, lista de desejos e acompanhe notas do Metacritic, tempos do HowLongToBeat e calendário de lançamentos ao vivo.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo.jpg", sizes: "180x180", type: "image/jpeg" },
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
      <body className="bg-[#0e0f12] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-[#00E5FF] selection:text-black">
        <AuthProvider>
          <GameLibraryProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-white/10 bg-[#0a0b0d] py-8 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-300">GameVault</span>
                  <span>— Catálogo Vivo IGDB, Metacritic &amp; HowLongToBeat</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>Cloud Firestore &amp; Firebase Auth</span>
                  <span>•</span>
                  <span>Desenvolvido com Next.js &amp; Tailwind CSS</span>
                </div>
              </div>
            </footer>
          </GameLibraryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
