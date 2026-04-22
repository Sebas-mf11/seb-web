'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

const FAQ_ITEMS = [
  {
    id: 'plazo',
    question: '¿Cuánto tarda en estar lista mi web?',
    answer:
      'Depende del plan. El plan Esencial toma entre 5 y 7 días hábiles, el Profesional entre 8 y 12, y el Avanzado entre 12 y 18. Te damos fecha exacta de entrega en la llamada inicial.',
  },
  {
    id: 'pagos',
    question: '¿Cómo son los pagos?',
    answer:
      'Trabajamos con un 50% de anticipo para iniciar el proyecto y el 50% restante contra entrega. Aceptamos transferencia bancaria, Nequi, Daviplata y Bre-b.',
  },
  {
    id: 'editar',
    question: '¿Puedo editar la web yo mismo después de la entrega?',
    answer:
      'Sí. Entregamos la web con un panel simple o instrucciones claras para que cambies textos, fotos y productos sin tocar código. Si quieres acompañamiento continuo, ofrecemos mantenimiento mensual.',
  },
  {
    id: 'soporte',
    question: '¿Qué incluye el soporte post-entrega?',
    answer:
      'Los primeros 15 días después de entregada la web incluyen ajustes menores sin costo. Después, puedes contratar el plan de mantenimiento mensual para tener soporte continuo, cambios y reportes de métricas.',
  },
] as const

export default function ContactFAQ() {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="border-t border-white/10 px-6 py-16 md:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="unbounded-heading text-2xl font-semibold uppercase tracking-tight text-white md:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="raleway-subtitle mt-3 text-sm font-medium leading-relaxed text-white/60 md:text-base">
          Las respuestas rápidas a lo que suelen preguntar antes de contactarnos.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-3xl space-y-2">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openId === item.id
          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.04]"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-medium uppercase tracking-tight text-white md:text-base">
                  {item.question}
                </span>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-amber-400/80 transition-transform duration-200',
                    isOpen ? 'rotate-180' : 'rotate-0',
                  )}
                  aria-hidden
                />
              </button>
              {isOpen ? (
                <div className="border-t border-white/10 px-5 pb-4 pt-3">
                  <p className="text-sm leading-relaxed text-white/65 md:text-[0.9375rem]">
                    {item.answer}
                  </p>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
