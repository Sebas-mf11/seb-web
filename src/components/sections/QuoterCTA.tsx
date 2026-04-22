import Link from 'next/link'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'

export default function QuoterCTA() {
  return (
    <section
      id="precios"
      aria-labelledby="quoter-heading"
      className="mt-24 w-full bg-amber-400/[0.06] px-6 py-24 backdrop-blur-xl md:mt-32 md:px-10 md:py-32"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2
          id="quoter-heading"
          className="unbounded-heading text-3xl font-semibold uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
        >
          Arma tu web a tu medida
        </h2>
        <p className="raleway-subtitle mt-5 text-base font-medium leading-relaxed text-white/70 md:text-lg">
          Elige el tipo de sitio, las herramientas que necesitas y recibe una
          propuesta al instante.
        </p>
        <HoverBorderGradient
          as={Link}
          href="/cotizador"
          containerClassName="mt-10 inline-flex"
          className="min-h-11 px-10 py-4 text-base font-semibold"
        >
          Ir al cotizador <span className="ml-1" aria-hidden>→</span>
        </HoverBorderGradient>
      </div>
    </section>
  )
}
