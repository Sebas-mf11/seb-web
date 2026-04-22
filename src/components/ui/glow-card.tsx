'use client'

import { useCallback, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type GlowColor = 'blue' | 'purple' | 'green' | 'red' | 'orange'

export interface GlowCardProps {
  children: ReactNode
  className?: string
  glowColor?: GlowColor
  size?: 'sm' | 'md' | 'lg'
  width?: string | number
  height?: string | number
  /** Cuando es true, ignora `size` y usa width/height o solo className. */
  customSize?: boolean
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
} as const

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
} as const

const beforeAfterStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: local;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
    );
    filter: brightness(2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`

export function GlowCard({
  children,
  className,
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const syncPointer = useCallback((clientX: number, clientY: number) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', String(clientX - r.left))
    el.style.setProperty('--y', String(clientY - r.top))
    el.style.setProperty('--xp', (clientX / window.innerWidth).toFixed(4))
    el.style.setProperty('--yp', (clientY / window.innerHeight).toFixed(4))
  }, [])

  const centerPointer = useCallback(() => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', String(r.width / 2))
    el.style.setProperty('--y', String(r.height / 2))
    el.style.setProperty('--xp', '0.5')
    el.style.setProperty('--yp', '0.5')
  }, [])

  useLayoutEffect(() => {
    centerPointer()
  }, [centerPointer])

  const { base, spread } = glowColorMap[glowColor]

  const getSizeClasses = () => {
    if (customSize) return ''
    return sizeMap[size]
  }

  const getInlineStyles = (): CSSProperties => {
    return {
      ['--base' as string]: base,
      ['--spread' as string]: spread,
      ['--radius' as string]: 14,
      ['--border' as string]: 3,
      ['--backdrop' as string]: 'hsl(0 0% 60% / 0.12)',
      ['--backup-border' as string]: 'var(--backdrop)',
      ['--size' as string]: 200,
      ['--outer' as string]: 1,
      ['--border-size' as string]: 'calc(var(--border, 2) * 1px)',
      ['--spotlight-size' as string]: 'calc(var(--size, 150) * 1px)',
      ['--hue' as string]:
        'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      backgroundImage: `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
      )`,
      backgroundColor: 'var(--backdrop, transparent)',
      backgroundSize:
        'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
      backgroundPosition: '50% 50%',
      backgroundAttachment: 'local',
      border: 'var(--border-size) solid var(--backup-border)',
      position: 'relative',
      width: width === undefined ? undefined : typeof width === 'number' ? `${width}px` : width,
      height:
        height === undefined
          ? undefined
          : typeof height === 'number'
            ? `${height}px`
            : height,
    } as CSSProperties
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={getInlineStyles()}
        onPointerMove={(e) => syncPointer(e.clientX, e.clientY)}
        onPointerLeave={centerPointer}
        className={cn(
          getSizeClasses(),
          !customSize && 'aspect-[3/4]',
          'relative flex flex-col gap-4 rounded-2xl p-4 shadow-[0_1rem_2rem_-1rem_black] [contain:paint]',
          className,
        )}
      >
        <div data-glow aria-hidden />
        {children}
      </div>
    </>
  )
}
