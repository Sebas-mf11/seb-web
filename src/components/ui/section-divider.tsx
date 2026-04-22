export function SectionDivider() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl items-center justify-center gap-4 px-6 py-4 md:py-6"
      aria-hidden
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/25" />
      <div className="size-1 shrink-0 rounded-full bg-white/30 shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/25" />
    </div>
  )
}
