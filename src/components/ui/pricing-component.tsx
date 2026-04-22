'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'

import type { PlanKey } from '@/lib/stores/quoteStore'

const PLAN_LINK = (plan: PlanKey) => `/cotizador?plan=${plan}`

function FeatureList({
  items,
  variant,
}: {
  items: string[]
  variant: 'light' | 'dark' | 'amber'
}) {
  const text =
    variant === 'light'
      ? 'text-neutral-800'
      : variant === 'amber'
        ? 'text-amber-100/90'
        : 'text-neutral-300'
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 text-sm font-medium ${text}`}>
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" strokeWidth={2.5} aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PricingCards() {
  const esencialFeatures = [
    'Diseño responsive y personalizado',
    'Animaciones al scroll',
    'SEO técnico optimizado',
    'Dominio con SSL y hosting primer año',
    'Formulario de contacto y WhatsApp',
    'Hasta 5 páginas',
  ]

  const profesionalFeatures = [
    'Todo lo del plan Esencial',
    'Galería interactiva con filtros',
    'Blog integrado con categorías',
    'Video de fondo en hero',
    'Animaciones avanzadas',
    'Panel de administración',
    'Hasta 8 páginas',
  ]

  const avanzadoFeatures = [
    'Todo lo del plan Profesional',
    'Tienda online con Wompi o PayU',
    'Sistema de reservas completo',
    'Chatbot inteligente con IA',
    'Área de miembros con login',
    'Multi-idioma',
    'Páginas ilimitadas',
  ]

  return (
    <div className="w-full">
      <header className="mx-auto mb-12 max-w-3xl text-center md:mb-16">
        <span className="inline-flex items-center rounded-full border border-amber-300/35 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
          Planes
        </span>
        <h2 className="unbounded-heading mt-6 text-4xl font-semibold uppercase leading-tight tracking-tight text-white md:text-5xl">
          Tres formas de construir tu presencia digital
        </h2>
        <p className="raleway-subtitle mx-auto mt-5 text-base font-medium leading-relaxed text-white/70 md:text-lg">
          Cada plan pensado para un momento distinto de tu negocio. Todos incluyen diseño propio, SEO técnico y
          acompañamiento post-entrega.
        </p>
      </header>

      <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 xl:items-stretch">
        {/* Esencial */}
        <div
          className={[
            'rounded-3xl p-2',
            'bg-white/65 backdrop-blur-md',
            'border border-neutral-200/70',
            'shadow-[0_12px_40px_-15px_rgba(0,0,0,0.15)]',
            'ring-1 ring-inset ring-white/40',
          ].join(' ')}
        >
          <div
            className={[
              'mb-2 rounded-2xl p-8',
              'bg-white/80 backdrop-blur-sm',
              'border border-neutral-200/80',
              'ring-1 ring-inset ring-neutral-900/5',
            ].join(' ')}
          >
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-3xl font-bold uppercase tracking-tight text-neutral-900">Esencial</h3>
                <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-neutral-200 bg-white/70 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
                  Plan inicial
                </span>
              </div>
              <p className="mt-3 w-full text-justify text-sm font-medium leading-snug text-neutral-600 sm:text-[0.9375rem] sm:leading-snug">
                Para marcas nuevas que necesitan presencia digital sólida desde el primer día.
              </p>
            </div>

            <div className="mb-2">
              <div className="text-5xl font-bold tracking-tighter text-neutral-900">$600.000</div>
              <div className="mt-1 text-sm font-medium text-neutral-500">Pago único</div>
            </div>

            <Link
              href={PLAN_LINK('esencial')}
              className="mt-6 flex w-full items-center justify-center rounded-full border border-neutral-800/15 bg-transparent px-5 py-3.5 text-sm font-semibold text-neutral-900 transition-colors duration-300 hover:bg-neutral-900/[0.05]"
            >
              Empezar con Esencial
            </Link>
          </div>

          <div
            className={[
              'rounded-2xl px-6 pb-6 pt-4',
              'bg-white/50 backdrop-blur-sm',
              'border border-neutral-200/70',
              'ring-1 ring-inset ring-white/30',
            ].join(' ')}
          >
            <FeatureList items={esencialFeatures} variant="light" />
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
              Entrega en 5 a 7 días hábiles
            </p>
          </div>
        </div>

        {/* Profesional — destacado */}
        <div
          className={[
            'rounded-3xl p-2',
            'bg-neutral-900/70 backdrop-blur-md',
            'border-2 border-amber-400/50',
            'shadow-[0_0_48px_-12px_rgba(251,191,36,0.35),0_12px_50px_-15px_rgba(0,0,0,0.55)]',
            'ring-1 ring-inset ring-amber-200/20',
            'xl:relative xl:z-10 xl:-mt-2 xl:mb-2',
          ].join(' ')}
        >
          <div
            className={[
              'mb-2 rounded-2xl p-8',
              'bg-neutral-900/80 backdrop-blur-sm',
              'border border-amber-400/25',
              'ring-1 ring-inset ring-white/10',
            ].join(' ')}
          >
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-3xl font-bold uppercase tracking-tight text-neutral-50">Profesional</h3>
                <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur">
                  Más elegido
                </span>
              </div>
              <p className="mt-3 w-full text-justify text-sm font-medium leading-snug text-neutral-400 sm:text-[0.9375rem] sm:leading-snug">
                Para negocios establecidos que usan la web como motor real de ventas y credibilidad.
              </p>
            </div>

            <div className="mb-2">
              <div className="text-5xl font-bold tracking-tighter text-white">$800.000</div>
              <div className="mt-1 text-sm font-medium text-neutral-400">Pago único</div>
            </div>

            <Link
              href={PLAN_LINK('profesional')}
              className="mt-6 flex w-full items-center justify-center rounded-full bg-amber-400 px-5 py-3.5 text-sm font-semibold text-neutral-950 transition-colors duration-300 hover:bg-amber-300"
            >
              Empezar con Profesional
            </Link>
          </div>

          <div
            className={[
              'rounded-2xl px-6 pb-6 pt-4',
              'bg-neutral-900/60 backdrop-blur-sm',
              'border border-neutral-800',
              'ring-1 ring-inset ring-white/10',
            ].join(' ')}
          >
            <FeatureList items={profesionalFeatures} variant="dark" />
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-neutral-500">
              Entrega en 8 a 12 días hábiles
            </p>
          </div>
        </div>

        {/* Avanzado */}
        <div
          className={[
            'rounded-3xl p-2 md:col-span-2 xl:col-span-1',
            'bg-amber-400/15 backdrop-blur-md',
            'border border-amber-300/45',
            'shadow-[0_12px_50px_-15px_rgba(251,191,36,0.4)]',
            'ring-1 ring-inset ring-amber-100/25',
          ].join(' ')}
        >
          <div
            className={[
              'mb-2 rounded-2xl p-8',
              'bg-neutral-950/88 backdrop-blur-sm',
              'border border-amber-300/30',
              'ring-1 ring-inset ring-amber-100/10',
            ].join(' ')}
          >
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-3xl font-bold uppercase tracking-tight text-amber-100">Avanzado</h3>
                <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-amber-200/35 bg-amber-100/10 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur">
                  Escala sin límites
                </span>
              </div>
              <p className="mt-3 w-full text-justify text-sm font-medium leading-snug text-amber-100/85 sm:text-[0.9375rem] sm:leading-snug">
                Para empresas que quieren una web con capacidades enterprise: IA, tienda online y sistemas complejos.
              </p>
            </div>

            <div className="mb-2">
              <div className="text-5xl font-bold tracking-tighter text-amber-100">$1.200.000</div>
              <div className="mt-1 text-sm font-medium text-amber-100/60">Pago único</div>
            </div>

            <Link
              href={PLAN_LINK('avanzado')}
              className="mt-6 flex w-full items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/5 px-5 py-3.5 text-sm font-semibold text-amber-100 transition-colors duration-300 hover:bg-amber-400/10"
            >
              Empezar con Avanzado
            </Link>
          </div>

          <div
            className={[
              'rounded-2xl px-6 pb-6 pt-4',
              'bg-neutral-950/70 backdrop-blur-sm',
              'border border-amber-200/25',
            ].join(' ')}
          >
            <FeatureList items={avanzadoFeatures} variant="amber" />
            <p className="mt-6 text-center text-xs font-medium uppercase tracking-wider text-amber-200/70">
              Entrega en 12 a 18 días hábiles
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
