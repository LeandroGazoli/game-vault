export interface CategoryItem {
  slug: string;
  name: string;
  badgeLabel: string;
  description: string;
  accent: string;
  borderAccent: string;
  glowColor: string;
  coverImage: string;
  igdbThemeId?: number;
  igdbGenreId?: number;
  featuredTitles: string[];
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    slug: "luta",
    name: "Luta & Combate",
    badgeLabel: "LUTA",
    description: "Confrontos eletrizantes, combos devastadores e o auge dos jogos de luta e hack'n slash.",
    accent: "from-red-900/80 via-red-950/60 to-[#101216]",
    borderAccent: "border-red-500/30 hover:border-red-400",
    glowColor: "rgba(239, 68, 68, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/ar1yf8.jpg",
    igdbGenreId: 4, // Fighting
    featuredTitles: ["Street Fighter 6", "Tekken 8", "Mortal Kombat 1", "Guilty Gear -Strive-"],
  },
  {
    slug: "mundo-aberto",
    name: "Mundo Aberto",
    badgeLabel: "MUNDO ABERTO",
    description: "Liberdade absoluta para explorar universos monumentais, segredos e cidades vibrantes.",
    accent: "from-amber-900/80 via-amber-950/60 to-[#101216]",
    borderAccent: "border-amber-500/30 hover:border-amber-400",
    glowColor: "rgba(245, 158, 11, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc7x7j.jpg",
    igdbThemeId: 38, // Open world
    featuredTitles: ["Red Dead Redemption 2", "Grand Theft Auto V", "The Witcher 3", "Elden Ring"],
  },
  {
    slug: "boa-trama",
    name: "Boa Trama & Narrativa",
    badgeLabel: "BOA TRAMA",
    description: "Histórias inesquecíveis, atuações marcantes e enredos que tocam o coração do jogador.",
    accent: "from-cyan-900/80 via-cyan-950/60 to-[#101216]",
    borderAccent: "border-cyan-500/30 hover:border-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6t0s.jpg",
    igdbThemeId: 31, // Drama
    featuredTitles: ["The Last of Us Part I", "God of War Ragnarök", "Detroit: Become Human", "Life is Strange"],
  },
  {
    slug: "casuais",
    name: "Casuais & Descontração",
    badgeLabel: "CASUAIS",
    description: "Jogos divertidos, acessíveis e perfeitos para relaxar sozinho ou dar risada com amigos.",
    accent: "from-emerald-900/80 via-emerald-950/60 to-[#101216]",
    borderAccent: "border-emerald-500/30 hover:border-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc884k.jpg",
    igdbThemeId: 40, // Party
    featuredTitles: ["Overcooked! All You Can Eat", "It Takes Two", "Fall Guys", "Animal Crossing"],
  },
  {
    slug: "corrida",
    name: "Corrida & Velocidade",
    badgeLabel: "CORRIDA",
    description: "Adrenalina pura no asfalto, simulações realistas e perseguições em alta rotação.",
    accent: "from-purple-900/80 via-purple-950/60 to-[#101216]",
    borderAccent: "border-purple-500/30 hover:border-purple-400",
    glowColor: "rgba(168, 85, 247, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6lq7.jpg",
    igdbGenreId: 10, // Racing
    featuredTitles: ["Forza Horizon 5", "Gran Turismo 7", "Need for Speed Unbound", "F1 24"],
  },
  {
    slug: "rpg",
    name: "RPG & Aventura Épica",
    badgeLabel: "RPG",
    description: "Evolução de personagens, tomadas de decisão profundas e jornadas místicas grandiosas.",
    accent: "from-indigo-900/80 via-indigo-950/60 to-[#101216]",
    borderAccent: "border-indigo-500/30 hover:border-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc8w2p.jpg",
    igdbGenreId: 12, // Role-playing (RPG)
    featuredTitles: ["Baldur's Gate 3", "Cyberpunk 2077", "Final Fantasy VII Rebirth", "Persona 5 Royal"],
  },
  {
    slug: "terror",
    name: "Terror & Sobrevivência",
    badgeLabel: "TERROR",
    description: "Atmosferas claustrofóbicas, sustos arrepiantes e a luta constante para permanecer vivo.",
    accent: "from-zinc-900/80 via-red-950/40 to-[#101216]",
    borderAccent: "border-red-900/40 hover:border-red-500",
    glowColor: "rgba(220, 38, 38, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc88f5.jpg",
    igdbThemeId: 19, // Horror
    featuredTitles: ["Resident Evil 4 Remake", "Silent Hill 2", "Dead Space", "Alan Wake 2"],
  },
  {
    slug: "tiro",
    name: "Tiro & Ação Tática",
    badgeLabel: "TIRO",
    description: "Precisão cirúrgica, tiroteios frenéticos e combates táticos em primeira e terceira pessoa.",
    accent: "from-orange-900/80 via-orange-950/60 to-[#101216]",
    borderAccent: "border-orange-500/30 hover:border-orange-400",
    glowColor: "rgba(249, 115, 22, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc8b3a.jpg",
    igdbGenreId: 5, // Shooter
    featuredTitles: ["DOOM Eternal", "Halo Infinite", "Call of Duty", "Titanfall 2"],
  },
  {
    slug: "indie",
    name: "Indie & Obras Criativas",
    badgeLabel: "INDIE",
    description: "Projetos autorais com arte deslumbrante, trilhas sonoras únicas e mecânicas inovadoras.",
    accent: "from-teal-900/80 via-teal-950/60 to-[#101216]",
    borderAccent: "border-teal-500/30 hover:border-teal-400",
    glowColor: "rgba(20, 184, 166, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6m0o.jpg",
    igdbGenreId: 32, // Indie
    featuredTitles: ["Hollow Knight", "Hades II", "Celeste", "Sea of Stars"],
  },
  {
    slug: "plataforma",
    name: "Plataforma & Precisão",
    badgeLabel: "PLATAFORMA",
    description: "Saltos calculados, exploração vertical e mundos cheios de carisma e desafios mecânicos.",
    accent: "from-blue-900/80 via-blue-950/60 to-[#101216]",
    borderAccent: "border-blue-500/30 hover:border-blue-400",
    glowColor: "rgba(59, 130, 246, 0.25)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc884i.jpg",
    igdbGenreId: 8, // Platform
    featuredTitles: ["Ori and the Will of the Wisps", "Super Mario Odyssey", "Rayman Legends", "Psychonauts 2"],
  },
];

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return CATEGORIES_DATA.find((c) => c.slug === slug);
}
