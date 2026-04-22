'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Calculator,
  CheckCircle2,
  Cpu,
  FileText,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface QuoteCalculatingProps {
  onComplete: () => void
}

const LOADING_PHRASES = [
  { icon: Cpu, text: 'Analizando las funcionalidades que elegiste' },
  { icon: Calculator, text: 'Calculando el plan ideal para tu proyecto' },
  { icon: FileText, text: 'Ajustando detalles según tu tipo de negocio' },
  { icon: Sparkles, text: 'Buscando la mejor combinación de valor' },
  { icon: CheckCircle2, text: 'Preparando tu propuesta personalizada' },
] as const

const DURATION_MS = 3500

export default function QuoteCalculating({ onComplete }: QuoteCalculatingProps) {
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)

  onCompleteRef.current = onComplete

  useEffect(() => {
    let cancelled = false
    const phraseInterval = window.setInterval(() => {
      setPhraseIndex((i) => (i + 1) % LOADING_PHRASES.length)
    }, 700)

    const started = performance.now()
    let raf = 0

    const tick = (now: number) => {
      if (cancelled) return
      const elapsed = now - started
      const p = Math.min(100, Math.round((elapsed / DURATION_MS) * 100))
      setProgress(p)
      if (elapsed < DURATION_MS) {
        raf = requestAnimationFrame(tick)
      } else {
        window.clearInterval(phraseInterval)
        setProgress(100)
        if (!cancelled) onCompleteRef.current()
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      window.clearInterval(phraseInterval)
      cancelAnimationFrame(raf)
    }
  }, [])

  const CurrentIcon = LOADING_PHRASES[phraseIndex].icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="flex min-h-[70vh] items-center justify-center px-6 py-12 md:min-h-[80vh]"
    >
      <div className="w-full max-w-lg text-center">
        <div className="relative mb-8 inline-flex items-center justify-center">
          <div className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/30 bg-white/5 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={phraseIndex}
                initial={{ scale: 0.5, opacity: 0, rotate: -30 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 30 }}
                transition={{ duration: 0.3 }}
              >
                <CurrentIcon className="h-8 w-8 text-amber-400" aria-hidden />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <h2 className="unbounded-heading mb-3 text-2xl font-semibold text-white md:text-3xl">
          Construyendo tu propuesta
        </h2>

        <div className="flex h-12 items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="raleway-subtitle text-base text-white/60"
            >
              {LOADING_PHRASES[phraseIndex].text}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="mt-8 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.08, ease: 'linear' }}
          />
        </div>

        <p className="mt-4 text-xs uppercase tracking-wider text-white/30">
          {progress}% completado
        </p>
      </div>
    </motion.div>
  )
}
