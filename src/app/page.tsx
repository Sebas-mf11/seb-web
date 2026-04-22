import type { Metadata } from 'next'

import HomeJsonLd from '@/components/seo/HomeJsonLd'
import ClientLogosBand from '@/components/sections/ClientLogosBand'
import FeaturedWorks from '@/components/sections/FeaturedWorks'
import Footer from '@/components/sections/Footer'
import Hero from '@/components/sections/Hero'
import ManifestoAccordion from '@/components/sections/ManifestoAccordion'
import Navbar from '@/components/sections/Navbar'
import QuoterCTA from '@/components/sections/QuoterCTA'
import Services from '@/components/sections/Services'
import { BeamsBackground } from '@/components/ui/beams-background'
import { SectionDivider } from '@/components/ui/section-divider'
import { buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'SEB — Diseño y desarrollo web profesional',
  description:
    'Diseñamos páginas web a medida con enfoque en SEO, velocidad y seguridad. Planes desde $600.000 y primera consulta sin costo. Atendemos Colombia y Latinoamérica desde Bogotá.',
  keywords: [
    'diseño web',
    'desarrollo web',
    'páginas web Colombia',
    'SEO',
    'Bogotá',
    'PYMEs',
    'sitio web profesional',
  ],
  path: '/',
})

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <main>
      <div className="relative bg-neutral-950">
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <Hero />
      </div>

      <BeamsBackground intensity="medium">
        <div className="mx-auto w-full max-w-7xl px-4 pb-0 pt-10 md:px-8 md:pt-14">
          <ClientLogosBand />
          <SectionDivider />
        </div>

        <ManifestoAccordion />

        <div className="mx-auto w-full max-w-7xl px-4 pb-0 md:px-8">
          <SectionDivider />
          <Services />
          <SectionDivider />
          <FeaturedWorks />
        </div>

        <QuoterCTA />

        <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-24 md:px-8 md:pb-32 md:pt-32">
          <Footer />
        </div>
      </BeamsBackground>
    </main>
    </>
  )
}
