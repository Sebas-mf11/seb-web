import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { trackQuoteFeatureAdded } from '@/lib/analytics'
import { formatPrice } from '@/lib/utils'

export interface QuotePage {
  id: string
  name: string
  isDefault: boolean
}

export interface QuoteFeature {
  id: string
  title: string
  category: string
  description: string
  icon: string
}

export type SiteType =
  | null
  | 'corporativa'
  | 'ecommerce'
  | 'reservas'
  | 'portafolio'
  | 'landing'
  | 'blog'

export type PlanKey = 'esencial' | 'profesional' | 'avanzado'

export type QuoteFlowStep = 'configuring' | 'calculating' | 'result'

export const FEATURE_REQUIREMENTS: Record<
  string,
  {
    minPlan: PlanKey
    premiumExtra?: number
    includedInPlan?: PlanKey
  }
> = {
  responsive: { minPlan: 'esencial', includedInPlan: 'esencial' },
  identidad: { minPlan: 'esencial', includedInPlan: 'esencial' },
  animaciones: { minPlan: 'esencial', includedInPlan: 'esencial' },
  seo: { minPlan: 'esencial', includedInPlan: 'esencial' },
  dominio: { minPlan: 'esencial', includedInPlan: 'esencial' },
  formulario: { minPlan: 'esencial', includedInPlan: 'esencial' },
  whatsapp: { minPlan: 'esencial', includedInPlan: 'esencial' },
  mapa: { minPlan: 'esencial', includedInPlan: 'esencial' },
  analytics: { minPlan: 'esencial', includedInPlan: 'esencial' },
  darkmode: { minPlan: 'esencial', includedInPlan: 'esencial' },

  galeria: { minPlan: 'profesional', includedInPlan: 'profesional' },
  blog: { minPlan: 'profesional', includedInPlan: 'profesional' },
  video: { minPlan: 'profesional', includedInPlan: 'profesional' },
  menu: { minPlan: 'profesional', includedInPlan: 'profesional' },
  panel: { minPlan: 'profesional', includedInPlan: 'profesional' },

  reservas: { minPlan: 'esencial', premiumExtra: 150000, includedInPlan: 'avanzado' },
  tienda: { minPlan: 'profesional', premiumExtra: 200000, includedInPlan: 'avanzado' },
  cotizador: { minPlan: 'profesional', premiumExtra: 75000, includedInPlan: 'avanzado' },
  miembros: { minPlan: 'profesional', premiumExtra: 300000, includedInPlan: 'avanzado' },
  idiomas: { minPlan: 'esencial', premiumExtra: 150000, includedInPlan: 'avanzado' },
  chatbot: { minPlan: 'esencial', premiumExtra: 150000, includedInPlan: 'avanzado' },
  busqueda: { minPlan: 'esencial', premiumExtra: 80000, includedInPlan: 'avanzado' },
  recomendaciones: { minPlan: 'profesional', premiumExtra: 80000, includedInPlan: 'avanzado' },
  generador: { minPlan: 'profesional', premiumExtra: 170000, includedInPlan: 'avanzado' },
}

export const PLAN_PRICES = {
  esencial: 600000,
  profesional: 800000,
  avanzado: 1200000,
} as const

export const PLAN_PAGE_LIMITS: Record<PlanKey, number> = {
  esencial: 5,
  profesional: 8,
  avanzado: Number.POSITIVE_INFINITY,
}

export const EXTRA_PAGE_PRICE = 80000

export const MAINTENANCE_MONTHLY = 150000

export interface QuoteCalculation {
  plan: PlanKey
  planPrice: number
  premiumExtras: Array<{ id: string; title: string; price: number }>
  extraPages: number
  extraPagesPrice: number
  includedFeatures: QuoteFeature[]
  maintenancePrice: number
  subtotal: number
  total: number
  suggestUpgrade: boolean
  suggestionMessage: string | null
  suggestionTarget: 'profesional' | 'avanzado' | null
  /** Páginas por encima del tope del plan previo al ajuste automático por cantidad */
  pageLimitNotice: {
    excess: number
    referencedPlan: PlanKey
  } | null
}

function planRank(p: PlanKey): number {
  return p === 'esencial' ? 0 : p === 'profesional' ? 1 : 2
}

function maxPlan(a: PlanKey, b: PlanKey): PlanKey {
  return planRank(a) >= planRank(b) ? a : b
}

function nextPlan(p: PlanKey): 'profesional' | 'avanzado' | null {
  if (p === 'esencial') return 'profesional'
  if (p === 'profesional') return 'avanzado'
  return null
}

function siteTypeMinPlan(site: SiteType): PlanKey {
  if (!site) return 'esencial'
  if (site === 'ecommerce') return 'avanzado'
  if (site === 'reservas' || site === 'blog') return 'profesional'
  return 'esencial'
}

function planSatisfiesPageCount(plan: PlanKey, count: number): boolean {
  const lim = PLAN_PAGE_LIMITS[plan]
  return lim === Number.POSITIVE_INFINITY || count <= lim
}

function bumpPlanForPages(plan: PlanKey, count: number): PlanKey {
  let p = plan
  while (!planSatisfiesPageCount(p, count) && p !== 'avanzado') {
    const n = nextPlan(p)
    if (!n) break
    p = n
  }
  return p
}

function computePremiumExtras(
  features: QuoteFeature[],
  effectivePlan: PlanKey,
): Array<{ id: string; title: string; price: number }> {
  const premiumExtras: Array<{ id: string; title: string; price: number }> = []
  for (const f of features) {
    const req = FEATURE_REQUIREMENTS[f.id]
    if (!req?.premiumExtra || !req.includedInPlan) continue
    if (planRank(effectivePlan) < planRank(req.includedInPlan)) {
      premiumExtras.push({ id: f.id, title: f.title, price: req.premiumExtra })
    }
  }
  return premiumExtras
}

function subtotalBreakdownForPlan(
  plan: PlanKey,
  features: QuoteFeature[],
  pageCount: number,
) {
  const premiumExtras = computePremiumExtras(features, plan)
  const premiumSum = premiumExtras.reduce((s, e) => s + e.price, 0)
  const lim = PLAN_PAGE_LIMITS[plan]
  const extraPages =
    lim === Number.POSITIVE_INFINITY ? 0 : Math.max(0, pageCount - lim)
  const extraPagesPrice = extraPages * EXTRA_PAGE_PRICE
  const subtotal = PLAN_PRICES[plan] + premiumSum + extraPagesPrice
  return { premiumExtras, premiumSum, extraPages, extraPagesPrice, subtotal }
}

type QuoteSnapshot = {
  siteType: SiteType
  pages: QuotePage[]
  features: QuoteFeature[]
  includesMaintenance: boolean
  userPlanFloor: PlanKey | null
}

function buildCalculation(snapshot: QuoteSnapshot): QuoteCalculation {
  const { siteType, pages, features, includesMaintenance, userPlanFloor } =
    snapshot

  let planFromFeatures: PlanKey = 'esencial'
  for (const f of features) {
    const req = FEATURE_REQUIREMENTS[f.id]
    if (req) planFromFeatures = maxPlan(planFromFeatures, req.minPlan)
  }

  const planBeforePageBump = maxPlan(planFromFeatures, siteTypeMinPlan(siteType))
  const limRef = PLAN_PAGE_LIMITS[planBeforePageBump]
  const pageLimitNotice =
    limRef !== Number.POSITIVE_INFINITY && pages.length > limRef
      ? {
          excess: pages.length - limRef,
          referencedPlan: planBeforePageBump,
        }
      : null

  let computed = planBeforePageBump
  computed = bumpPlanForPages(computed, pages.length)

  const effectivePlan = userPlanFloor
    ? maxPlan(computed, userPlanFloor)
    : computed

  const premiumExtras = computePremiumExtras(features, effectivePlan)
  const premiumSum = premiumExtras.reduce((s, e) => s + e.price, 0)

  const lim = PLAN_PAGE_LIMITS[effectivePlan]
  const extraPages =
    lim === Number.POSITIVE_INFINITY ? 0 : Math.max(0, pages.length - lim)
  const extraPagesPrice = extraPages * EXTRA_PAGE_PRICE

  const planPrice = PLAN_PRICES[effectivePlan]
  const subtotal = planPrice + premiumSum + extraPagesPrice
  const maintenancePrice = includesMaintenance ? MAINTENANCE_MONTHLY : 0
  const total = subtotal + maintenancePrice

  const premiumIds = new Set(premiumExtras.map((e) => e.id))
  const includedFeatures = features.filter((f) => !premiumIds.has(f.id))

  let suggestUpgrade = false
  let suggestionMessage: string | null = null
  let suggestionTarget: 'profesional' | 'avanzado' | null = null

  const next = nextPlan(effectivePlan)
  if (next && premiumExtras.length > 0) {
    const threshold = 0.85 * PLAN_PRICES[next]
    const waiveCount = premiumExtras.filter((e) => {
      const req = FEATURE_REQUIREMENTS[e.id]
      return (
        req?.includedInPlan && planRank(next) >= planRank(req.includedInPlan)
      )
    }).length
    const majority =
      waiveCount >= Math.ceil(premiumExtras.length / 2) &&
      premiumExtras.length > 0

    if (subtotal >= threshold && majority) {
      suggestUpgrade = true
      suggestionTarget = next
      const after = subtotalBreakdownForPlan(next, features, pages.length)
      const delta = after.subtotal - subtotal
      const benefits =
        next === 'profesional'
          ? 'hasta 8 páginas y más módulos de contenido incluidos'
          : 'páginas ilimitadas y suite de módulos premium incluida'
      const label = next === 'profesional' ? 'Profesional' : 'Avanzado'
      if (delta > 0) {
        suggestionMessage = `Por $${formatPrice(Math.round(delta))} más puedes llevarte el plan ${label} con todo esto incluido y ${benefits}`
      } else {
        suggestionMessage = `El plan ${label} agrupa más módulos incluidos con un total similar o mejor y ${benefits}`
      }
    }
  }

  return {
    plan: effectivePlan,
    planPrice,
    premiumExtras,
    extraPages,
    extraPagesPrice,
    includedFeatures,
    maintenancePrice,
    subtotal,
    total,
    suggestUpgrade,
    suggestionMessage,
    suggestionTarget,
    pageLimitNotice,
  }
}

interface QuoteState {
  siteType: SiteType
  pages: QuotePage[]
  features: QuoteFeature[]
  clientInfo: {
    name: string
    email: string
    company: string
  }
  includesMaintenance: boolean
  userPlanFloor: PlanKey | null
  quoteFlowStep: QuoteFlowStep
  setSiteType: (type: SiteType) => void
  addPage: (page: QuotePage) => void
  removePage: (id: string) => void
  renamePage: (id: string, newName: string) => void
  addFeature: (feature: QuoteFeature) => void
  removeFeature: (id: string) => void
  hasFeature: (id: string) => boolean
  setClientInfo: (info: Partial<QuoteState['clientInfo']>) => void
  setIncludesMaintenance: (value: boolean) => void
  toggleMaintenance: () => void
  applySuggestedPlan: (plan: 'profesional' | 'avanzado') => void
  /** Fija el plan mínimo desde enlaces externos (p. ej. ?plan=esencial en /precios o /cotizador) */
  setUserPlanFloor: (plan: PlanKey | null) => void
  setQuoteFlowStep: (step: QuoteFlowStep) => void
  resetQuote: () => void
  getTotalItems: () => number
  calculateQuote: () => QuoteCalculation
}

const DEFAULT_PAGES: QuotePage[] = [
  { id: 'home', name: 'Inicio', isDefault: true },
  { id: 'about', name: 'Sobre nosotros', isDefault: true },
  { id: 'contact', name: 'Contacto', isDefault: true },
]

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      siteType: null,
      pages: DEFAULT_PAGES,
      features: [],
      clientInfo: { name: '', email: '', company: '' },
      includesMaintenance: false,
      userPlanFloor: null,
      quoteFlowStep: 'configuring',
      setSiteType: (type) => set({ siteType: type }),
      addPage: (page) =>
        set((state) => ({
          pages: [...state.pages, page],
        })),
      removePage: (id) =>
        set((state) => ({
          pages: state.pages.filter((p) => p.id !== id || p.isDefault),
        })),
      renamePage: (id, newName) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === id ? { ...p, name: newName } : p,
          ),
        })),
      addFeature: (feature) =>
        set((state) => {
          if (state.features.some((f) => f.id === feature.id)) return state
          if (typeof window !== 'undefined') {
            trackQuoteFeatureAdded(feature.id, feature.title)
          }
          return { features: [...state.features, feature] }
        }),
      removeFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.id !== id),
        })),
      hasFeature: (id) => get().features.some((f) => f.id === id),
      setClientInfo: (info) =>
        set((state) => ({
          clientInfo: { ...state.clientInfo, ...info },
        })),
      setIncludesMaintenance: (value) => set({ includesMaintenance: value }),
      toggleMaintenance: () =>
        set((state) => ({ includesMaintenance: !state.includesMaintenance })),
      applySuggestedPlan: (plan) => set({ userPlanFloor: plan }),
      setUserPlanFloor: (plan) => set({ userPlanFloor: plan }),
      setQuoteFlowStep: (step) => set({ quoteFlowStep: step }),
      resetQuote: () =>
        set({
          siteType: null,
          pages: DEFAULT_PAGES,
          features: [],
          clientInfo: { name: '', email: '', company: '' },
          includesMaintenance: false,
          userPlanFloor: null,
          quoteFlowStep: 'configuring',
        }),
      getTotalItems: () => {
        const state = get()
        return state.features.length + (state.siteType ? 1 : 0)
      },
      calculateQuote: () => {
        const s = get()
        return buildCalculation({
          siteType: s.siteType,
          pages: s.pages,
          features: s.features,
          includesMaintenance: s.includesMaintenance,
          userPlanFloor: s.userPlanFloor,
        })
      },
    }),
    {
      name: 'seb-quote-storage-v6',
      partialize: (state) => ({
        siteType: state.siteType,
        pages: state.pages,
        features: state.features,
        clientInfo: state.clientInfo,
        includesMaintenance: state.includesMaintenance,
        userPlanFloor: state.userPlanFloor,
        quoteFlowStep: state.quoteFlowStep,
      }),
    },
  ),
)
