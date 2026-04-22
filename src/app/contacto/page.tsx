import type { Metadata } from 'next'

import ContactFAQ from '@/components/contact/ContactFAQ'
import ContactHero from '@/components/contact/ContactHero'
import ContactLiveCTA from '@/components/contact/ContactLiveCTA'
import ContactSection from '@/components/contact/ContactSection'
import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import { buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Contacto — SEB',
  description:
    'Hablemos de tu proyecto web. WhatsApp, teléfono o formulario. Respondemos en menos de 24 horas.',
  keywords: [
    'contacto',
    'WhatsApp',
    'desarrollo web Bogotá',
    'cotizar página web',
    'SEB',
  ],
  path: '/contacto',
})

export default function ContactoPage() {
  return (
    <main className="min-h-svh bg-neutral-950 text-white antialiased">
      <div className="relative border-b border-white/10 bg-neutral-950">
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <ContactHero />
      </div>

      <ContactSection />
      <ContactFAQ />
      <ContactLiveCTA />

      <Footer />
    </main>
  )
}
