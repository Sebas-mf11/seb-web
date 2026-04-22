import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { buildPageMetadata } from '@/lib/seo-metadata'

type PlanParam = 'esencial' | 'profesional' | 'avanzado'

export const metadata: Metadata = buildPageMetadata({
  title: 'Cotiza tu web a medida — SEB',
  description:
    'Arma tu web con las funcionalidades que necesitas. Cotización instantánea y personalizada sin compromiso.',
  keywords: [
    'cotizar página web',
    'cotizador',
    'presupuesto web',
    'SEB',
    'Colombia',
  ],
  path: '/cotizador',
})

export default function CotizadorRedirectPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  const raw = searchParams.plan
  const plan =
    raw === 'esencial' || raw === 'profesional' || raw === 'avanzado'
      ? (raw as PlanParam)
      : null
  redirect(plan ? `/precios?plan=${plan}` : '/precios')
}
