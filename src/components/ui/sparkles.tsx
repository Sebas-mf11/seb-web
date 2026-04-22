'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { ISourceOptions } from '@tsparticles/engine'

export interface SparklesProps {
  className?: string
  size?: number
  minSize?: number | null
  density?: number
  speed?: number
  minSpeed?: number | null
  opacity?: number
  opacitySpeed?: number
  minOpacity?: number | null
  color?: string
  background?: string
  options?: ISourceOptions
}

export function Sparkles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = '#FFFFFF',
  background = 'transparent',
  options,
}: SparklesProps) {
  const [isReady, setIsReady] = useState(false)
  const rawId = useId()
  const id = useMemo(() => rawId.replace(/:/g, ''), [rawId])

  useEffect(() => {
    void initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setIsReady(true)
    })
  }, [])

  const defaultOptions = useMemo<ISourceOptions>(
    () => ({
      background: {
        color: {
          value: background,
        },
      },
      fullScreen: {
        enable: false,
        zIndex: 1,
      },
      fpsLimit: 60,
      particles: {
        color: {
          value: color,
        },
        move: {
          enable: true,
          direction: 'none',
          speed: {
            min: minSpeed ?? speed / 10,
            max: speed,
          },
          straight: false,
        },
        number: {
          value: density,
        },
        opacity: {
          value: {
            min: minOpacity ?? opacity / 10,
            max: opacity,
          },
          animation: {
            enable: true,
            sync: false,
            speed: opacitySpeed,
          },
        },
        size: {
          value: {
            min: minSize ?? size / 2.5,
            max: size,
          },
        },
      },
      detectRetina: true,
    }),
    [
      background,
      color,
      density,
      minOpacity,
      minSize,
      minSpeed,
      opacity,
      opacitySpeed,
      size,
      speed,
    ],
  )

  const merged = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [defaultOptions, options],
  )

  if (!isReady) return null

  return <Particles id={id} options={merged} className={className} />
}
