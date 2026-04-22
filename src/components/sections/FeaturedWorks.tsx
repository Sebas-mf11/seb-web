import Image from 'next/image'
import Link from 'next/link'

import { GlowCard } from '@/components/ui/glow-card'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'

type FeaturedProject = {
  sector: string
  title: string
  tags: string
  href: string
  image: string
  alt: string
  /** Si true, la imagen se muestra como logo (contain + padding). */
  isLogo?: boolean
  /** Clases del fondo del bloque superior (solo si isLogo). */
  logoBgClass?: string
}

const projects: FeaturedProject[] = [
  {
    sector: 'Automotriz',
    title: 'LuxCar Club',
    tags: 'Next.js · Reservas · Animaciones',
    href: 'https://luxcarclub.com.co/',
    image: '/images/Logo-lux.png',
    alt: 'Logo de LuxCar Club — autolavado y detailing premium',
    isLogo: true,
    logoBgClass: 'bg-white',
  },
  {
    sector: 'Turismo B2B',
    title: 'The Travel Hub',
    tags: 'Next.js · Integraciones · SEO',
    href: 'https://www.thetravelhub.com.co/',
    image: '/images/Logo-TravelHub.png',
    alt: 'Logo de The Travel Hub Colombia — noticias de la industria turística',
    isLogo: true,
    logoBgClass: 'bg-black',
  },
  {
    sector: 'Retail de muebles',
    title: 'Tu Casa Design',
    tags: 'E-commerce · Catálogo · UX',
    href: '/trabajos',
    image:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    alt: 'Interior con muebles',
  },
]

const cardLink =
  'group block h-full rounded-2xl ring-1 ring-white/10 transition-[ring-color] duration-300 hover:ring-white/30'

function ProjectMedia({ project: p }: { project: FeaturedProject }) {
  if (p.isLogo) {
    return (
      <div
        className={`relative flex aspect-[4/3] w-full items-center justify-center px-8 py-10 md:px-10 md:py-12 ${p.logoBgClass ?? 'bg-white/5'}`}
      >
        <Image
          src={p.image}
          alt={p.alt}
          width={280}
          height={160}
          className="h-auto max-h-[120px] w-auto max-w-[85%] object-contain transition duration-500 group-hover:scale-[1.03] md:max-h-[140px]"
          sizes="(max-width: 768px) 85vw, 280px"
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden">
      <Image
        src={p.image}
        alt={p.alt}
        fill
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    </div>
  )
}

function ProjectCard({ project: p }: { project: FeaturedProject }) {
  const isExternal = /^https?:\/\//.test(p.href)

  const inner = (
    <GlowCard customSize glowColor="blue" className="h-full gap-0 overflow-hidden p-0">
      <ProjectMedia project={p} />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <p className="raleway-subtitle text-xs font-medium uppercase tracking-wider text-white/50">
          {p.sector}
        </p>
        <h3 className="mt-2 unbounded-heading text-xl font-semibold uppercase tracking-tight text-white md:text-2xl">
          {p.title}
        </h3>
        <p className="raleway-subtitle mt-3 text-sm text-white/60">{p.tags}</p>
        <HoverBorderGradient
          as="span"
          containerClassName="pointer-events-none mt-6 inline-flex w-fit transition-transform duration-300 group-hover:translate-x-0.5"
          className="gap-1 px-4 py-2 text-sm font-medium"
        >
          {isExternal ? (
            <>
              Visitar sitio <span aria-hidden>→</span>
            </>
          ) : (
            <>
              Ver caso <span aria-hidden>→</span>
            </>
          )}
        </HoverBorderGradient>
      </div>
    </GlowCard>
  )

  if (isExternal) {
    return (
      <a
        href={p.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardLink}
      >
        {inner}
      </a>
    )
  }

  return (
    <Link href={p.href} className={cardLink}>
      {inner}
    </Link>
  )
}

export default function FeaturedWorks() {
  return (
    <section id="trabajos" className="bg-transparent px-6 py-24 md:px-10 md:py-32">
      <h2 className="unbounded-heading text-center text-3xl font-semibold uppercase leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
        ÚLTIMOS TRABAJOS
      </h2>
      <p className="raleway-subtitle mx-auto mt-5 max-w-3xl text-center text-base font-medium leading-relaxed text-white/70 md:text-lg">
        Cada proyecto es único. Estos son algunos de los que construimos recientemente.
      </p>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.title} project={p} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <HoverBorderGradient
          as={Link}
          href="/trabajos"
          containerClassName="inline-flex"
          className="gap-1 px-6 py-3 text-sm font-medium"
        >
          Ver todos los proyectos <span aria-hidden>→</span>
        </HoverBorderGradient>
      </div>
    </section>
  )
}
