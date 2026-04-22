'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  CheckCircle,
  FileEdit,
  GripVertical,
  Home,
  Image as ImageIcon,
  Lock,
  MapPin,
  MessageCircle,
  Moon,
  Play,
  Search,
  Settings2,
  ShoppingCart,
  Sparkles,
  Sun,
  Wand2,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

export const MOCKUP_URL_BY_FEATURE: Record<string, string> = {
  reservas: 'minegocio.co/reservas',
  tienda: 'minegocio.co/tienda',
  cotizador: 'minegocio.co/cotizar',
  whatsapp: 'minegocio.co',
  formulario: 'minegocio.co/contacto',
  galeria: 'minegocio.co/galeria',
  blog: 'minegocio.co/blog',
  video: 'minegocio.co',
  menu: 'minegocio.co/carta',
  darkmode: 'minegocio.co',
  animaciones: 'minegocio.co',
  responsive: 'minegocio.co',
  identidad: 'minegocio.co/marca',
  mapa: 'minegocio.co/ubicacion',
  chatbot: 'minegocio.co',
  busqueda: 'minegocio.co/buscar',
  recomendaciones: 'minegocio.co/para-ti',
  generador: 'minegocio.co/admin',
  seo: 'google.com/search?q=tu+negocio',
  analytics: 'minegocio.co/analytics',
  idiomas: 'minegocio.co',
  dominio: 'minegocio.co',
  miembros: 'minegocio.co/login',
  panel: 'minegocio.co/admin',
}

export function getMockupUrlForFeature(featureId: string | null): string {
  if (!featureId) return 'minegocio.co'
  return MOCKUP_URL_BY_FEATURE[featureId] ?? 'minegocio.co'
}

export function MockDefaultBase({ dimmed }: { dimmed?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 transition-opacity duration-500 md:gap-6',
        dimmed && 'pointer-events-none opacity-25',
      )}
    >
      <div className="flex items-start gap-3 md:gap-4">
        <div className="size-10 shrink-0 rounded-lg bg-amber-400/40 md:size-12" aria-hidden />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-32 rounded bg-white/20 md:h-4 md:w-40" aria-hidden />
          <div className="h-2.5 w-44 rounded bg-white/10 md:h-3 md:w-56" aria-hidden />
        </div>
      </div>
      <div className="h-8 w-32 rounded-full bg-white/15 md:h-9 md:w-36" aria-hidden />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 md:p-3"
          >
            <div className="aspect-[4/3] w-full rounded-md bg-white/10" aria-hidden />
            <div className="h-2 w-full rounded bg-white/10" aria-hidden />
            <div className="h-2 w-[66%] rounded bg-white/5" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualReservas() {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const cells = Array.from({ length: 30 }, (_, i) => i + 1)
  const selectedDay = 14
  return (
    <div className="relative mx-auto w-full max-w-sm px-1">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-xl md:p-6">
        <p className="text-center text-sm font-medium text-white md:text-base">
          Reservar cita
        </p>
        <p className="mt-1 text-center text-[11px] text-white/50 md:text-xs">
          Selecciona fecha y hora
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[9px] font-medium uppercase tracking-wider text-white/40 md:mt-5 md:text-[10px]">
          {days.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((n) => {
            const pastSimulated = n <= 5
            const selected = n === selectedDay
            return (
              <div
                key={n}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-md text-[10px] text-white/60 md:text-xs',
                  pastSimulated && 'opacity-20',
                  selected &&
                    'border border-amber-400/50 bg-amber-400/20 font-medium text-amber-300',
                )}
              >
                {n}
              </div>
            )
          })}
        </div>
        <div className="mt-4 border-t border-white/10 pt-3 md:mt-5 md:pt-4">
          <p className="text-center text-[10px] font-medium uppercase tracking-wider text-white/50 md:text-xs">
            Horarios disponibles
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:mt-3">
            {['09:00', '11:00', '14:00', '16:00'].map((t) => (
              <span
                key={t}
                className={cn(
                  'rounded-md border px-2 py-1.5 text-center text-[10px] md:px-3 md:text-xs',
                  t === '14:00'
                    ? 'border-amber-400/50 bg-amber-400/20 text-amber-200'
                    : 'border-white/10 text-white/60',
                )}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-lg bg-amber-400 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 md:mt-6 md:py-2.5"
        >
          Confirmar reserva
        </button>
      </div>
    </div>
  )
}

const galleryGradients = [
  'from-sky-500/30 to-indigo-600/30',
  'from-amber-500/30 to-orange-600/30',
  'from-emerald-500/30 to-teal-600/30',
  'from-violet-500/30 to-fuchsia-600/30',
  'from-rose-500/30 to-red-600/30',
  'from-cyan-500/30 to-blue-600/30',
]

function VisualGaleria() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3 py-1 md:gap-4">
      <div className="flex flex-wrap gap-2">
        {['Todos', 'Cat 1', 'Cat 2'].map((f, i) => (
          <span
            key={f}
            className={cn(
              'rounded-full border px-2.5 py-1 text-[10px] md:px-3 md:text-xs',
              i === 0
                ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
                : 'border-white/10 text-white/50',
            )}
          >
            {f}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 md:gap-3">
        {galleryGradients.map((g, index) => (
          <motion.div
            key={g}
            className={cn(
              'aspect-[4/3] w-full rounded-xl bg-gradient-to-br ring-1 ring-white/10',
              g,
            )}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
          />
        ))}
      </div>
    </div>
  )
}

function VisualDarkmode() {
  const [light, setLight] = useState(false)
  return (
    <div
      className={cn(
        'relative flex w-full max-w-xl min-h-[320px] flex-col gap-4 rounded-xl p-3 transition-colors duration-500 md:min-h-[380px] md:gap-6 md:p-6',
        light ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-900/80 text-white',
      )}
    >
      <div className="absolute right-2 top-2 md:right-4 md:top-4">
        <button
          type="button"
          onClick={() => setLight((v) => !v)}
          className={cn(
            'flex size-9 items-center justify-center rounded-full border transition-all duration-300 md:size-10',
            light
              ? 'border-neutral-200 bg-white text-amber-600 shadow-sm'
              : 'border-white/15 bg-white/10 text-amber-300',
          )}
          aria-label={light ? 'Activar modo oscuro' : 'Activar modo claro'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {light ? (
              <motion.span
                key="sun"
                initial={{ opacity: 0, rotate: -40 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 40 }}
                transition={{ duration: 0.2 }}
              >
                <Sun className="size-4 md:size-5" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ opacity: 0, rotate: 40 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -40 }}
                transition={{ duration: 0.2 }}
              >
                <Moon className="size-4 md:size-5" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <div className="flex items-start gap-3 pr-10 md:gap-4 md:pr-12">
        <div
          className={cn(
            'size-10 shrink-0 rounded-lg md:size-12',
            light ? 'bg-amber-500/40' : 'bg-amber-400/35',
          )}
          aria-hidden
        />
        <div className="flex-1 space-y-2 pt-1">
          <div
            className={cn('h-3 w-36 rounded md:h-4 md:w-44', light ? 'bg-neutral-300' : 'bg-white/20')}
            aria-hidden
          />
          <div
            className={cn('h-2.5 w-44 rounded md:h-3 md:w-52', light ? 'bg-neutral-200' : 'bg-white/10')}
            aria-hidden
          />
        </div>
      </div>
      <div
        className={cn('h-8 w-36 rounded-full md:h-9 md:w-40', light ? 'bg-neutral-800/10' : 'bg-white/15')}
        aria-hidden
      />
      <div className="grid grid-cols-3 gap-1.5 md:gap-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col gap-1.5 rounded-xl border p-2 md:gap-2',
              light ? 'border-neutral-200 bg-white' : 'border-white/10 bg-white/[0.05]',
            )}
          >
            <div
              className={cn('aspect-[4/3] w-full rounded-md', light ? 'bg-neutral-200' : 'bg-white/10')}
              aria-hidden
            />
            <div className={cn('h-2 w-full rounded', light ? 'bg-neutral-200' : 'bg-white/10')} aria-hidden />
          </div>
        ))}
      </div>
    </div>
  )
}

const chatMessages = [
  { role: 'bot' as const, text: 'Hola, ¿en qué te puedo ayudar?' },
  { role: 'user' as const, text: 'Quiero saber sus servicios' },
  { role: 'bot' as const, text: 'Ofrecemos tres servicios principales para tu negocio' },
]

function VisualChatbot() {
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    setVisible(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= chatMessages.length; i += 1) {
      timers.push(setTimeout(() => setVisible(i), i * 400))
    }
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="relative w-full min-h-[360px] md:min-h-[440px]">
      <MockDefaultBase dimmed />
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 md:p-6">
        <div className="pointer-events-auto flex flex-col items-end gap-2 md:gap-3">
          <motion.div
            className="w-[min(100%,17rem)] overflow-hidden rounded-xl border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur-md md:w-[18rem]"
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.35 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="text-xs font-medium text-white md:text-sm">Asistente virtual</span>
              <span className="flex items-center gap-1 text-[9px] text-white/50 md:text-[10px]">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
                En línea
              </span>
            </div>
            <div className="flex max-h-48 flex-col gap-2 overflow-y-auto p-2.5 md:max-h-56 md:p-3">
              {chatMessages.slice(0, visible).map((m, i) => (
                <motion.div
                  key={`${m.role}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'max-w-[88%] rounded-lg px-2.5 py-1.5 text-[11px] leading-relaxed md:px-3 md:py-2 md:text-xs',
                    m.role === 'bot'
                      ? 'self-start bg-white/10 text-white/90'
                      : 'self-end bg-amber-400/20 text-white',
                  )}
                >
                  {m.text}
                </motion.div>
              ))}
            </div>
          </motion.div>
          <div className="flex size-11 items-center justify-center rounded-full bg-amber-400 text-neutral-950 shadow-lg shadow-amber-900/30 md:size-12">
            <MessageCircle className="size-4 md:size-5" strokeWidth={2} aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}

const tiendaProducts = [
  { g: 'from-violet-500/35 to-purple-700/35', price: '$ 120.000' },
  { g: 'from-sky-500/35 to-cyan-700/35', price: '$ 89.000' },
  { g: 'from-amber-500/35 to-orange-700/35', price: '$ 210.000' },
  { g: 'from-emerald-500/35 to-teal-700/35', price: '$ 45.000' },
]

function VisualTienda() {
  return (
    <div className="mx-auto w-full max-w-md px-1">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-5">
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {tiendaProducts.map((p, i) => (
            <motion.div
              key={p.price}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2 md:p-3"
            >
              <div className={cn('aspect-square w-full rounded-lg bg-gradient-to-br', p.g)} aria-hidden />
              <div className="mt-2 h-2 w-3/4 rounded bg-white/15" aria-hidden />
              <p className="mt-1.5 text-xs font-medium text-amber-400 md:text-sm">{p.price}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 md:mt-5">
          <div className="flex items-center gap-2 text-white/80">
            <ShoppingCart className="size-5" strokeWidth={1.75} aria-hidden />
            <span className="text-sm">Carrito</span>
          </div>
          <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-black">3</span>
        </div>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
        >
          Ir al carrito
        </button>
      </div>
    </div>
  )
}

function VisualCotizador() {
  return (
    <div className="mx-auto w-full max-w-sm px-1">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-5">
        <p className="text-center text-sm font-medium text-white md:text-base">Cotizá tu proyecto</p>
        <div className="mt-4 space-y-3 md:mt-5">
          <div>
            <p className="text-[10px] text-white/45 md:text-xs">Tipo de servicio</p>
            <div className="mt-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Desarrollo web
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/45 md:text-xs">Páginas</p>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <span className="text-xs text-white/70">Slider</span>
              <span className="text-xs font-medium text-white">5 páginas</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] text-white/45 md:text-xs">Extras</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['SEO', 'IA', 'Animaciones'].map((label, i) => (
                <span
                  key={label}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-[10px] md:text-xs',
                    i !== 2
                      ? 'border-amber-400/50 bg-amber-400/15 text-amber-100'
                      : 'border-white/10 text-white/40',
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="my-4 border-t border-white/10 md:my-5" />
        <p className="text-center text-2xl font-semibold text-amber-400 md:text-3xl">$ 1.200.000</p>
        <p className="mt-1 text-center text-[10px] text-white/45 md:text-xs">Cotización estimada</p>
        <button
          type="button"
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
        >
          Solicitar propuesta
        </button>
      </div>
    </div>
  )
}

function VisualWhatsapp() {
  return (
    <div className="relative w-full min-h-[340px] md:min-h-[400px]">
      <div className="absolute inset-0 overflow-hidden rounded-xl">
        <MockDefaultBase dimmed />
      </div>
      <div className="absolute bottom-3 right-3 flex items-center gap-2 md:bottom-5 md:right-5">
        <div className="relative mr-1 rounded-xl border border-white/15 bg-neutral-900/95 px-3 py-2 text-xs text-white shadow-lg backdrop-blur-md md:text-sm">
          ¿Hablamos?
          <span className="absolute -right-1 top-1/2 size-2 -translate-y-1/2 rotate-45 border-r border-t border-white/15 bg-neutral-900/95" />
        </div>
        <motion.button
          type="button"
          className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ring-4 ring-green-500/30 animate-pulse md:size-14"
          aria-label="Abrir WhatsApp"
        >
          <MessageCircle className="size-6 md:size-7" strokeWidth={2} aria-hidden />
        </motion.button>
      </div>
    </div>
  )
}

function VisualFormulario() {
  return (
    <div className="mx-auto w-full max-w-md px-1">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-6">
        <p className="text-center text-sm font-medium text-white md:text-base">Dejanos tu mensaje</p>
        <div className="mt-4 space-y-3 md:mt-5">
          <input
            readOnly
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 placeholder:text-white/35 md:px-4 md:text-sm"
            placeholder="Tu nombre"
          />
          <input
            readOnly
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 placeholder:text-white/35 md:px-4 md:text-sm"
            placeholder="tu@email.com"
          />
          <textarea
            readOnly
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 placeholder:text-white/35 md:px-4 md:text-sm"
            placeholder="Tu mensaje"
          />
          <label className="flex items-center gap-2 text-[11px] text-white/50 md:text-xs">
            <span className="size-3.5 rounded border border-white/20 bg-amber-400/20" aria-hidden />
            Acepto política de datos
          </label>
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
        >
          Enviar mensaje
        </button>
      </div>
    </div>
  )
}

function VisualBlog() {
  const posts = [
    { tag: 'Diseño', tagClass: 'bg-amber-400/20 text-amber-200 border-amber-400/30' },
    { tag: 'Marketing', tagClass: 'bg-sky-500/20 text-sky-200 border-sky-400/30' },
    { tag: 'Tecnología', tagClass: 'bg-teal-500/20 text-teal-200 border-teal-400/30' },
  ]
  return (
    <div className="w-full max-w-lg">
      <p className="mb-3 text-sm font-medium text-white md:mb-4 md:text-base">Últimos artículos</p>
      <div className="space-y-3 md:space-y-4">
        {posts.map((p, i) => (
          <motion.div
            key={p.tag}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35 }}
            className={cn(
              'rounded-xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-sm md:p-4',
              i === 0 && 'border-amber-400/25 bg-white/[0.08]',
            )}
          >
            {i === 0 ? (
              <div className="mb-3 aspect-[2/1] w-full rounded-xl bg-gradient-to-br from-amber-500/25 via-violet-600/25 to-sky-600/25" aria-hidden />
            ) : null}
            <span
              className={cn(
                'inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium md:text-xs',
                p.tagClass,
              )}
            >
              {p.tag}
            </span>
            <div className="mt-2 space-y-1.5">
              <div className="h-2.5 w-full max-w-[90%] rounded bg-white/15" aria-hidden />
              <div className="h-2.5 w-full max-w-[70%] rounded bg-white/10" aria-hidden />
            </div>
            <p className="mt-2 text-[10px] text-white/40 md:text-xs">Hace 3 días · 4 min de lectura</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualVideo() {
  return (
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl">
      <motion.div
        className="relative flex min-h-[220px] items-center justify-center bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-amber-900/40 md:min-h-[280px]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-amber-900/40 animate-[pulse_8s_ease-in-out_infinite]" aria-hidden />
        <div className="relative z-[1] flex flex-col items-center gap-3 px-4 text-center">
          <div className="h-4 w-48 rounded bg-white/25 md:h-5 md:w-56" aria-hidden />
          <div className="h-3 w-36 rounded bg-white/15" aria-hidden />
          <button
            type="button"
            className="mt-2 flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
            aria-label="Reproducir"
          >
            <Play className="ml-0.5 size-6" fill="currentColor" aria-hidden />
          </button>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md border border-red-500/40 bg-black/50 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-red-300 backdrop-blur-sm">
          <span className="size-1.5 animate-pulse rounded-full bg-red-500" aria-hidden />
          LIVE
        </div>
      </motion.div>
    </div>
  )
}

function VisualMenu() {
  const platos = [1, 2, 3, 4]
  return (
    <div className="w-full max-w-md">
      <p className="text-center text-sm font-medium text-white md:text-base">Nuestra carta</p>
      <div className="mt-3 flex justify-center gap-2 border-b border-white/10 pb-3 md:mt-4">
        {['Entradas', 'Principales', 'Postres'].map((t, i) => (
          <span
            key={t}
            className={cn(
              'rounded-full px-3 py-1 text-[10px] md:text-xs',
              i === 1 ? 'bg-amber-400/20 text-amber-100' : 'text-white/45',
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 divide-y divide-white/10 md:mt-4">
        {platos.map((_, i) => (
          <div key={i} className="flex gap-3 py-3 first:pt-0">
            <div
              className="size-12 shrink-0 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-700/30 md:size-14"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="h-2.5 w-28 rounded bg-white/15" aria-hidden />
              <div className="mt-1.5 h-2 w-full max-w-[200px] rounded bg-white/10" aria-hidden />
              <p className="mt-2 text-xs font-medium text-amber-400 md:text-sm">$ {(i + 1) * 18}.000</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualAnimaciones() {
  const [cycle, setCycle] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCycle((c) => c + 1), 4000)
    return () => clearInterval(t)
  }, [])
  const cards = [
    'from-violet-500/40 to-indigo-700/40',
    'from-amber-500/40 to-orange-700/40',
    'from-emerald-500/40 to-teal-700/40',
  ]
  return (
    <div className="w-full max-w-lg">
      <div className="mb-3 flex items-center justify-center gap-2 text-center text-xs text-white/70 md:text-sm">
        <Wand2 className="size-4 text-amber-400/90" aria-hidden />
        Animaciones al hacer scroll
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={cycle}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {cards.map((g, i) => (
            <motion.div
              key={`${cycle}-${g}`}
              className={cn('h-[100px] rounded-xl bg-gradient-to-br md:h-[120px]', g)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.4 }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function VisualResponsive() {
  const devices = [
    { label: 'Desktop', w: 'w-full max-w-[140px] md:max-w-[180px]', h: 'h-[100px] md:h-[120px]' },
    { label: 'Tablet', w: 'w-full max-w-[100px] md:max-w-[120px]', h: 'h-[120px] md:h-[140px]' },
    { label: 'Móvil', w: 'w-[56px] md:w-[64px]', h: 'h-[140px] md:h-[160px]' },
  ]
  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-4 md:flex-row md:justify-center md:gap-6">
      {devices.map((d, i) => (
        <motion.div
          key={d.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="flex flex-col items-center gap-2"
        >
          <div
            className={cn(
              'overflow-hidden rounded-xl border border-white/15 bg-neutral-900/80 p-1.5 shadow-inner',
              d.w,
              d.h,
            )}
          >
            <div className="flex h-2 w-full items-center gap-0.5 rounded bg-white/10 px-1">
              <span className="size-0.5 rounded-full bg-white/30" />
              <span className="size-0.5 rounded-full bg-white/30" />
            </div>
            <div className="mt-1 space-y-1 p-1">
              <div className="h-1.5 w-3/4 rounded bg-white/15" />
              <div className="h-1 w-1/2 rounded bg-white/10" />
              <div className="mt-1 grid grid-cols-2 gap-0.5">
                <div className="h-6 rounded bg-white/10" />
                <div className="h-6 rounded bg-white/10" />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-white/45 md:text-xs">{d.label}</span>
        </motion.div>
      ))}
    </div>
  )
}

function VisualIdentidad() {
  return (
    <div className="grid w-full max-w-xl grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      <div className="col-span-2 flex gap-1 rounded-xl border border-white/10 bg-white/[0.05] p-3 md:col-span-1 md:flex-col">
        {['bg-amber-400', 'bg-sky-500', 'bg-violet-500', 'bg-emerald-500'].map((c) => (
          <div key={c} className={cn('h-8 flex-1 rounded-md', c)} aria-hidden />
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
        <p className="text-lg text-white/90 md:text-xl">Marca</p>
        <p className="text-xs text-white/50 md:text-sm">negocio</p>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-white/10 bg-amber-400/25 p-3 text-sm font-bold text-neutral-900">
        MB
      </div>
      <div
        className="rounded-xl border border-white/10 bg-[repeating-linear-gradient(135deg,transparent,transparent_4px,rgba(255,255,255,0.06)_4px,rgba(255,255,255,0.06)_5px)] p-4"
        aria-hidden
      />
      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
        <div className="h-2 w-full rounded bg-white/15" />
        <div className="mt-2 h-8 rounded-lg bg-amber-400/20" />
      </div>
      <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] p-3">
        <Sparkles className="size-8 text-amber-400/80" aria-hidden />
      </div>
    </div>
  )
}

function VisualMapa() {
  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-800">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent 1px),linear-gradient(rgba(255,255,255,0.06)_1px,transparent 1px)',
            backgroundSize: '18px 18px',
          }}
        />
        {[12, 28, 44].map((l) => (
          <div
            key={l}
            className="absolute size-2 rounded-sm bg-white/10"
            style={{ left: `${l}%`, top: `${30 + (l % 20)}%` }}
            aria-hidden
          />
        ))}
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="flex size-10 items-center justify-center rounded-full border-2 border-amber-400/70 bg-amber-400/25 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.35)]">
            <MapPin className="size-5" aria-hidden />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
        <p className="text-sm font-medium text-white">Mi Negocio Centro</p>
        <p className="mt-1 text-xs text-white/50">Calle 10 # 20-30, Bogotá</p>
        <p className="mt-2 text-xs text-white/45">Lun a Vie 9:00 — 18:00</p>
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-amber-400 py-2 text-sm font-semibold text-black"
        >
          Cómo llegar
        </button>
      </div>
    </div>
  )
}

function VisualBusqueda() {
  const results = [
    { title: 'Pack regalo premium', pct: '92% coincide' },
    { title: 'Accesorios elegantes', pct: '87% coincide' },
    { title: 'Guía de tallas', pct: '76% coincide' },
  ]
  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2.5 md:px-4">
        <Search className="size-4 shrink-0 text-white/50" aria-hidden />
        <span className="text-xs text-white/35 md:text-sm">¿Qué estás buscando?</span>
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-xs text-white/70 md:text-sm">
        <span>algo para un regalo de cumpleaños elegante</span>
        <motion.span
          className="ml-0.5 inline-block h-4 w-px bg-amber-400 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          aria-hidden
        />
      </div>
      <div className="space-y-2">
        {results.map((r, i) => (
          <motion.div
            key={r.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.35 }}
            className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3"
          >
            <div className="mt-0.5 size-8 shrink-0 rounded-lg bg-white/10" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-white md:text-sm">{r.title}</p>
              <p className="mt-1 text-[10px] text-white/45 md:text-xs">Descripción breve del resultado sugerido por la búsqueda</p>
              <p className="mt-1.5 text-[10px] font-medium text-amber-400 md:text-xs">{r.pct}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function VisualRecomendaciones() {
  const g = [
    'from-violet-500/35 to-purple-700/35',
    'from-amber-500/35 to-orange-700/35',
    'from-sky-500/35 to-cyan-700/35',
    'from-emerald-500/35 to-teal-700/35',
  ]
  return (
    <div className="relative w-full max-w-md">
      <div className="mb-3 flex items-center justify-center gap-2 text-xs text-white/70 md:text-sm">
        <Sparkles className="size-4 text-amber-400" aria-hidden />
        Basado en lo que has visto
      </div>
      <div className="relative grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
        <div className="absolute left-[22%] top-[40%] hidden h-px w-[56%] border-t border-dashed border-amber-400/40 md:block" aria-hidden />
        {g.map((grad, i) => (
          <motion.div
            key={grad}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className={cn(
              'relative overflow-hidden rounded-xl border border-white/10 p-2',
              i === 1 && 'ring-2 ring-amber-400/50',
            )}
          >
            {i === 1 ? (
              <span className="absolute right-1 top-1 rounded-md bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-semibold text-black">
                Para ti
              </span>
            ) : null}
            <div className={cn('aspect-square w-full rounded-lg bg-gradient-to-br', grad)} aria-hidden />
            <div className="mt-2 h-2 w-2/3 rounded bg-white/10" aria-hidden />
            <p className="mt-1 text-[10px] font-medium text-amber-400 md:text-xs">$ 95.000</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const generadorText =
  'Sillón de diseño contemporáneo, tapizado en tela premium, ideal para espacios modernos y confortables'

const GENERADOR_WORDS = generadorText.split(' ')

function VisualGenerador() {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    setShown(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i <= GENERADOR_WORDS.length; i += 1) {
      timers.push(setTimeout(() => setShown(i), i * 120))
    }
    return () => timers.forEach(clearTimeout)
  }, [])
  return (
    <div className="mx-auto w-full max-w-lg px-1">
      <p className="text-center text-sm font-medium text-white md:text-base">Generar descripción</p>
      <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs text-white/55 md:mt-5 md:p-4 md:text-sm">
        Escribe sobre un sillón moderno para sala de estar...
      </div>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-black transition hover:bg-amber-300"
      >
        <Sparkles className="size-4" aria-hidden />
        Generar con IA
      </button>
      <div className="mt-4 min-h-[4.5rem] rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-white/80 md:min-h-[5rem] md:p-4">
        {GENERADOR_WORDS.slice(0, shown).map((w, i) => (
          <motion.span
            key={`${i}-${w}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-block mr-1"
          >
            {w}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

function VisualSeo() {
  return (
    <div className="w-full max-w-xl">
      <div className="rounded-xl bg-white p-3 text-neutral-800 shadow-xl md:p-4">
        <p className="text-[10px] text-neutral-500 md:text-xs">google.com/search?q=tu+negocio</p>
        <div className="mt-3 flex flex-col gap-3 border-t border-neutral-200 pt-3 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-emerald-700 md:text-sm">minegocio.co</p>
            <p className="mt-1 text-sm font-medium text-blue-700 md:text-base">
              Mi Negocio — Servicios profesionales
            </p>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600 md:text-sm">
              Líder en su sector desde 2020. Conoce nuestros servicios, precios y casos de éxito...
            </p>
          </div>
          <div className="flex shrink-0 gap-2 md:flex-col">
            {[
              { v: '98', l: 'Performance' },
              { v: '100', l: 'SEO' },
              { v: '95', l: 'Accesibilidad' },
            ].map((s) => (
              <div
                key={s.l}
                className="flex flex-col items-center rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 md:px-3"
              >
                <span className="text-sm font-bold text-emerald-700 md:text-base">{s.v}</span>
                <span className="text-[9px] text-emerald-800 md:text-[10px]">{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualAnalytics() {
  return (
    <div className="w-full max-w-xl overflow-x-auto">
      <div className="min-w-[280px] space-y-4 rounded-xl border border-white/10 bg-white/[0.05] p-4 md:p-5">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {[
            { k: 'Visitantes', v: '1.847', d: '+12%' },
            { k: 'Conversiones', v: '42', d: '+8%' },
            { k: 'Tiempo promedio', v: '3:24', d: '—' },
          ].map((m, i) => (
            <motion.div
              key={m.k}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="rounded-xl border border-white/10 bg-black/30 p-2 md:p-3"
            >
              <p className="text-[9px] text-white/45 md:text-[10px]">{m.k}</p>
              <p className="mt-1 text-lg font-semibold text-white md:text-xl">{m.v}</p>
              <p className="text-[10px] text-emerald-400 md:text-xs">{m.d}</p>
            </motion.div>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-3">
          <svg viewBox="0 0 200 80" className="h-20 w-full text-amber-400" aria-hidden>
            <motion.path
              d="M0,60 Q50,20 100,45 T200,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
            />
          </svg>
        </div>
        <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-[10px] text-white/60 md:text-xs">
          <p>Página más vista: /servicios — 42%</p>
          <p>/inicio — 35%</p>
          <p>/contacto — 18%</p>
        </div>
      </div>
    </div>
  )
}

const idiomasLineas = [
  'Bienvenido a nuestra tienda',
  'Welcome to our store',
  'Bem-vindo à nossa loja',
]

function VisualIdiomas() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % idiomasLineas.length), 2000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute right-2 top-0 z-10 flex gap-1 rounded-lg border border-white/10 bg-black/40 p-1 backdrop-blur-sm md:right-3">
        {['ES', 'EN', 'PT'].map((code, i) => (
          <span
            key={code}
            className={cn(
              'rounded-md px-2 py-0.5 text-[10px] font-medium md:text-xs',
              i === idx % 3 ? 'bg-amber-400/25 text-amber-100' : 'text-white/45',
            )}
          >
            {code}
          </span>
        ))}
      </div>
      <div className="pt-10">
        <MockDefaultBase />
        <AnimatePresence mode="wait">
          <motion.p
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 text-center text-sm text-white/80 md:text-base"
          >
            {idiomasLineas[idx]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function VisualDominio() {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-sm text-white md:text-base">
          <Lock className="size-4 text-emerald-400" aria-hidden />
          <span className="text-emerald-300">Conexión segura</span>
        </div>
        <p className="mt-2 text-center text-xs text-white/60 md:text-sm">minegocio.co</p>
      </div>
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.05] p-4">
        {['Dominio propio registrado', 'Certificado SSL', 'Hosting Cloudflare incluido'].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs text-white/75 md:text-sm">
            <CheckCircle className="size-4 shrink-0 text-amber-400" aria-hidden />
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualMiembros() {
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-5">
        <p className="text-center text-sm font-medium text-white md:text-base">Iniciá sesión</p>
        <input
          readOnly
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50 md:px-4 md:text-sm"
          placeholder="tu@email.com"
        />
        <input
          readOnly
          type="password"
          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs md:px-4 md:text-sm"
          placeholder="••••••••"
        />
        <label className="mt-3 flex items-center gap-2 text-[11px] text-white/50 md:text-xs">
          <span className="size-3.5 rounded border border-white/20 bg-amber-400/15" aria-hidden />
          Recordarme
        </label>
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-black"
        >
          Ingresar
        </button>
        <div className="my-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] text-white/40">o</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <button
          type="button"
          className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-sm text-white transition hover:bg-white/10"
        >
          Crear cuenta
        </button>
        <p className="mt-3 text-center text-[10px] text-white/40 md:text-xs">
          Zona exclusiva para clientes registrados
        </p>
      </div>
    </div>
  )
}

const panelBlocks = [
  'Hero — Título y subtítulo',
  'Servicios — 3 tarjetas',
  'Galería — 6 imágenes',
  'Contacto — Formulario',
]

function VisualPanel() {
  return (
    <div className="flex w-full max-w-2xl gap-2 overflow-x-auto md:gap-3">
      <aside className="flex w-12 shrink-0 flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-2 md:w-14">
        <Home className="mx-auto size-4 text-white/50" aria-hidden />
        <FileEdit className="mx-auto size-4 text-white/50" aria-hidden />
        <ImageIcon className="mx-auto size-4 text-white/50" aria-hidden />
        <Settings2 className="mx-auto size-4 text-white/50" aria-hidden />
      </aside>
      <div className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.05] p-3 md:p-4">
        <p className="text-xs font-medium text-white md:text-sm">Editar: Página de inicio</p>
        <div className="mt-3 space-y-2">
          {panelBlocks.map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-2.5 transition hover:bg-white/10 md:p-3"
            >
              <GripVertical className="size-4 shrink-0 text-white/30" aria-hidden />
              <span className="min-w-0 flex-1 text-[11px] text-white/75 md:text-xs">{b}</span>
              <span className="text-[10px] text-amber-400/90">editar</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VisualPlaceholder() {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.04] p-8 text-center text-sm text-white/45">
      Visualización en preparación
    </div>
  )
}

export function renderFeatureVisual(featureId: string) {
  switch (featureId) {
    case 'reservas':
      return <VisualReservas />
    case 'galeria':
      return <VisualGaleria />
    case 'darkmode':
      return <VisualDarkmode />
    case 'chatbot':
      return <VisualChatbot />
    case 'tienda':
      return <VisualTienda />
    case 'cotizador':
      return <VisualCotizador />
    case 'whatsapp':
      return <VisualWhatsapp />
    case 'formulario':
      return <VisualFormulario />
    case 'blog':
      return <VisualBlog />
    case 'video':
      return <VisualVideo />
    case 'menu':
      return <VisualMenu />
    case 'animaciones':
      return <VisualAnimaciones />
    case 'responsive':
      return <VisualResponsive />
    case 'identidad':
      return <VisualIdentidad />
    case 'mapa':
      return <VisualMapa />
    case 'busqueda':
      return <VisualBusqueda />
    case 'recomendaciones':
      return <VisualRecomendaciones />
    case 'generador':
      return <VisualGenerador />
    case 'seo':
      return <VisualSeo />
    case 'analytics':
      return <VisualAnalytics />
    case 'idiomas':
      return <VisualIdiomas />
    case 'dominio':
      return <VisualDominio />
    case 'miembros':
      return <VisualMiembros />
    case 'panel':
      return <VisualPanel />
    default:
      return <VisualPlaceholder />
  }
}
