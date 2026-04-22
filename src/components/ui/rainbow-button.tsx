import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type RainbowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'ghost'
  children: ReactNode
}

/**
 * Botón con borde arcoíris animado (conic-gradient + rotate) y centro glass / oscuro.
 */
export function RainbowButton({
  className,
  variant = 'solid',
  children,
  ...props
}: RainbowButtonProps) {
  return (
    <div
      className={cn(
        'rainbow-border relative inline-flex overflow-hidden rounded-full p-[2px] transition-transform duration-300 hover:scale-105 active:scale-100',
      )}
    >
      <button
        type="button"
        className={cn(
          'relative z-[1] rounded-full px-6 py-3 text-sm font-medium tracking-tight text-white',
          variant === 'solid' && 'bg-gray-950/85 backdrop-blur-md',
          variant === 'ghost' && 'bg-white/10 backdrop-blur-md hover:bg-white/15',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    </div>
  )
}

type RainbowButtonFrameProps = {
  children: ReactNode
  className?: string
}

/** Solo el marco arcoíris; el contenido interno lo defines tú (p. ej. CTA con flecha). */
export function RainbowButtonFrame({ children, className }: RainbowButtonFrameProps) {
  return (
    <div
      className={cn(
        'rainbow-border relative inline-flex overflow-hidden rounded-full p-[2px] transition-transform duration-300 hover:scale-105 active:scale-100',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** Marco animado en tonos sky / cyan (navbar CTA, etc.). */
export function FrostButtonFrame({ children, className }: RainbowButtonFrameProps) {
  return (
    <div
      className={cn(
        'frost-border relative inline-flex overflow-hidden rounded-full p-[2px] transition-transform duration-300 hover:scale-105 active:scale-100',
        className,
      )}
    >
      {children}
    </div>
  )
}
