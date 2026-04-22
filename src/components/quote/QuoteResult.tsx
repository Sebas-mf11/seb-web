'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Download,
  MessageCircle,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import ScheduleCallModal from '@/components/quote/ScheduleCallModal'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { trackQuoteResultViewed, trackWhatsAppClick } from '@/lib/analytics'
import { buildSebWhatsAppUrl } from '@/lib/site-contact'
import { MAINTENANCE_MONTHLY, useQuoteStore } from '@/lib/stores/quoteStore'
import { formatPrice } from '@/lib/utils'

interface QuoteResultProps {
  onBack: () => void
  onEmailRequest: () => void
}

export default function QuoteResult({ onBack, onEmailRequest }: QuoteResultProps) {
  const [scheduleCallOpen, setScheduleCallOpen] = useState(false)

  useEffect(() => {
    trackQuoteResultViewed()
  }, [])
  const { pages, includesMaintenance } = useQuoteStore(
    useShallow((s) => ({
      siteType: s.siteType,
      pages: s.pages,
      features: s.features,
      includesMaintenance: s.includesMaintenance,
      userPlanFloor: s.userPlanFloor,
    })),
  )
  const calculateQuote = useQuoteStore((s) => s.calculateQuote)
  const quote = calculateQuote()

  const handleScheduleCall = () => {
    setScheduleCallOpen(true)
  }

  const handleWhatsApp = () => {
    trackWhatsAppClick('quote_result')
    window.open(
      buildSebWhatsAppUrl(
        'Hola, acabo de ver el resultado de mi cotización en la página de precios de SEB y quiero coordinar los siguientes pasos',
      ),
      '_blank',
      'noopener,noreferrer',
    )
  }

  const planTitle =
    quote.plan.charAt(0).toUpperCase() + quote.plan.slice(1)

  const deliveryDays =
    quote.plan === 'esencial'
      ? '5 a 7'
      : quote.plan === 'profesional'
        ? '8 a 12'
        : '12 a 18'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45 }}
      className="min-h-[70vh] px-6 py-12 md:min-h-[80vh] md:py-16"
    >
      <div className="mx-auto max-w-5xl">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          type="button"
          onClick={onBack}
          className="mb-10 flex items-center gap-2 text-sm text-white/50 transition-colors duration-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span>Ajustar configuración</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
            <CheckCircle2 className="h-8 w-8 text-amber-400" aria-hidden />
          </div>
          <h1 className="unbounded-heading mb-4 text-3xl font-bold text-white md:text-5xl">
            Tu propuesta está lista
          </h1>
          <p className="raleway-subtitle max-w-2xl text-base text-white/60 md:text-lg">
            Esta es la cotización basada en lo que armaste. Los valores son estimados y podemos ajustarlos en una conversación corta según necesidades específicas.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mb-8 rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 to-transparent p-8 text-center md:p-12"
        >
          <div className="mb-3 text-xs uppercase tracking-[0.2em] text-amber-400/80">
            Valor estimado del proyecto
          </div>
          <div className="mb-2 text-5xl font-bold text-white md:text-7xl">
            ${formatPrice(quote.total)}
          </div>
          <div className="text-sm text-white/50">
            Pago único · Entrega en {deliveryDays} días hábiles
          </div>
          {includesMaintenance ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-amber-400" aria-hidden />
              Más ${formatPrice(MAINTENANCE_MONTHLY)} mensuales por mantenimiento
            </div>
          ) : null}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.45 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <h2 className="unbounded-heading mb-6 text-xl font-semibold text-white">
            Desglose de la propuesta
          </h2>

          <div className="space-y-4 divide-y divide-white/5">
            <div className="flex items-center justify-between pb-4">
              <div>
                <div className="font-medium text-white">Plan {planTitle}</div>
                <div className="mt-0.5 text-sm text-white/50">
                  {quote.includedFeatures.length} funcionalidades incluidas · {pages.length}{' '}
                  páginas
                </div>
              </div>
              <div className="text-lg font-medium text-white">
                ${formatPrice(quote.planPrice)}
              </div>
            </div>

            {quote.premiumExtras.length > 0 ? (
              <div className="py-4">
                <div className="mb-3 text-xs uppercase tracking-wider text-amber-400/80">
                  Módulos premium
                </div>
                <div className="space-y-2">
                  {quote.premiumExtras.map((extra) => (
                    <div key={extra.id} className="flex items-center justify-between">
                      <div className="text-sm text-white/80">{extra.title}</div>
                      <div className="text-sm font-medium text-amber-400">
                        +${formatPrice(extra.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {quote.extraPages > 0 ? (
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-white/80">
                    {quote.extraPages} páginas adicionales
                  </div>
                  <div className="mt-0.5 text-xs text-white/40">
                    Por encima del límite del plan
                  </div>
                </div>
                <div className="text-sm font-medium text-white">
                  +${formatPrice(quote.extraPagesPrice)}
                </div>
              </div>
            ) : null}

            {includesMaintenance ? (
              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="text-sm text-white/80">Mantenimiento mensual</div>
                  <div className="mt-0.5 text-xs text-white/40">
                    Primer mes incluido desde la entrega
                  </div>
                </div>
                <div className="text-sm font-medium text-white">
                  ${formatPrice(MAINTENANCE_MONTHLY)}/mes
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between pt-6">
              <div className="text-lg font-medium text-white">Total estimado</div>
              <div className="text-2xl font-bold text-amber-400">
                ${formatPrice(quote.total)}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.45 }}
          className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <h2 className="unbounded-heading mb-2 text-xl font-semibold text-white">¿Qué sigue?</h2>
          <p className="raleway-subtitle mb-6 text-sm text-white/60">
            Elige cómo quieres continuar. Todas las opciones son sin compromiso.
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <HoverBorderGradient
              type="button"
              roundedClassName="rounded-2xl"
              innerTone="light"
              containerClassName="h-full min-h-[148px]"
              className="h-full min-h-[148px] flex-col items-start justify-start gap-0 p-5 text-left text-neutral-900"
              onClick={handleScheduleCall}
            >
              <Calendar className="mb-3 h-5 w-5 text-neutral-700" aria-hidden />
              <div className="text-sm font-medium">Agendar llamada</div>
              <div className="mt-1 text-xs text-neutral-600">20 minutos sin costo</div>
            </HoverBorderGradient>

            <HoverBorderGradient
              type="button"
              roundedClassName="rounded-2xl"
              containerClassName="h-full min-h-[148px]"
              className="h-full min-h-[148px] flex-col items-start justify-start gap-0 p-5 text-left"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="mb-3 h-5 w-5 text-green-400" aria-hidden />
              <div className="text-sm font-medium">WhatsApp directo</div>
              <div className="mt-1 text-xs text-white/50">Respuesta en minutos</div>
            </HoverBorderGradient>

            <HoverBorderGradient
              type="button"
              roundedClassName="rounded-2xl"
              containerClassName="h-full min-h-[148px]"
              className="h-full min-h-[148px] flex-col items-start justify-start gap-0 p-5 text-left"
              onClick={onEmailRequest}
            >
              <Download className="mb-3 h-5 w-5 text-white/70" aria-hidden />
              <div className="text-sm font-medium">Recibir por email</div>
              <div className="mt-1 text-xs text-white/50">PDF con el detalle</div>
            </HoverBorderGradient>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.45 }}
          className="text-center text-xs text-white/40"
        >
          Los valores son estimados basados en la configuración que armaste. El precio final puede ajustarse según alcance específico, integraciones particulares o requerimientos técnicos del proyecto.
        </motion.p>
      </div>

      <ScheduleCallModal open={scheduleCallOpen} onClose={() => setScheduleCallOpen(false)} />
    </motion.div>
  )
}
