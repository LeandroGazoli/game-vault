/**
 * Versão pública do MyGameList / Game Vault.
 * Sincronizada com o Service Worker (public/sw.js) e documentada no CHANGELOG.md.
 */
export const APP_VERSION = "v4.15.0";
export const APP_RELEASE_DATE = "2026-09-26";

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  highlights: string[];
}

export const RECENT_CHANGELOG: ChangelogEntry[] = [
  {
    version: "v4.15.0",
    date: "26/09/2026",
    title: "Navegação Mobile com Animação Líquida GSAP e Links Dedicados",
    highlights: [
      "Reformulação completa do menu inferior mobile com 5 opções exclusivas sem repetição: Início, Buscar, Ações Rápidas (+), Rankings e Perfil.",
      "Círculo animado com física líquida GSAP: deslocamento fluido entre as abas com esticamento elástico (squash & stretch), rastro metaball e onda de pouso.",
      "Filtro SVG Gooey e brilho especular 3D de alta performance sem drenagem de bateria.",
      "Eliminação do ponto estático verde sob o texto, integrando a elevação do ícone ativo diretamente dentro da bolha esmeralda líquida.",
    ],
  },
  {
    version: "v4.14.2",
    date: "26/09/2026",
    title: "Resiliência de Catálogo, Fim dos Erros 404 e Correção de Navegação",
    highlights: [
      "Correção no roteamento de páginas e navegação suave entre jogos, buscas e catálogo.",
      "Blindagem do Service Worker evitando recarregamento indevido e loops de loading.",
      "Novo esqueleto neutro e compacto de carregamento global para transições mais limpas.",
      "Fim dos erros 404 em fichas de jogos: recuperação inteligente por slug ou título caso o ID falhe.",
      "Auto-cura transparente da biblioteca: substituição assíncrona de IDs sintéticos de importação pelos IDs canônicos do IGDB.",
      "Importação otimizada sem limite de 50 jogos e sanitização automática de sufixos de plataformas (Xbox, Steam).",
      "Redirecionamento canônico 301 automático e suporte resiliente a jogos independentes.",
    ],
  },
  {
    version: "v4.14.1",
    date: "26/09/2026",
    title: "Segurança e Resiliência de APIs",
    highlights: [
      "Reforços contra XSS, abuso de IA e acesso indevido a serviços administrativos.",
      "Proteções extras para proxy de imagens e uso de chaves de integrações.",
    ],
  },
  {
    version: "v4.14.0",
    date: "24/09/2026",
    title: "Hiper-Personalização do Perfil: Drag & Drop Modular, Insígnias Pentágono e Hardware",
    highlights: [
      "Modo de Edição Visual ao Vivo na Página: arraste e reordene os quadros diretamente na tela com feedback tátil e controles visuais de coluna",
      "Organização 100% modular com Drag & Drop e posicionamento livre entre Coluna Principal e Barra Lateral",
      "Insígnias de Franquias com design pentágono de prestígio e background artístico das capas de jogos",
      "Remoção de mockups genéricos na Vitrine de Troféus, Galeria de Mídias, Personagens e Setup (ocultação inteligente quando vazio)",
      "Novas gavetas no estúdio /perfil/editar para cadastro de Setup Gamer & Hardware e Top 5 Personagens Favoritos",
      "Modal explicativo e didático 'Como Funciona?' sobre ROI Gamer, Custo por Hora e Total Investido",
      "Redirecionamento automático e correção de rota para /perfil/badges e /profile/badges",
    ],
  },
  {
    version: "v4.13.2",
    date: "24/09/2026",
    title: "Correção de Hidratação e Estabilidade no Estúdio de Edição de Perfil",
    highlights: [
      "Correção de sincronização de dados e campo de data de nascimento em /perfil/editar",
      "Suporte reativo completo a estilização customizada CSS Scoped para membros VIP/PRO",
      "Proteção de acesso com tela de carregamento e barreira amigável para usuários não autenticados",
    ],
  },
  {
    version: "v4.13.1",
    date: "24/09/2026",
    title: "Unificação de Nível Gamer & Otimização do SplashScreen",
    highlights: [
      "Unificação do cálculo de nível gamer em todos os elementos de perfil e modais",
      "Sincronização correta do plano VIP/PRO efetivo com o cálculo de XP",
      "Eliminação do piscar repetido e carregamento acelerado do SplashScreen mobile",
    ],
  },
  {
    version: "v4.13.0",
    date: "24/09/2026",
    title: "Mural da Comunidade (Guestbook) & Mais Aguardados com Countdown",
    highlights: [
      "Mural de Recados no perfil com suporte a marcar jogos jogados juntos e moderação opcional.",
      "Seção Mais Aguardados com contagem regressiva em tempo real até o lançamento de cada jogo.",
      "Novas seções integradas ao orquestrador modular de perfis.",
    ],
  },
  {
    version: "v4.12.0",
    date: "21/09/2026",
    title: "Identidade Gamer, Sincronização Explicada, Favoritos & Twitch Live",
    highlights: [
      "Cadastro com escolha/gerador de username único, data de nascimento e indicação.",
      "Edição única do @username nas configurações com proteção de limite.",
      "Modal 'Como a Sincronização Funciona' com suporte interno e orientações passo a passo.",
      "Sistema de Favoritar Usuários com estrela e 4 toggles independentes de alertas.",
      "Integração Twitch: anel LIVE pulsante no avatar do perfil e player retrátil.",
      "Rail 'Jogando Agora' com rotação automática de 6s e fallback inteligente.",
      "Suporte a vídeos de até 90s na galeria com proteção de spoiler interativo.",
      "Botão de iniciar jogo Steam direto do navegador (steam://run/[appId]).",
    ],
  },
  {
    version: "v4.11.0",
    date: "21/09/2026",
    title: "Upload Direto de Imagens, Vitrine de Troféus & Insígnias de Franquias",
    highlights: [
      "Upload direto de fotos e screenshots do dispositivo para capa e galeria gamer.",
      "Vitrine de troféus e platinas importadas da Steam, PSN e Xbox.",
      "Insígnias de Franquias com progresso por jogo (Dark Souls, Resident Evil, Persona, etc.).",
      "Mapa de Calor de Atividade Gamer estilo GitHub e Vitrines de Setup e Personagens.",
    ],
  },
  {
    version: "v4.10.2",
    date: "21/09/2026",
    title: "Suporte a Arrastar Menu de Abas no Perfil (Desktop / PC)",
    highlights: [
      "Permite clicar e arrastar (drag-to-scroll) na barra horizontal de categorias do perfil no PC",
      "Diferenciação precisa entre clique e arrasto para navegação fluida sem ativações acidentais",
      "Feedback visual de cursor (cursor-grab e cursor-grabbing) em desktop sem afetar touch no mobile",
    ],
  },
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
