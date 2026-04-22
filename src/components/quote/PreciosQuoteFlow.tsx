'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { type PlanKey, useQuoteStore } from '@/lib/stores/quoteStore'

import LeadCaptureModal from './LeadCaptureModal'
import QuoteCalculating from './QuoteCalculating'
import QuoteResult from './QuoteResult'
import SmartQuoteBuilder from './SmartQuoteBuilder'

export default function PreciosQuoteFlow() {
  const quoteFlowStep = useQuoteStore((s) => s.quoteFlowStep)
  const setQuoteFlowStep = useQuoteStore((s) => s.setQuoteFlowStep)
  const setUserPlanFloor = useQuoteStore((s) => s.setUserPlanFloor)
  const searchParams = useSearchParams()
  const [leadModalOpen, setLeadModalOpen] = useState(false)

  useEffect(() => {
    const raw = searchParams.get('plan')
    if (raw === 'esencial' || raw === 'profesional' || raw === 'avanzado') {
      setUserPlanFloor(raw as PlanKey)
    }
  }, [searchParams, setUserPlanFloor])

  const handleCalculatingComplete = useCallback(() => {
    setQuoteFlowStep('result')
  }, [setQuoteFlowStep])

  return (
    <>
      <AnimatePresence mode="wait">
        {quoteFlowStep === 'configuring' ? (
          <motion.div
            key="configuring"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-10 max-w-3xl">
              <h2 className="unbounded-heading text-3xl font-semibold leading-tight md:text-4xl">
                Personaliza tu página
              </h2>
              <p className="raleway-subtitle mt-4 text-base font-medium leading-relaxed text-white/70">
                Configura tipo de web, estructura de páginas y funcionalidades. Verás un resumen del plan
                mientras ajustas y, al pulsar Cotizar ahora, verás el precio estimado y los siguientes pasos
              </p>
            </div>
            <SmartQuoteBuilder />
          </motion.div>
        ) : null}

        {quoteFlowStep === 'calculating' ? (
          <QuoteCalculating key="calculating" onComplete={handleCalculatingComplete} />
        ) : null}

        {quoteFlowStep === 'result' ? (
          <QuoteResult
            key="result"
            onBack={() => setQuoteFlowStep('configuring')}
            onEmailRequest={() => setLeadModalOpen(true)}
          />
        ) : null}
      </AnimatePresence>

      <LeadCaptureModal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
    </>
  )
}
