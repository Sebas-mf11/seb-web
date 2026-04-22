/**
 * Configura NEXT_PUBLIC_BOOKING_URL y NEXT_PUBLIC_WHATSAPP_PHONE (solo dígitos, ej. 573113891980)
 */

/** Correo público de contacto (formulario, mailto, pie de página). */
export const SEB_CONTACT_EMAIL = 'sebas_980907@hotmail.com'

export const SEB_BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://cal.com'

/** Colombia +57 311 389 1980 si no hay variable de entorno */
export const SEB_WHATSAPP_DIGITS_DEFAULT = '573113891980'

export function getSebWhatsAppDigits(): string {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE ?? SEB_WHATSAPP_DIGITS_DEFAULT
  const digits = raw.replace(/\D/g, '')
  return digits || SEB_WHATSAPP_DIGITS_DEFAULT.replace(/\D/g, '')
}

export function buildSebWhatsAppUrl(message: string): string {
  const digits = getSebWhatsAppDigits()
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function getWhatsAppQuoteUrl(): string {
  return buildSebWhatsAppUrl(
    'Hola, acabo de armar una cotización en tu sitio y me gustaría conversar contigo sobre el proyecto',
  )
}
