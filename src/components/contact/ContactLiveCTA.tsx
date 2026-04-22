'use client'

import { useState } from 'react'

import ScheduleCallModal from '@/components/quote/ScheduleCallModal'

export default function ContactLiveCTA() {
  const [callModalOpen, setCallModalOpen] = useState(false)

  return (
    <section className="border-t border-white/10 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="unbounded-heading text-2xl font-semibold text-white md:text-3xl">
          ¿Prefieres conversar en vivo?
        </h2>
        <p className="raleway-subtitle mt-3 text-sm font-medium leading-relaxed text-white/60 md:text-base">
          A veces una llamada corta resuelve más que 10 correos.
        </p>
        <button
          type="button"
          onClick={() => setCallModalOpen(true)}
          aria-expanded={callModalOpen}
          aria-controls="schedule-call-dialog"
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-8 py-3.5 text-base font-medium text-black transition-colors hover:bg-amber-300"
        >
          Agendar 20 minutos sin costo
          <span aria-hidden>→</span>
        </button>
      </div>

      <ScheduleCallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        title="Conversar en vivo"
        description="Déjanos tu nombre y teléfono y te llamamos sin costo"
      />
    </section>
  )
}
