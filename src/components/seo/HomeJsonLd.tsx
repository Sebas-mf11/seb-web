import { SEB_WHATSAPP_DIGITS_DEFAULT } from '@/lib/site-contact'
import { SITE_URL } from '@/lib/site'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'SEB — Diseño y desarrollo web',
  description:
    'Estudio de diseño y desarrollo web especializado en PYMEs y emprendedores.',
  url: SITE_URL,
  telephone: `+${SEB_WHATSAPP_DIGITS_DEFAULT}`,
  priceRange: '$600.000 - $1.500.000',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Bogotá',
    addressCountry: 'CO',
  },
  areaServed: ['Colombia', 'Latinoamérica'],
} as const

export default function HomeJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
