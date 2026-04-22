'use client'

import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface GlassTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon: LucideIcon
  }>
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

function GlassTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: GlassTabsProps) {
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 backdrop-blur-xl',
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'raleway-subtitle flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300',
              isActive
                ? 'border border-white/15 bg-white/10 text-white backdrop-blur'
                : 'border border-transparent text-white/50 hover:bg-white/5 hover:text-white/80',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export { GlassTabs }
