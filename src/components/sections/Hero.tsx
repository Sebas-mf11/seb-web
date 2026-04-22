'use client'

import { Sparkles } from 'lucide-react'
import AnimatedShaderHero from '@/components/ui/animated-shader-hero'
import { PRECIOS_PERSONALIZA_HREF } from '@/lib/precios-personaliza-nav'

export default function Hero() {
  return (
    <AnimatedShaderHero
      enableShader={false}
      trustBadge={{
        text: 'Planes desde $600.000 · Entrega en 5 días',
        leading: (
          <Sparkles
            className="size-4 shrink-0 text-sky-300"
            strokeWidth={1.75}
            aria-hidden
          />
        ),
      }}
      headline={{
        line1: 'Tu página web profesional al mejor precio',
      }}
      subtitle="Diseño y desarrollo web para emprendedores valientes, empresas en crecimiento y marcas que apuntan alto."
      buttons={{
        primary: {
          text: 'Comenzar proyecto',
          href: PRECIOS_PERSONALIZA_HREF,
        },
        secondary: { text: 'Ver trabajos', href: '/trabajos' },
      }}
    />
  )
}
