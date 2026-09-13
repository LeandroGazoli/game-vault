export interface BackgroundConfig {
  type: "preset" | "custom_image" | "solid_color" | "animated";
  value: string; // URL da imagem, código Hex da cor ou ID do preset/animação
  animationId?: "parallax" | "sprites" | "dust" | "minimal";
  opacity?: number; // Opacidade da imagem sobre o fundo escuro (0.1 a 1.0)
}

export interface PresetBackground {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  category: "cidade" | "cyberpunk" | "gameplay" | "fotografia";
}

export const PRESET_BACKGROUNDS: PresetBackground[] = [
  {
    id: "city",
    name: "Pixel City Horizon",
    url: "/assets/bg/city.png",
    thumbnail: "/assets/bg/city.png",
    category: "cidade",
  },
  {
    id: "cyberpunk-street",
    name: "Cyberpunk Street 8-Bit",
    url: "/assets/bg/cyberpunk-street.png",
    thumbnail: "/assets/bg/cyberpunk-street.png",
    category: "cyberpunk",
  },
  {
    id: "preview-arcade",
    name: "Retro Game Panorama",
    url: "/assets/bg/preview.png",
    thumbnail: "/assets/bg/preview.png",
    category: "gameplay",
  },
  {
    id: "neon-gamer-room",
    name: "Dark Neon Atmosphere",
    url: "/assets/bg/sandro-katalina-k1bO_VTiZSs-unsplash.jpg",
    thumbnail: "/assets/bg/sandro-katalina-k1bO_VTiZSs-unsplash.jpg",
    category: "fotografia",
  },
];

export const SOLID_COLOR_PRESETS: { id: string; name: string; hex: string }[] = [
  { id: "obsidian", name: "Obsidiana Padrão", hex: "#0e0f12" },
  { id: "midnight", name: "Azul Meia-Noite", hex: "#0b0f19" },
  { id: "deep-purple", name: "Roxo Abissal", hex: "#120d1c" },
  { id: "emerald-dark", name: "Esmeralda Noturno", hex: "#091410" },
  { id: "crimson-noir", name: "Rubi Sombrio", hex: "#160b0d" },
  { id: "pure-black", name: "Preto OLED Absoluto", hex: "#000000" },
];

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: "preset",
  value: "/assets/bg/city.png",
  opacity: 0.35,
};
