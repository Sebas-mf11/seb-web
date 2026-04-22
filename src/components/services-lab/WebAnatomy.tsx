'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Anchor,
  Check,
  LayoutGrid,
  Menu,
  MousePointerClick,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { GlassTabs } from '@/components/ui/glass-tabs'
import { cn } from '@/lib/utils'

const anatomyTabs = [
  { id: 'nav', label: 'Navegación', icon: Menu },
  { id: 'hero', label: 'Hero', icon: Sparkles },
  { id: 'content', label: 'Secciones', icon: LayoutGrid },
  { id: 'cta', label: 'Conversión', icon: MousePointerClick },
  { id: 'footer', label: 'Pie de página', icon: Anchor },
] as const

type AnatomyTabId = (typeof anatomyTabs)[number]['id']

const anatomyContent: Record<
  AnatomyTabId,
  { title: string; description: string; points: string[] }
> = {
  nav: {
    title: 'Navegación',
    description:
      'Es la primera decisión del visitante. Una navegación clara reduce fricción y guía hacia la acción correcta en segundos',
    points: [
      'Logo con acceso rápido al inicio',
      'Menú con las secciones esenciales',
      'Botón de acción destacado',
      'Versión adaptada para celular',
    ],
  },
  hero: {
    title: 'Hero',
    description:
      'Lo primero que ve el visitante al llegar. En tres segundos decide si se queda o se va. Aquí se concentra la promesa de tu marca',
    points: [
      'Título aspiracional que conecta',
      'Subtítulo que aclara qué haces',
      'Llamado a la acción principal',
      'Soporte visual que refuerza el mensaje',
    ],
  },
  content: {
    title: 'Secciones de contenido',
    description:
      'El cuerpo de la web. Aquí vive la información que convence: servicios, portafolio, testimonios, beneficios. Cada sección tiene un propósito',
    points: [
      'Jerarquía visual que guía la lectura',
      'Contenido escaneable y breve',
      'Imágenes y ejemplos que validan',
      'Ritmo visual que mantiene el interés',
    ],
  },
  cta: {
    title: 'Conversión',
    description:
      'El momento en que el visitante pasa a contacto. Formularios, botones de WhatsApp, cotizadores, reservas. Aquí se vuelve cliente',
    points: [
      'Llamadas a la acción claras y repetidas',
      'Formularios simples y sin fricción',
      'Integración con WhatsApp y calendario',
      'Confirmación inmediata que genera confianza',
    ],
  },
  footer: {
    title: 'Pie de página',
    description:
      'El cierre silencioso de la experiencia. Aquí va la información que sostiene la credibilidad: contacto, redes, legal, links secundarios',
    points: [
      'Datos de contacto visibles',
      'Enlaces a redes y canales',
      'Políticas y términos legales',
      'Mapa del sitio para SEO y usabilidad',
    ],
  },
}

function zoneWrap(
  activeTab: AnatomyTabId,
  zoneId: AnatomyTabId,
  children: ReactNode,
) {
  const isActive = activeTab === zoneId
  return (
    <div
      className={cn(
        'rounded-lg transition-all duration-500',
        isActive
          ? 'border-2 border-amber-400/60 opacity-100 shadow-[0_0_30px_rgba(251,191,36,0.2)]'
          : 'border-2 border-transparent opacity-40',
      )}
    >
      {children}
    </div>
  )
}

function BrowserMockup({ activeTab }: { activeTab: AnatomyTabId }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/20 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/60" aria-hidden />
          <span
            className="size-2.5 rounded-full bg-yellow-400/60"
            aria-hidden
          />
          <span className="size-2.5 rounded-full bg-green-400/60" aria-hidden />
        </div>
        <div className="ml-2 flex-1 truncate rounded-md bg-white/5 px-3 py-1 text-center text-[10px] text-white/40 sm:text-xs">
          sebweb.co
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col gap-2 p-3 lg:min-h-[500px]">
        {zoneWrap(
          activeTab,
          'nav',
          <div className="flex h-11 items-center justify-between gap-2 px-2">
            <div className="size-6 shrink-0 rounded bg-white/15" aria-hidden />
            <div className="flex flex-1 justify-end gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-2 w-8 rounded-sm bg-white/10"
                  aria-hidden
                />
              ))}
            </div>
          </div>,
        )}

        {zoneWrap(
          activeTab,
          'hero',
          <div className="flex min-h-[120px] flex-col justify-center gap-2 px-3 py-4">
            <div className="h-3 w-[85%] rounded bg-white/20" aria-hidden />
            <div className="h-2.5 w-[70%] rounded bg-white/10" aria-hidden />
            <div className="h-2.5 w-[55%] rounded bg-white/10" aria-hidden />
            <div className="mt-2 h-7 w-28 self-start rounded-full bg-amber-400/25" aria-hidden />
          </div>,
        )}

        {zoneWrap(
          activeTab,
          'content',
          <div className="grid grid-cols-3 gap-2 px-1 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-md bg-white/[0.06] p-2"
              >
                <div className="aspect-[4/3] w-full rounded bg-white/10" aria-hidden />
                <div className="h-2 w-full rounded bg-white/10" aria-hidden />
                <div className="h-2 w-[80%] rounded bg-white/5" aria-hidden />
              </div>
            ))}
          </div>,
        )}

        {zoneWrap(
          activeTab,
          'cta',
          <div className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-md bg-white/[0.04] px-3 py-4">
            <div className="h-2 w-32 rounded bg-white/10" aria-hidden />
            <div
              className="mt-1 h-8 w-36 rounded-full bg-amber-400/30"
              aria-hidden
            />
          </div>,
        )}

        {zoneWrap(
          activeTab,
          'footer',
          <div className="flex min-h-[52px] items-center justify-between gap-2 bg-black/35 px-3 py-2">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-1.5 w-10 rounded bg-white/10"
                  aria-hidden
                />
              ))}
            </div>
            <div className="h-1.5 w-14 rounded bg-white/10" aria-hidden />
          </div>,
        )}
      </div>
    </div>
  )
}

export default function WebAnatomy() {
  const [activeTab, setActiveTab] = useState<AnatomyTabId>('nav')
  const content = anatomyContent[activeTab]

  return (
    <section
      className="bg-transparent py-24 md:py-32"
      aria-labelledby="web-anatomy-heading"
    >
      <div className="mx-auto max-w-7xl px-6">
        <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <h2
            id="web-anatomy-heading"
            className="unbounded-heading text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl"
          >
            Cada parte de tu web tiene una razón
          </h2>
          <p className="raleway-subtitle mx-auto mt-4 max-w-2xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Antes de mostrarte las funcionalidades, te mostramos cómo se compone
            una web profesional moderna
          </p>
        </header>

        <div className="mb-12 flex w-full justify-start overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:mb-16 md:justify-center [&::-webkit-scrollbar]:hidden">
          <GlassTabs
            tabs={[...anatomyTabs]}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as AnatomyTabId)}
            className="shrink-0 md:mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <BrowserMockup activeTab={activeTab} />
          </div>

          <div className="order-1 min-h-[280px] lg:order-2 lg:min-h-[320px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="unbounded-heading text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
                  {content.title}
                </h3>
                <p className="raleway-subtitle mt-4 text-base font-medium leading-relaxed text-white/70 md:text-lg">
                  {content.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {content.points.map((point) => (
                    <li
                      key={point}
                      className="raleway-subtitle flex gap-2.5 text-sm font-medium leading-relaxed text-white/65"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-amber-400/80"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
