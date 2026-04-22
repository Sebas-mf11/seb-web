export default function ContactHero() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center bg-transparent px-6 pb-24 pt-36 text-center md:px-8 md:pb-32 md:pt-44">
      <span className="inline-flex items-center rounded-full border border-amber-300/35 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
        CONTACTO
      </span>
      <h1 className="unbounded-heading mt-6 max-w-4xl text-5xl font-semibold uppercase leading-tight tracking-tight text-white md:text-7xl">
        Hablemos de tu proyecto
      </h1>
      <p className="raleway-subtitle mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/60 md:text-lg">
        Cuéntanos qué tienes en mente. Te respondemos en menos de 24 horas con una propuesta inicial sin compromiso.
      </p>
      <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm text-green-400">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" aria-hidden />
        <span>Disponibles ahora · Respondemos en minutos</span>
      </div>
    </section>
  )
}
