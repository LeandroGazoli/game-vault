import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { GameLibraryProvider } from "@/context/GameLibraryContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "GameVault - Plataforma de Perfil & Rastreamento de Jogos",
  description:
    "Organize seus jogos zerados, em andamento e dropados. Veja notas do Metacritic e tempo médio para zerar com HowLongToBeat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0b0e14] text-gray-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <GameLibraryProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <footer className="border-t border-gray-800/80 bg-surface-50/50 py-8 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-300">GameVault</span>
                  <span>— Rastreamento de Jogos, Metacritic &amp; HowLongToBeat</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <span>Modo Firebase / Local Híbrido</span>
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
