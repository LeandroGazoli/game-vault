import React from "react";
import Link from "next/link";
import { ArrowLeft, Cookie, Info, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Política de Cookies • GameVault",
  description:
    "Saiba como o GameVault e o Google AdSense utilizam cookies e como você pode gerenciar suas preferências no seu navegador.",
};

export default function CookiesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </Link>

      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-8 sm:p-12 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Política de Cookies
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Transparência no uso de Cookies e Tecnologias de Armazenamento Local
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">1. O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto que são armazenados no seu navegador ou dispositivo quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem com mais eficiência, lembrar suas preferências e fornecer informações aos proprietários do site e parceiros de publicidade.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">2. Categorias de Cookies que Utilizamos</h2>

            <div className="space-y-4 pt-2">
              {/* Essenciais */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Cookies Estritamente Necessários (Essenciais)
                </h3>
                <p className="text-xs text-gray-400">
                  Fundamentais para o funcionamento da plataforma. Permitem que você faça login em sua conta, navegue entre páginas e salve seus jogos no Cloud Firestore com segurança. O site não pode funcionar corretamente sem esses cookies.
                </p>
              </div>

              {/* Preferências & PWA */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  Cookies de Desempenho &amp; Armazenamento Local (PWA)
                </h3>
                <p className="text-xs text-gray-400">
                  Utilizamos o Cache Storage e LocalStorage do navegador para armazenar temporariamente dados de jogos, capas e preferências de exibição para permitir carregamentos instantâneos e suporte offline através do Service Worker.
                </p>
              </div>

              {/* Publicidade / AdSense */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Cookies de Publicidade &amp; Terceiros (Google AdSense)
                </h3>
                <p className="text-xs text-gray-400">
                  Cookies definidos por parceiros de publicidade autorizados (como Google AdSense e DoubleClick). São utilizados para exibir anúncios relevantes ao seu perfil de interesse, medir a eficácia das campanhas e evitar a repetição excessiva do mesmo anúncio.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">3. Como Gerenciar ou Desativar Cookies</h2>
            <p>
              Você pode alterar as configurações do seu navegador para bloquear ou receber alertas sobre cookies a qualquer momento. Note que ao desativar cookies estritamente necessários, algumas funcionalidades do GameVault (como manter-se conectado à sua conta) podem não operar como esperado.
            </p>
            <p className="text-xs text-gray-400">
              Instruções dos principais navegadores:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs text-gray-300">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/pt-BR/kb/gerencie-configuracoes-de-armazenamento-local-do-site" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/pt-br/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Apple Safari</a></li>
              <li><a href="https://support.microsoft.com/pt-br/microsoft-edge/excluir-cookies-no-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#00E5FF] underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-white">4. Dúvidas</h2>
            <p>
              Para esclarecimentos sobre a nossa utilização de cookies e tecnologias semelhantes, contate: <a href="mailto:privacidade@gamevault.app" className="text-[#00E5FF] underline">privacidade@gamevault.app</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
