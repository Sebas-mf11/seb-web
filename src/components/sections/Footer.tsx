import Link from 'next/link'

import SiteLogo from '@/components/brand/SiteLogo'
import { PRECIOS_PERSONALIZA_HREF } from '@/lib/precios-personaliza-nav'
import { SEB_CONTACT_EMAIL } from '@/lib/site-contact'

export default function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-white/10 bg-transparent px-6 py-14 md:px-10 md:py-16"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <SiteLogo variant="footer" className="mx-0 h-16 sm:h-20 md:h-24" />
          <p className="raleway-subtitle mt-5 max-w-md text-sm font-medium leading-relaxed text-white/65">
            Diseñamos y desarrollamos sitios web con estrategia, rendimiento y estética para que tu marca venda mejor y se vea profesional en cada punto de contacto
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:col-span-7">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Páginas
            </p>
            <div className="space-y-2.5">
              <Link href="/" className="block text-sm text-white/75 transition-colors hover:text-white">
                Inicio
              </Link>
              <Link href="/servicios/desarrollo-web" className="block text-sm text-white/75 transition-colors hover:text-white">
                Servicios
              </Link>
              <Link href="/trabajos" className="block text-sm text-white/75 transition-colors hover:text-white">
                Trabajos
              </Link>
              <Link href="/precios" className="block text-sm text-white/75 transition-colors hover:text-white">
                Precios
              </Link>
              <Link href="/contacto" className="block text-sm text-white/75 transition-colors hover:text-white">
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
              Contacto
            </p>
            <div className="space-y-2.5 text-sm text-white/75">
              <Link href={PRECIOS_PERSONALIZA_HREF} className="block transition-colors hover:text-white">
                Cotizar
              </Link>
              <Link href="/servicios/desarrollo-web" className="block transition-colors hover:text-white">
                Ver servicios
              </Link>
              <Link href="/trabajos" className="block transition-colors hover:text-white">
                Ver trabajos
              </Link>
              <a
                href={`mailto:${SEB_CONTACT_EMAIL}`}
                className="block break-all transition-colors hover:text-white"
              >
                {SEB_CONTACT_EMAIL}
              </a>
              <p className="text-white/55">Atención online para proyectos en toda Latinoamérica</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 w-full max-w-7xl border-t border-white/10 pt-6">
        <p className="text-sm font-medium tracking-tight text-white/45">
          © {new Date().getFullYear()} SEB — Diseño y desarrollo web
        </p>
      </div>
    </footer>
  )
}
