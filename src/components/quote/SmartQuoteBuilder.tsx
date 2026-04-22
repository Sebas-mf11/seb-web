'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Plus,
  Sparkles,
  X,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { Switch } from '@/components/ui/switch'
import { trackWhatsAppClick } from '@/lib/analytics'
import { getPageIcon } from '@/lib/quote-page-icons'
import type { SiteType } from '@/lib/stores/quoteStore'
import {
  EXTRA_PAGE_PRICE,
  MAINTENANCE_MONTHLY,
  useQuoteStore,
} from '@/lib/stores/quoteStore'
import { buildSebWhatsAppUrl } from '@/lib/site-contact'
import { cn, formatPrice } from '@/lib/utils'

const SITE_TYPES: Array<{ id: Exclude<SiteType, null>; title: string; description: string }> = [
  {
    id: 'corporativa',
    title: 'Corporativa',
    description: 'Sitio profesional para marca, servicios y confianza.',
  },
  {
    id: 'ecommerce',
    title: 'Ecommerce',
    description: 'Catálogo, carrito y pagos para vender online.',
  },
  {
    id: 'reservas',
    title: 'Reservas',
    description: 'Agenda automática de citas y disponibilidad en tiempo real.',
  },
  {
    id: 'portafolio',
    title: 'Portafolio',
    description: 'Muestra visual de trabajos y casos de éxito.',
  },
  {
    id: 'landing',
    title: 'Landing',
    description: 'Página enfocada en conversión y captación de leads.',
  },
  {
    id: 'blog',
    title: 'Blog',
    description: 'Contenido SEO para atraer tráfico orgánico.',
  },
]

const PAGE_SUGGESTIONS: Record<
  string,
  Array<{ id: string; name: string; description: string }>
> = {
  corporativa: [
    { id: 'servicios', name: 'Servicios', description: 'Detalle de lo que ofrece tu empresa' },
    { id: 'equipo', name: 'Equipo', description: 'Las personas detrás del negocio' },
    { id: 'clientes', name: 'Clientes', description: 'Empresas que ya confían en ti' },
    { id: 'casos', name: 'Casos de éxito', description: 'Historias reales con resultados' },
    { id: 'faq', name: 'Preguntas frecuentes', description: 'Respuestas a dudas comunes' },
  ],
  ecommerce: [
    { id: 'productos', name: 'Productos', description: 'Catálogo completo con filtros' },
    { id: 'categorias', name: 'Categorías', description: 'Navegación por tipo de producto' },
    { id: 'carrito', name: 'Carrito', description: 'Resumen de compra' },
    { id: 'checkout', name: 'Pago', description: 'Proceso de compra seguro' },
    { id: 'mi-cuenta', name: 'Mi cuenta', description: 'Panel del cliente' },
    { id: 'envios', name: 'Envíos y devoluciones', description: 'Políticas claras para el cliente' },
  ],
  reservas: [
    { id: 'servicios', name: 'Servicios', description: 'Qué se puede reservar' },
    { id: 'agendar', name: 'Agendar cita', description: 'Calendario de disponibilidad' },
    { id: 'profesionales', name: 'Profesionales', description: 'Quiénes atienden' },
    { id: 'ubicacion', name: 'Ubicación', description: 'Dónde te encuentras' },
  ],
  portafolio: [
    { id: 'proyectos', name: 'Proyectos', description: 'Galería de trabajos realizados' },
    { id: 'sobre-mi', name: 'Sobre mí', description: 'Tu historia como profesional' },
    { id: 'servicios', name: 'Servicios', description: 'Qué ofreces y cómo' },
    { id: 'testimonios', name: 'Testimonios', description: 'Lo que dicen tus clientes' },
  ],
  landing: [
    { id: 'beneficios', name: 'Beneficios', description: 'Valor inmediato para el visitante' },
    { id: 'testimonios', name: 'Testimonios', description: 'Prueba social con resultados' },
    { id: 'faq', name: 'Preguntas frecuentes', description: 'Resuelve objeciones antes del clic' },
  ],
  blog: [
    { id: 'articulos', name: 'Artículos', description: 'Todo tu contenido editorial' },
    { id: 'categorias', name: 'Categorías', description: 'Organización por tema' },
    { id: 'autor', name: 'Autor', description: 'Tu biografía profesional' },
    { id: 'newsletter', name: 'Newsletter', description: 'Suscripción por email' },
  ],
}

function newPageId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `page-${crypto.randomUUID()}`
  }
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function SmartQuoteBuilder() {
  const siteType = useQuoteStore((s) => s.siteType)
  const pages = useQuoteStore((s) => s.pages)
  const features = useQuoteStore((s) => s.features)
  const includesMaintenance = useQuoteStore((s) => s.includesMaintenance)
  const setSiteType = useQuoteStore((s) => s.setSiteType)
  const addPage = useQuoteStore((s) => s.addPage)
  const removePage = useQuoteStore((s) => s.removePage)
  const renamePage = useQuoteStore((s) => s.renamePage)
  const resetQuote = useQuoteStore((s) => s.resetQuote)
  const setIncludesMaintenance = useQuoteStore((s) => s.setIncludesMaintenance)
  const applySuggestedPlan = useQuoteStore((s) => s.applySuggestedPlan)
  const calculateQuote = useQuoteStore((s) => s.calculateQuote)
  const setQuoteFlowStep = useQuoteStore((s) => s.setQuoteFlowStep)
  const quoteFlowStep = useQuoteStore((s) => s.quoteFlowStep)
  const showMoney = quoteFlowStep !== 'configuring'

  const [newPageName, setNewPageName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [applyFeedback, setApplyFeedback] = useState(false)

  const userPlanFloor = useQuoteStore((s) => s.userPlanFloor)
  const quoteWithFloor = calculateQuote()

  useEffect(() => {
    if (!applyFeedback) return
    const t = window.setTimeout(() => setApplyFeedback(false), 2600)
    return () => window.clearTimeout(t)
  }, [applyFeedback])

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditValue(name)
  }

  const saveEdit = (id: string) => {
    const trimmed = editValue.trim()
    if (trimmed) renamePage(id, trimmed)
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const confirmAddPage = () => {
    const trimmed = newPageName.trim()
    if (!trimmed) return
    addPage({ id: newPageId(), name: trimmed, isDefault: false })
    setNewPageName('')
    setAdding(false)
  }

  const handleQuote = () => {
    if (!siteType) return
    setQuoteFlowStep('calculating')
  }

  const planLabel =
    quoteWithFloor.plan.charAt(0).toUpperCase() + quoteWithFloor.plan.slice(1)

  const suggestions = siteType ? PAGE_SUGGESTIONS[siteType] ?? [] : []

  const pageLimit = quoteWithFloor.pageLimitNotice

  return (
    <section className="grid grid-cols-1 gap-8 xl:grid-cols-5">
      <div className="space-y-6 xl:col-span-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="unbounded-heading text-xl font-semibold uppercase tracking-tight text-white">
              1. Tipo de página
            </h3>
            <span className="text-xs uppercase tracking-[0.2em] text-amber-300/80">Base</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {SITE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setSiteType(type.id)}
                className={cn(
                  'rounded-xl border p-4 text-left transition-all duration-300',
                  siteType === type.id
                    ? 'border-amber-300/70 bg-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20',
                )}
              >
                <p className="text-sm font-semibold uppercase tracking-tight text-white">{type.title}</p>
                <p className="mt-1 text-sm text-white/65">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="unbounded-heading text-2xl font-semibold uppercase tracking-tight text-white">
                2. Páginas del sitio
              </h2>
              <p className="raleway-subtitle mt-1 text-sm text-white/60">
                Las páginas predeterminadas están incluidas. Puedes renombrarlas o agregar nuevas según tu negocio
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-white/50">Total</div>
              <div className="text-2xl font-bold text-amber-400">{pages.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {pages.map((page) => {
                const PageIcon = getPageIcon(page)
                return (
                  <motion.div
                    key={page.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                      <PageIcon className="h-5 w-5 text-white/70" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingId === page.id ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(page.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(page.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="w-full border-b border-amber-400 bg-transparent py-1 text-white focus:outline-none"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEdit(page.id, page.name)}
                          className="w-full text-left"
                        >
                          <div className="truncate text-sm font-medium text-white">{page.name}</div>
                          {page.isDefault ? (
                            <div className="mt-0.5 text-xs text-white/40">
                              Predeterminada · Clic para renombrar
                            </div>
                          ) : (
                            <div className="mt-0.5 text-xs text-white/40">
                              Personalizada · Clic para renombrar
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                    {!page.isDefault ? (
                      <button
                        type="button"
                        onClick={() => removePage(page.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-red-500/10"
                        aria-label={`Eliminar ${page.name}`}
                      >
                        <X className="h-4 w-4 text-red-400" />
                      </button>
                    ) : null}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {!adding ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 p-4 text-sm text-white/60 transition-all duration-300 hover:border-amber-400/50 hover:bg-amber-400/5 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar página personalizada</span>
            </button>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-white/5 p-4 transition-all duration-300">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-amber-400/30 bg-amber-400/10">
                <FileText className="h-5 w-5 text-amber-400" aria-hidden />
              </div>
              <input
                autoFocus
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newPageName.trim()) confirmAddPage()
                  if (e.key === 'Escape') {
                    setAdding(false)
                    setNewPageName('')
                  }
                }}
                placeholder="Nombre de la página (ej. Clientes, Casos de éxito, Recursos)"
                className="min-w-0 flex-1 border-b border-amber-400 bg-transparent text-white placeholder-white/30 focus:outline-none"
              />
              <HoverBorderGradient
                type="button"
                onClick={confirmAddPage}
                disabled={!newPageName.trim()}
                roundedClassName="rounded-lg"
                className="px-4 py-2 text-sm font-medium"
              >
                Agregar
              </HoverBorderGradient>
              <button
                type="button"
                onClick={() => {
                  setAdding(false)
                  setNewPageName('')
                }}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white/60 transition-all duration-300 hover:bg-white/5"
                aria-label="Cancelar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
              <span className="text-sm font-medium text-white/80">Páginas sugeridas para tu negocio</span>
            </div>
            <p className="mb-4 text-xs text-white/50">
              Agrega con un clic las páginas que suelen incluirse según el tipo de sitio que elegiste
            </p>
            {!siteType ? (
              <div className="py-8 text-center text-sm text-white/40">
                Selecciona un tipo de página arriba para ver sugerencias inteligentes
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {suggestions.map((sug) => {
                  const alreadyAdded = pages.some(
                    (p) =>
                      p.id === sug.id ||
                      p.name.toLowerCase() === sug.name.toLowerCase(),
                  )
                  return (
                    <button
                      key={sug.id}
                      type="button"
                      onClick={() =>
                        !alreadyAdded &&
                        addPage({ id: sug.id, name: sug.name, isDefault: false })
                      }
                      disabled={alreadyAdded}
                      className={cn(
                        'rounded-lg border p-3 text-left transition-all duration-300',
                        alreadyAdded
                          ? 'cursor-default border-amber-400/20 bg-amber-400/5'
                          : 'cursor-pointer border-white/10 bg-white/5 hover:border-amber-400/40 hover:bg-amber-400/5',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-sm font-medium',
                            alreadyAdded ? 'text-amber-400/60' : 'text-white',
                          )}
                        >
                          {sug.name}
                        </span>
                        {alreadyAdded ? (
                          <Check className="h-4 w-4 text-amber-400/60" aria-hidden />
                        ) : (
                          <Plus className="h-4 w-4 text-white/40" aria-hidden />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-white/50">{sug.description}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {pageLimit ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" aria-hidden />
                <div>
                  <div className="text-sm font-medium text-amber-300">
                    Has agregado {pageLimit.excess}{' '}
                    {pageLimit.excess === 1 ? 'página' : 'páginas'} adicional
                    {pageLimit.excess !== 1 ? 'es' : ''} al plan{' '}
                    {pageLimit.referencedPlan.charAt(0).toUpperCase() +
                      pageLimit.referencedPlan.slice(1)}
                  </div>
                  <div className="mt-1 text-xs text-white/70">
                    {showMoney ? (
                      <>
                        Cada página extra se cobra a ${formatPrice(EXTRA_PAGE_PRICE)}. Si prefieres, puedes subir al siguiente plan y obtener más páginas incluidas más beneficios adicionales
                      </>
                    ) : (
                      <>
                        Al cotizar verás el detalle de costos. También puedes subir de plan para incluir más páginas y beneficios
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h3 className="unbounded-heading text-xl font-semibold uppercase tracking-tight text-white">
            3. Funcionalidades seleccionadas
          </h3>
          {features.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">
              Aún no agregaste funcionalidades desde el Laboratorio. Puedes hacerlo y volver aquí
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {features.map((feature) => (
                <span
                  key={feature.id}
                  className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-medium text-amber-100"
                >
                  {feature.title}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/servicios/desarrollo-web#laboratorio-interactivo"
            className="mt-5 flex w-full items-center justify-center rounded-xl border border-amber-400/35 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100 transition-colors duration-300 hover:bg-amber-400/15"
          >
            Agregar más
          </Link>
        </div>
      </div>

      <div className="xl:col-span-2">
        <div
          className="sticky top-24 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
          data-quote-plan-floor={userPlanFloor ?? 'auto'}
        >
          <h3 className="unbounded-heading text-xl font-semibold uppercase tracking-tight text-white">
            Resumen inteligente
          </h3>

          {applyFeedback ? (
            <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Plan actualizado: se aplicó la sugerencia y el total se recalculó
            </div>
          ) : null}

          <div className="border-b border-white/10 pb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Plan base</span>
              <span className="font-medium text-amber-400">{planLabel}</span>
            </div>
            <div className="mt-1 text-xs text-white/50">
              {quoteWithFloor.plan === 'esencial' ? 'Hasta 5 páginas' : null}
              {quoteWithFloor.plan === 'profesional' ? 'Hasta 8 páginas' : null}
              {quoteWithFloor.plan === 'avanzado' ? 'Páginas ilimitadas' : null}
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-white/60">Incluidas en el plan</span>
            {quoteWithFloor.includedFeatures.length === 0 ? (
              <p className="mt-2 text-sm text-white/45">Ninguna por ahora</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-white/80">
                {quoteWithFloor.includedFeatures.map((f) => (
                  <li key={f.id}>• {f.title}</li>
                ))}
              </ul>
            )}
          </div>

          {showMoney && quoteWithFloor.premiumExtras.length > 0 ? (
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400">Módulos premium</span>
              <ul className="mt-2 space-y-2 text-sm text-white/85">
                {quoteWithFloor.premiumExtras.map((e) => (
                  <li key={e.id} className="flex justify-between gap-2">
                    <span>{e.title}</span>
                    <span className="shrink-0 text-amber-400">+${formatPrice(e.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {showMoney && quoteWithFloor.extraPages > 0 ? (
            <div className="flex justify-between text-sm text-white/80">
              <span>{quoteWithFloor.extraPages} páginas extra</span>
              <span>+${formatPrice(quoteWithFloor.extraPagesPrice)}</span>
            </div>
          ) : null}

          <div className="border-t border-white/10 pt-4">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Mantenimiento mensual</div>
                <div className="text-xs text-white/50">Soporte, cambios menores y reportes</div>
              </div>
              <Switch
                checked={includesMaintenance}
                onCheckedChange={setIncludesMaintenance}
              />
            </label>
            {showMoney && includesMaintenance ? (
              <div className="mt-2 text-right text-sm text-amber-400">
                +${formatPrice(MAINTENANCE_MONTHLY)}/mes
              </div>
            ) : null}
          </div>

          {showMoney && quoteWithFloor.suggestUpgrade && quoteWithFloor.suggestionMessage ? (
            <div className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <div>
                  <div className="text-sm font-medium text-amber-300">Sugerencia inteligente</div>
                  <div className="mt-1 text-xs text-white/70">{quoteWithFloor.suggestionMessage}</div>
                  {quoteWithFloor.suggestionTarget ? (
                    <button
                      type="button"
                      onClick={() => {
                        applySuggestedPlan(quoteWithFloor.suggestionTarget!)
                        setApplyFeedback(true)
                      }}
                      className="mt-2 text-xs text-amber-400 underline"
                    >
                      Aplicar sugerencia
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          {showMoney ? (
            <div className="border-t border-white/10 pt-4">
              <div className="text-xs uppercase tracking-wider text-white/50">Estimado total</div>
              <div className="mt-1 text-4xl font-bold text-amber-400">
                ${formatPrice(quoteWithFloor.total)}
              </div>
              {includesMaintenance ? (
                <div className="mt-1 text-xs text-white/50">
                  Más ${formatPrice(MAINTENANCE_MONTHLY)} mensuales
                </div>
              ) : null}
            </div>
          ) : (
            <p className="border-t border-white/10 pt-4 text-center text-xs text-white/45">
              El precio estimado se muestra después de pulsar Cotizar ahora
            </p>
          )}

          <div className="space-y-2">
            <HoverBorderGradient
              type="button"
              disabled={!siteType}
              title={!siteType ? 'Selecciona primero un tipo de página' : undefined}
              onClick={handleQuote}
              containerClassName="w-full"
              className="w-full gap-2 py-3 text-sm font-semibold"
            >
              <Sparkles className="h-4 w-4 text-sky-200" strokeWidth={2} aria-hidden />
              Cotizar ahora
            </HoverBorderGradient>
            <a
              href={buildSebWhatsAppUrl(
                'Hola, estoy armando una cotización en la página de precios de SEB y quiero hablar con alguien antes de finalizar',
              )}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick('precios_cotizador')}
              className="block w-full text-center text-xs font-medium text-amber-300/90 underline-offset-2 transition-colors hover:text-amber-200 hover:underline"
            >
              Hablar por WhatsApp antes de cotizar
            </a>
          </div>
          {!siteType ? (
            <p className="mt-2 text-center text-xs text-amber-400/60">
              Selecciona un tipo de página para continuar
            </p>
          ) : null}

          <HoverBorderGradient
            type="button"
            onClick={() => {
              resetQuote()
              setApplyFeedback(false)
              setAdding(false)
              setNewPageName('')
              setEditingId(null)
            }}
            containerClassName="w-full"
            className="w-full py-3 text-sm font-medium text-white/90"
          >
            Reiniciar configuración
          </HoverBorderGradient>
        </div>
      </div>
    </section>
  )
}
