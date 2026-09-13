export type GameStatus = "completed" | "playing" | "dropped" | "backlog" | "library";

export type CompletionType = "main_story" | "main_extra" | "completionist" | "platinum" | "custom";

export type UserPlan = "free" | "pro" | "vip";

/**
 * Origem do acesso premium atual do usuário.
 * - purchase: comprou via Stripe (assinatura PRO ou VIP vitalício)
 * - trial: período de teste concedido pelo admin
 * - courtesy: cortesia concedida pelo admin
 * - contributor: colaborador que fez diferença no site
 * - custom: concessão com rótulo personalizado
 * - admin: concessão administrativa genérica
 */
export type PlanSource = "purchase" | "trial" | "courtesy" | "contributor" | "custom" | "admin";

export interface GrantTypeMeta {
  label: string;
  short: string;
  color: string; // classe tailwind de texto
  badge: string; // classes tailwind de fundo/borda para chip
}

/** Metadados de apresentação por tipo de concessão (admin + perfil). */
export const GRANT_TYPE_META: Record<PlanSource, GrantTypeMeta> = {
  purchase: {
    label: "Compra",
    short: "Assinante",
    color: "text-emerald-400",
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  },
  trial: {
    label: "Período de Teste",
    short: "Teste",
    color: "text-sky-400",
    badge: "bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
  courtesy: {
    label: "Cortesia",
    short: "Cortesia",
    color: "text-pink-400",
    badge: "bg-pink-500/10 border-pink-500/30 text-pink-300",
  },
  contributor: {
    label: "Colaborador",
    short: "Colaborador",
    color: "text-amber-400",
    badge: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  custom: {
    label: "Personalizado",
    short: "Especial",
    color: "text-purple-400",
    badge: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
  admin: {
    label: "Concessão Admin",
    short: "Admin",
    color: "text-cyan-400",
    badge: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  },
};

export type ProfileTheme = "cyan" | "gold" | "purple" | "crimson" | "emerald";

export const ADMIN_EMAILS = ["leandro.gazolig@gmail.com"];

export const PRESET_BANNERS = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&crop=entropy&q=80",
  },
  {
    id: "elden_ring",
    name: "Dark Fantasy Epic",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&crop=entropy&q=80",
  },
  {
    id: "retro_synthwave",
    name: "Retro Synthwave",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&crop=entropy&q=80",
  },
  {
    id: "deep_space",
    name: "Nebulosa Cósmica",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&crop=entropy&q=80",
  },
  {
    id: "gold_vip",
    name: "Obsidian Gold VIP",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&crop=entropy&q=80",
  },
];

export const GAMER_EMOJI_SUGGESTIONS = [
  "👑", "🏆", "⚔️", "🕹️", "⚡", "🛡️", "💎", "🎯",
  "🌌", "💀", "🔥", "🎮", "👾", "🚀", "🌟", "🧙‍♂️"
];

export const DEFAULT_GAMER_TITLES = [
  "🏆 Caçador de Platinas",
  "⚔️ Mestre dos RPGs",
  "🕹️ Maratonista de Backlog",
  "💎 Colecionador Veterano",
  "🎯 Estrategista Implacável",
  "🌌 Explorador de Mundos",
  "⚡ Speedrunner Dedicado",
  "🛡️ Guardião da Biblioteca",
  "🔥 No-Hit Challenger",
  "👑 Lorde Supremo do Vault",
];

export interface SocialLinks {
  steam?: string;
  psn?: string;
  xbox?: string;
  switch?: string;
  discord?: string;
  twitch?: string;
  youtube?: string;
  twitter?: string;
}

export interface ProfileVisibility {
  isPublic?: boolean;
  showStats?: boolean;
  showPlaytime?: boolean;
  showRatings?: boolean;
  showDropped?: boolean;
}

export const MARKDOWN_PRESETS = [
  {
    id: "cyberpunk_bio",
    name: "⚡ Cyberpunk Netrunner",
    markdown: `### 🎮 Bem-vindo ao meu Vault
> *"Wake up, samurai. We have a backlog to burn."*

![Cyberpunk Pixel Art](https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif)

#### 🏆 Minhas Metas em 2026:
- [x] Zerar **Elden Ring: Shadow of the Erdtree**
- [x] Platinar **Cyberpunk 2077**
- [ ] Concluir todos os RPGs do meu backlog (Meta: 30 jogos)

#### ⚔️ Gêneros Favoritos:
* **Soulslike & RPGs de Ação:** Desafios intensos e construção de builds.
* **Metroidvanias & Pixel Art:** Exploração não linear e trilha sonora marcante.
* **Cyberpunk & Sci-Fi:** Narrativas profundas e escolhas morais.

---
*Atualizado periodicamente • Fique à vontade para me adicionar na Steam e PSN!*`
  },
  {
    id: "trophy_hunter",
    name: "🏆 Caçador de Troféus & Platinas",
    markdown: `## 🏆 Hall da Fama • Platinas & Conquistas 100%

| Jogo | Dificuldade | Horas Dedicadas | Status |
| :--- | :---: | :---: | :---: |
| ⚔️ **Elden Ring** | 9/10 | 145h | 🥇 Platina Conquistada |
| 🩸 **Bloodborne** | 9.5/10 | 98h | 🥇 Platina Conquistada |
| 🏹 **God of War Ragnarök** | 7/10 | 62h | 🥇 100% Concluído |
| 🌌 **Hollow Knight** | 10/10 | 110h | ⏳ Panteão Final |

> *"A verdadeira vitória não é terminar o jogo, é não deixar nenhuma conquista para trás."*`
  },
  {
    id: "retro_gamer",
    name: "🕹️ Retrô Arcade & Anos 90",
    markdown: `### 🕹️ Colecionador de Clássicos & Retrô Gaming

![Arcade GIF](https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif)

* **Primeiro Console:** Super Nintendo (1995)
* **Jogos Inesquecíveis:** *Chrono Trigger, Castlevania: SOTN, Super Mario World*
* **Plataformas Atuais:** PC Master Race, Nintendo Switch OLED e Emuladores

> Apaixonado por trilhas sonoras em Chiptune e pixel art artesanal!`
  }
];

export const HTML_BIO_PRESETS = [
  {
    id: "interactive_tabs",
    name: "⚡ Abas Interativas (Radio + CSS)",
    html: `<style>
.gv-card {
  background: linear-gradient(135deg, #121316 0%, #1a1c23 100%);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  color: #fff;
  font-family: system-ui, sans-serif;
}
.gv-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 229, 255, 0.1);
  color: #00E5FF;
  border: 1px solid rgba(0, 229, 255, 0.3);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: bold;
}
.gv-btn {
  background: #00E5FF;
  color: #000;
  border: none;
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.gv-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(0, 229, 255, 0.4);
}
</style>

<div class="gv-card">
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
    <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      Showcase Interativo do Jogador
    </h3>
    <span class="gv-badge">HTML5 + CSS3</span>
  </div>

  <p style="color: #bbb; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
    Personalize seus cards com cores neon, botões estilizados, elementos gráficos SVG e estilização total via CSS!
  </p>

  <div style="display: flex; gap: 8px; align-items: center;">
    <button type="button" class="gv-btn">🏆 100% Conquistas</button>
    <button type="button" class="gv-btn" style="background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">🎮 Setup Gamer</button>
  </div>
</div>`
  },
  {
    id: "svg_badges",
    name: "🏆 Insígnias SVG & Neon",
    html: `<style>
.neon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}
.neon-item {
  background: rgba(20, 21, 26, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.neon-item:hover {
  transform: translateY(-2px);
  border-color: #00E5FF;
  box-shadow: 0 8px 24px rgba(0, 229, 255, 0.2);
}
</style>

<div class="neon-grid">
  <div class="neon-item">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#00E5FF"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    <div>
      <div style="font-weight: 800; font-size: 13px; color: #fff;">Platinador Master</div>
      <div style="font-size: 11px; color: #888;">50+ Jogos 100%</div>
    </div>
  </div>

  <div class="neon-item">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="#a855f7"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
    <div>
      <div style="font-weight: 800; font-size: 13px; color: #fff;">Console & PC</div>
      <div style="font-size: 11px; color: #888;">Multiplataforma</div>
    </div>
  </div>
</div>`
  }
];

export interface HLTBData {
  gameTitle?: string;
  mainStory: number | null;
  mainExtra: number | null;
  completionist: number | null;
  source?: string;
}

export interface GenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface PlatformItem {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GameVideo {
  id: number;
  name: string;
  video_id: string;
}

export interface SimilarGameItem {
  id: number;
  name: string;
  coverUrl?: string | null;
  rating?: number | null;
}

export interface AgeRatingItem {
  organization: string;
  rating: string;
}

export interface LanguageSupportItem {
  language: string;
  supportsAudio: boolean;
  supportsSubtitles: boolean;
  supportsInterface: boolean;
}

export interface PTBRSupport {
  audio: boolean;
  subtitles: boolean;
  interface: boolean;
}

export interface DLCItem {
  id: number;
  name: string;
  slug?: string;
  coverUrl?: string | null;
  releaseDate?: string | null;
  category?: number;
}

export interface ParentGameItem {
  id: number;
  name: string;
  slug?: string;
  coverUrl?: string | null;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  backdrop_image?: string | null;
  metacritic: number | null;
  released: string | null;
  genres: { id: number; name: string }[];
  platforms: PlatformItem[];
  hltb?: HLTBData | null;
  description_raw?: string;
  storyline?: string;
  rating?: number;
  ratings_count?: number;
  playtime?: number;
  short_screenshots?: { id: number; image: string }[];
  screenshots?: string[];
  artworks?: string[];
  videos?: GameVideo[];
  developers?: string[];
  publishers?: string[];
  game_modes?: string[];
  themes?: string[];
  keywords?: string[];
  websites?: { id: number; category?: number; url: string; label?: string }[];
  similar_games?: SimilarGameItem[];
  age_ratings?: AgeRatingItem[];
  franchises?: string[];
  collections?: string[];
  player_perspectives?: string[];
  language_supports?: LanguageSupportItem[];
  ptbrSupport?: PTBRSupport;
  total_results_count?: number;
  dlcs?: DLCItem[];
  expansions?: DLCItem[];
  parent_game?: ParentGameItem | null;
  category?: number;
  isAiRecommended?: boolean;
  aiExplanation?: string;
  isAdult?: boolean;
}

export interface UserGameDLC {
  id: number;
  name: string;
  coverUrl?: string | null;
  status: GameStatus;
  playtimeHours?: number | null;
  rating?: number | null;
  completedAt?: string | null;
}

export interface UserGame {
  id?: string;
  userId?: string;
  gameId: number;
  gameSlug: string;
  gameTitle: string;
  gameCover: string | null;
  status: GameStatus;
  completionType?: CompletionType | null;
  userRating: number | null;
  userPlaytimeHours: number | null;
  userReview: string;
  platformPlayed: string;
  platformsPlayed?: string[];
  isFavorite: boolean;
  completedAt: string | null;
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metacritic: number | null;
  hltbData?: HLTBData | null;
  genres?: string[];
  releaseYear?: string;
  dlcs?: UserGameDLC[];
  parentGameId?: number | null;
  parentGameTitle?: string | null;
  includeDlcHoursInTotal?: boolean;
}

export type ProfileLayout = "default" | "cinematic" | "gamer_id" | "minimal";

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  favoriteGame?: string;
  plan?: UserPlan;
  isPremium?: boolean;
  isAdmin?: boolean;
  hideAds?: boolean;
  banned?: boolean;
  suspended?: boolean;
  moderationReason?: string | null;
  moderatedAt?: string | null;
  bannerURL?: string | null;
  customBackground?: {
    type: "preset" | "custom_image" | "solid_color" | "animated";
    value: string; // url, hex (#0e0f12), ou preset id
    animationId?: "parallax" | "sprites" | "dust" | "minimal";
  } | null;
  theme?: ProfileTheme;
  profileLayout?: ProfileLayout;
  customTitle?: string | null;
  customTitles?: string[];
  createdCustomTitles?: string[];
  customHtml?: string | null;
  customMarkdown?: string | null;
  customBioMode?: "markdown" | "html" | null;
  socialLinks?: SocialLinks;
  showcaseGameId?: number | null;
  isPublic?: boolean;
  visibility?: ProfileVisibility;
  isVerified?: boolean;
  gamerLevel?: number;
  gamerXp?: number;
  celebratedGamerLevel?: number;
  // XP bônus concedido por conquistas/missões dinâmicas (ledger aditivo, idempotente)
  bonusXp?: number;
  // IDs de conquistas/missões já recompensadas (evita pagar XP duas vezes)
  claimedRewards?: string[];
  premiumUntil?: string | null;
  // Controle de acesso / concessões (grants) do admin
  planSource?: PlanSource;      // origem do acesso premium atual
  planLabel?: string | null;    // rótulo custom exibido no badge (ex.: "Colaborador Fundador")
  grantedBy?: string | null;    // email do admin que concedeu (auditoria)
  grantedAt?: string | null;    // ISO da concessão
  birthDate?: string | null;
  adultContentConfirmedAt?: string | null;
  readNotificationIds?: string[];
  dismissedNotificationIds?: string[];
  acquisition?: UserAcquisition;
  createdAt: string;
  updatedAt?: string;
}

export interface UserAcquisition {
  source?: string;        // ex: 'google', 'instagram', 'facebook', 'direct', 'organic'
  medium?: string;        // ex: 'cpc', 'stories', 'bio', 'referral', 'organic'
  campaign?: string;      // ex: 'launch_promo_2026'
  content?: string;
  term?: string;
  referrer?: string;      // document.referrer original
  landingPage?: string;   // primeira URL acessada
  capturedAt?: string;    // ISO timestamp
}

export interface EffectiveAccess {
  plan: UserPlan;          // plano EFETIVO (free se o premium expirou)
  isPremium: boolean;
  hideAds: boolean;
  lifetime: boolean;       // acesso premium sem data de expiração
  expired: boolean;        // tinha premium mas a vigência passou
  expiresAt: string | null;
  source: PlanSource | null;
  label: string | null;
}

/**
 * Calcula o acesso EFETIVO do usuário considerando a expiração (premiumUntil).
 * Fonte única de verdade para exibir badges e liberar recursos premium na UI.
 * Um grant/assinatura com premiumUntil no passado é tratado como free.
 */
export function getEffectiveAccess(
  user?: Pick<
    UserProfile,
    "plan" | "isPremium" | "hideAds" | "premiumUntil" | "planSource" | "planLabel" | "isAdmin"
  > | null
): EffectiveAccess {
  const rawPlan: UserPlan = user?.plan || "free";
  const source = (user?.planSource as PlanSource | undefined) || null;
  const label = user?.planLabel || null;
  const isAdmin = !!user?.isAdmin;

  // Calcula o acesso REAL (concessão/compra) primeiro, respeitando a vigência
  let result: EffectiveAccess;
  if (rawPlan === "free") {
    result = { plan: "free", isPremium: false, hideAds: false, lifetime: false, expired: false, expiresAt: null, source, label };
  } else {
    const until = user?.premiumUntil ? new Date(user.premiumUntil).getTime() : null;
    const hasExpiry = until !== null && !isNaN(until);
    const expired = hasExpiry && until! < Date.now();
    if (expired) {
      result = { plan: "free", isPremium: false, hideAds: false, lifetime: false, expired: true, expiresAt: user?.premiumUntil || null, source, label };
    } else {
      result = {
        plan: rawPlan,
        isPremium: true,
        hideAds: user?.hideAds !== false,
        lifetime: !hasExpiry,
        expired: false,
        expiresAt: hasExpiry ? user?.premiumUntil || null : null,
        source,
        label,
      };
    }
  }

  // Admin sempre tem acesso: se o acesso real NÃO for premium (free/expirado), concede acesso
  // administrativo vitalício. Se o admin tiver uma concessão/compra real ativa, mostra a real.
  if (isAdmin && !result.isPremium) {
    return {
      plan: rawPlan === "free" ? "vip" : rawPlan,
      isPremium: true,
      hideAds: true,
      lifetime: true,
      expired: false,
      expiresAt: null,
      source: source || "admin",
      label,
    };
  }

  return result;
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  adminUid: string;
  action: string;
  category: "users" | "plans" | "feedback" | "notifications" | "settings" | "security" | "gamification";
  targetId?: string;
  targetName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
  targetEmail?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ==========================================
// GAMIFICAÇÃO: CONQUISTAS & MISSÕES DINÂMICAS
// ==========================================

/**
 * Métricas avaliáveis contra as estatísticas rastreadas (LibraryStats) e o nível gamer.
 * São as únicas dimensões que o site consegue medir automaticamente hoje.
 */
export type GamificationMetric =
  | "completed"
  | "hours"
  | "library"
  | "rated"
  | "playing"
  | "level";

export const GAMIFICATION_METRICS: { value: GamificationMetric; label: string; unit: string }[] = [
  { value: "completed", label: "Jogos zerados", unit: "jogos" },
  { value: "hours", label: "Horas jogadas", unit: "horas" },
  { value: "library", label: "Tamanho da biblioteca", unit: "jogos" },
  { value: "rated", label: "Avaliações feitas", unit: "avaliações" },
  { value: "playing", label: "Jogos em andamento", unit: "jogos" },
  { value: "level", label: "Nível gamer", unit: "nível" },
];

export interface GamificationAchievementDef {
  id: string;
  title: string;
  description: string;
  iconName: string; // nome do ícone lucide (ex.: "Trophy"), resolvido no client
  metric: GamificationMetric;
  targetValue: number;
  globalRarity: number; // % global estilo Steam (menor = mais raro)
  rewardXp: number;
  isSecret: boolean; // oculta título/descrição até desbloquear
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export type GamificationMissionType = "season" | "daily";

export interface GamificationMissionDef {
  id: string;
  title: string;
  description: string;
  iconName: string;
  type: GamificationMissionType;
  metric: GamificationMetric;
  targetValue: number;
  rewardXp: number;
  isActive: boolean;
  // Somente missões de temporada: janela de validade (ISO strings)
  startsAt?: string | null;
  endsAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface GamificationConfig {
  dailyRotationCount: number; // quantas missões diárias do pool aparecem por dia
  seasonName?: string;
  seasonEndsAt?: string | null;
  /** Escada de títulos de prestígio. Ausente = DEFAULT_RANK_TIERS. */
  rankTiers?: RankTier[];
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_GAMIFICATION_CONFIG: GamificationConfig = {
  dailyRotationCount: 3,
  seasonName: "Temporada 1",
  seasonEndsAt: null,
};

export interface HeroCarouselItem {
  id: string;
  gameId?: number;
  title: string;
  subtitle?: string;
  bannerUrl: string;
  linkUrl: string;
  tag?: string;
}

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceNotice?: string;
  allowRegistrations: boolean;
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkUrl?: string;
    linkLabel?: string;
    variant: "info" | "warning" | "promo";
  };
  heroCarousel?: {
    enabled: boolean;
    maxItems: number;
    items: HeroCarouselItem[];
  };
  defaultBackground?: {
    type: "preset" | "custom_image" | "solid_color" | "animated";
    value: string; // url, hex (#0e0f12), ou preset id
    animationId?: "parallax" | "sprites" | "dust" | "minimal";
  };
  features: {
    aiRecommendations: boolean;
    communityChat: boolean;
    bountiesEnabled: boolean;
    instantSyncSteam: boolean;
  };
  emailTemplates?: {
    vipWelcome?: EmailTemplateConfig;
    proWelcome?: EmailTemplateConfig;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface EmailTemplateConfig {
  subject: string;
  preheader?: string;
  badgeText?: string;
  heading?: string;
  subheading?: string;
  defaultMessage?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  accentColor?: string;
  benefits?: string[];
  footerText?: string;
}

export interface LibraryStats {
  totalGames: number;
  completedCount: number;
  playingCount: number;
  droppedCount: number;
  backlogCount: number;
  libraryCount?: number;
  totalPlaytimeHours: number;
  averageRating: number;
  /** Jogos com nota atribuída pelo usuário (userRating > 0). Ausente = não computado. */
  ratedCount?: number;
  topGenres: { name: string; count: number }[];
}

export interface PlanXpBoostConfig {
  multiplier: number;
  label: string;
  bonusPercent: number;
  name: string;
  badge: string;
}

export const PLAN_XP_BOOST: Record<UserPlan, PlanXpBoostConfig> = {
  free: {
    multiplier: 1.0,
    label: "1.0x",
    bonusPercent: 0,
    name: "Free (Padrão)",
    badge: "1.0x XP",
  },
  pro: {
    multiplier: 1.5,
    label: "1.5x",
    bonusPercent: 50,
    name: "PRO (+50% XP)",
    badge: "⚡ 1.5x XP Boost",
  },
  vip: {
    multiplier: 2.0,
    label: "2.0x",
    bonusPercent: 100,
    name: "VIP (2x XP em Dobro)",
    badge: "👑 2.0x XP Boost",
  },
};

/**
 * Fator da curva de nível: o XP acumulado necessário para o nível N é (N-1)² * XP_LEVEL_FACTOR.
 * Menor = progressão mais rápida. NÃO existe nível máximo — a curva segue indefinidamente.
 */
export const XP_LEVEL_FACTOR = 8;

/**
 * Teto de avaliações que rendem XP base (20 notas x 20 XP = 400 XP).
 * Preserva o limite original da economia; a métrica "rated" das conquistas não tem teto.
 */
export const RATED_XP_CAP = 20;

/** XP acumulado necessário para alcançar o nível informado. */
export function xpForLevel(level: number): number {
  return Math.pow(Math.max(1, Math.floor(level)) - 1, 2) * XP_LEVEL_FACTOR;
}

/** Nível correspondente ao XP acumulado. Sem teto: cresce com a raiz do XP. */
export function levelFromXp(xp: number): number {
  const safeXp = Math.max(0, Math.floor(xp) || 0);
  return Math.max(1, Math.floor(Math.sqrt(safeXp / XP_LEVEL_FACTOR)) + 1);
}

/** Um degrau da escada de prestígio: a partir de `minLevel`, o usuário exibe `title`. */
export interface RankTier {
  minLevel: number;
  title: string;
}

/**
 * Escada de títulos de prestígio, do topo para a base — o primeiro degrau que couber vence.
 * Como não existe nível máximo, "Fim dos Créditos" é o título terminal: quem passa de 200
 * continua com ele. O admin sobrescreve esta escada em system/gamification.rankTiers.
 *
 * Os cinco degraus de baixo (1/15/30/50/80) são os originais e não mudaram: seus nomes
 * aparecem nas descrições das conquistas de nível já cadastradas.
 */
export const DEFAULT_RANK_TIERS: RankTier[] = [
  { minLevel: 200, title: "Fim dos Créditos" },
  { minLevel: 150, title: "Soberano Eterno" },
  { minLevel: 130, title: "Oráculo dos Mundos" },
  { minLevel: 115, title: "Titã do Backlog" },
  { minLevel: 100, title: "Lenda Viva" },
  { minLevel: 90, title: "Arconte do Vault" },
  { minLevel: 80, title: "Lorde Supremo" },
  { minLevel: 50, title: "Mestre Lendário" },
  { minLevel: 30, title: "Veterano Hardcore" },
  { minLevel: 15, title: "Aventureiro PRO" },
  { minLevel: 1, title: "Aspirante Gamer" },
];

/**
 * Escada ativa. Config global (não por usuário), então um registro de módulo é seguro:
 * o app chama setRankTiers() uma vez ao carregar system/gamification e todas as telas
 * que derivam o título passam a refletir o que o admin cadastrou, sem mudar assinatura.
 * Sem chamada, vale DEFAULT_RANK_TIERS.
 */
let activeRankTiers: RankTier[] = DEFAULT_RANK_TIERS;

/** Normaliza e instala a escada vinda do Firestore. Lista vazia/inválida volta ao padrão. */
export function setRankTiers(tiers?: RankTier[] | null): void {
  activeRankTiers = normalizeRankTiers(tiers);
}

export function getRankTiers(): RankTier[] {
  return activeRankTiers;
}

/**
 * Descarta degraus malformados e ordena do maior minLevel para o menor, que é a ordem que
 * rankTitleForLevel assume. Garante um degrau em minLevel 1 para nunca faltar título.
 */
export function normalizeRankTiers(tiers?: RankTier[] | null): RankTier[] {
  if (!Array.isArray(tiers)) return DEFAULT_RANK_TIERS;
  const clean = tiers
    .filter((t) => t && typeof t.title === "string" && t.title.trim().length > 0)
    .map((t) => ({ minLevel: Math.max(1, Math.floor(Number(t.minLevel) || 1)), title: t.title.trim() }))
    .sort((a, b) => b.minLevel - a.minLevel);
  if (clean.length === 0) return DEFAULT_RANK_TIERS;
  if (clean[clean.length - 1].minLevel > 1) {
    clean.push({ minLevel: 1, title: clean[clean.length - 1].title });
  }
  return clean;
}

/** Título de prestígio do nível. Usa a escada ativa, ou a que for passada explicitamente. */
export function rankTitleForLevel(level: number, tiers: RankTier[] = activeRankTiers): string {
  const list = tiers.length > 0 ? tiers : DEFAULT_RANK_TIERS;
  const tier = list.find((t) => level >= t.minLevel);
  return (tier ?? list[list.length - 1]).title;
}

/**
 * Calcula o Nível Gamer (sem teto máximo) e o Ranking de Prestígio a partir das estatísticas e do multiplicador do Plano
 */
export function calculateGamerLevel(
  stats?: LibraryStats | null,
  realGlobalRank?: string,
  plan?: UserPlan,
  bonusXp: number = 0
): {
  level: number;
  xp: number;
  baseXp: number;
  boostMultiplier: number;
  boostBonusXp: number;
  boostLabel: string;
  boostPercent: number;
  userPlan: UserPlan;
  currentLevelBaseXp: number;
  nextLevelXp: number;
  xpToNextLevel: number;
  percentToNext: number;
  rankTitle: string;
  globalRank: string;
  breakdown: {
    completedXp: number;
    hoursXp: number;
    playingXp: number;
    libraryXp: number;
    ratingXp: number;
    baseXp: number;
    boostBonusXp: number;
    bonusXp: number;
  };
} {
  const activePlan: UserPlan = plan || "free";
  const boost = PLAN_XP_BOOST[activePlan] || PLAN_XP_BOOST.free;

  const fallbackBreakdown = {
    completedXp: 0,
    hoursXp: 0,
    playingXp: 0,
    libraryXp: 0,
    ratingXp: 0,
    baseXp: 0,
    boostBonusXp: 0,
    bonusXp: 0,
  };

  const safeBonusXp = Math.max(0, Math.floor(bonusXp || 0));

  if (!stats) {
    const totalXpNoStats = safeBonusXp;
    const levelNoStats = levelFromXp(totalXpNoStats);
    const curBase = xpForLevel(levelNoStats);
    const nextBase = xpForLevel(levelNoStats + 1);
    const diff = Math.max(1, nextBase - curBase);
    return {
      level: levelNoStats,
      xp: totalXpNoStats,
      baseXp: 0,
      boostMultiplier: boost.multiplier,
      boostBonusXp: 0,
      boostLabel: boost.label,
      boostPercent: boost.bonusPercent,
      userPlan: activePlan,
      currentLevelBaseXp: curBase,
      nextLevelXp: nextBase,
      xpToNextLevel: Math.max(0, nextBase - totalXpNoStats),
      percentToNext: Math.min(100, Math.floor((Math.max(0, totalXpNoStats - curBase) / diff) * 100)),
      rankTitle: rankTitleForLevel(levelNoStats),
      globalRank: realGlobalRank || "Iniciante",
      breakdown: { ...fallbackBreakdown, bonusXp: safeBonusXp },
    };
  }

  const completed = stats.completedCount || 0;
  const playing = stats.playingCount || 0;
  const library = stats.totalGames || 0;
  const hours = stats.totalPlaytimeHours || 0;
  const rated = Math.min(Math.max(0, stats.ratedCount ?? 0), RATED_XP_CAP);

  const completedXp = completed * 60;
  const hoursXp = Math.floor(hours * 0.2);
  const playingXp = playing * 20;
  const libraryXp = library * 10;
  const ratingXp = rated * 20;

  const baseXp = completedXp + hoursXp + playingXp + libraryXp + ratingXp;
  const boostBonusXp = Math.floor(baseXp * (boost.multiplier - 1));
  // XP bônus de conquistas/missões entra sem multiplicador de plano (recompensa fixa)
  const totalXp = Math.floor(baseXp * boost.multiplier) + safeBonusXp;

  const calculatedLevel = levelFromXp(totalXp);
  const currentLevelBaseXp = xpForLevel(calculatedLevel);
  const nextLevelBaseXp = xpForLevel(calculatedLevel + 1);
  const levelXpDiff = Math.max(1, nextLevelBaseXp - currentLevelBaseXp);
  const currentProgress = Math.max(0, totalXp - currentLevelBaseXp);
  const percentToNext = Math.min(100, Math.floor((currentProgress / levelXpDiff) * 100));
  const xpToNextLevel = Math.max(0, nextLevelBaseXp - totalXp);

  const rankTitle = rankTitleForLevel(calculatedLevel);
  const globalRank = realGlobalRank || "Calculando Rank...";

  return {
    level: calculatedLevel,
    xp: totalXp,
    baseXp,
    boostMultiplier: boost.multiplier,
    boostBonusXp,
    boostLabel: boost.label,
    boostPercent: boost.bonusPercent,
    userPlan: activePlan,
    currentLevelBaseXp,
    nextLevelXp: nextLevelBaseXp,
    xpToNextLevel,
    percentToNext,
    rankTitle,
    globalRank,
    breakdown: {
      completedXp,
      hoursXp,
      playingXp,
      libraryXp,
      ratingXp,
      baseXp,
      boostBonusXp,
      bonusXp: safeBonusXp,
    },
  };
}

export type GamerLevelInfo = ReturnType<typeof calculateGamerLevel>;

// ==========================================
// SISTEMA DE FEEDBACK, IDEIAS & RECOMPENSAS
// ==========================================

export type FeedbackCategory = "idea" | "bug" | "improvement" | "feedback";

export type FeedbackStatus =
  | "under_review"
  | "planned"
  | "in_progress"
  | "completed"
  | "declined";

export type FeedbackRewardType = "vip" | "pro" | "badge" | "custom";

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhoto: string | null;
  authorPlan: UserPlan;
  upvotesCount: number;
  downvotesCount: number;
  score: number;
  commentsCount: number;
  adminResponse?: string | null;
  adminResponseAt?: string | null;
  rewarded?: boolean;
  rewardType?: FeedbackRewardType | null;
  rewardTitle?: string | null;
  rewardGrantedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackVote {
  feedbackId: string;
  userId: string;
  vote: 1 | -1;
  updatedAt: string;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorPhoto: string | null;
  authorPlan: UserPlan;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

export const FEEDBACK_CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  iconName: "Lightbulb" | "Bug" | "Zap" | "MessageSquare";
  description: string;
  badgeClass: string;
}[] = [
  {
    id: "idea",
    label: "Ideia / Recurso",
    iconName: "Lightbulb",
    description: "Sugira uma nova funcionalidade, ferramenta ou recurso para a plataforma.",
    badgeClass: "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF]",
  },
  {
    id: "bug",
    label: "Bug / Erro",
    iconName: "Bug",
    description: "Relate uma falha técnica, erro de exibição ou comportamento inesperado.",
    badgeClass: "bg-rose-500/15 border-rose-500/40 text-rose-400",
  },
  {
    id: "improvement",
    label: "Melhoria UX",
    iconName: "Zap",
    description: "Proponha aprimoramentos de velocidade, usabilidade ou design.",
    badgeClass: "bg-amber-500/15 border-amber-500/40 text-amber-300",
  },
  {
    id: "feedback",
    label: "Feedback Geral",
    iconName: "MessageSquare",
    description: "Compartilhe sua opinião, elogio ou sugestão geral sobre a plataforma.",
    badgeClass: "bg-purple-500/15 border-purple-500/40 text-purple-300",
  },
];

export const FEEDBACK_STATUSES: Record<
  FeedbackStatus,
  { label: string; color: string; dotClass: string; desc: string }
> = {
  under_review: {
    label: "Em Análise",
    color: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    dotClass: "bg-yellow-400",
    desc: "A equipe e a comunidade estão avaliando esta sugestão.",
  },
  planned: {
    label: "Planejado",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    dotClass: "bg-purple-400",
    desc: "Aprovado! Entrou no planejamento de desenvolvimento.",
  },
  in_progress: {
    label: "Em Desenvolvimento",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    dotClass: "bg-blue-400 animate-pulse",
    desc: "Nossa equipe já está codificando e implementando.",
  },
  completed: {
    label: "Implementado",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    dotClass: "bg-emerald-400",
    desc: "Lançado no MyGameList! Já está disponível no site.",
  },
  declined: {
    label: "Não Viável",
    color: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-400",
    desc: "Analisado pela equipe, porém não será possível implementar no momento.",
  },
};

export const DEFAULT_REWARD_TITLES = [
  "🐛 Bug Hunter Master",
  "💡 Visionário do Vault",
  "🛡️ Guardião da Plataforma",
  "⚡ Otimizador de Elite",
  "⭐ Contribuidor Master",
  "💎 Caçador de Glitches",
  "🚀 Arquiteto Comunitário",
];

// ==========================================
// SISTEMA DE NOTIFICAÇÕES (PUSH & IN-APP)
// ==========================================

export type NotificationCategory = "feature" | "content" | "update" | "reward" | "general";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  linkUrl?: string | null;
  linkLabel?: string | null;
  imageUrl?: string | null;
  isPinned?: boolean;
  sendPush?: boolean;
  targetUserId?: string | null;
  createdAt: string;
  createdBy?: string;
}

export const NOTIFICATION_CATEGORIES: Record<
  NotificationCategory,
  {
    label: string;
    iconName: "Sparkles" | "Gamepad2" | "Zap" | "Trophy" | "Bell";
    badgeClass: string;
    accentColor: string;
  }
> = {
  feature: {
    label: "Novo Recurso",
    iconName: "Sparkles",
    badgeClass: "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF]",
    accentColor: "#00E5FF",
  },
  content: {
    label: "Novo Conteúdo",
    iconName: "Gamepad2",
    badgeClass: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
    accentColor: "#34d399",
  },
  update: {
    label: "Atualização",
    iconName: "Zap",
    badgeClass: "bg-amber-500/15 border-amber-500/40 text-amber-300",
    accentColor: "#fbbf24",
  },
  reward: {
    label: "Recompensa",
    iconName: "Trophy",
    badgeClass: "bg-yellow-500/15 border-yellow-500/40 text-yellow-300",
    accentColor: "#facc15",
  },
  general: {
    label: "Aviso Geral",
    iconName: "Bell",
    badgeClass: "bg-purple-500/15 border-purple-500/40 text-purple-300",
    accentColor: "#c084fc",
  },
};

// ==========================================
// SISTEMA DE INVENTÁRIO STEAM & IMPORTADOR
// ==========================================

export type SteamSupportedAppId = 730 | 440 | 252490 | 570 | 753;

export interface SteamSupportedApp {
  id: SteamSupportedAppId;
  name: string;
  shortName: string;
  contextId: number;
  icon: string;
  badgeColor: string;
  heroImage: string;
}

export const STEAM_SUPPORTED_APPS: SteamSupportedApp[] = [
  {
    id: 730,
    name: "Counter-Strike 2",
    shortName: "CS2",
    contextId: 2,
    icon: "🔫",
    badgeColor: "border-amber-500/40 text-amber-300 bg-amber-500/10",
    heroImage: "https://media.steampowered.com/steamcommunity/public/images/apps/730/81e51c890a1961448b1d406fed6eb42b31a5477b.jpg",
  },
  {
    id: 440,
    name: "Team Fortress 2",
    shortName: "TF2",
    contextId: 2,
    icon: "🎩",
    badgeColor: "border-orange-500/40 text-orange-300 bg-orange-500/10",
    heroImage: "https://media.steampowered.com/steamcommunity/public/images/apps/440/e3f595a92552da3d664ad00277fad2107345f743.jpg",
  },
  {
    id: 252490,
    name: "Rust",
    shortName: "Rust",
    contextId: 2,
    icon: "🌲",
    badgeColor: "border-rose-500/40 text-rose-300 bg-rose-500/10",
    heroImage: "https://media.steampowered.com/steamcommunity/public/images/apps/252490/47622f6d2f347b59e7464a85702213abec80357f.jpg",
  },
  {
    id: 570,
    name: "Dota 2",
    shortName: "Dota 2",
    contextId: 2,
    icon: "⚔️",
    badgeColor: "border-red-500/40 text-red-300 bg-red-500/10",
    heroImage: "https://media.steampowered.com/steamcommunity/public/images/apps/570/d4f836839254be08d8e9dd333ecc9a01782d26d2.jpg",
  },
  {
    id: 753,
    name: "Comunidade Steam",
    shortName: "Cartas & Itens",
    contextId: 6,
    icon: "🃏",
    badgeColor: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10",
    heroImage: "https://media.steampowered.com/steamcommunity/public/images/apps/753/135dc194e4c274da5c84d728551f15dbb03e0310.jpg",
  },
];

export interface SteamItemTag {
  category: string;
  internalName: string;
  localizedCategoryName?: string;
  localizedTagName: string;
  color?: string;
}

export interface SteamItemDescription {
  type?: string;
  value: string;
  color?: string;
}

export interface SteamInventoryItem {
  assetId: string;
  classId: string;
  instanceId: string;
  amount: number;
  name: string;
  marketName: string;
  marketHashName: string;
  iconUrl: string;
  iconUrlLarge?: string;
  type: string;
  rarity?: string;
  rarityColor?: string;
  exterior?: string;
  weapon?: string;
  descriptions?: SteamItemDescription[];
  tags?: SteamItemTag[];
  tradable: boolean;
  marketable: boolean;
  marketPrice?: string;
  appId: number;
  contextId: number;
}

export interface SteamInventoryResponse {
  success: boolean;
  steamId64?: string;
  profile?: {
    personaname: string;
    avatarUrl: string;
    profileUrl: string;
    customURL?: string;
  };
  appId: number;
  totalCount: number;
  items: SteamInventoryItem[];
  isDemo?: boolean;
  error?: string;
  isPrivate?: boolean;
  rateLimited?: boolean;
}

export interface SteamGameItem {
  appId: number;
  name: string;
  playtimeForeverHours: number;
  playtime2WeeksHours?: number;
  iconUrl?: string;
  logoUrl?: string;
}

export type StorePlatform =
  | "Steam"
  | "Epic Games"
  | "GOG"
  | "PlayStation 5"
  | "PlayStation 4"
  | "Xbox Series"
  | "Xbox One"
  | "Nintendo Switch"
  | "PC"
  | "Outro";

export interface ImportGameDraft {
  id: string;
  originalTitle: string;
  matchedGameId?: number;
  matchedSlug?: string;
  matchedTitle?: string;
  matchedCover?: string | null;
  matchedMetacritic?: number | null;
  matchedReleaseYear?: string;
  matchedGenres?: string[];
  platform: StorePlatform | string;
  status: GameStatus;
  userPlaytimeHours?: number;
  userRating?: number;
  isFavorite?: boolean;
  selected: boolean;
  alreadyInLibrary?: boolean;
}



