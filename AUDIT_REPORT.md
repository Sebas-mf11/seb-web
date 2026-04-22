# Auditoría SEB — 21 de abril de 2026

## ✓ Completado

### SEO y metadatos (paso 1)

- **Metadatos por página** con `buildPageMetadata()` (`src/lib/seo-metadata.ts`): `title`, `description`, `keywords`, `alternates.canonical`, `openGraph` (incluye `locale: es_CO`, `type: website`, imagen OG) y `twitter` (`summary_large_image`). `metadataBase` en `src/app/layout.tsx` apunta a `https://sebweb.co`.
- Páginas actualizadas: inicio (`src/app/page.tsx`), servicios (`src/app/servicios/desarrollo-web/page.tsx`), cotizador (`src/app/cotizador/page.tsx`), contacto, precios, trabajos y política de datos.
- **`src/app/sitemap.ts`**: rutas solicitadas más `/precios`, `/trabajos` y `/politica-de-datos` (evita huecos del sitio real).
- **`src/app/robots.ts`**: `allow: /`, `disallow` para `/admin/` y `/api/`, `sitemap` a `https://sebweb.co/sitemap.xml`.
- **JSON-LD** en el home (`src/components/seo/HomeJsonLd.tsx`): `ProfessionalService` con datos alineados al brief (teléfono desde constante de contacto).
- **Semántica HTML**: un solo `h1` en hero cuando hay dos líneas animadas (segunda línea pasa a `span` dentro del bloque del título en `animated-shader-hero.tsx`). “Nuestros clientes” pasa de `p` a `h2` (`ClientLogosBand.tsx`). Portafolio: `h2` solo para lectores (`sr-only`) antes de la grilla para no saltar `h1` → `h3` (`WorksShowcase.tsx`).
- **Enlaces rotos corregidos**: tarjetas “Contenido y redes” y “Pauta en Meta” apuntaban a `/servicios/redes-y-pauta` (inexistente); ahora van a `/contacto`. Proyectos destacados enlazaban a rutas de detalle inexistentes; ahora van a `/trabajos`.
- **Ruta legal mínima** `src/app/politica-de-datos/page.tsx` para que el enlace del formulario de contacto no devuelva 404.

### Performance y optimización (paso 2)

- **`next.config.mjs`**: `reactStrictMode`, `swcMinify`, `compress`, `poweredByHeader: false`, `images.formats` AVIF/WebP, `remotePatterns` para Unsplash (Next no admite `hostname: '**'` de forma portable; se documenta en “Requiere atención”).
- Laboratorio ya usaba `dynamic()` para `InteractiveLab`; sin `<img>` crudos en `src` (ya se usa `next/image` donde aplica).
- Fuentes vía `next/font` y Geist; sin `<link>` manual a Google Fonts.
- Sin `console.log` ni `debugger` detectados en `src/app`, `src/components` y `src/lib`.

### Accesibilidad (paso 3)

- **`prefers-reduced-motion`** global en `globals.css` (animaciones y transiciones casi instantáneas).
- **Focus visible** global `:focus-visible` con anillo ámbar coherente con el brief.
- Acordeón del manifiesto: anillo de foco alineado a ámbar (`interactive-image-accordion.tsx`).
- **Framer Motion**: `useReducedMotion` en `FloatingQuoteButton.tsx`.
- **Modal de agendar**: `role="dialog"`, `aria-modal`, `aria-labelledby` y `id` estable (`ScheduleCallModal.tsx`). Botón en `ContactLiveCTA.tsx` con `aria-expanded` y `aria-controls`.
- Botón enviar en contacto y CTAs varios: **altura mínima ~44px** donde se tocó (`min-h-11`).

### Responsive y UX (paso 4)

- **FloatingQuoteButton**: `bottom-20` en viewport pequeño y `sm:bottom-6` en desktop para no tapar CTAs inferiores; navegación a `/cotizador`.

### Código y flujo (pasos 5–8)

- **Cotización persistente (Zustand)**: `partialize` ampliado para incluir `siteType` y `quoteFlowStep`; versión de storage `seb-quote-storage-v6` para rehidratar sin mezclar esquemas viejos de forma confusa.
- Enlaces de **planes** y CTAs principales unificados hacia **`/cotizador`** (redirige a `/precios` con query cuando aplica), alineado al brief de enlaces “Cotizar”.
- **Analytics preparatorio**: `src/lib/analytics.ts` (eventos), `src/components/analytics/GoogleAnalytics.tsx` (carga condicional con `NEXT_PUBLIC_GA_MEASUREMENT_ID`), integrado en `layout.tsx`. Eventos enganchados: agregar feature al cotizador, ver resultado, envío formulario contacto, clics WhatsApp (varios orígenes).

### Seguridad básica (paso 6)

- Headers en `next.config.mjs`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
- **`.env.example`** con variables públicas documentadas. `.gitignore` ya incluye `*.local` (cubre `.env.local`).
- Enlaces `target="_blank"` revisados en grep; WhatsApp en `ContactSection` y cotizador llevan `rel="noopener noreferrer"`; `QuoteResult` usa `window.open` con `noopener,noreferrer`.

---

## ⚠ Requiere atención manual

- **Imagen Open Graph**: en metadatos se usa `/images/logo.png` con dimensiones 1200×630 recomendadas para OG; el archivo real puede tener otra proporción. Conviene una imagen OG dedicada (1200×630) y actualizar `seo-metadata.ts`.
- **`next.config.js` e imágenes remotas**: no es posible usar un comodín `hostname: '**'` de forma fiable en Next 14; hoy solo está `images.unsplash.com`. Si añades otro dominio de imágenes, hay que extender `remotePatterns`.
- **Cloudflare Pages**: los `headers()` de `next.config` aplican en el runtime de Node de Next; en despliegues estáticos conviene confirmar en el dashboard o con archivo `_headers` de Cloudflare que los encabezados de seguridad lleguen al navegador.
- **Contraste WCAG**: se mejoró foco y textos sobre ámbar en botones existentes; no se ejecutó un auditor automático de contraste en todos los pares color/fondo. Recomendado: pass con herramienta dedicada (p. ej. axe) en tema claro/oscuro.
- **Política de datos**: la página nueva es un resumen operativo, no un documento legal completo; debe revisarlo un asesor en Colombia (Ley 1581 / política de privacidad definitiva).
- **Copy “vos” / regionalismos**: no se hizo una pasada exhaustiva de todo el repositorio; conviene una lectura humana final en español Colombia.

---

## ✗ Pendiente antes del lanzamiento (crítico sugerido)

- **Formulario de contacto**: sigue simulando envío con `setTimeout`; falta backend (API Route, servicio de correo, Formspree, etc.) y mensajes de error reales.
- **Google Analytics**: definir `NEXT_PUBLIC_GA_MEASUREMENT_ID` en `.env.local` y producción; hasta entonces el componente no carga scripts.
- **Favicon / PWA**: se usan iconos desde `logo.png`; valorar `favicon.ico` multi-tamaño y `apple-touch-icon` optimizado.
- **Pruebas E2E manuales** en dispositivos reales: flujo laboratorio → contador flotante → `/cotizador` → `/precios` con estado, y formulario tras integrar backend.
- **Revisión legal y de precios** en contenido visible (correo `hotmail.com` en pie: valorar dominio profesional).

---

## Métricas estimadas

| Área            | Estimación |
|-----------------|------------|
| SEO (on-page)   | **82/100** — metadatos, canonical, sitemap, robots, JSON-LD y enlaces internos mejorados; falta OG image óptima y validación en Search Console. |
| Performance     | **Buena** — imágenes optimizadas, code splitting del laboratorio; vídeos hero y paquetes 3D/particles pueden pesar en 3G; medir Lighthouse en producción. |
| Accesibilidad   | **Requiere ajustes puntuales** — foco, reduced-motion y ARIA en modal mejorados; falta auditoría completa (contraste, modales secundarios, teclado en carruseles). |

---

## Recomendaciones finales

**Próximos 7 días**

1. Sustituir o complementar la imagen OG y validar en [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) o equivalente.
2. Implementar envío real del formulario de contacto y prueba en staging.
3. Configurar `NEXT_PUBLIC_GA_MEASUREMENT_ID` y verificar eventos en GA4 DebugView.
4. Verificar headers en Cloudflare Pages y Search Console (sitemap, cobertura).

**Post-lanzamiento**

- Ampliar pruebas de rendimiento (LCP en hero con vídeo, bundles de Three/tsparticles donde se activen).
- Añadir páginas legales completas y actualizar `sitemap.ts` si crece el sitio.
- Considerar tests automatizados (Playwright) para el flujo del cotizador.
