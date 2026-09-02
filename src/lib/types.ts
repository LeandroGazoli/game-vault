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
  websites?: { id: number; category?: number; url: string; label?: string }[];
  similar_games?: SimilarGameItem[];
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
}

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
  bannerURL?: string | null;
  theme?: ProfileTheme;
  customTitle?: string | null;
  customHtml?: string | null;
  customMarkdown?: string | null;
  socialLinks?: SocialLinks;
  showcaseGameId?: number | null;
  visibility?: ProfileVisibility;
  premiumUntil?: string | null;
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
