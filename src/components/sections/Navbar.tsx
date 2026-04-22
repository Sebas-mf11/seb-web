'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import SiteLogo from '@/components/brand/SiteLogo'
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient'
import { PRECIOS_PERSONALIZA_HREF } from '@/lib/precios-personaliza-nav'

const navItems: { label: string; href: string }[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios/desarrollo-web' },
  { label: 'Trabajos', href: '/trabajos' },
  { label: 'Precios', href: '/precios' },
  { label: 'Contacto', href: '/contacto' },
]

function navItemIsActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  if (href.startsWith('/#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

function ArrowIcon() {
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

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  const linkClass = (href: string) =>
    `rounded-full px-4 py-1.5 text-sm transition-colors ${
      navItemIsActive(pathname, href)
        ? 'border border-white/30 bg-white/20 font-medium text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:bg-white/25'
        : 'font-medium text-white hover:text-white'
    }`

  const mobileLinkClass = (href: string) =>
    `rounded-lg px-4 py-2.5 text-sm ${
      navItemIsActive(pathname, href)
        ? 'bg-white/15 font-medium text-white'
        : 'font-medium text-white hover:bg-white/10'
    }`

  return (
    <header className="relative z-50">
      <nav className="relative flex items-center justify-between border-b border-white/10 bg-white/10 px-6 py-1 backdrop-blur-xl supports-[backdrop-filter]:bg-white/[0.06] md:px-12 md:py-1.5 lg:px-24 xl:px-40">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          onClick={closeMenu}
        >
          <SiteLogo variant="header" priority />
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/5 px-1 py-1 backdrop-blur-md md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={linkClass(item.href)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <HoverBorderGradient
          as={Link}
          href={PRECIOS_PERSONALIZA_HREF}
          onClick={closeMenu}
          className="min-h-10 gap-2.5 py-2 pl-5 pr-2 text-sm font-medium"
          containerClassName="hidden md:inline-flex"
        >
          <span>Comenzar</span>
          <span className="flex size-7 items-center justify-center rounded-full bg-white">
            <ArrowIcon />
          </span>
        </HoverBorderGradient>

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex cursor-pointer flex-col gap-1.5 border-0 bg-transparent p-1 md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>

        {menuOpen ? (
          <div
            id="mobile-menu"
            className="absolute left-0 top-full z-50 flex w-full flex-col gap-1 border-b border-white/10 border-t border-white/10 bg-black/45 p-5 backdrop-blur-xl md:hidden"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={mobileLinkClass(item.href)}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <HoverBorderGradient
              as={Link}
              href={PRECIOS_PERSONALIZA_HREF}
              onClick={closeMenu}
              className="min-h-11 gap-2.5 py-2.5 pl-5 pr-2 text-sm font-medium"
              containerClassName="mt-3 w-fit"
            >
              <span>Comenzar</span>
              <span className="flex size-7 items-center justify-center rounded-full bg-white">
                <ArrowIcon />
              </span>
            </HoverBorderGradient>
          </div>
        ) : null}
      </nav>
    </header>
  )
}
