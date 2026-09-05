/**
 * Utilitários e helpers visuais inspirados no ecossistema da Steam
 * Cores de Nível por Dezena, Insígnias e Conquistas Raras
 */

export interface SteamLevelTier {
  tierName: string;
  borderColor: string;
  textColor: string;
  bgColor: string;
  glowColor: string;
  badgeClass: string;
  ringBorderClass: string;
}

/**
 * Retorna as cores oficiais do círculo de Nível da Steam com base na dezena do nível:
 * 1-9: Cinza metálico
 * 10-19: Vermelho escarlate
 * 20-29: Amarelo / Dourado
 * 30-39: Verde floresta
 * 40-49: Azul Steam
 * 50-59: Roxo ametista
 * 60-69: Rosa magenta
 * 70-79: Ciano turquesa
 * 80-89: Laranja fogo
 * 90+: Dourado Foil Reluzente
 */
export function getSteamLevelTier(level: number): SteamLevelTier {
  const safeLevel = Math.max(1, level);

  if (safeLevel < 10) {
    return {
      tierName: "Cinza Metálico",
      borderColor: "#8a9eaf",
      textColor: "text-[#8a9eaf]",
      bgColor: "bg-[#8a9eaf]/10",
      glowColor: "rgba(138, 158, 175, 0.25)",
      badgeClass: "border-[#8a9eaf] text-[#8a9eaf]",
      ringBorderClass: "border-[#8a9eaf]/70 shadow-[0_0_10px_rgba(138,158,175,0.3)]",
    };
  }

  if (safeLevel < 20) {
    return {
      tierName: "Vermelho Escarlate",
      borderColor: "#d9534f",
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
      glowColor: "rgba(217, 83, 79, 0.35)",
      badgeClass: "border-red-500 text-red-400",
      ringBorderClass: "border-red-500 shadow-[0_0_12px_rgba(217,83,79,0.45)]",
    };
  }

  if (safeLevel < 30) {
    return {
      tierName: "Amarelo / Dourado",
      borderColor: "#e5c158",
      textColor: "text-amber-400",
      bgColor: "bg-amber-500/10",
      glowColor: "rgba(229, 193, 88, 0.35)",
      badgeClass: "border-amber-400 text-amber-300",
      ringBorderClass: "border-amber-400 shadow-[0_0_14px_rgba(229,193,88,0.5)]",
    };
  }

  if (safeLevel < 40) {
    return {
      tierName: "Verde Floresta",
      borderColor: "#5cb85c",
      textColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      glowColor: "rgba(92, 184, 92, 0.35)",
      badgeClass: "border-emerald-500 text-emerald-300",
      ringBorderClass: "border-emerald-500 shadow-[0_0_12px_rgba(92,184,92,0.45)]",
    };
  }

  if (safeLevel < 50) {
    return {
      tierName: "Azul Safira",
      borderColor: "#428bca",
      textColor: "text-[#66c0f4]",
      bgColor: "bg-blue-500/10",
      glowColor: "rgba(66, 139, 202, 0.35)",
      badgeClass: "border-[#428bca] text-[#66c0f4]",
      ringBorderClass: "border-[#428bca] shadow-[0_0_14px_rgba(102,192,244,0.45)]",
    };
  }

  if (safeLevel < 60) {
    return {
      tierName: "Roxo Ametista",
      borderColor: "#9b59b6",
      textColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
      glowColor: "rgba(155, 89, 182, 0.35)",
      badgeClass: "border-purple-500 text-purple-300",
      ringBorderClass: "border-purple-500 shadow-[0_0_14px_rgba(155,89,182,0.45)]",
    };
  }

  if (safeLevel < 70) {
    return {
      tierName: "Rosa Magenta",
      borderColor: "#ff69b4",
      textColor: "text-pink-400",
      bgColor: "bg-pink-500/10",
      glowColor: "rgba(255, 105, 180, 0.35)",
      badgeClass: "border-pink-500 text-pink-300",
      ringBorderClass: "border-pink-500 shadow-[0_0_14px_rgba(255,105,180,0.45)]",
    };
  }

  if (safeLevel < 80) {
    return {
      tierName: "Ciano Turquesa",
      borderColor: "#00ced1",
      textColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      glowColor: "rgba(0, 206, 209, 0.35)",
      badgeClass: "border-cyan-400 text-cyan-300",
      ringBorderClass: "border-cyan-400 shadow-[0_0_14px_rgba(0,206,209,0.45)]",
    };
  }

  if (safeLevel < 90) {
    return {
      tierName: "Laranja Fogo",
      borderColor: "#e67e22",
      textColor: "text-orange-400",
      bgColor: "bg-orange-500/10",
      glowColor: "rgba(230, 126, 34, 0.35)",
      badgeClass: "border-orange-500 text-orange-300",
      ringBorderClass: "border-orange-500 shadow-[0_0_14px_rgba(230,126,34,0.45)]",
    };
  }

  return {
    tierName: "Dourado Foil Supremo",
    borderColor: "#ffd700",
    textColor: "text-yellow-300",
    bgColor: "bg-yellow-500/20",
    glowColor: "rgba(255, 215, 0, 0.5)",
    badgeClass: "border-yellow-400 text-yellow-300",
    ringBorderClass: "border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.65)]",
  };
}

export interface SteamAchievementRarity {
  isRare: boolean;
  label: string;
  badgeColor: string;
  borderClass: string;
  glowClass: string;
}

/**
 * Retorna as informações de raridade e estilização de conquista no padrão Steam.
 * Conquistas com taxa <= 10% recebem o tratamento dourado brilhante de Conquista Rara.
 */
export function getSteamAchievementRarity(globalPercentage: number): SteamAchievementRarity {
  if (globalPercentage <= 10) {
    return {
      isRare: true,
      label: "Conquista Rara",
      badgeColor: "#e5c158",
      borderClass: "border-[#e5c158] ring-1 ring-[#e5c158]/50",
      glowClass: "shadow-[0_0_12px_rgba(229,193,88,0.4)]",
    };
  }
  if (globalPercentage <= 25) {
    return {
      isRare: false,
      label: "Incomum",
      badgeColor: "#66c0f4",
      borderClass: "border-[#2a475e] hover:border-[#66c0f4]/60",
      glowClass: "",
    };
  }
  return {
    isRare: false,
    label: "Comum",
    badgeColor: "#8a9eaf",
    borderClass: "border-[#2a475e]/80 hover:border-[#2a475e]",
    glowClass: "",
  };
}

