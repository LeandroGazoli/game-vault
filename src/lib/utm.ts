/**
 * Utilitário de Rastreamento de Origem & Atribuição de Tráfego (UTMs).
 * 
 * Implementa modelo "first-touch" (primeiro contato) com persistência em localStorage.
 * Garante que se o usuário vier de um anúncio (ex: Google Ads, Meta Ads, TikTok) e navegar
 * por diversas páginas antes de criar a conta, os parâmetros originais de conversão continuam vinculados.
 */

import { UserAcquisition } from "@/lib/types";

export const UTM_STORAGE_KEY = "gv_user_acquisition_v1";

/**
 * Normaliza parâmetros conhecidos de anúncios e UTMs da URL atual.
 */
export function extractAcquisitionFromUrl(): UserAcquisition | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");
    const utmContent = urlParams.get("utm_content");
    const utmTerm = urlParams.get("utm_term");
    const gclid = urlParams.get("gclid"); // Google Click ID
    const fbclid = urlParams.get("fbclid"); // Facebook Click ID
    const ttclid = urlParams.get("ttclid"); // TikTok Click ID

    // Se possui parâmetros explícitos de rastreamento
    if (utmSource || utmCampaign || gclid || fbclid || ttclid) {
      const source = utmSource || (gclid ? "google" : fbclid ? "facebook" : ttclid ? "tiktok" : "unknown");
      const medium = utmMedium || (gclid ? "cpc" : fbclid ? "paid_social" : ttclid ? "paid_social" : "unknown");

      return {
        source: source.toLowerCase().trim(),
        medium: medium.toLowerCase().trim(),
        campaign: utmCampaign ? utmCampaign.trim() : gclid ? "google_ads" : fbclid ? "meta_ads" : undefined,
        content: utmContent?.trim() || undefined,
        term: utmTerm?.trim() || undefined,
        referrer: document.referrer ? sanitizeUrl(document.referrer) : undefined,
        landingPage: `${window.location.pathname}${window.location.search || ""}`,
        capturedAt: new Date().toISOString(),
      };
    }

    // Se veio de um referrer externo conhecido (busca orgânica ou redes sociais sem UTM)
    if (document.referrer && !document.referrer.includes(window.location.hostname)) {
      const refUrl = new URL(document.referrer);
      const host = refUrl.hostname.toLowerCase();

      let source = "referral";
      let medium = "referral";

      if (host.includes("google.")) {
        source = "google";
        medium = "organic";
      } else if (host.includes("bing.")) {
        source = "bing";
        medium = "organic";
      } else if (host.includes("instagram.com") || host.includes("l.instagram.com")) {
        source = "instagram";
        medium = "social";
      } else if (host.includes("facebook.com") || host.includes("l.facebook.com")) {
        source = "facebook";
        medium = "social";
      } else if (host.includes("twitter.com") || host.includes("x.com") || host.includes("t.co")) {
        source = "twitter";
        medium = "social";
      } else if (host.includes("tiktok.com")) {
        source = "tiktok";
        medium = "social";
      } else if (host.includes("youtube.com")) {
        source = "youtube";
        medium = "social";
      } else if (host.includes("reddit.com")) {
        source = "reddit";
        medium = "social";
      } else {
        source = host.replace(/^www\./, "");
      }

      return {
        source,
        medium,
        referrer: sanitizeUrl(document.referrer),
        landingPage: `${window.location.pathname}${window.location.search || ""}`,
        capturedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[UTM] Erro ao extrair acquisition da URL:", err);
  }

  return null;
}

/**
 * Salva a atribuição em localStorage (First-Touch: só salva se ainda não houver atribuição registrada).
 */
export function captureAndStoreAcquisition(): void {
  if (typeof window === "undefined") return;

  try {
    const existing = localStorage.getItem(UTM_STORAGE_KEY);
    const incoming = extractAcquisitionFromUrl();

    // Se já tem UTMs registradas e a nova navegação não tem UTMs explícitas, preserva o first-touch
    if (existing && !incoming) return;

    // Se veio uma campanha explícita (ex: anúncio com gclid/utm), podemos atualizar
    if (incoming) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(incoming));
    }
  } catch {
    // localStorage desabilitado ou cota excedida
  }
}

/**
 * Recupera os dados salvos de aquisição do usuário ou default orgânico/direto.
 */
export function getStoredAcquisition(): UserAcquisition {
  if (typeof window === "undefined") {
    return { source: "direct", medium: "none", capturedAt: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(UTM_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserAcquisition;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    }
  } catch {
    // Falha silenciosa
  }

  // Fallback orgânico/direto caso não tenha nenhum dado gravado
  return {
    source: "direct",
    medium: "none",
    landingPage: window.location?.pathname || "/",
    capturedAt: new Date().toISOString(),
  };
}

/**
 * Remove parâmetros sensíveis de URL de referrer
 */
function sanitizeUrl(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    return `${u.origin}${u.pathname}`;
  } catch {
    return urlStr.substring(0, 150);
  }
}
