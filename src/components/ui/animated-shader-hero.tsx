'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { TextAnimate } from '@/components/ui/text-animate'

/** Three.js + fluid sim: solo se carga si enableShader (evita ~600KB+ en el home actual). */
const LiquidEther = dynamic(() => import('@/components/ui/liquid-ether'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-black" aria-hidden />,
})

function HeroBackdropStatic() {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-neutral-950"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(56,189,248,0.14),transparent_55%),radial-gradient(ellipse_90%_55%_at_100%_40%,rgba(82,39,255,0.1),transparent_50%),linear-gradient(to_bottom,#020617,#000000)]" />
    </div>
  )
}

const DEFAULT_FRAGMENT_SHADER = `#version 300 es
/*********
* made by Matthias Hurrle (@atzedent)
*
*	To explore strange new worlds, to seek out new life
*	and new civilizations, to boldly go where no man has
*	gone before.
*/
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
	float d=1., t=.0;
	for (float i=.0; i<3.; i++) {
		float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
		t=mix(t,d,a);
		d=a;
		p*=2./(i+1.);
	}
	return t;
}
void main(void) {
	vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
	vec3 col=vec3(0);
	float bg=clouds(vec2(st.x+T*.5,-st.y));
	uv*=1.-.3*(sin(T*.2)*.5+.5);
	for (float i=1.; i<12.; i++) {
		uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
		vec2 p=uv;
		float d=length(p);
		col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
		float b=noise(i+p+bg*1.731);
		col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
		col=mix(col,vec3(bg*.25,bg*.137,bg*.05),d);
	}
	O=vec4(col,1);
}`

function mapPointer(
  element: HTMLCanvasElement,
  scale: number,
  x: number,
  y: number,
): [number, number] {
  return [x * scale, element.height - y * scale]
}

class WebGLRenderer {
  private canvas: HTMLCanvasElement
  private gl: WebGL2RenderingContext
  private program: WebGLProgram | null = null
  private vs: WebGLShader | null = null
  private fs: WebGLShader | null = null
  private buffer: WebGLBuffer | null = null
  private shaderSource: string
  private mouseMove = [0, 0]
  private mouseCoords = [0, 0]
  private pointerCoords = [0, 0]
  private nbrOfPointers = 0
  private uResolution: WebGLUniformLocation | null = null
  private uTime: WebGLUniformLocation | null = null
  private uMove: WebGLUniformLocation | null = null
  private uTouch: WebGLUniformLocation | null = null
  private uPointerCount: WebGLUniformLocation | null = null
  private uPointers: WebGLUniformLocation | null = null

  private readonly vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`

  private readonly vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])

  constructor(canvas: HTMLCanvasElement, scale: number, shaderSource: string) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2')
    if (!gl) {
      throw new Error('WebGL2 no disponible')
    }
    this.gl = gl
    this.shaderSource = shaderSource
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale)
  }

  updateShader(source: string) {
    this.reset()
    this.shaderSource = source
    this.setup()
    this.init()
  }

  updateMove(deltas: number[]) {
    this.mouseMove = deltas
  }

  updateMouse(coords: number[]) {
    this.mouseCoords = coords
  }

  updatePointerCoords(coords: number[]) {
    this.pointerCoords = coords
  }

  updatePointerCount(nbr: number) {
    this.nbrOfPointers = nbr
  }

  updateScale(scale: number) {
    this.gl.viewport(
      0,
      0,
      this.canvas.width * scale,
      this.canvas.height * scale,
    )
  }

  private compile(shader: WebGLShader, source: string) {
    const gl = this.gl
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
    }
  }

  test(source: string): string | null {
    const gl = this.gl
    const shader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!shader) return 'No se pudo crear fragment shader'
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    let result: string | null = null
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      result = gl.getShaderInfoLog(shader)
    }
    gl.deleteShader(shader)
    return result
  }

  reset() {
    const gl = this.gl
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) {
        gl.detachShader(this.program, this.vs)
        gl.deleteShader(this.vs)
      }
      if (this.fs) {
        gl.detachShader(this.program, this.fs)
        gl.deleteShader(this.fs)
      }
      gl.deleteProgram(this.program)
    }
    this.program = null
    this.vs = null
    this.fs = null
    this.buffer = null
  }

  setup() {
    const gl = this.gl
    const vs = gl.createShader(gl.VERTEX_SHADER)
    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    if (!vs || !fs) return
    this.vs = vs
    this.fs = fs
    this.compile(this.vs, this.vertexSrc)
    this.compile(this.fs, this.shaderSource)
    const program = gl.createProgram()
    if (!program) return
    this.program = program
    gl.attachShader(this.program, this.vs)
    gl.attachShader(this.program, this.fs)
    gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.program))
    }
  }

  init() {
    const gl = this.gl
    const program = this.program
    if (!program) return

    this.buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

    const position = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    this.uResolution = gl.getUniformLocation(program, 'resolution')
    this.uTime = gl.getUniformLocation(program, 'time')
    this.uMove = gl.getUniformLocation(program, 'move')
    this.uTouch = gl.getUniformLocation(program, 'touch')
    this.uPointerCount = gl.getUniformLocation(program, 'pointerCount')
    this.uPointers = gl.getUniformLocation(program, 'pointers')
  }

  render(now = 0) {
    const gl = this.gl
    const program = this.program
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return

    gl.clearColor(0, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

    if (this.uResolution)
      gl.uniform2f(this.uResolution, this.canvas.width, this.canvas.height)
    if (this.uTime) gl.uniform1f(this.uTime, now * 1e-3)
    if (this.uMove) gl.uniform2f(this.uMove, this.mouseMove[0], this.mouseMove[1])
    if (this.uTouch)
      gl.uniform2f(this.uTouch, this.mouseCoords[0], this.mouseCoords[1])
    if (this.uPointerCount) gl.uniform1i(this.uPointerCount, this.nbrOfPointers)
    if (this.uPointers) gl.uniform2fv(this.uPointers, this.pointerCoords)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

class PointerHandler {
  private scale: number
  private active = false
  private pointers = new Map<number, number[]>()
  private lastCoords = [0, 0]
  private moves = [0, 0]
  private readonly element: HTMLCanvasElement

  constructor(element: HTMLCanvasElement, scale: number) {
    this.element = element
    this.scale = scale

    element.addEventListener('pointerdown', (e) => {
      this.active = true
      this.pointers.set(
        e.pointerId,
        mapPointer(element, this.getScale(), e.clientX, e.clientY),
      )
    })

    element.addEventListener('pointerup', (e) => {
      if (this.count === 1) {
        this.lastCoords = [...this.first]
      }
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
    })

    element.addEventListener('pointerleave', (e) => {
      if (this.count === 1) {
        this.lastCoords = [...this.first]
      }
      this.pointers.delete(e.pointerId)
      this.active = this.pointers.size > 0
    })

    element.addEventListener('pointermove', (e) => {
      if (!this.active) return
      this.lastCoords = [e.clientX, e.clientY]
      this.pointers.set(
        e.pointerId,
        mapPointer(this.element, this.getScale(), e.clientX, e.clientY),
      )
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY]
    })
  }

  getScale() {
    return this.scale
  }

  updateScale(scale: number) {
    this.scale = scale
  }

  get count() {
    return this.pointers.size
  }

  get move() {
    return this.moves
  }

  get coords() {
    return this.pointers.size > 0
      ? Array.from(this.pointers.values()).flat()
      : [0, 0]
  }

  get first(): number[] {
    const firstPointer = this.pointers.values().next().value
    return firstPointer ?? this.lastCoords
  }
}

function useShaderBackground(fragmentSource: string, enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const rendererRef = useRef<WebGLRenderer | null>(null)
  const pointersRef = useRef<PointerHandler | null>(null)
  const tabVisibleRef = useRef(true)
  const heroVisibleRef = useRef(true)

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    rendererRef.current?.updateScale(dpr)
    pointersRef.current?.updateScale(dpr)
  }, [])

  const loop = useCallback((now: number) => {
    const renderer = rendererRef.current
    const pointers = pointersRef.current
    if (!renderer || !pointers) {
      animationFrameRef.current = null
      return
    }
    if (
      !tabVisibleRef.current ||
      !heroVisibleRef.current ||
      document.visibilityState === 'hidden'
    ) {
      animationFrameRef.current = null
      return
    }

    renderer.updateMouse(pointers.first)
    renderer.updatePointerCount(pointers.count)
    renderer.updatePointerCoords(pointers.coords)
    renderer.updateMove(pointers.move)
    renderer.render(now)
    animationFrameRef.current = requestAnimationFrame(loop)
  }, [])

  const scheduleLoop = useCallback(() => {
    if (!enabled) return
    if (!tabVisibleRef.current || !heroVisibleRef.current) return
    if (document.visibilityState === 'hidden') return
    if (!rendererRef.current || !pointersRef.current) return
    if (animationFrameRef.current !== null) return
    animationFrameRef.current = requestAnimationFrame(loop)
  }, [enabled, loop])

  useEffect(() => {
    if (!enabled || !canvasRef.current) return

    const canvas = canvasRef.current
    window.addEventListener('resize', resize)

    const onVisibility = () => {
      tabVisibleRef.current = document.visibilityState === 'visible'
      if (tabVisibleRef.current && heroVisibleRef.current) {
        scheduleLoop()
      } else if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    tabVisibleRef.current = document.visibilityState === 'visible'

    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              heroVisibleRef.current = entry?.isIntersecting ?? true
              if (heroVisibleRef.current && tabVisibleRef.current) {
                scheduleLoop()
              } else if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
              }
            },
            { root: null, threshold: 0, rootMargin: '80px 0px 80px 0px' },
          )
        : null
    io?.observe(canvas)

    try {
      const dpr = Math.max(1, 0.5 * window.devicePixelRatio)
      const renderer = new WebGLRenderer(canvas, dpr, fragmentSource)
      rendererRef.current = renderer
      pointersRef.current = new PointerHandler(canvas, dpr)
      renderer.setup()
      renderer.init()
      resize()
      if (renderer.test(fragmentSource) === null) {
        renderer.updateShader(fragmentSource)
      }
      scheduleLoop()
    } catch (err) {
      console.warn('[AnimatedShaderHero] WebGL2 no disponible o error de shader:', err)
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      io?.disconnect()
      window.removeEventListener('resize', resize)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      rendererRef.current?.reset()
      rendererRef.current = null
      pointersRef.current = null
    }
  }, [enabled, fragmentSource, loop, resize, scheduleLoop])

  return canvasRef
}

export interface AnimatedShaderHeroTrustBadge {
  text: string
  /** Emojis u texto corto; colores fijos por índice (Tailwind JIT). */
  icons?: string[]
  /** Contenido extra a la izquierda (p. ej. icono Lucide). */
  leading?: ReactNode
}

export interface AnimatedShaderHeroHeadline {
  line1: string
  /** Si se omite o queda vacío, solo se muestra `line1` (un renglón de título). */
  line2?: string
}

export interface AnimatedShaderHeroButton {
  text: string
  href?: string
  onClick?: () => void
}

export interface AnimatedShaderHeroProps {
  trustBadge?: AnimatedShaderHeroTrustBadge
  headline: AnimatedShaderHeroHeadline
  subtitle: string
  buttons?: {
    primary?: AnimatedShaderHeroButton
    secondary?: AnimatedShaderHeroButton
  }
  className?: string
  /** Si es false, no se intenta WebGL2 (solo overlay). */
  enableShader?: boolean
}

function HeroCtaArrow() {
  return (
    <svg
      width="12"
      height="10"
      viewBox="0 0 12 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="text-neutral-900"
    >
      <path
        d="M.6 4.602h10m-4-4 4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrustBadgeIcon({ icon, index }: { icon: string; index: number }) {
  const colorClass =
    index === 0
      ? 'text-sky-200'
      : index === 1
        ? 'text-cyan-200'
        : 'text-sky-300'
  return <span className={colorClass}>{icon}</span>
}

function CtaButton({ btn, variant }: { btn: AnimatedShaderHeroButton; variant: 'primary' | 'secondary' }) {
  const primaryInner =
    'min-h-[52px] justify-between gap-4 py-3 pl-8 pr-2 text-base font-semibold md:min-h-[56px] md:text-lg'
  const secondaryInner =
    'min-h-[52px] gap-2 px-8 py-3 text-base font-semibold md:min-h-[56px] md:text-lg'

  if (btn.href) {
    return (
      <HoverBorderGradient
        as={Link}
        href={btn.href}
        onClick={btn.onClick}
        containerClassName={variant === 'primary' ? 'min-w-[min(100%,280px)]' : undefined}
        className={variant === 'primary' ? primaryInner : secondaryInner}
      >
        {variant === 'primary' ? (
          <>
            <span>{btn.text}</span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white md:size-10">
              <HeroCtaArrow />
            </span>
          </>
        ) : (
          <>
            <Sparkles className="size-4 shrink-0 text-sky-200" strokeWidth={2} aria-hidden />
            {btn.text}
          </>
        )}
      </HoverBorderGradient>
    )
  }

  return (
    <HoverBorderGradient
      as="button"
      type="button"
      onClick={btn.onClick}
      containerClassName={variant === 'primary' ? 'min-w-[min(100%,280px)]' : undefined}
      className={variant === 'primary' ? primaryInner : secondaryInner}
    >
      {variant === 'primary' ? (
        <>
          <span>{btn.text}</span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white md:size-10">
            <HeroCtaArrow />
          </span>
        </>
      ) : (
        <>
          <Sparkles className="size-4 shrink-0 text-sky-200" strokeWidth={2} aria-hidden />
          {btn.text}
        </>
      )}
    </HoverBorderGradient>
  )
}

export default function AnimatedShaderHero({
  trustBadge,
  headline,
  subtitle,
  buttons,
  className = '',
  enableShader = true,
}: AnimatedShaderHeroProps) {
  const canvasRef = useShaderBackground(DEFAULT_FRAGMENT_SHADER, enableShader)

  return (
    <div
      className={`relative min-h-svh w-full overflow-hidden bg-black ${className}`}
    >
      {enableShader ? (
        <div className="absolute inset-0">
          <Suspense fallback={<div className="h-full w-full bg-black" aria-hidden />}>
            <LiquidEther
              colors={['#5227FF', '#FF9FFC', '#B497CF']}
              mouseForce={20}
              cursorSize={100}
              isViscous
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
            />
          </Suspense>
        </div>
      ) : (
        <HeroBackdropStatic />
      )}
      {enableShader ? (
        <canvas
          ref={canvasRef}
          className="hidden"
          style={{ background: 'black' } as CSSProperties}
          aria-hidden
        />
      ) : null}

      <div className="absolute inset-0 z-10 flex min-h-svh flex-col items-center justify-start px-4 pb-24 pt-36 text-white sm:pt-40 md:px-8 md:pb-32 md:pt-48 lg:pt-52">
        {trustBadge && (
          <div className="mb-10 mt-2 ash-animate-fade-in-down md:mb-12">
            <div className="flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-500/[0.12] px-6 py-3 text-sm backdrop-blur-md">
              {trustBadge.leading}
              {trustBadge.icons?.map((icon, index) => (
                <TrustBadgeIcon key={`${icon}-${index}`} icon={icon} index={index} />
              ))}
              <span className="text-sky-50">{trustBadge.text}</span>
            </div>
          </div>
        )}

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center space-y-6 text-center">
          <div className={headline.line2?.trim() ? 'space-y-2' : ''}>
            <TextAnimate
              animation="blurIn"
              as="h1"
              by="word"
              once
              delay={0.08}
              duration={0.45}
              className="unbounded-heading text-balance break-words text-3xl font-bold uppercase leading-[1.15] sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-[1.1]"
              segmentClassName="bg-gradient-to-br from-white via-sky-50 to-sky-200 bg-clip-text text-transparent"
            >
              {headline.line1}
            </TextAnimate>
            {headline.line2?.trim() ? (
              <TextAnimate
                animation="blurIn"
                as="span"
                by="word"
                once
                delay={0.12}
                duration={0.45}
                className="unbounded-heading block text-balance break-words text-4xl font-bold uppercase sm:text-5xl md:text-7xl lg:text-8xl"
                segmentClassName="bg-gradient-to-br from-sky-100 via-sky-300 to-cyan-200 bg-clip-text text-transparent"
              >
                {headline.line2.trim()}
              </TextAnimate>
            ) : null}
          </div>

          <div className="mx-auto max-w-3xl">
            <TextAnimate
              animation="blurIn"
              as="p"
              by="word"
              once
              delay={0.2}
              duration={0.5}
              className="raleway-subtitle text-lg font-light leading-relaxed text-white/85 md:text-xl lg:text-2xl"
              segmentClassName="text-white/85"
            >
              {subtitle}
            </TextAnimate>
          </div>

          {buttons && (
            <div className="ash-animate-fade-in-up ash-delay-800 mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              {buttons.primary && (
                <CtaButton btn={buttons.primary} variant="primary" />
              )}
              {buttons.secondary && (
                <CtaButton btn={buttons.secondary} variant="secondary" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
