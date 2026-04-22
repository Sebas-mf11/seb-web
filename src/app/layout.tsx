import type { Metadata } from 'next'
import { Raleway, Unbounded, Zen_Dots } from 'next/font/google'
import { GeistSans } from 'geist/font/sans'

import GoogleAnalytics from '@/components/analytics/GoogleAnalytics'
import FloatingQuoteButton from '@/components/quote/FloatingQuoteButton'
import { SITE_URL } from '@/lib/site'

import './globals.css'

const zenDots = Zen_Dots({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-zen-dots',
})

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-unbounded',
})

const raleway = Raleway({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SEB — Diseño y desarrollo web profesional',
    template: '%s',
  },
  description:
    'Diseño y desarrollo web profesional para marcas en Colombia y Latinoamérica.',
  icons: {
    icon: [{ url: '/images/logo.png', type: 'image/png' }],
    apple: [{ url: '/images/logo.png', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${zenDots.variable} ${unbounded.variable} ${raleway.variable}`}
    >
      <body className={`${GeistSans.className} antialiased`}>
        <GoogleAnalytics />
        {children}
        <FloatingQuoteButton />
      </body>
    </html>
  )
}
