"use client";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Dispara evento seguro para Google Analytics e Google Ads (gtag)
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, eventParams);
    } catch (e) {
      console.warn("Falha ao registrar evento gtag:", e);
    }
  }
}

/**
 * Evento de Conversão quando o usuário clica no CTA de cadastro
 */
export function trackSignUpClick(source: string) {
  trackEvent("cta_signup_click", {
    source,
    event_category: "acquisition",
    event_label: `CTA Signup from ${source}`,
  });
}

/**
 * Evento de Conversão quando o cadastro/login é concluído com sucesso
 */
export function trackSignUpSuccess(method: "google" | "email") {
  trackEvent("sign_up", {
    method,
  });
  // Disparo direto para a Conversão de Cadastro no Google Ads
  trackEvent("conversion", {
    send_to: process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID || "AW-18443489371/oCUxCKispPUcENugxdpE",
    value: 1.0,
    currency: "BRL",
  });
}
