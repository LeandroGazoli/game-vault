/**
 * Versão pública do MyGameList / Game Vault.
 * Sincronizada com o Service Worker (public/sw.js) e documentada no CHANGELOG.md.
 */
export const APP_VERSION = "v4.3.0";
export const APP_RELEASE_DATE = "2026-09-19";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const RECENT_CHANGELOG: ChangelogEntry[] = [
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
