'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { useQuoteStore } from '@/lib/stores/quoteStore'

export default function FloatingQuoteButton() {
  const totalItems = useQuoteStore((state) => state.getTotalItems())
  const quoteFlowStep = useQuoteStore((state) => state.quoteFlowStep)
  const router = useRouter()
  const pathname = usePathname()
  const [justAdded, setJustAdded] = useState(false)
  const prevItems = useRef(totalItems)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (totalItems > prevItems.current) {
      setJustAdded(true)
      const timer = setTimeout(() => setJustAdded(false), 400)
      prevItems.current = totalItems
      return () => clearTimeout(timer)
    }
    prevItems.current = totalItems
    return undefined
  }, [totalItems])

  if (pathname === '/precios' || pathname === '/cotizador') return null
  if (quoteFlowStep !== 'configuring') return null

  return (
    <AnimatePresence>
      {totalItems > 0 ? (
        <motion.div
          initial={{ scale: 0, y: 20, opacity: 0 }}
          animate={{ scale: justAdded ? 1.08 : 1, y: 0, opacity: 1 }}
          exit={{ scale: 0, y: 20, opacity: 0 }}
          transition={
            reduceMotion
              ? { duration: 0.01 }
              : { type: 'spring', stiffness: 300, damping: 25 }
          }
          className="fixed bottom-20 right-6 z-50 sm:bottom-6"
        >
          <HoverBorderGradient
            type="button"
            onClick={() => router.push('/cotizador')}
            className="min-h-11 gap-3 px-5 py-4 text-sm font-medium shadow-[0_8px_32px_rgba(15,23,42,0.45)]"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5" aria-hidden />
              <motion.div
                key={totalItems}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-neutral-900"
              >
                {totalItems}
              </motion.div>
            </div>
            <span>Ver cotización</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </HoverBorderGradient>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
