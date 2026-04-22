'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Calculator,
  Calendar,
  Check,
  FileText,
  Globe,
  Images,
  Lock,
  MapPin,
  MessageSquare,
  Moon,
  Palette,
  PenTool,
  Plus,
  Search,
  Send,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Video,
  Wand2,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { useQuoteStore } from '@/lib/stores/quoteStore'
import { cn } from '@/lib/utils'

import {
  getMockupUrlForFeature,
  MockDefaultBase,
  renderFeatureVisual,
} from './mockup-visuals/FeatureVisuals'

export interface LabFeature {
  id: string
  category: string
  title: string
  description: string
  icon: LucideIcon
  mockupUrl?: string
}

const labCategories = [
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
  { id: 'contenido', label: 'Contenido', icon: FileText },
  { id: 'diseno', label: 'Diseño', icon: Palette },
  { id: 'ia', label: 'Inteligencia artificial', icon: Sparkles },
  { id: 'tecnico', label: 'Técnico', icon: Settings2 },
] as const

const labFeatures: LabFeature[] = [
  {
    id: 'reservas',
    category: 'ventas',
    title: 'Sistema de reservas',
    description:
      'Tus clientes agendan citas directamente en tu web sin llamadas',
    icon: Calendar,
  },
  {
    id: 'tienda',
    category: 'ventas',
    title: 'Tienda online',
    description:
      'Catálogo, carrito y pagos integrados con Wompi o PayU para vender sin fricciones.',
    icon: ShoppingBag,
  },
  {
    id: 'cotizador',
    category: 'ventas',
    title: 'Cotizador interactivo',
    description:
      'El visitante configura su pedido y ve el precio al instante antes de contactarte.',
    icon: Calculator,
  },
  {
    id: 'whatsapp',
    category: 'ventas',
    title: 'WhatsApp flotante',
    description:
      'Botón fijo en cada página que abre conversación directa con tu negocio.',
    icon: MessageSquare,
  },
  {
    id: 'formulario',
    category: 'ventas',
    title: 'Formulario de contacto',
    description:
      'Captura leads con validación y envío automático a tu correo.',
    icon: Send,
  },
  {
    id: 'galeria',
    category: 'contenido',
    title: 'Galería interactiva',
    description:
      'Portafolio visual con filtros y detalle expandido al hacer clic',
    icon: Images,
  },
  {
    id: 'blog',
    category: 'contenido',
    title: 'Blog integrado',
    description:
      'Sección de artículos con categorías, ideal para posicionamiento orgánico en Google.',
    icon: BookOpen,
  },
  {
    id: 'video',
    category: 'contenido',
    title: 'Video de fondo',
    description:
      'Hero cinematográfico con video en loop para impacto visual inmediato.',
    icon: Video,
  },
  {
    id: 'menu',
    category: 'contenido',
    title: 'Menú digital',
    description:
      'Carta interactiva con fotos y precios, perfecta para restaurantes y cafés.',
    icon: UtensilsCrossed,
  },
  {
    id: 'darkmode',
    category: 'diseno',
    title: 'Modo oscuro / claro',
    description:
      'La web se adapta al gusto visual del visitante con un toggle',
    icon: Moon,
  },
  {
    id: 'animaciones',
    category: 'diseno',
    title: 'Animaciones al scroll',
    description:
      'Elementos que aparecen con movimiento suave a medida que el visitante navega.',
    icon: Wand2,
  },
  {
    id: 'responsive',
    category: 'diseno',
    title: 'Diseño responsive',
    description:
      'Adaptación perfecta a celular, tablet y computador sin perder calidad visual.',
    icon: Smartphone,
  },
  {
    id: 'identidad',
    category: 'diseno',
    title: 'Identidad personalizada',
    description:
      'Paleta de colores y tipografía alineadas con tu marca en cada detalle.',
    icon: Palette,
  },
  {
    id: 'mapa',
    category: 'diseno',
    title: 'Mapa integrado',
    description:
      'Google Maps con tu ubicación, horarios y botón de ruta directa.',
    icon: MapPin,
  },
  {
    id: 'chatbot',
    category: 'ia',
    title: 'Chatbot inteligente',
    description:
      'Asistente que responde consultas del negocio las 24 horas sin intervención',
    icon: Bot,
  },
  {
    id: 'busqueda',
    category: 'ia',
    title: 'Búsqueda semántica',
    description:
      'El visitante escribe lo que busca en lenguaje natural y la IA lo lleva al resultado correcto.',
    icon: Search,
  },
  {
    id: 'recomendaciones',
    category: 'ia',
    title: 'Recomendaciones inteligentes',
    description:
      'Productos o servicios sugeridos según el comportamiento del visitante.',
    icon: Zap,
  },
  {
    id: 'generador',
    category: 'ia',
    title: 'Generador de contenido',
    description:
      'La web crea descripciones de productos o posts automáticamente con IA.',
    icon: PenTool,
  },
  {
    id: 'seo',
    category: 'tecnico',
    title: 'SEO optimizado',
    description:
      'Metadatos, velocidad, sitemap y schema configurados para aparecer en Google.',
    icon: TrendingUp,
  },
  {
    id: 'analytics',
    category: 'tecnico',
    title: 'Analytics integrado',
    description:
      'Panel de métricas para ver visitas, comportamiento y conversiones en tiempo real.',
    icon: BarChart3,
  },
  {
    id: 'idiomas',
    category: 'tecnico',
    title: 'Multi-idioma',
    description:
      'Selector que traduce el contenido para clientes en distintos países.',
    icon: Globe,
  },
  {
    id: 'dominio',
    category: 'tecnico',
    title: 'Dominio con SSL',
    description:
      'Tu propio dominio con certificado de seguridad y hosting incluido el primer año.',
    icon: Lock,
  },
  {
    id: 'miembros',
    category: 'tecnico',
    title: 'Área de miembros',
    description:
      'Zona privada con login exclusivo para clientes registrados o suscriptores.',
    icon: Users,
  },
  {
    id: 'panel',
    category: 'tecnico',
    title: 'Panel de administración',
    description:
      'Edita textos, fotos y productos directamente sin tocar código.',
    icon: Settings2,
  },
]

function firstFeatureInCategory(categoryId: string): LabFeature | null {
  return labFeatures.find((f) => f.category === categoryId) ?? null
}

type LabCategory = (typeof labCategories)[number]

function LabVerticalCategoryTabs({
  categories,
  activeId,
  onChange,
}: {
  categories: readonly LabCategory[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <nav
      className="flex w-full flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl"
      aria-label="Categorías del laboratorio"
    >
      {categories.map((cat) => {
        const Icon = cat.icon
        const active = activeId === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={cn(
              'relative flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300',
              active
                ? 'border-white/15 bg-white/10 text-white'
                : 'border-transparent text-white/50 hover:bg-white/5 hover:text-white/80',
            )}
          >
            {active ? (
              <span
                className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-amber-400"
                aria-hidden
              />
            ) : null}
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="raleway-subtitle text-sm font-medium">{cat.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function LabMockup({
  activeFeature,
  onInteract,
}: {
  activeFeature: LabFeature | null
  onInteract: () => void
}) {
  const url = getMockupUrlForFeature(activeFeature?.id ?? null)
  const isLightChrome = activeFeature?.id === 'darkmode'
  const contentKey = activeFeature?.id ?? 'default'

  return (
    <div
      className={cn(
        'flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-xl transition-colors duration-500',
        isLightChrome && 'border-neutral-200 bg-neutral-100',
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-3',
          isLightChrome && 'border-neutral-200 bg-white/80',
        )}
      >
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/60" aria-hidden />
          <span
            className="size-2.5 rounded-full bg-yellow-400/60"
            aria-hidden
          />
          <span className="size-2.5 rounded-full bg-green-400/60" aria-hidden />
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 truncate rounded-lg px-3 py-1.5 text-center text-xs text-white/45',
            isLightChrome && 'bg-neutral-200/80 text-neutral-600',
            !isLightChrome && 'bg-white/5',
          )}
        >
          {url}
        </div>
      </div>

      <div
        className={cn(
          'relative flex min-h-[500px] flex-1 flex-col items-center justify-center bg-black/40 p-4 md:p-6',
          isLightChrome && 'bg-neutral-950/50',
        )}
        onClick={onInteract}
        role="presentation"
      >
        <AnimatePresence initial={false}>
          {activeFeature ? (
            <motion.div
              key={`badge-${activeFeature.id}`}
              className="pointer-events-none absolute right-3 top-3 z-20 md:right-6 md:top-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="raleway-subtitle flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-400">
                <span
                  className="size-1.5 shrink-0 rounded-full bg-amber-400 animate-pulse"
                  aria-hidden
                />
                {activeFeature.title}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="relative z-[1] flex w-full max-w-4xl flex-col items-center justify-center"
          >
            {activeFeature ? (
              renderFeatureVisual(activeFeature.id)
            ) : (
              <div className="w-full max-w-lg">
                <MockDefaultBase />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function InteractiveLab() {
  const [activeCategory, setActiveCategory] = useState('ventas')
  const [activeFeature, setActiveFeature] = useState<LabFeature | null>(() =>
    firstFeatureInCategory('ventas'),
  )
  const addFeature = useQuoteStore((state) => state.addFeature)
  const removeFeature = useQuoteStore((state) => state.removeFeature)
  const hasFeature = useQuoteStore((state) => state.hasFeature)
  const isAdded = activeFeature ? hasFeature(activeFeature.id) : false

  const categoryFeatures = useMemo(
    () => labFeatures.filter((f) => f.category === activeCategory),
    [activeCategory],
  )

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id)
    setActiveFeature(firstFeatureInCategory(id))
  }

  const handleSelectFeature = (f: LabFeature) => {
    setActiveFeature(f)
  }

  return (
    <section
      id="laboratorio-interactivo"
      className="bg-transparent py-24 md:py-32"
      aria-labelledby="interactive-lab-heading"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <h2
            id="interactive-lab-heading"
            className="unbounded-heading text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl"
          >
            Explora lo que podemos construir juntos
          </h2>
          <p className="raleway-subtitle mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Haz clic en cualquier funcionalidad y mira cómo se siente en una web
            real. Todas las que ves aquí son herramientas que implemento en los
            proyectos que entrego
          </p>
        </header>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
          <div className="order-1 self-start lg:col-span-3 lg:sticky lg:top-24">
            <LabMockup activeFeature={activeFeature} onInteract={() => {}} />
            <div className="mt-4 flex items-center justify-start px-2">
              <button
                type="button"
                onClick={() => {
                  if (!activeFeature) return
                  if (isAdded) {
                    removeFeature(activeFeature.id)
                    return
                  }
                  addFeature({
                    id: activeFeature.id,
                    title: activeFeature.title,
                    category: activeFeature.category,
                    description: activeFeature.description,
                    icon: activeFeature.icon.displayName || 'Sparkles',
                  })
                }}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300',
                  isAdded
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20'
                    : 'border-amber-400 bg-amber-400 text-black hover:bg-amber-300',
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isAdded ? (
                    <motion.div
                      key="added"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Añadido a cotización</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Añadir a cotización</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          <div className="order-2 flex flex-col gap-4 lg:col-span-2 lg:flex-row lg:items-start">
            <div className="w-full shrink-0 lg:w-44">
              <LabVerticalCategoryTabs
                categories={labCategories}
                activeId={activeCategory}
                onChange={handleCategoryChange}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
              {categoryFeatures.length === 0 ? (
                <p className="raleway-subtitle rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm font-medium text-white/50 backdrop-blur-sm">
                  Próximamente más herramientas en esta categoría
                </p>
              ) : (
                categoryFeatures.map((f) => {
                  const Icon = f.icon
                  const active = activeFeature?.id === f.id
                  const featureAdded = hasFeature(f.id)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectFeature(f)}
                      className={cn(
                        'group relative w-full rounded-xl border p-5 text-left transition-all duration-300',
                        active
                          ? 'border-amber-400/60 bg-amber-400/5 shadow-sm'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
                      )}
                    >
                      <div className="absolute right-3 top-3 z-10">
                        {featureAdded ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex h-5 w-5 items-center justify-center rounded-full border border-amber-300/80 bg-amber-400/20 shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                          >
                            <Check className="h-3 w-3 text-amber-300" />
                          </motion.div>
                        ) : null}
                      </div>
                      <div className="flex gap-4">
                        <div
                          className={cn(
                            'flex size-10 shrink-0 items-center justify-center rounded-full border',
                            active
                              ? 'border-amber-400/30 bg-amber-400/10 text-amber-400'
                              : 'border-white/10 bg-white/5 text-white/70',
                          )}
                        >
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1 pr-6">
                          <p className="unbounded-heading text-base font-semibold tracking-tight text-white">
                            {f.title}
                          </p>
                          <p className="raleway-subtitle mt-1 text-sm font-medium leading-relaxed text-white/70">
                            {f.description}
                          </p>
                        </div>
                        <ArrowRight
                          className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-amber-400/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          aria-hidden
                        />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
