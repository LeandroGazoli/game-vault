/**
 * Versão pública do MyGameList / Game Vault.
 * Sincronizada com o Service Worker (public/sw.js) e documentada no CHANGELOG.md.
 */
export const APP_VERSION = "v4.10.1";
export const APP_RELEASE_DATE = "2026-09-21";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const RECENT_CHANGELOG: ChangelogEntry[] = [
  {
    version: "v4.10.1",
    date: "21/09/2026",
    title: "Suporte Oficial a Markdown para Agentes de IA (Content Negotiation)",
    highlights: [
      "Suporte a 'Accept: text/markdown' entregando texto semântico, rápido e limpo para agentes e LLMs",
      "Frontmatter YAML com metadados estruturados (title, description, image, canonical url)",
      "Preservação de blocos JSON-LD estruturados ao final do documento",
      "Cabeçalhos oficiais de contagem de tokens (x-markdown-tokens, x-original-tokens) e Content-Signal",
      "Link de descoberta automática em metadados HTML (alternates.types text/markdown)",
    ],
  },
  {
    version: "v4.10.0",
    date: "21/09/2026",
    title: "Importador de Bibliotecas Xbox Live & Nintendo Switch",
    highlights: [
      "Sincronização de biblioteca do Xbox Live com suporte a cota Cloudflare e chave privada do usuário",
      "Novo importador dedicado do Nintendo Switch com 3 métodos: Lista Rápida, CSV Deku Deals e Friend Code",
      "Persistência isolada e segura de credenciais e Friend Code no perfil gamer",
      "Refatoração modular do importador com componentes atômicos shadcn/ui",
    ],
  },
  {
    version: "v4.9.0",
    date: "20/09/2026",
    title: "Customização Total de Perfil e Site para Assinantes VIP & PRO",
    highlights: [
      "Suporte a estilização CSS Scoped no perfil com editor ao vivo e sanitização de segurança",
      "Novos temas de cores ultra-vibrantes (Gold Royale, Neon Sunset, Ametista Mística)",
      "Novos wallpapers de games épicos (Gold Obsidian, Dark Fantasy, Nebula Odyssey, Retro Synthwave)",
      "3 novas cores OLED puras para perfil (Gold Dark, Amethyst Noir, Cyber Slate)",
      "Badges visuais exclusivos, novos títulos de honra e tabela comparativa atualizada em /planos",
    ],
  },
  {
    version: "v4.8.1",
    date: "20/09/2026",
    title: "Central de Contato, Leads e Cloudflare Email Routing Exclusivo no Admin",
    highlights: [
      "Recepção de e-mails em contato@ e parcerias@ via Cloudflare Email Worker",
      "Persistência automática no Firestore sem sobrecarregar caixa postal particular",
      "Nova central de Mensagens & Leads no Painel Administrativo (/admin/contatos)",
      "Envio de respostas oficiais com 1 clique por e-mail pelo Admin via Resend",
    ],
  },
  {
    version: "v4.8.0",
    date: "20/09/2026",
    title: "Sistema de Anúncios de Planos Aleatórios com Painel Admin & Sincronização de Preços",
    highlights: [
      "Lógica de probabilidade configurável (0-100%) e posicionamento randômico de anúncios entre os jogos",
      "Painel administrativo em /admin/plans com controle mestre, editor de criativos e Live Preview em tempo real",
      "Sincronização automática e dinâmica dos valores exibidos com os planos oficiais do Stripe/Firestore",
      "Cards de anúncios 100% clicáveis com correção de corte visual e tipografia compacta mobile-first",
    ],
  },
  {
    version: "v4.7.3",
    date: "20/09/2026",
    title: "Correção na Animação de Curadoria IA na Busca",
    highlights: [
      "Isolamento do feixe cônico animado (ai-card-border-beam) em container delimitador",
      "Eliminação do vazamento de gradiente sobre as informações de títulos e badges no dropdown",
      "Preservação do efeito neon rotativo contornando a borda dos cards de recomendação",
    ],
  },
  {
    version: "v4.7.2",
    date: "20/09/2026",
    title: "MRR Real do Stripe & Detalhamento Financeiro Mensal",
    highlights: [
      "Substituição de estimativas artificiais por dados reais sincronizados diretamente com o Stripe",
      "Novo demonstrativo mensal com receita bruta, taxas da Stripe, lucro líquido e margem",
      "Extrato de transações recentes com detalhamento de taxas retidas",
    ],
  },
  {
    version: "v4.7.1",
    date: "20/09/2026",
    title: "Padronização de Altura e Design System com shadcn/ui na Navbar",
    highlights: [
      "Altura padronizada de 36px (desktop) e 44px (mobile touch-friendly) em todos os elementos da barra",
      "Adoção dos componentes shadcn Button para links de navegação, botão PRO, notificações e menu",
      "Eliminação do atalho ⌘K duplicado no campo de busca",
    ],
  },
  {
    version: "v4.7.0",
    date: "19/09/2026",
    title: "Nova Página de Planos & Anúncios Promocionais In-Feed",
    highlights: [
      "Página completa de Planos & Assinaturas com Modo Gratuito, PRO (mensal, anual com -33% e avulso) e VIP Fundador.",
      "Matriz comparativa detalhada 'O que tem e o que não tem' categorizada por recursos, gamificação e dados.",
      "Cards promocionais nativos estilo Google AdSense (GameCardPlanPromo) intercalados entre os cards de jogos nas grades e carrosséis.",
      "Acesso rápido e destacado a Planos & Assinaturas no menu lateral móvel e na barra de navegação.",
    ],
  },
  {
    version: "v4.6.1",
    date: "19/09/2026",
    title: "Proteção de Cotas Firestore & Blindagem de Sitemap",
    highlights: [
      "Remoção do fallback que lia até 45.000 documentos do Firestore durante falhas parciais.",
      "Leitura estrita de índices particionados (~9 leituras para todo o catálogo).",
      "Eliminação definitiva de picos acidentais de consumo durante builds e deploys.",
    ],
  },
  {
    version: "v4.6.0",
    date: "19/09/2026",
    title: "Slider/Carrossel Horizontal 16:9 para Destaques Indie na Home",
    highlights: [
      "Cards compactos em proporção 16:9 (aspect-video) no padrão streaming.",
      "Rolagem horizontal fluida com suporte a toque nativo e scroll snap.",
      "Navegação com setas flutuantes e feedback tátil em dispositivos móveis.",
      "Card de ação rápida 'Ver Todos' integrado diretamente ao final do carrossel.",
    ],
  },
];
