'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Mail, MessageCircle, Phone, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { trackContactFormSubmit, trackWhatsAppClick } from '@/lib/analytics'
import { SEB_CONTACT_EMAIL, getSebWhatsAppDigits } from '@/lib/site-contact'

/** Formato legible +57 XXX XXX XXXX a partir de dígitos (ej. 573113891980) */
function formatCoMobile(digits: string): string {
  const d = digits.replace(/\D/g, '')
  if (d.length >= 12 && d.startsWith('57')) {
    const rest = d.slice(2)
    return `+57 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`
  }
  if (d.length > 0) return `+${d}`
  return '+57 311 389 1980'
}

const HELP_OPTIONS = [
  'Necesito una web nueva',
  'Quiero renovar mi web actual',
  'Redes sociales y contenido',
  'Pauta en Meta (Facebook/Instagram)',
  'No estoy seguro, necesito asesoría',
] as const

const inputClass =
  'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 transition-colors focus:border-amber-400/50 focus:outline-none'
const labelClass = 'mb-2 block text-xs uppercase tracking-wider text-white/60'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export default function ContactSection() {
  const waDigits = getSebWhatsAppDigits()
  const phoneDisplay = formatCoMobile(waDigits)
  const telHref = `tel:+${waDigits}`
  const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(
    'Hola, me interesa saber más sobre sus servicios',
  )}`

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [])

  const resetForm = useCallback(() => {
    setName('')
    setEmail('')
    setPhone('')
    setCompany('')
    setTopic('')
    setMessage('')
    setConsent(false)
    setErrors({})
    setSuccess(false)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Ingresa tu nombre completo'
    if (!email.trim()) next.email = 'Ingresa tu correo electrónico'
    else if (!isValidEmail(email)) next.email = 'Ingresa un correo válido'
    if (!topic) next.topic = 'Selecciona una opción'
    if (!message.trim()) next.message = 'Cuéntanos un poco sobre tu proyecto'
    if (!consent) next.consent = 'Debes aceptar la política de datos para continuar'

    setErrors(next)
    if (Object.keys(next).length > 0) return

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setSuccess(true)
    trackContactFormSubmit()

    if (successTimer.current) clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => {
      resetForm()
      successTimer.current = null
    }, 3000)
  }

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 lg:grid-cols-5 lg:px-8">
      <div className="lg:col-span-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <h2 className="unbounded-heading text-2xl font-semibold uppercase tracking-tight text-white">
            Envíanos un mensaje
          </h2>
          <p className="raleway-subtitle mt-2 text-sm text-white/60">
            Completa los datos y te contactamos con una propuesta clara en menos de 24 horas.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="contact-name" className={labelClass}>
                Nombre completo
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. María González"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'contact-name-err' : undefined}
              />
              {errors.name ? (
                <p id="contact-name-err" className="mt-1.5 text-xs text-amber-400">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-email" className={labelClass}>
                Correo electrónico
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'contact-email-err' : undefined}
              />
              {errors.email ? (
                <p id="contact-email-err" className="mt-1.5 text-xs text-amber-400">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-phone" className={labelClass}>
                Teléfono <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </label>
              <input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-company" className={labelClass}>
                Empresa o negocio <span className="normal-case tracking-normal text-white/35">(opcional)</span>
              </label>
              <input
                id="contact-company"
                name="company"
                type="text"
                autoComplete="organization"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre del negocio"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="contact-topic" className={labelClass}>
                ¿En qué podemos ayudarte?
              </label>
              <select
                id="contact-topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat text-white`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.45)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                }}
                aria-invalid={Boolean(errors.topic)}
                aria-describedby={errors.topic ? 'contact-topic-err' : undefined}
              >
                <option value="" className="bg-neutral-900 text-white">
                  Selecciona una opción
                </option>
                {HELP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} className="bg-neutral-900 text-white">
                    {opt}
                  </option>
                ))}
              </select>
              {errors.topic ? (
                <p id="contact-topic-err" className="mt-1.5 text-xs text-amber-400">
                  {errors.topic}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Cuéntanos sobre tu proyecto
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe tu negocio, tus objetivos y lo que esperas lograr con el proyecto."
                className={`${inputClass} resize-y min-h-[7.5rem]`}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'contact-message-err' : undefined}
              />
              {errors.message ? (
                <p id="contact-message-err" className="mt-1.5 text-xs text-amber-400">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-amber-400 focus:ring-amber-400/40"
                  aria-invalid={Boolean(errors.consent)}
                />
                <span>
                  Acepto la{' '}
                  <Link
                    href="/politica-de-datos"
                    className="text-amber-400 underline-offset-2 transition-colors hover:text-amber-300 hover:underline"
                  >
                    política de tratamiento de datos personales
                  </Link>
                  .
                </span>
              </label>
              {errors.consent ? (
                <p className="mt-1.5 text-xs text-amber-400">{errors.consent}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 font-medium text-black transition-colors hover:bg-amber-300 disabled:opacity-70"
            >
              {success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-800" aria-hidden />
                  Mensaje enviado
                </>
              ) : loading ? (
                <>
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"
                    aria-hidden
                  />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden />
                  Enviar mensaje
                </>
              )}
            </button>

            {success ? (
              <p className="text-center text-sm text-white/60">
                Gracias por escribir. Te respondemos en las próximas horas.
              </p>
            ) : null}
          </form>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('contacto_tarjeta')}
          className="group block rounded-2xl border border-green-500/20 bg-green-500/10 p-6 transition-all hover:border-green-500/40 hover:bg-green-500/15"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-500/20">
              <MessageCircle className="h-6 w-6 text-green-400" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs uppercase tracking-wider text-green-400">Respuesta rápida</div>
              <div className="mb-1 text-lg font-medium text-white">WhatsApp</div>
              <div className="mb-3 text-sm text-white/60">
                Escríbenos directo. Respondemos en minutos durante horario laboral.
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-400 transition-all group-hover:gap-2">
                <span>{phoneDisplay}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </div>
            </div>
          </div>
        </a>

        <a
          href={telHref}
          className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Phone className="h-6 w-6 text-white/70" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Llamada directa</div>
              <div className="mb-1 text-lg font-medium text-white">Teléfono</div>
              <div className="mb-3 text-sm text-white/60">Lunes a viernes · 8:00 AM a 6:00 PM</div>
              <div className="flex items-center gap-1 text-sm font-medium text-white transition-all group-hover:gap-2">
                <span>{phoneDisplay}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </div>
            </div>
          </div>
        </a>

        <a
          href={`mailto:${SEB_CONTACT_EMAIL}`}
          className="group block rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/10"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
              <Mail className="h-6 w-6 text-white/70" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs uppercase tracking-wider text-white/50">Correo</div>
              <div className="mb-1 text-lg font-medium text-white">Email</div>
              <div className="mb-3 text-sm text-white/60">Propuestas detalladas y archivos grandes.</div>
              <div className="flex items-center gap-1 break-all text-sm font-medium text-white transition-all group-hover:gap-2">
                <span>{SEB_CONTACT_EMAIL}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </div>
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
