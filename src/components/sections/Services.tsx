import Link from 'next/link'
import { Code2, Share2, Target } from 'lucide-react'

import { GlowCard } from '@/components/ui/glow-card'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'

const linkWrap =
  'group block min-h-0 rounded-2xl ring-1 ring-white/10 transition-[ring-color,transform] duration-300 hover:ring-white/30'

export default function Services() {
  return (
    <section
      id="servicios"
      className="bg-transparent px-6 py-24 md:px-10 md:py-32"
    >
      <h2 className="unbounded-heading text-center text-3xl font-semibold uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
        Un oficio, tres formas de acompañarte
      </h2>
      <p className="raleway-subtitle mx-auto mt-5 max-w-3xl text-center text-base font-medium leading-relaxed text-white/70 md:text-lg">
        Nos especializamos en desarrollo web. Ofrecemos también servicios
        complementarios para completar tu presencia digital.
      </p>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-2">
        <Link
          href="/servicios/desarrollo-web"
          className={`${linkWrap} lg:row-span-2`}
        >
          <GlowCard
            customSize
            glowColor="orange"
            className="h-full min-h-[420px] gap-0 p-8 md:min-h-[480px] md:p-12"
          >
            <Code2
              className="mb-6 size-10 text-amber-400/90 md:size-12"
              strokeWidth={1.25}
              aria-hidden
            />
            <h3 className="unbounded-heading text-2xl font-semibold uppercase text-white md:text-3xl">
              Desarrollo web a medida
            </h3>
            <p className="raleway-subtitle mt-4 flex-1 text-base leading-relaxed text-white/70 md:text-lg">
              Sitios corporativos, tiendas online, sistemas de reservas y
              plataformas con inteligencia artificial integrada. Cada web se
              diseña desde cero para tu negocio.
            </p>
            <HoverBorderGradient
              as="span"
              containerClassName="pointer-events-none mt-auto inline-flex w-fit transition-transform duration-300 group-hover:translate-x-0.5"
              className="gap-1 px-4 py-2.5 text-xs font-medium md:text-sm"
            >
              Explorar planes y herramientas <span aria-hidden>→</span>
            </HoverBorderGradient>
          </GlowCard>
        </Link>

        <Link href="/contacto" className={linkWrap}>
          <GlowCard
            customSize
            glowColor="orange"
            className="h-full min-h-[280px] gap-0 p-8 md:min-h-[300px] md:p-10"
          >
            <Share2
              className="mb-5 size-9 text-amber-400/90 md:size-10"
              strokeWidth={1.25}
              aria-hidden
            />
            <h3 className="unbounded-heading text-xl font-semibold uppercase text-white md:text-2xl">
              Contenido y redes
            </h3>
            <p className="raleway-subtitle mt-3 flex-1 text-sm leading-relaxed text-white/70 md:text-base">
              Estrategia, diseño y gestión mensual para marcas que quieren
              comunicar con propósito.
            </p>
            <HoverBorderGradient
              as="span"
              containerClassName="pointer-events-none mt-auto inline-flex w-fit transition-transform duration-300 group-hover:translate-x-0.5"
              className="gap-1 px-4 py-2.5 text-xs font-medium md:text-sm"
            >
              Más información <span aria-hidden>→</span>
            </HoverBorderGradient>
          </GlowCard>
        </Link>

        <Link href="/contacto" className={linkWrap}>
          <GlowCard
            customSize
            glowColor="orange"
            className="h-full min-h-[280px] gap-0 p-8 md:min-h-[300px] md:p-10"
          >
            <Target
              className="mb-5 size-9 text-amber-400/90 md:size-10"
              strokeWidth={1.25}
              aria-hidden
            />
            <h3 className="unbounded-heading text-xl font-semibold uppercase text-white md:text-2xl">
              Pauta en Meta
            </h3>
            <p className="raleway-subtitle mt-3 flex-1 text-sm leading-relaxed text-white/70 md:text-base">
              Campañas en Facebook e Instagram configuradas, optimizadas y
              reportadas semana a semana.
            </p>
            <HoverBorderGradient
              as="span"
              containerClassName="pointer-events-none mt-auto inline-flex w-fit transition-transform duration-300 group-hover:translate-x-0.5"
              className="gap-1 px-4 py-2.5 text-xs font-medium md:text-sm"
            >
              Más información <span aria-hidden>→</span>
            </HoverBorderGradient>
          </GlowCard>
        </Link>
      </div>
    </section>
  )
}
