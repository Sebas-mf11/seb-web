'use client'

import { motion } from 'framer-motion'
import type { ComponentPropsWithoutRef, ElementType } from 'react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type HoverBorderGradientProps<T extends ElementType = 'button'> = {
  as?: T
  children: React.ReactNode
  containerClassName?: string
  className?: string
  /** Interior: vidrio oscuro (hero, navbar) o claro (tarjetas pricing claras) */
  innerTone?: 'dark' | 'light'
  /** Esquinas exteriores e internas (p. ej. `rounded-2xl` en grillas de acciones) */
  roundedClassName?: string
  /** Duración base del giro (se escala en el componente) */
  duration?: number
  clockwise?: boolean
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>

/**
 * Borde con gradiente cónico plateado / cian que rota al hover (patrón Aceternity UI).
 * Interior pensado para fondos oscuros: vidrio oscuro + blur.
 */
export function HoverBorderGradient<T extends ElementType = 'button'>({
  as,
  children,
  containerClassName,
  className,
  innerTone = 'dark',
  roundedClassName = 'rounded-full',
  duration = 1,
  clockwise = true,
  ...props
}: HoverBorderGradientProps<T>) {
  const Component = (as ?? 'button') as ElementType
  const [hovered, setHovered] = useState(false)
  const disabled = Boolean(
    (props as { disabled?: boolean }).disabled,
  )

  const toneClass =
    innerTone === 'light'
      ? 'bg-white/88 text-neutral-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] group-hover:bg-white/92'
      : 'bg-neutral-950/75 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] group-hover:bg-neutral-950/85'

  return (
    <Component
      className={cn(
        'group relative inline-flex overflow-hidden p-[1.5px] transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]',
        roundedClassName,
        disabled && 'pointer-events-none cursor-not-allowed opacity-55 hover:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/50 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        containerClassName,
      )}
      onMouseEnter={() => {
        if (!disabled) setHovered(true)
      }}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      <motion.div
        className={cn(
          'pointer-events-none absolute inset-[-120%] z-0 opacity-90',
          roundedClassName,
        )}
        style={{
          background:
            'conic-gradient(from 0deg, #e2e8f0, #cbd5e1, #f8fafc, #7dd3fc, #bae6fd, #e2e8f0, #94a3b8, #f1f5f9, #e2e8f0)',
        }}
        animate={{
          rotate: hovered && !disabled ? (clockwise ? 360 : -360) : 0,
        }}
        transition={{
          duration: hovered ? Math.max(0.35, duration) * 3.2 : 0.45,
          repeat: hovered ? Infinity : 0,
          ease: 'linear',
        }}
      />
      <span
        className={cn(
          'relative z-[1] flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-semibold backdrop-blur-xl',
          roundedClassName,
          'transition-colors duration-300',
          toneClass,
          className,
        )}
      >
        {children}
      </span>
    </Component>
  )
}
