/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  transpilePackages: ['geist'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // El CMS es una app estática en /public/commerce-cms. Sin esto, la URL
      // corta daría 404 y habría que compartir el enlace con "/index.html".
      // Se usa redirect (no rewrite) para que la ruta base del navegador
      // conserve la carpeta y las rutas relativas del panel sigan resolviendo.
      {
        source: '/commerce-cms',
        destination: '/commerce-cms/index.html',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // El panel privado no debe indexarse aunque alguien enlace la URL.
        source: '/commerce-cms/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default nextConfig
