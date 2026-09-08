/**
 * Camada de ícones da gamificação (client) + reexport da lógica pura de gamificationCore.
 * Componentes continuam importando tudo daqui; o servidor importa de gamificationCore.
 */
import type React from "react";
import {
  Trophy,
  Award,
  Star,
  Flame,
  Clock,
  Crown,
  Sparkles,
  Gamepad2,
  Bookmark,
  Zap,
  Shield,
  Target,
  Rocket,
  Medal,
  Heart,
  Gem,
  Swords,
  Skull,
  Ghost,
  Bomb,
  Compass,
  Map,
  Dices,
  Joystick,
  Puzzle,
  Lock,
  CheckCircle2,
} from "lucide-react";

// Reexporta a lógica pura para manter os imports existentes funcionando
export {
  getMetricValue,
  evaluateDef,
  getActiveSeasonMissions,
  getDailyMissions,
  getDateKey,
  computeLibraryStats,
} from "./gamificationCore";
export type { MetricContext, EvaluatedDef } from "./gamificationCore";

// ==========================================
// Mapa de ícones (Firestore guarda apenas o nome string do ícone lucide)
// ==========================================

export const GAMIFICATION_ICONS: Record<string, React.ElementType> = {
  Trophy,
  Award,
  Star,
  Flame,
  Clock,
  Crown,
  Sparkles,
  Gamepad2,
  Bookmark,
  Zap,
  Shield,
  Target,
  Rocket,
  Medal,
  Heart,
  Gem,
  Swords,
  Skull,
  Ghost,
  Bomb,
  Compass,
  Map,
  Dices,
  Joystick,
  Puzzle,
  CheckCircle2,
};

/** Lista de nomes de ícones disponíveis para o seletor do admin. */
export const GAMIFICATION_ICON_NAMES = Object.keys(GAMIFICATION_ICONS);

export function iconFromName(name?: string): React.ElementType {
  if (name && GAMIFICATION_ICONS[name]) return GAMIFICATION_ICONS[name];
  return Trophy;
}

export { Lock as LockIcon };
