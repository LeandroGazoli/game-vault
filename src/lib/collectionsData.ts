export interface CollectionItem {
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  accent: string;
  borderAccent: string;
  glowColor: string;
  coverImage: string;
  gameQueryType: "goty" | "ptbr" | "short" | "soulslike" | "indie" | "scifi" | "horror" | "retro";
  highlightTitles: string[];
}

export const COLLECTIONS_DATA: CollectionItem[] = [
  {
    slug: "hall-da-fama",
    title: "Hall da Fama (90+ Metacritic)",
    subtitle: "As maiores obras-primas da história dos games avaliadas com nota máxima.",
    badge: "🏆 90+ Metacritic",
    description: "Uma seleção rigorosa dos jogos que transcenderam gerações, venceram prêmios de Jogo do Ano (GOTY) e alcançaram aclamação quase unânime da crítica internacional.",
    accent: "from-amber-600/25 via-amber-950/30 to-[#101216]",
    borderAccent: "border-amber-500/30 hover:border-amber-400",
    glowColor: "rgba(245, 158, 11, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6q9k.jpg",
    gameQueryType: "goty",
    highlightTitles: ["Elden Ring", "The Witcher 3", "Baldur's Gate 3", "Red Dead Redemption 2"],
  },
  {
    slug: "dublados-ptbr",
    title: "Vozes do Brasil (100% Dublados)",
    subtitle: "Grandes produções internacionais que receberam atuações de voz brasileiras históricas.",
    badge: "🇧🇷 Dublagem Oficial",
    description: "Jogos que contam com localização impecável, vozes lendárias da dublagem brasileira e diálogos que tornam cada cena ainda mais emocionante em nosso idioma.",
    accent: "from-emerald-600/25 via-emerald-950/30 to-[#101216]",
    borderAccent: "border-emerald-500/30 hover:border-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6t0s.jpg",
    gameQueryType: "ptbr",
    highlightTitles: ["The Last of Us Part I", "God of War Ragnarök", "Cyberpunk 2077", "Spider-Man 2"],
  },
  {
    slug: "fim-de-semana",
    title: "Zere no Fim de Semana (Até 10 Horas)",
    subtitle: "Campanhas curtas, diretas ao ponto e inesquecíveis para você zerar sem enrolação.",
    badge: "⏱️ Zeramento Rápido",
    description: "Para quem tem rotina corrida mas não abre mão da sensação de zerar um jogo memorável. Títulos com duração estimada de até 10 horas repletos de brilhantismo narrativo.",
    accent: "from-cyan-600/25 via-cyan-950/30 to-[#101216]",
    borderAccent: "border-cyan-500/30 hover:border-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6m0o.jpg",
    gameQueryType: "short",
    highlightTitles: ["Inside", "Stray", "Journey", "Gris", "Cocoon"],
  },
  {
    slug: "soulslike",
    title: "Desafio Soulslike & Mestria",
    subtitle: "Combate de precisão milimétrica, chefes colossais e a suprema sensação de superação.",
    badge: "🗡️ Alta Dificuldade",
    description: "Universos sombrios onde cada esquina esconde perigo e cada vitória sobre um boss é uma conquista conquistada com disciplina, paciência e maestria mecânica.",
    accent: "from-purple-600/25 via-purple-950/30 to-[#101216]",
    borderAccent: "border-purple-500/30 hover:border-purple-400",
    glowColor: "rgba(168, 85, 247, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc8w2q.jpg",
    gameQueryType: "soulslike",
    highlightTitles: ["Dark Souls III", "Bloodborne", "Sekiro", "Lies of P", "Elden Ring"],
  },
  {
    slug: "joias-indie",
    title: "Joias Indie Aclamadas",
    subtitle: "Criatividade pura e mecânicas revolucionárias fora do grande circuito mainstream.",
    badge: "💎 Criatividade Pura",
    description: "O coração pulsante da indústria dos videogames. Histórias comoventes, pixel art deslumbrante e trilhas sonoras autorais premiadas no mundo todo.",
    accent: "from-teal-600/25 via-teal-950/30 to-[#101216]",
    borderAccent: "border-teal-500/30 hover:border-teal-400",
    glowColor: "rgba(20, 184, 166, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6p2m.jpg",
    gameQueryType: "indie",
    highlightTitles: ["Hades", "Hollow Knight", "Celeste", "Sea of Stars", "Dead Cells"],
  },
  {
    slug: "sci-fi",
    title: "Ficção Científica & Futuro",
    subtitle: "Distopias cyberpunk, inteligências artificiais e exploração espacial imersiva.",
    badge: "🌌 Sci-Fi Épico",
    description: "Jornadas que questionam a essência da humanidade entre megacorporações tecnológicas, galáxias distantes e futuros alternativos fascinantes.",
    accent: "from-blue-600/25 via-blue-950/30 to-[#101216]",
    borderAccent: "border-blue-500/30 hover:border-blue-400",
    glowColor: "rgba(59, 130, 246, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc6q9n.jpg",
    gameQueryType: "scifi",
    highlightTitles: ["Cyberpunk 2077", "Mass Effect Legendary Edition", "Dead Space", "Deus Ex"],
  },
  {
    slug: "terror-sobrevivencia",
    title: "Terror Noturno & Sobrevivência",
    subtitle: "Luzes apagadas, fones no máximo e recursos escassos para escapar do horror.",
    badge: "🧟 Pavor Imersivo",
    description: "Tensão psicológica no limite, monstros aterrorizantes e atmosferas macabras desenhadas para testar a coragem dos jogadores mais destemidos.",
    accent: "from-red-950/50 via-zinc-950/60 to-[#101216]",
    borderAccent: "border-red-800/40 hover:border-red-500",
    glowColor: "rgba(239, 68, 68, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc88f5.jpg",
    gameQueryType: "horror",
    highlightTitles: ["Resident Evil 4", "Silent Hill 2", "Alan Wake 2", "Alien: Isolation"],
  },
  {
    slug: "retro-legends",
    title: "Lendas Retrô & Clássicos",
    subtitle: "Obras imortais dos 16 e 32 bits que moldaram a linguagem dos games.",
    badge: "🕹️ Clássicos Imortais",
    description: "Nostalgia pura e game design impecável que resistiu ao teste do tempo. Os jogos pioneiros que colocaram os videogames no patamar de arte mundial.",
    accent: "from-indigo-600/25 via-indigo-950/30 to-[#101216]",
    borderAccent: "border-indigo-500/30 hover:border-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.2)",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/sc884i.jpg",
    gameQueryType: "retro",
    highlightTitles: ["Chrono Trigger", "Castlevania: SOTN", "Super Mario World", "Zelda: Ocarina of Time"],
  },
];

export function getCollectionBySlug(slug: string): CollectionItem | undefined {
  return COLLECTIONS_DATA.find((c) => c.slug === slug);
}
