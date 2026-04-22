import type { Metadata } from 'next'

import { SITE_URL } from '@/lib/site'

const OG_IMAGE = {
  url: '/images/logo.png',
  width: 1200,
  height: 630,
  alt: 'SEB — Diseño y desarrollo web',
} as const

export type BuildPageMetadataInput = {
  title: string
  description: string
  keywords?: string[]
  path: string
}

/** Metadatos por página: canonical, Open Graph y Twitter alineados con metadataBase del layout. */
export function buildPageMetadata({
  title,
  description,
  keywords,
  path,
}: BuildPageMetadataInput): Metadata {
  const pathNorm = path === '/' ? '' : path
  const canonical = `${SITE_URL}${pathNorm}`

  return {
    title,
    description,
    ...(keywords?.length ? { keywords: keywords } : {}),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'SEB',
      locale: 'es_CO',
      type: 'website',
      images: [{ ...OG_IMAGE }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
