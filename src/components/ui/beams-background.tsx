'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedGradientBackgroundProps {
  className?: string
  children?: React.ReactNode
  intensity?: 'subtle' | 'medium' | 'strong'
}

interface Beam {
  x: number
  y: number
  width: number
  length: number
  angle: number
  speed: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
}

const opacityMap = {
  subtle: 0.7,
  medium: 0.85,
  strong: 1,
} as const

function createBeam(width: number, height: number): Beam {
  const angle = -35 + Math.random() * 10
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: 190 + Math.random() * 70,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  }
}

export function BeamsBackground({
  className,
  intensity = 'strong',
  children,
}: AnimatedGradientBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const beamsRef = useRef<Beam[]>([])
  const animationFrameRef = useRef<number | null>(null)
  const sizeRef = useRef({ w: 0, h: 0 })
  const tabVisibleRef = useRef(true)
  /** Menos geometría + sin blur por frame = scroll mucho más fluido. */
  const MINIMUM_BEAMS = 8

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      const paintOnce = () => {
        const w = window.innerWidth
        const h = window.innerHeight
        canvas.width = w
        canvas.height = h
        canvas.style.width = `${w}px`
        canvas.style.height = `${h}px`
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.fillStyle = '#030712'
        ctx.fillRect(0, 0, w, h)
      }
      paintOnce()
      window.addEventListener('resize', paintOnce)
      return () => window.removeEventListener('resize', paintOnce)
    }

    const updateCanvasSize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      sizeRef.current = { w, h }
      const dpr = Math.min(1.75, window.devicePixelRatio || 1)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const totalBeams = Math.round(MINIMUM_BEAMS * 1.25)
      beamsRef.current = Array.from({ length: totalBeams }, () =>
        createBeam(w, h),
      )
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    function resetBeam(beam: Beam, index: number, totalBeams: number) {
      const { w, h } = sizeRef.current
      if (!w || !h) return beam

      const column = index % 3
      const spacing = w / 3

      beam.y = h + 100
      beam.x =
        column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5
      beam.width = 100 + Math.random() * 100
      beam.speed = 0.5 + Math.random() * 0.4
      beam.hue = 190 + (index * 70) / totalBeams
      beam.opacity = 0.2 + Math.random() * 0.1
      return beam
    }

    function drawBeam(context: CanvasRenderingContext2D, beam: Beam) {
      context.save()
      context.translate(beam.x, beam.y)
      context.rotate((beam.angle * Math.PI) / 180)

      const pulsingOpacity =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        opacityMap[intensity]

      const gradient = context.createLinearGradient(0, 0, 0, beam.length)

      gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`)
      gradient.addColorStop(
        0.1,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`,
      )
      gradient.addColorStop(
        0.4,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`,
      )
      gradient.addColorStop(
        0.6,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`,
      )
      gradient.addColorStop(
        0.9,
        `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`,
      )
      gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`)

      context.fillStyle = gradient
      context.fillRect(-beam.width / 2, 0, beam.width, beam.length)
      context.restore()
    }

    function animate() {
      if (!canvas || !ctx) return

      if (!tabVisibleRef.current || document.visibilityState === 'hidden') {
        animationFrameRef.current = null
        return
      }

      const { w, h } = sizeRef.current
      ctx.clearRect(0, 0, w, h)

      const totalBeams = beamsRef.current.length
      beamsRef.current.forEach((beam, index) => {
        beam.y -= beam.speed
        beam.pulse += beam.pulseSpeed

        if (beam.y + beam.length < -100) {
          resetBeam(beam, index, totalBeams)
        }

        drawBeam(ctx, beam)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const onVisibility = () => {
      tabVisibleRef.current = document.visibilityState === 'visible'
      if (tabVisibleRef.current && animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    tabVisibleRef.current = document.visibilityState === 'visible'

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [intensity])

  return (
    <div
      className={cn(
        'relative w-full bg-neutral-950 text-white',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 translate-z-0 transform-gpu opacity-90"
        style={{ filter: 'blur(6px)' }}
        aria-hidden
      />

      {/*
        Evitamos backdrop-filter a pantalla completa + fixed: es muy costoso al scrollear.
        Gradiente estático para unificar tono sin repintar el viewport.
      */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-neutral-950/55 via-neutral-950/75 to-neutral-950"
        aria-hidden
      />

      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
