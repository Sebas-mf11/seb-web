'use client'

import {
  InteractiveImageAccordion,
  type InteractiveAccordionItem,
} from '@/components/ui/interactive-image-accordion'

const manifestoItems: InteractiveAccordionItem[] = [
  {
    id: 1,
    title: 'Diseño',
    desc: 'Paleta, tipografía y componentes construidos desde cero para tu marca. Cada sección responde a lo que tu cliente necesita ver y hacer en tu sitio. Sin plantillas, sin atajos, sin elementos genéricos que se repitan en cien webs más',
    imageUrl: '/images/diseño-home.jpg',
  },
  {
    id: 2,
    title: 'Optimización',
    desc: 'Metadatos, estructura semántica, schema y sitemap configurados desde el primer día. Tu web sale lista para aparecer en Google por las búsquedas que realmente importan a tu negocio. Construida para rankear, no solo para existir',
    imageUrl: '/images/optimizacion.home.jpg',
  },
  {
    id: 3,
    title: 'Velocidad',
    desc: 'Código limpio y optimizado para que tu sitio cargue en menos de dos segundos en cualquier dispositivo. Cada imagen comprimida, cada línea revisada, cada componente probado antes de entregar. Sin bugs ni fallos que espanten visitantes',
    imageUrl: '/images/velocidad-home.png',
  },
  {
    id: 4,
    title: 'Seguridad',
    desc: 'Certificado SSL activo, hosting en Cloudflare con protección contra ataques y backup automático. Entregamos documentación completa y acompañamiento post-entrega para que tu web siga viva, actualizada y segura mucho después del lanzamiento',
    imageUrl: '/images/seguridad-home.jpg',
  },
]

export default function ManifestoAccordion() {
  return (
    <section id="manifiesto" className="w-full bg-transparent">
      <InteractiveImageAccordion
        variant="dark"
        defaultActiveIndex={3}
        headline="Construimos webs que funcionan de verdad"
        subtitle="Cada pieza pensada, diseñada y programada con criterio. Sin plantillas recicladas, sin atajos. Lo que ves es lo que funciona en tu negocio todos los días"
        cta={{ label: 'Ver servicios', href: '/servicios/desarrollo-web' }}
        items={manifestoItems}
      />
    </section>
  )
}
