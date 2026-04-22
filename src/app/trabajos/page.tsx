export const runtime = 'edge';
import type { Metadata } from 'next'

import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import WorksShowcase from '@/components/works/WorksShowcase'
import { buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Trabajos y casos de éxito — SEB',
  description:
    'Portafolio SEB: sitios corporativos, blogs, ecommerce y plataformas con reservas. Diseño, desarrollo y conversión.',
  keywords: [
    'portafolio web',
    'casos de éxito',
    'proyectos web',
    'SEB',
    'Colombia',
  ],
  path: '/trabajos',
})

export default function TrabajosPage() {
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
          <source src="/videos/hero-trabajos.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/55" aria-hidden />
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-36 text-center md:pb-28 md:pt-44">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
            Portafolio
          </span>
          <h1 className="unbounded-heading mx-auto mt-6 max-w-4xl text-4xl font-semibold uppercase leading-tight tracking-tight md:text-6xl">
            Trabajos que reflejan estrategia, diseño y conversión
          </h1>
          <p className="raleway-subtitle mx-auto mt-5 max-w-3xl text-base font-medium leading-relaxed text-white/70 md:text-lg">
            Selecciona una tarjeta para abrir el detalle ampliado y recorrer capturas
            horizontales de cada proyecto. Luego reemplazamos estas imágenes por tus
            pantallazos finales.
          </p>
        </section>
      </div>

      <WorksShowcase />

      <Footer />
    </main>
  )
}
