'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type InteractiveAccordionItem = {
  id: number
  title: string
  desc: string
  imageUrl: string
}

export interface InteractiveImageAccordionProps {
  headline: string
  subtitle: string
  cta: { label: string; href: string }
  items: InteractiveAccordionItem[]
  /** Índice inicial activo (0-based). */
  defaultActiveIndex?: number
  /** `dark` encaja con el home SEB; `light` replica el demo claro. */
  variant?: 'light' | 'dark'
  className?: string
}

type AccordionItemProps = {
  item: InteractiveAccordionItem
  isActive: boolean
  onActivate: () => void
  variant: 'light' | 'dark'
  accentSlide: boolean
}

function AccordionItem({
  item,
  isActive,
  onActivate,
  variant,
  accentSlide,
}: AccordionItemProps) {
  const [src, setSrc] = useState(item.imageUrl)

  return (
    <button
      type="button"
      className={cn(
        'relative min-h-[min(320px,52vh)] cursor-pointer overflow-hidden rounded-2xl border text-left transition-[flex-grow,flex-basis,min-width] duration-700 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/90 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 md:min-h-[min(420px,56vh)] lg:min-h-[450px]',
        variant === 'dark'
          ? 'border-white/10'
          : 'border-gray-200 shadow-sm',
        isActive
          ? 'min-w-0 flex-1 basis-0'
          : 'w-11 shrink-0 basis-11 sm:w-12 sm:basis-12 md:w-[60px] md:basis-[60px]',
      )}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-expanded={isActive}
    >
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 768px) 70vw, 50vw"
        onError={() =>
          setSrc(
            'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=60',
          )
        }
      />
      {variant === 'dark' ? (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/70 via-black/30 to-transparent"
          aria-hidden
        />
      ) : (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/50 via-black/20 to-transparent"
          aria-hidden
        />
      )}
      {isActive ? (
        <div className="pointer-events-none absolute bottom-0 left-0 z-[2] max-w-lg p-8 text-left md:p-12">
          <h3
            className={cn(
              'mb-3 unbounded-heading text-3xl font-semibold uppercase leading-tight md:text-5xl',
              accentSlide ? 'text-white' : 'text-white',
            )}
          >
            {item.title}
          </h3>
          <p className="raleway-subtitle max-w-xl text-sm leading-relaxed text-white/80 md:text-base">
            {item.desc}
          </p>
        </div>
      ) : (
        <span
          className={cn(
            'pointer-events-none absolute bottom-20 left-1/2 z-[2] w-max max-w-[none] -translate-x-1/2 rotate-90 text-center text-xs font-semibold uppercase leading-snug tracking-tight transition-opacity duration-300 sm:bottom-24 sm:text-sm md:text-base',
            'text-white',
            'unbounded-heading',
          )}
        >
          {item.title}
        </span>
      )}
    </button>
  )
}

export function InteractiveImageAccordion({
  headline,
  subtitle,
  cta,
  items,
  defaultActiveIndex = 0,
  variant = 'dark',
  className,
}: InteractiveImageAccordionProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.min(Math.max(0, defaultActiveIndex), items.length - 1),
  )

  const go = useCallback(
    (delta: number) => {
      setActiveIndex((i) => {
        const n = items.length
        return (i + delta + n) % n
      })
    },
    [items.length],
  )

  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'w-full',
        isDark ? 'bg-transparent text-white' : 'bg-white text-gray-900',
        className,
      )}
    >
      <section
        className="w-full px-4 py-16 sm:px-6 md:px-10 md:py-24 lg:px-16 lg:py-28 xl:px-20"
        aria-labelledby="manifiesto-accordion-heading"
      >
        <div className="mx-auto flex w-full max-w-[1920px] flex-col items-stretch justify-between gap-10 md:flex-row md:items-stretch md:gap-10 lg:gap-14 xl:gap-16">
          <div className="w-full shrink-0 text-center md:w-[min(42%,28rem)] md:max-w-xl md:text-left lg:w-[min(38%,26rem)]">
            <h2
              id="manifiesto-accordion-heading"
              className={cn(
                'unbounded-heading text-3xl font-semibold uppercase leading-[1.1] tracking-tight md:text-4xl lg:text-5xl xl:text-[2.75rem]',
                isDark ? 'text-white' : 'text-gray-900',
              )}
            >
              {headline}
            </h2>
            <p
              className={cn(
                'raleway-subtitle mx-auto mt-5 max-w-xl text-base leading-relaxed md:mx-0 md:text-lg',
                isDark ? 'text-white/70' : 'text-gray-600',
              )}
            >
              {subtitle}
            </p>
            <div className="mt-8 flex justify-center md:justify-start">
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/25 transition hover:from-sky-400 hover:to-sky-500 md:text-base"
              >
                {cta.label}
              </Link>
            </div>
          </div>

          <div className="relative min-w-0 flex-1 md:pl-2 lg:pl-4">
            <button
              type="button"
              onClick={() => go(-1)}
              className={cn(
                'absolute left-0 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-md transition md:flex lg:-translate-x-1',
                isDark
                  ? 'border border-white/15 bg-neutral-950/85 text-white hover:bg-neutral-900'
                  : 'border border-gray-200 bg-gray-900 text-white hover:bg-gray-800',
              )}
              aria-label="Ítem anterior"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className={cn(
                'absolute right-0 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-md transition md:flex lg:translate-x-1',
                isDark
                  ? 'border border-white/15 bg-neutral-950/85 text-white hover:bg-neutral-900'
                  : 'border border-gray-200 bg-gray-900 text-white hover:bg-gray-800',
              )}
              aria-label="Ítem siguiente"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>

            <div
              className="flex w-full flex-row items-stretch justify-start gap-2 overflow-hidden pt-1 sm:gap-2.5 md:gap-3 md:pl-12 md:pr-12 lg:gap-4"
              role="group"
              aria-label="Manifiesto en imágenes"
            >
              {items.map((item, index) => (
                <AccordionItem
                  key={item.id}
                  item={item}
                  isActive={index === activeIndex}
                  onActivate={() => setActiveIndex(index)}
                  variant={variant}
                  accentSlide={item.id === 4}
                />
              ))}
            </div>

            <div className="mt-4 flex justify-center gap-3 md:hidden">
              <button
                type="button"
                onClick={() => go(-1)}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold',
                  isDark
                    ? 'border-white/15 bg-neutral-950/80 text-white'
                    : 'border-gray-200 bg-gray-900 text-white',
                )}
                aria-label="Anterior"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className={cn(
                  'inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold',
                  isDark
                    ? 'border-white/15 bg-neutral-950/80 text-white'
                    : 'border-gray-200 bg-gray-900 text-white',
                )}
                aria-label="Siguiente"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
