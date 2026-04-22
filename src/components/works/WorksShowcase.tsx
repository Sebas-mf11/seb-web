'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Construction, Expand, X } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

type WorkItem = {
  id: string
  name: string
  tagline: string
  description: string
  siteType: string
  status?: 'en-construccion'
  images: string[]
}

const works: WorkItem[] = [
  {
    id: 'travel-hub',
    name: 'The Travel Hub',
    tagline: 'Medio de comunicación B2B de la industria turística',
    description: 'Página tipo blog de noticias para audiencia profesional del turismo.',
    siteType: 'Blog de noticias',
    images: [
      '/images/travelhub-1.png',
      '/images/travelhub-2.png',
      '/images/travelhub-3.png',
      '/images/travelhub-4.png',
    ],
  },
  {
    id: 'luxcar-club',
    name: 'LuxCar Club',
    tagline: 'Autolavado y detailing premium',
    description: 'Página corporativa con motor de reservas para gestionar citas.',
    siteType: 'Corporativa + reservas',
    images: [
      '/images/luxcar-1.png',
      '/images/luxcar-2.png',
      '/images/luxcar-3.png',
      '/images/luxcar-4.png',
    ],
  },
  {
    id: 'wilor-comercial',
    name: 'Wilor Comercial',
    tagline: 'Empresa comercializadora de decoración de casas',
    description: 'Proyecto e-commerce para catálogo y compra online de decoración.',
    siteType: 'E-commerce',
    status: 'en-construccion',
    images: [],
  },
  {
    id: 'flower-of-the-forest',
    name: 'Flower of the Forest',
    tagline: 'Mantenimiento de jardín y landscaping (Cape Cod, EEUU)',
    description: 'Sitio corporativo para servicios, cobertura y captación de leads.',
    siteType: 'Corporativa',
    status: 'en-construccion',
    images: [],
  },
]

export default function WorksShowcase() {
  const firstWithPreview =
    works.find((work) => work.status !== 'en-construccion')?.id ?? null
  const [activeId, setActiveId] = useState<string | null>(firstWithPreview)
  const carouselRef = useRef<HTMLDivElement | null>(null)

  const activeWork = useMemo(() => {
    const work = works.find((w) => w.id === activeId) ?? null
    if (!work || work.status === 'en-construccion') return null
    return work
  }, [activeId])

  const scrollCarousel = (direction: 'left' | 'right') => {
    const el = carouselRef.current
    if (!el) return
    const delta = direction === 'left' ? -Math.round(el.clientWidth * 0.85) : Math.round(el.clientWidth * 0.85)
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 pt-8 md:pb-28">
      <h2 className="sr-only">Proyectos del portafolio</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {works.map((work) => {
          const isActive = activeId === work.id
          return (
            <button
              key={work.id}
              type="button"
              onClick={() => {
                if (work.status === 'en-construccion') {
                  setActiveId(null)
                  return
                }
                setActiveId(work.id)
              }}
              className={cn(
                'relative rounded-2xl border p-5 text-left transition-colors',
                isActive
                  ? 'border-amber-300/60 bg-amber-400/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20',
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">{work.siteType}</span>
                {work.status === 'en-construccion' ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                    <Construction className="h-3 w-3" />
                    En construcción
                  </span>
                ) : null}
              </div>
              <h3 className="unbounded-heading text-xl font-semibold text-white">{work.name}</h3>
              <p className="mt-2 text-sm text-white/75">{work.tagline}</p>
              <p className="mt-3 text-sm text-white/55">{work.description}</p>
              {work.status !== 'en-construccion' ? (
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-300">
                  Expandir
                  <Expand className="h-3.5 w-3.5" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeWork ? (
          <motion.div
            key={activeWork.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h4 className="unbounded-heading text-2xl font-semibold text-white md:text-3xl">
                  {activeWork.name}
                </h4>
                <p className="mt-2 text-sm text-white/75 md:text-base">{activeWork.description}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveId(null)}
                className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition-colors hover:bg-white/10"
                aria-label="Cerrar detalle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative">
              <div
                ref={carouselRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]"
              >
                {activeWork.images.map((image, idx) => (
                  <div
                    key={`${activeWork.id}-${idx}`}
                    className="w-[min(92vw,58rem)] shrink-0 snap-start"
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-inner shadow-black/40">
                      {/*
                        Capturas ~1890×860 (~2.2:1). Antes: altura fija baja + object-cover recortaba mucho.
                        Ahora la caja sigue esa proporción y object-contain muestra la imagen completa.
                      */}
                      <div className="relative aspect-[1890/860] w-full">
                        <Image
                          src={image}
                          alt={`${activeWork.name} captura ${idx + 1}`}
                          fill
                          className="object-contain object-center"
                          sizes="(max-width: 768px) 100vw, 896px"
                          priority={idx === 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 p-2 text-white/90"
                aria-label="Desplazar a la izquierda"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/55 p-2 text-white/90"
                aria-label="Desplazar a la derecha"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}
