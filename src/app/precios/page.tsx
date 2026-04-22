export const runtime = 'edge';
import type { Metadata } from 'next'
import { Suspense } from 'react'

import PreciosQuoteFlow from '@/components/quote/PreciosQuoteFlow'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import PricingCards from '@/components/ui/pricing-component'
import { buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Precios y cotizador inteligente — SEB',
  description:
    'Planes desde $600.000 y cotizador interactivo: elige tipo de sitio, páginas y funcionalidades. Propuesta clara al instante, sin compromiso.',
  keywords: [
    'precios página web',
    'cotizador web',
    'planes desarrollo web',
    'Colombia',
    'SEB',
  ],
  path: '/precios',
})

export default function PreciosPage() {
  return (
    <main className="min-h-svh bg-neutral-950 text-white antialiased">
      <div className="relative overflow-hidden border-b border-white/10">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        >
          <source src="/videos/hero-precios.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-36 text-center md:pb-28 md:pt-44">
          <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
            Precios
          </span>
          <h1 className="unbounded-heading mx-auto mt-6 max-w-4xl text-4xl font-semibold uppercase leading-tight tracking-tight md:text-6xl">
            Planes claros y cotizador inteligente para tu próxima web
          </h1>
          <p className="raleway-subtitle mx-auto mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Elige un plan base para orientarte y después personaliza cada detalle de tu
            proyecto con una experiencia interactiva, descriptiva y pensada para tomar
            decisiones rápidas.
          </p>
        </section>
      </div>

      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <PricingCards />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24 pt-10 md:pb-28 md:pt-14">
        <Suspense fallback={<div className="min-h-[50vh] animate-pulse rounded-2xl bg-white/5" aria-hidden />}>
          <PreciosQuoteFlow />
        </Suspense>
      </section>

      <Footer />
    </main>
  )
}
