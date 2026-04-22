'use client'

import { motion } from 'framer-motion'
import { Building, CheckCircle2, Mail, Send, User, X } from 'lucide-react'
import { useState } from 'react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { useQuoteStore } from '@/lib/stores/quoteStore'

interface LeadCaptureModalProps {
  open: boolean
  onClose: () => void
}

export default function LeadCaptureModal({ open, onClose }: LeadCaptureModalProps) {
  const clientInfo = useQuoteStore((s) => s.clientInfo)
  const setClientInfo = useQuoteStore((s) => s.setClientInfo)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    await new Promise((r) => setTimeout(r, 1500))

    setSubmitting(false)
    setSuccess(true)

    window.setTimeout(() => {
      onClose()
      setSuccess(false)
    }, 2500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-950 p-8"
      >
        <button
          type="button"
          onClick={onClose}
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
            <h3 className="mb-2 text-xl font-medium text-white">Propuesta enviada</h3>
            <p className="text-sm text-white/60">
              En los próximos minutos recibirás el detalle en tu correo. Revisa la carpeta de spam si no lo ves.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="mb-2 text-xl font-medium text-white">
                Recibe tu propuesta por email
              </h3>
              <p className="text-sm text-white/60">
                Te enviamos un PDF con el desglose completo y los pasos para arrancar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/60">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                  <input
                    type="text"
                    required
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ name: e.target.value })}
                    placeholder="Tu nombre"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/30 transition-colors duration-300 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/60">
                  Correo electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                  <input
                    type="email"
                    required
                    value={clientInfo.email}
                    onChange={(e) => setClientInfo({ email: e.target.value })}
                    placeholder="tu@correo.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/30 transition-colors duration-300 focus:border-amber-400/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-white/60">
                  Empresa o negocio{' '}
                  <span className="normal-case tracking-normal text-white/30">(opcional)</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" aria-hidden />
                  <input
                    type="text"
                    value={clientInfo.company}
                    onChange={(e) => setClientInfo({ company: e.target.value })}
                    placeholder="Nombre del negocio"
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
                    <span>Enviar propuesta</span>
                  </>
                )}
              </HoverBorderGradient>

              <p className="text-center text-xs text-white/40">
                Nunca compartimos tus datos. Solo los usamos para enviarte la propuesta.
              </p>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
