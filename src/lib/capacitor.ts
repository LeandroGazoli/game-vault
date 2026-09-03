import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/**
 * Retorna se o app está rodando dentro do WebView nativo do Capacitor (iOS ou Android)
 */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.isNativePlatform();
}

/**
 * Retorna a plataforma atual ('ios', 'android' ou 'web')
 */
export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const platform = Capacitor.getPlatform();
  if (platform === "ios" || platform === "android") return platform;
  return "web";
}

/**
 * Dispara feedback tátil (vibração háptica) seguro em dispositivos móveis.
 * No ambiente Web tradicional no navegador, a chamada não causa erro.
 */
export async function triggerHaptic(
  style: "light" | "medium" | "heavy" = "light"
): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    const impactMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: impactMap[style] });
  } catch {
    // Silencia em plataformas sem suporte
  }
}

/**
 * Feedback tátil sutil para toques em abas, botões de navegação e seleções rápidas.
 */
export async function triggerSelectionHaptic(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Haptics.selectionStart();
    await Haptics.selectionEnd();
  } catch {
    // Silencia em plataformas sem suporte
  }
}

/**
 * Feedback de celebração/sucesso (ex: zerar jogo, salvar avaliação com nota 10, conquista).
 */
export async function triggerSuccessHaptic(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch {
    // Silencia em plataformas sem suporte
  }
}

/**
 * Feedback de aviso/alerta.
 */
export async function triggerWarningHaptic(): Promise<void> {
  if (!isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch {
    // Silencia em plataformas sem suporte
  }
}
