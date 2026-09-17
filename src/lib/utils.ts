import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Junta classes Tailwind resolvendo conflitos — `cn("p-2", "p-4")` vira `p-4`.
 * É o helper que todo componente shadcn espera encontrar.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
