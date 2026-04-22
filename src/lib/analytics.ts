/**
 * Helpers para Google Analytics 4. Los eventos no hacen nada hasta que `gtag` exista
 * (p. ej. tras cargar `GoogleAnalytics` con `NEXT_PUBLIC_GA_MEASUREMENT_ID`).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function trackGaEvent(
  action: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }
  window.gtag('event', action, params)
}

export function trackQuoteFeatureAdded(
  featureId: string,
  featureTitle?: string,
): void {
  trackGaEvent('quote_feature_add', {
    feature_id: featureId,
    ...(featureTitle ? { feature_title: featureTitle } : {}),
  })
}

export function trackQuoteResultViewed(): void {
  trackGaEvent('quote_result_view', {})
}

export function trackContactFormSubmit(): void {
  trackGaEvent('contact_form_submit', {})
}

export function trackWhatsAppClick(origin: string): void {
  trackGaEvent('whatsapp_click', { origin })
}
