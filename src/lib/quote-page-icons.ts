import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  Images,
  Info,
  LayoutGrid,
  Mail,
  MessageCircle,
  Package,
  ShoppingBag,
  Tag,
  Users,
  UtensilsCrossed,
} from 'lucide-react'

import type { QuotePage } from '@/lib/stores/quoteStore'

const PAGE_ICONS: Record<string, LucideIcon> = {
  home: Home,
  inicio: Home,
  about: Info,
  'sobre-nosotros': Info,
  contact: Mail,
  contacto: Mail,
  services: Briefcase,
  servicios: Briefcase,
  products: Package,
  productos: Package,
  blog: BookOpen,
  gallery: Images,
  galeria: Images,
  portfolio: LayoutGrid,
  portafolio: LayoutGrid,
  team: Users,
  equipo: Users,
  faq: HelpCircle,
  pricing: Tag,
  precios: Tag,
  testimonials: MessageCircle,
  testimonios: MessageCircle,
  reserva: Calendar,
  reservas: Calendar,
  menu: UtensilsCrossed,
  carta: UtensilsCrossed,
  tienda: ShoppingBag,
  shop: ShoppingBag,
  custom: FileText,
}

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
}

export function getPageIcon(page: QuotePage): LucideIcon {
  const idKey = normalizeKey(page.id)
  if (PAGE_ICONS[idKey]) return PAGE_ICONS[idKey]

  const slug = normalizeKey(page.name).replace(/\s+/g, '-')
  if (PAGE_ICONS[slug]) return PAGE_ICONS[slug]

  for (const part of idKey.split(/[-_/]/)) {
    if (part && PAGE_ICONS[part]) return PAGE_ICONS[part]
  }
  for (const part of slug.split('-')) {
    if (part && PAGE_ICONS[part]) return PAGE_ICONS[part]
  }

  return FileText
}
