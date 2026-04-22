import type { QuoteCalculation, QuotePage, SiteType } from '@/lib/stores/quoteStore'
import { formatPrice } from '@/lib/utils'

const SITE_LABELS: Record<Exclude<SiteType, null>, string> = {
  corporativa: 'Corporativa',
  ecommerce: 'E-commerce',
  reservas: 'Reservas',
  portafolio: 'Portafolio',
  landing: 'Landing',
  blog: 'Blog',
}

const MAX_FEATURE_NAMES = 15
const MAX_PAGE_NAMES = 12

function featureListText(quote: QuoteCalculation): string {
  const titles = [
    ...quote.includedFeatures.map((f) => f.title),
    ...quote.premiumExtras.map((e) => e.title),
  ]
  if (titles.length === 0) {
    return 'sin módulos extra del laboratorio'
  }
  if (titles.length <= MAX_FEATURE_NAMES) {
    return titles.join(', ')
  }
  const head = titles.slice(0, MAX_FEATURE_NAMES).join(', ')
  return `${head} y ${titles.length - MAX_FEATURE_NAMES} más`
}

function pagesSummaryText(pages: QuotePage[]): string {
  const names = pages.map((p) => p.name)
  if (names.length <= MAX_PAGE_NAMES) {
    return names.join(', ')
  }
  return `${names.slice(0, MAX_PAGE_NAMES).join(', ')}… (+${names.length - MAX_PAGE_NAMES})`
}

/** Mensaje para WhatsApp con el resumen de lo configurado en el cotizador. */
export function buildQuoteSummaryWhatsAppMessage(params: {
  siteType: SiteType
  pages: QuotePage[]
  quote: QuoteCalculation
  includesMaintenance: boolean
}): string {
  const { siteType, pages, quote, includesMaintenance } = params

  const siteLabel =
    siteType != null ? (SITE_LABELS[siteType] ?? 'Web a medida') : 'Web a medida'

  const featuresPart = featureListText(quote)
  const pagesPart = pagesSummaryText(pages)
  const planTitle =
    quote.plan.charAt(0).toUpperCase() + quote.plan.slice(1)
  const totalStr = formatPrice(quote.total)

  let msg =
    `¡Hola! Estoy interesado en una página tipo ${siteLabel} con las siguientes funcionalidades: ${featuresPart}.`

  msg += `\n\nPáginas (${pages.length}): ${pagesPart}.`
  msg += `\nPlan: ${planTitle}. Total estimado: $${totalStr}.`

  if (includesMaintenance) {
    msg += `\nQuiero incluir mantenimiento mensual.`
  }

  msg += `\n\nLo armé en el cotizador de SEB (sebweb.co).`

  return msg
}
