/**
 * Versão pública do MyGameList / Game Vault.
 * Sincronizada com o Service Worker (public/sw.js) e documentada no CHANGELOG.md.
 */
export const APP_VERSION = "v4.4.1";
export const APP_RELEASE_DATE = "2026-09-19";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const RECENT_CHANGELOG: ChangelogEntry[] = [
  {
    version: "v4.4.1",
    date: "19/09/2026",
    title: "Correção na Transição e Roteamento de Jogos",
    highlights: [
      "Correção do problema de navegação onde a URL mudava ao clicar em um jogo mas a página permanecia na Home.",
      "Padronização de URLs canônicas em todos os carrosséis e artigos com getGameUrl.",
      "Normalização de slugs e prevenção de loops de redirecionamento RSC.",
      "Adição de diretivas de cliente e error boundary dedicado para fichas de jogos.",
    ],
  },
  {
    version: "v4.4.0",
    date: "19/09/2026",
    title: "Ultra Performance: Cloudflare Edge & Firestore",
    highlights: [
      "Cache global multicamadas (Cache API + KV) para listas IGDB, HowLongToBeat e traduções.",
      "Sincronização inteligente da biblioteca gamer: evita leituras redundantes do Firestore via hash de atualização local.",
      "Catálogo consolidado na Home: substituição de 6 chamadas de rede por 1 única requisição com cache de borda.",
      "Persistência offline local do Firestore (IndexedDB multi-abas) para carregamento instantâneo.",
      "Eliminação de refetch duplicado nas páginas de detalhes de jogos renderizadas via SSR.",
    ],
  },
  {
    version: "v4.3.0",
    date: "19/09/2026",
    title: "Adeus Tela Branca & Nova Splash Gamer",
    highlights: [
      "Eliminação definitiva da tela branca na inicialização do PWA (Stale-While-Revalidate e App Shell instantâneo).",
      "Nova Splash Screen animada com GSAP e iluminação neon personalizada.",
      "Aviso de novas versões com atualização sob demanda no PWA.",
      "Carregamento assíncrono de fontes sem bloqueio de renderização.",
    ],
  },
  {
    version: "v4.2.0",
    date: "17/09/2026",
    title: "Vitrine Indie e Destaques da Comunidade",
    highlights: [
      "Novo ecossistema de jogos independentes com suporte a votos e vitrine.",
      "Otimizações de performance no feed e catálogo de jogos.",
      "Ajustes de navegação tátil e ergonomia mobile-first.",
    ],
  },
];
