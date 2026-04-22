import type { Metadata } from 'next'
import dynamic from 'next/dynamic'

import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import HeroServices from '@/components/services-lab/HeroServices'
import WebAnatomy from '@/components/services-lab/WebAnatomy'
import { buildPageMetadata } from '@/lib/seo-metadata'

const InteractiveLab = dynamic(
  () => import('@/components/services-lab/InteractiveLab'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[320px] items-center justify-center bg-transparent px-6 py-24"
        aria-busy
        aria-label="Cargando laboratorio"
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-amber-400"
          aria-hidden
        />
      </div>
    ),
  },
)

export const metadata: Metadata = buildPageMetadata({
  title: 'Desarrollo web profesional — SEB',
  description:
    'Laboratorio interactivo de funcionalidades: ecommerce, sistemas de reservas, chatbots con IA, SEO y más. Descubre todo lo que tu web puede ser.',
  keywords: [
    'desarrollo web',
    'ecommerce',
    'reservas online',
    'chatbot',
    'SEO',
    'laboratorio web',
    'Colombia',
  ],
  path: '/servicios/desarrollo-web',
})

export default function DesarrolloWebPage() {
  return (
    <main className="min-h-svh bg-neutral-950 text-foreground antialiased">
      <div className="relative border-b border-white/10">
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <HeroServices />
      </div>

      <WebAnatomy />

      <div className="mx-auto h-px w-full max-w-[1400px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <InteractiveLab />

      <Footer />
    </main>
  )
}
