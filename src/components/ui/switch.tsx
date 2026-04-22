'use client'

import { cn } from '@/lib/utils'

type SwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
}

export function Switch({ checked, onCheckedChange, id, className }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 rounded-full border border-white/20 transition-colors',
        checked ? 'bg-amber-400/90' : 'bg-white/10',
        className,
      )}
    >
      <span
        className={cn(
          'pointer-events-none absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition-transform duration-200 ease-out',
          checked ? 'translate-x-[1.375rem]' : 'translate-x-0',
        )}
        aria-hidden
      />
    </button>
  )
}
