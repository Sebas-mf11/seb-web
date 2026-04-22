'use client'

export default function ButtonTextChange() {
  return (
    <button
      type="button"
      className="group relative h-12 rounded-full border-2 border-[#656fe2] bg-gradient-to-r from-[#070e41] to-[#263381] px-5 text-white"
    >
      <span className="relative inline-flex overflow-hidden">
        <span className="inline-block translate-y-0 skew-y-0 transition duration-500 group-hover:-translate-y-[110%] group-hover:skew-y-12">
          Ver trabajos
        </span>
        <span className="absolute inline-block translate-y-[114%] skew-y-12 transition duration-500 group-hover:translate-y-0 group-hover:skew-y-0">
          Ver trabajos
        </span>
      </span>
    </button>
  )
}
