import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type GlassPanelProps = {
  children: ReactNode
  className?: string
  /** Pie o bandas más discretas */
  variant?: 'default' | 'subtle'
}

export function GlassPanel({
  children,
  className,
  variant = 'default',
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-2xl md:rounded-3xl',
        variant === 'default' && 'bg-white/[0.05]',
        variant === 'subtle' && 'border-white/[0.08] bg-white/[0.03]',
        className,
      )}
    >
      {children}
    </div>
  )
}
