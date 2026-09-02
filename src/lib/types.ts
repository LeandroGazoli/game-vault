export type GameStatus = "completed" | "playing" | "dropped" | "backlog";

export type CompletionType = "main_story" | "main_extra" | "completionist" | "platinum" | "custom";

export type UserPlan = "free" | "pro" | "vip";

export type ProfileTheme = "cyan" | "gold" | "purple" | "crimson" | "emerald";

export const ADMIN_EMAILS = ["leandro.gazolig@gmail.com"];

export const PRESET_BANNERS = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "elden_ring",
    name: "Dark Fantasy Epic",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "retro_synthwave",
    name: "Retro Synthwave",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "deep_space",
    name: "Nebulosa Cósmica",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "gold_vip",
    name: "Obsidian Gold VIP",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
  },
];

export interface HLTBData {
  gameTitle?: string;
  mainStory: number | null;     // Horas (ex: 35)
  mainExtra: number | null;     // Horas (ex: 60)
  completionist: number | null; // Horas (ex: 120)
  source?: string;
}

export interface PlatformItem {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  metacritic: number | null;
  released: string | null;
  genres: { id: number; name: string }[];
  platforms: PlatformItem[];
  hltb?: HLTBData | null;
  description_raw?: string;
  rating?: number;
  ratings_count?: number;
  playtime?: number;
  short_screenshots?: { id: number; image: string }[];
}

export interface UserGame {
  id?: string;                     // ID único do registro no Firestore
  userId?: string;                 // ID do usuário
  gameId: number;                  // ID do jogo no IGDB/RAWG
  gameSlug: string;
  gameTitle: string;
  gameCover: string | null;
  status: GameStatus;
  completionType?: CompletionType | null; // Ex: "main_story", "main_extra", "completionist", "platinum"
  userRating: number | null;       // Nota pessoal dada pelo usuário (0 a 10)
  userPlaytimeHours: number | null;// Tempo real que o usuário gastou jogando
  userReview: string;              // Resenha ou anotações pessoais
  platformPlayed: string;          // Plataforma principal
  platformsPlayed?: string[];      // Múltiplas plataformas selecionadas
  isFavorite: boolean;
  completedAt: string | null;      // Data em que zerou (ISO string)
  startedAt: string | null;        // Data de início
  createdAt: string;
  updatedAt: string;
  metacritic: number | null;
  hltbData?: HLTBData | null;
  genres?: string[];
  releaseYear?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  favoriteGame?: string;
  plan?: UserPlan;                 // "free" | "pro" | "vip"
  isPremium?: boolean;             // Flag rápida para VIP/Pro
  isAdmin?: boolean;               // Flag de Administrador da plataforma
  hideAds?: boolean;               // Opção de desativar anúncios
  bannerURL?: string | null;       // Capa personalizada do perfil
  theme?: ProfileTheme;            // Tema de cores (ex: "cyan", "gold", "purple", "crimson", "emerald")
  customTitle?: string | null;     // Título Gamer (ex: "Caçador de Platinas", "Mestre dos RPGs")
  customHtml?: string | null;      // HTML e CSS customizado no perfil (sem JS)
  premiumUntil?: string | null;    // Data de expiração da assinatura
  createdAt: string;
  updatedAt?: string;
}

export interface LibraryStats {
  totalGames: number;
  completedCount: number;
  playingCount: number;
  droppedCount: number;
  backlogCount: number;
  totalPlaytimeHours: number;
  averageRating: number;
  topGenres: { name: string; count: number }[];
}

export const HTML_PRESETS = [
  {
    id: "cyberpunk_hud",
    name: "Cyberpunk HUD & Pixel Art",
    html: `<div style="background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(168, 85, 247, 0.08)); border: 1px solid rgba(0, 229, 255, 0.3); border-radius: 20px; padding: 20px; color: #e2e8f0; font-family: monospace;">
  <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(0, 229, 255, 0.2); padding-bottom: 10px; margin-bottom: 15px;">
    <span style="color: #00E5FF; font-weight: bold; font-size: 14px;">⚡ STATUS: ONLINE // NIGHT_CITY</span>
    <span style="color: #a855f7; font-size: 12px;">LVL 99 NETRUNNER</span>
  </div>
  
  <div style="display: flex; flex-wrap: wrap; gap: 20px; align-items: center;">
    <img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" alt="Pixel Art Cyberpunk" style="width: 140px; height: 140px; border-radius: 16px; object-fit: cover; border: 2px solid #00E5FF; box-shadow: 0 0 15px rgba(0, 229, 255, 0.3);" />
    <div style="flex: 1; min-width: 200px;">
      <h3 style="color: #ffffff; margin: 0 0 8px 0; font-size: 18px; font-weight: 800;">"Wake up, samurai. We have a backlog to burn."</h3>
      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 10px 0; line-height: 1.5;">Explorando universos cyberpunk, soulslikes e RPGs com narrativa densa. Sempre em busca da próxima platina impossível.</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span style="background: rgba(0, 229, 255, 0.15); color: #00E5FF; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">#Soulslike</span>
        <span style="background: rgba(168, 85, 247, 0.15); color: #c084fc; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">#RPG</span>
        <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold;">#RetroGaming</span>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: "retro_arcade",
    name: "Retro Arcade 90s",
    html: `<div style="background: #0d0e12; border: 2px dashed #f59e0b; border-radius: 20px; padding: 20px; color: #fff; text-align: center;">
  <marquee style="color: #f59e0b; font-family: monospace; font-weight: bold; font-size: 14px; margin-bottom: 15px; letter-spacing: 2px;">
    🕹️ INSERIR FICHA PARA CONTINUAR • RECORDISTA DO MÊS • BEM-VINDO AO MEU VAULT 🕹️
  </marquee>

  <div style="display: flex; justify-content: center; gap: 15px; margin: 15px 0;">
    <img src="https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif" alt="Arcade GIF" style="max-height: 120px; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.4);" />
  </div>

  <p style="font-size: 13px; color: #cbd5e1; max-width: 500px; margin: 0 auto; line-height: 1.6;">
    Fã inveterado de clássicos dos anos 90, plataformas 16-bits e metroidvanias modernos. Colecionando memórias e zerando clássicos desde 1998!
  </p>
</div>`
  },
  {
    id: "character_stats",
    name: "RPG Character Sheet",
    html: `<div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 20px; color: #e2e8f0;">
  <h3 style="color: #38bdf8; margin: 0 0 12px 0; font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">⚔️ FICHA DO PERSONAGEM</h3>
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
      <td style="padding: 8px 0; color: #94a3b8;">Classe Principal</td>
      <td style="padding: 8px 0; font-weight: bold; color: #fff; text-align: right;">Caçador de Troféus</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
      <td style="padding: 8px 0; color: #94a3b8;">Dificuldade Favorita</td>
      <td style="padding: 8px 0; font-weight: bold; color: #ef4444; text-align: right;">Hard / Nightmare</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.06);">
      <td style="padding: 8px 0; color: #94a3b8;">Plataformas Ativas</td>
      <td style="padding: 8px 0; font-weight: bold; color: #38bdf8; text-align: right;">PC Master Race & PS5</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #94a3b8;">Meta Atual</td>
      <td style="padding: 8px 0; font-weight: bold; color: #10b981; text-align: right;">Zerar 50 jogos em 2026</td>
    </tr>
  </table>
</div>`
  }
];
