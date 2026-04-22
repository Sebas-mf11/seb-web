'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'

export default function HeroServices() {
  return (
    <section
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden bg-transparent px-4 py-32 text-center md:py-40"
      aria-labelledby="servicios-desarrollo-hero-heading"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      >
        <source src="/videos/hero-servicios.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 flex flex-col items-center">
        <span className="inline-flex items-center rounded-full border border-amber-300/40 bg-black/25 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200 backdrop-blur-md">
          Servicios
        </span>

        <h1
          id="servicios-desarrollo-hero-heading"
          className="unbounded-heading mt-8 max-w-4xl text-5xl font-semibold leading-tight text-white md:text-7xl lg:text-8xl"
        >
          Todo lo que tu web puede ser
        </h1>

        <p className="raleway-subtitle mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/70 md:text-xl">
          Explora funcionalidades reales en un entorno interactivo. Diseño,
          desarrollo, inteligencia artificial y todo lo que convierte una página
          en una herramienta de negocio.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <HoverBorderGradient
            as={Link}
            href="/cotizador"
            containerClassName="raleway-subtitle inline-flex"
            className="min-h-11 gap-2 px-8 py-3.5 text-sm font-semibold md:text-base"
          >
            Ir al cotizador
            <ArrowRight className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          </HoverBorderGradient>
          <HoverBorderGradient
            as="button"
            type="button"
            containerClassName="raleway-subtitle inline-flex"
            className="gap-2 px-8 py-3.5 text-sm font-semibold md:text-base"
            onClick={() => {
              document
                .getElementById('laboratorio-interactivo')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
          >
            <Sparkles className="size-4 shrink-0 text-sky-200" strokeWidth={2} aria-hidden />
            Ir al laboratorio
          </HoverBorderGradient>
        </div>

        <p className="raleway-subtitle mt-14 flex items-center justify-center gap-1 text-sm font-medium text-white/45">
          Scroll para explorar
          <span className="inline-block animate-bounce" aria-hidden>
            →
          </span>
        </p>
      </div>
    </section>
  )
}
