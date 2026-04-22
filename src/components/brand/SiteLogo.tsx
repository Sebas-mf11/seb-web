import Image from 'next/image'

import { cn } from '@/lib/utils'

type SiteLogoProps = {
  variant?: 'header' | 'footer'
  className?: string
  priority?: boolean
}

export default function SiteLogo({
  variant = 'header',
  className,
  priority = false,
}: SiteLogoProps) {
  return (
    <Image
      src="/images/logo.png"
      alt="SEB — Diseño y desarrollo web"
      width={400}
      height={132}
      priority={priority}
      className={cn(
        'w-auto object-contain object-left',
        variant === 'header' &&
          'h-[4.75rem] sm:h-20 md:h-[5.25rem] lg:h-[5.5rem]',
        variant === 'footer' && 'mx-auto h-10 sm:h-11 md:h-12',
        className,
      )}
    />
  )
}
