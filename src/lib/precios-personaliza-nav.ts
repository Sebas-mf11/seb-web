/** Ancla de la sección del cotizador en /precios */
export const PERSONALIZA_SECTION_ID = 'personaliza-tu-pagina' as const

/** Enlace con hash para SEO y navegación directa */
export const PRECIOS_PERSONALIZA_HREF = `/precios#${PERSONALIZA_SECTION_ID}` as const

const SCROLL_INTENT_KEY = 'seb-precios-scroll-personaliza'

export function scrollToPersonalizaSection(): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document
        .getElementById(PERSONALIZA_SECTION_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })
}

/** Marca que, al cargar /precios, hay que hacer scroll a Personaliza (p. ej. botón flotante). */
export function markPreciosPersonalizaScrollIntent(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SCROLL_INTENT_KEY, '1')
}

export function consumePreciosPersonalizaScrollIntent(): boolean {
  if (typeof sessionStorage === 'undefined') return false
  const v = sessionStorage.getItem(SCROLL_INTENT_KEY)
  if (v === '1') {
    sessionStorage.removeItem(SCROLL_INTENT_KEY)
    return true
  }
  return false
}

export function shouldScrollPersonalizaFromHash(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hash === `#${PERSONALIZA_SECTION_ID}`
}
