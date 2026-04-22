'use client'

import { useEffect } from 'react'

import {
  consumePreciosPersonalizaScrollIntent,
  scrollToPersonalizaSection,
  shouldScrollPersonalizaFromHash,
} from '@/lib/precios-personaliza-nav'

/** En /precios: si llegas con #personaliza-tu-pagina o desde el botón flotante, baja al cotizador. */
export default function ScrollToPersonalizaOnLoad() {
  useEffect(() => {
    const needsScroll =
      consumePreciosPersonalizaScrollIntent() || shouldScrollPersonalizaFromHash()
    if (!needsScroll) return

    const run = () => scrollToPersonalizaSection()
    requestAnimationFrame(() => requestAnimationFrame(run))
    const t = window.setTimeout(run, 150)
    return () => window.clearTimeout(t)
  }, [])

  return null
}
