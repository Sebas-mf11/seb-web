'use client'

import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

const clients = [
  { name: 'LuxCar Club' },
  { name: 'The Travel Hub' },
  { name: 'Wilor Comercial' },
  { name: 'Flower of the Forest' },
]

export default function ClientLogosBand() {
  return (
    <section
      className="bg-transparent px-4 pb-8 pt-16 md:px-8 md:pb-10 md:pt-20"
      aria-labelledby="clientes-heading"
    >
      <h2
        id="clientes-heading"
        className="raleway-subtitle mb-8 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/50 md:mb-10"
      >
        Nuestros clientes
      </h2>

      <div className="relative mx-auto h-[88px] w-full max-w-6xl md:h-[100px]">
        <InfiniteSlider
          className="flex h-full w-full items-center"
          duration={32}
          gap={48}
        >
          {clients.map((client) => (
            <div
              key={client.name}
              className="flex shrink-0 items-center px-2 md:px-3"
            >
              <span className="whitespace-nowrap text-xl font-semibold tracking-tight text-white/55 transition-colors hover:text-white/90 md:text-2xl lg:text-3xl">
                {client.name}
              </span>
            </div>
          ))}
        </InfiniteSlider>

        <ProgressiveBlur
          className="pointer-events-none absolute left-0 top-0 h-full w-20 md:w-36"
          direction="left"
          blurIntensity={0.9}
          blurLayers={5}
        />
        <ProgressiveBlur
          className="pointer-events-none absolute right-0 top-0 h-full w-20 md:w-36"
          direction="right"
          blurIntensity={0.9}
          blurLayers={5}
        />
      </div>
    </section>
  )
}
