import type { Metadata } from 'next'
import Link from 'next/link'

import Footer from '@/components/sections/Footer'
import Navbar from '@/components/sections/Navbar'
import { SEB_CONTACT_EMAIL } from '@/lib/site-contact'
import { buildPageMetadata } from '@/lib/seo-metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Política de tratamiento de datos — SEB',
  description:
    'Información sobre el tratamiento de datos personales en el sitio de SEB. Para el texto legal completo o solicitudes, contáctanos.',
  keywords: [
    'política de datos',
    'privacidad',
    'SEB',
    'tratamiento de datos personales',
    'Colombia',
  ],
  path: '/politica-de-datos',
})

export default function PoliticaDatosPage() {
  return (
    <main className="min-h-svh bg-neutral-950 text-white antialiased">
      <div className="relative border-b border-white/10">
        <div className="absolute inset-x-0 top-0 z-20">
          <Navbar />
        </div>
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-36 md:pt-44">
          <h1 className="unbounded-heading text-3xl font-semibold leading-tight md:text-4xl">
            Política de tratamiento de datos personales
          </h1>
          <p className="raleway-subtitle mt-6 text-base leading-relaxed text-white/75">
            En SEB respetamos tu privacidad. Los datos que nos envías por formularios o
            canales de contacto se usan únicamente para responder solicitudes comerciales
            y prestar nuestros servicios. No vendemos ni compartimos tu información con
            terceros para fines ajenos a esa relación.
          </p>
          <p className="raleway-subtitle mt-4 text-base leading-relaxed text-white/75">
            Esta página resume nuestros principios. Si necesitas la política detallada,
            avisos legales para tu organización o ejercer derechos de habeas data en
            Colombia, escríbenos y te respondemos con el documento o la orientación
            adecuada.
          </p>
          <p className="raleway-subtitle mt-8 text-sm text-white/55">
            Contacto:{' '}
            <Link
              href="/contacto"
              className="font-medium text-amber-300 underline-offset-2 hover:text-amber-200 hover:underline"
            >
              formulario de contacto
            </Link>
            {' · '}
            <a
              href={`mailto:${SEB_CONTACT_EMAIL}`}
              className="font-medium text-amber-300 underline-offset-2 hover:text-amber-200 hover:underline"
            >
              {SEB_CONTACT_EMAIL}
            </a>
          </p>
        </section>
      </div>
      <Footer />
    </main>
  )
}
