'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Phone, Send, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { useQuoteStore } from '@/lib/stores/quoteStore'

interface ScheduleCallModalProps {
  open: boolean
  onClose: () => void
  /** Título del formulario (por defecto: agendar llamada desde cotización). */
  title?: string
  /** Texto bajo el título. */
  description?: string
}

const DEFAULT_TITLE = 'Agendar llamada'
const DEFAULT_DESCRIPTION = 'Déjanos tu nombre y teléfono y te llamamos sin costo'

export default function ScheduleCallModal({
  open,
  onClose,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
}: ScheduleCallModalProps) {
  const storedName = useQuoteStore((s) => s.clientInfo.name)
  const setClientInfo = useQuoteStore((s) => s.setClientInfo)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (open) {
      setName(storedName)
      setPhone('')
      setSuccess(false)
      setSubmitting(false)
    }
  }, [open, storedName])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSubmitting(false)
    setClientInfo({ name: name.trim() })
    setSuccess(true)
    window.setTimeout(() => {
      onClose()
      setSuccess(false)
    }, 2800)
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
    >
      <motion.div
        id="schedule-call-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-call-title"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-8"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-colors duration-300 hover:bg-white/5"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-400" aria-hidden />
            </div>
            <h3
              id="schedule-call-title"
              className="unbounded-heading mb-2 text-xl font-semibold text-white"
            >
              Listo
            </h3>
            <p className="raleway-subtitle text-sm text-white/60">En los próximos minutos te contactaremos</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3
                id="schedule-call-title"
                className="unbounded-heading mb-2 text-xl font-semibold text-white"
              >
                {title}
              </h3>
              <p className="raleway-subtitle text-sm text-white/60">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/60">
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/30 transition-colors duration-300 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/60">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +57 300 0000000"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/30 transition-colors duration-300 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <HoverBorderGradient
                type="submit"
                disabled={submitting}
                roundedClassName="rounded-xl"
                containerClassName="w-full"
                className="w-full justify-center gap-2 py-3 font-medium disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Enviando</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden />
                    <span>Enviar</span>
                  </>
                )}
              </HoverBorderGradient>

              <p className="text-center text-xs text-white/40">
                Nunca compartimos tus datos. Solo los usamos para contactarte por esta solicitud
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
