export interface FilterOption {
  id: string;
  name: string;
  shortName?: string;
  igdbId?: number;
  igdbIds?: number[];
  igdbThemeId?: number;
}

export interface PlatformFamily {
  family: string;
  platforms: FilterOption[];
}

export const GENRE_FILTER_OPTIONS: FilterOption[] = [
  { id: "all", name: "Todos os Gêneros" },
  { id: "action", name: "Ação & Combate", shortName: "Ação", igdbIds: [4, 25, 31] },
  { id: "rpg", name: "RPG", shortName: "RPG", igdbId: 12 },
  { id: "adventure", name: "Aventura", shortName: "Aventura", igdbId: 31 },
  { id: "shooter", name: "Tiro (FPS/TPS)", shortName: "Tiro", igdbId: 5 },
  { id: "horror", name: "Terror / Horror", shortName: "Terror", igdbThemeId: 19 },
  { id: "open-world", name: "Mundo Aberto", shortName: "Mundo Aberto", igdbThemeId: 38 },
  { id: "platform", name: "Plataforma", shortName: "Plataforma", igdbId: 8 },
  { id: "strategy", name: "Estratégia", shortName: "Estratégia", igdbIds: [15, 11, 16] },
  { id: "racing", name: "Corrida", shortName: "Corrida", igdbId: 10 },
  { id: "fighting", name: "Luta", shortName: "Luta", igdbId: 4 },
  { id: "indie", name: "Indie", shortName: "Indie", igdbId: 32 },
  { id: "puzzle", name: "Puzzle", shortName: "Puzzle", igdbId: 9 },
  { id: "sports", name: "Esportes", shortName: "Esportes", igdbId: 14 },
];

export const PLATFORM_FAMILIES: PlatformFamily[] = [
  {
    family: "PlayStation",
    platforms: [
      { id: "all-playstation", name: "Todas as PlayStation", shortName: "PlayStation (Todas)", igdbIds: [167, 48, 9, 8, 7, 38, 46] },
      { id: "ps5", name: "PlayStation 5", shortName: "PS5", igdbId: 167 },
      { id: "ps4", name: "PlayStation 4", shortName: "PS4", igdbId: 48 },
      { id: "ps3", name: "PlayStation 3", shortName: "PS3", igdbId: 9 },
      { id: "ps2", name: "PlayStation 2", shortName: "PS2", igdbId: 8 },
      { id: "ps1", name: "PlayStation 1 (PS1)", shortName: "PS1", igdbId: 7 },
      { id: "psp", name: "PSP", shortName: "PSP", igdbId: 38 },
      { id: "psvita", name: "PlayStation Vita", shortName: "PS Vita", igdbId: 46 },
    ],
  },
  {
    family: "Xbox",
    platforms: [
      { id: "all-xbox", name: "Todas as Xbox", shortName: "Xbox (Todas)", igdbIds: [169, 49, 12, 11] },
      { id: "xbox-series", name: "Xbox Series X|S", shortName: "Series X|S", igdbId: 169 },
      { id: "xbox-one", name: "Xbox One", shortName: "Xbox One", igdbId: 49 },
      { id: "xbox-360", name: "Xbox 360", shortName: "Xbox 360", igdbId: 12 },
      { id: "xbox-classic", name: "Xbox Clássico", shortName: "Xbox Clássico", igdbId: 11 },
    ],
  },
  {
    family: "Nintendo",
    platforms: [
      { id: "all-nintendo", name: "Todas as Nintendo", shortName: "Nintendo (Todas)", igdbIds: [130, 4, 21, 19, 18, 41, 5, 37, 20, 24, 22, 33] },
      { id: "switch", name: "Nintendo Switch", shortName: "Switch", igdbId: 130 },
      { id: "n64", name: "Nintendo 64", shortName: "N64", igdbId: 4 },
      { id: "gamecube", name: "GameCube", shortName: "GameCube", igdbId: 21 },
      { id: "snes", name: "Super Nintendo (SNES)", shortName: "SNES", igdbId: 19 },
      { id: "nes", name: "NES (Nintendinho)", shortName: "NES", igdbId: 18 },
      { id: "wii", name: "Nintendo Wii", shortName: "Wii", igdbId: 5 },
      { id: "gba", name: "Game Boy Advance", shortName: "GBA", igdbId: 24 },
      { id: "3ds", name: "Nintendo 3DS / DS", shortName: "3DS / DS", igdbIds: [37, 20] },
    ],
  },
  {
    family: "PC & Retrô",
    platforms: [
      { id: "pc", name: "PC (Windows)", shortName: "PC", igdbId: 6 },
      { id: "dreamcast", name: "Dreamcast", shortName: "Dreamcast", igdbId: 23 },
      { id: "mega-drive", name: "Mega Drive / Genesis", shortName: "Mega Drive", igdbId: 29 },
      { id: "saturn", name: "Sega Saturn", shortName: "Saturn", igdbId: 32 },
    ],
  },
];

// Lista linear de todas as plataformas para busca rápida
export const ALL_FILTER_PLATFORMS: FilterOption[] = PLATFORM_FAMILIES.flatMap((f) => f.platforms);

// Atalhos mais populares para exibição direta em pills
export const QUICK_POPULAR_PLATFORMS: FilterOption[] = [
  { id: "all", name: "Todas as Plataformas", shortName: "Todas" },
  { id: "pc", name: "PC", shortName: "PC", igdbId: 6 },
  { id: "ps5", name: "PS5", shortName: "PS5", igdbId: 167 },
  { id: "ps4", name: "PS4", shortName: "PS4", igdbId: 48 },
  { id: "ps2", name: "PS2", shortName: "PS2", igdbId: 8 },
  { id: "ps1", name: "PS1", shortName: "PS1", igdbId: 7 },
  { id: "xbox-series", name: "Xbox Series", shortName: "Xbox Series", igdbId: 169 },
  { id: "xbox-360", name: "Xbox 360", shortName: "Xbox 360", igdbId: 12 },
  { id: "switch", name: "Nintendo Switch", shortName: "Switch", igdbId: 130 },
  { id: "snes", name: "Super Nintendo", shortName: "SNES", igdbId: 19 },
  { id: "n64", name: "Nintendo 64", shortName: "N64", igdbId: 4 },
];

export const RATING_FILTER_OPTIONS = [
  { label: "Todas as Notas", value: 0 },
  { label: "90+ (Obra-Prima)", value: 90 },
  { label: "85+ (Excelente)", value: 85 },
  { label: "75+ (Bom)", value: 75 },
];

export const SORT_FILTER_OPTIONS = [
  { id: "popular", label: "Mais Populares" },
  { id: "top_rated", label: "Melhores Notas" },
  { id: "recent", label: "Mais Recentes" },
  { id: "upcoming", label: "Próximos Lançamentos" },
  { id: "name_asc", label: "Ordem Alfabética (A-Z)" },
];

export const DISCOVERY_PRESETS = [
  { id: "popular", label: "Em Alta", icon: "🔥", sort: "popular", minRating: 0 },
  { id: "top_rated", label: "Obras-Primas (90+)", icon: "⭐", sort: "top_rated", minRating: 90 },
  { id: "recent", label: "Lançamentos Recentes", icon: "🆕", sort: "recent", minRating: 0 },
  { id: "upcoming", label: "Em Breve", icon: "⏳", sort: "upcoming", minRating: 0 },
  { id: "retro", label: "Clássicos Retrô", icon: "🕹️", sort: "top_rated", platform: "all-playstation", minRating: 80 },
];

export function findPlatformFilter(idOrSlug: string): FilterOption | undefined {
  if (!idOrSlug || idOrSlug === "all" || idOrSlug === "Todas") return undefined;
  const lower = idOrSlug.toLowerCase().trim();

  // Procura por ID exato
  const foundById = ALL_FILTER_PLATFORMS.find((p) => p.id.toLowerCase() === lower);
  if (foundById) return foundById;

  // Procura por nome ou shortName
  const foundByName = ALL_FILTER_PLATFORMS.find(
    (p) => p.name.toLowerCase() === lower || p.shortName?.toLowerCase() === lower
  );
  if (foundByName) return foundByName;

  // Casos especiais comuns de digitação
  if (lower === "playstation" || lower === "ps1") return ALL_FILTER_PLATFORMS.find((p) => p.id === "ps1");
  if (lower === "playstation 2") return ALL_FILTER_PLATFORMS.find((p) => p.id === "ps2");
  if (lower === "playstation 3") return ALL_FILTER_PLATFORMS.find((p) => p.id === "ps3");
  if (lower === "playstation 4") return ALL_FILTER_PLATFORMS.find((p) => p.id === "ps4");
  if (lower === "playstation 5") return ALL_FILTER_PLATFORMS.find((p) => p.id === "ps5");
  if (lower === "xbox") return ALL_FILTER_PLATFORMS.find((p) => p.id === "xbox-classic");
  if (lower === "nintendo switch") return ALL_FILTER_PLATFORMS.find((p) => p.id === "switch");
  if (lower === "super nintendo") return ALL_FILTER_PLATFORMS.find((p) => p.id === "snes");
  if (lower === "nintendo 64") return ALL_FILTER_PLATFORMS.find((p) => p.id === "n64");

  return undefined;
}

export function findGenreFilter(idOrSlug: string): FilterOption | undefined {
  if (!idOrSlug || idOrSlug === "all" || idOrSlug === "Todos") return undefined;
  const lower = idOrSlug.toLowerCase().trim();

  const found = GENRE_FILTER_OPTIONS.find(
    (g) =>
      g.id.toLowerCase() === lower ||
      g.name.toLowerCase() === lower ||
      g.shortName?.toLowerCase() === lower ||
      lower.includes(g.id.toLowerCase())
  );
  if (found) return found;

  // Mapeamentos comuns em inglês
  if (lower.includes("rpg") || lower.includes("role-playing")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "rpg");
  if (lower.includes("action")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "action");
  if (lower.includes("adventure")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "adventure");
  if (lower.includes("shooter") || lower.includes("fps")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "shooter");
  if (lower.includes("horror") || lower.includes("terror")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "horror");
  if (lower.includes("strategy") || lower.includes("estrategia")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "strategy");
  if (lower.includes("puzzle")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "puzzle");
  if (lower.includes("platform") || lower.includes("plataforma")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "platform");
  if (lower.includes("indie")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "indie");
  if (lower.includes("racing") || lower.includes("corrida")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "racing");
  if (lower.includes("fighting") || lower.includes("luta")) return GENRE_FILTER_OPTIONS.find((g) => g.id === "fighting");

  return undefined;
}
