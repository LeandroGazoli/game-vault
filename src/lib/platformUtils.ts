export const CONSOLE_CATEGORIES: Record<string, string[]> = {
  "PlayStation": [
    "PlayStation 5",
    "PlayStation 4",
    "PlayStation 3",
    "PlayStation 2",
    "PlayStation (PS1)",
    "PSP",
    "PlayStation Vita",
  ],
  "Xbox": [
    "Xbox Series X/S",
    "Xbox One",
    "Xbox 360",
    "Xbox (Clássico)",
  ],
  "Nintendo": [
    "Nintendo Switch",
    "Wii U",
    "Wii",
    "GameCube",
    "Nintendo 64",
    "Super Nintendo (SNES)",
    "NES (Nintendinho)",
    "Nintendo 3DS",
    "Nintendo DS",
    "Game Boy Advance (GBA)",
    "Game Boy / Color",
  ],
  "PC & Portáteis": [
    "PC",
    "Steam Deck",
    "ROG Ally",
    "Mobile (Android/iOS)",
  ],
  "Sega & Retrô": [
    "Mega Drive / Genesis",
    "Dreamcast",
    "Sega Saturn",
    "Master System",
    "Arcade / Fliperama",
    "Emulador",
  ],
};

export const ALL_CONSOLES: string[] = Object.values(CONSOLE_CATEGORIES).flat();

// Plataformas padrão mais populares exibidas por padrão
export const POPULAR_CONSOLES = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "PlayStation 3",
  "PlayStation 2",
  "Xbox Series X/S",
  "Xbox One",
  "Xbox 360",
  "Xbox (Clássico)",
  "Nintendo Switch",
  "Nintendo 64",
  "Super Nintendo (SNES)",
  "Steam Deck",
  "Emulador",
];

/**
 * Converte nomes longos de plataformas vindos de APIs (como IGDB)
 * em abreviações limpas e amigáveis para badges e cards.
 */
export function formatPlatformShort(name: string): string {
  if (!name) return "";
  const lower = name.toLowerCase().trim();

  if (lower.includes("playstation 5") || lower === "ps5") return "PS5";
  if (lower.includes("playstation 4") || lower === "ps4") return "PS4";
  if (lower.includes("playstation 3") || lower === "ps3") return "PS3";
  if (lower.includes("playstation 2") || lower === "ps2") return "PS2";
  if (lower.includes("playstation portable") || lower === "psp") return "PSP";
  if (lower.includes("playstation vita") || lower === "ps vita") return "PS Vita";
  if (lower.includes("playstation") || lower === "ps1" || lower === "psx") return "PS1";

  if (lower.includes("xbox series")) return "Xbox Series";
  if (lower.includes("xbox one")) return "Xbox One";
  if (lower.includes("xbox 360")) return "Xbox 360";
  if (lower.includes("xbox")) return "Xbox";

  if (lower.includes("nintendo switch") || lower === "switch") return "Switch";
  if (lower.includes("nintendo 64") || lower === "n64") return "N64";
  if (lower.includes("gamecube")) return "GameCube";
  if (lower.includes("wii u")) return "Wii U";
  if (lower.includes("wii")) return "Wii";
  if (lower.includes("super nintendo") || lower.includes("snes")) return "SNES";
  if (lower.includes("nintendo entertainment system") || lower.includes("nes")) return "NES";
  if (lower.includes("game boy advance") || lower === "gba") return "GBA";
  if (lower.includes("nintendo 3ds") || lower === "3ds") return "3DS";
  if (lower.includes("nintendo ds") || lower === "ds") return "DS";

  if (lower.includes("mega drive") || lower.includes("genesis")) return "Mega Drive";
  if (lower.includes("dreamcast")) return "Dreamcast";
  if (lower.includes("steam deck")) return "Steam Deck";
  if (lower.includes("linux")) return "Linux";
  if (lower.includes("mac") || lower.includes("ios")) return "Apple";
  if (lower.includes("android")) return "Android";
  if (lower === "pc (microsoft windows)" || lower.includes("pc")) return "PC";

  return name;
}
