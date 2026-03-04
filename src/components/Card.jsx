function Card({ microbe, sectionKey, sectionLabel, isEnergized, width }) {
  return (
    <article
      className={`relative rounded-3xl border border-white/20 bg-white/92 p-4 sm:p-6 shadow-[0_14px_32px_rgba(15,23,42,0.2)] backdrop-blur-md transition-all duration-300 ${isEnergized ? 'ring-1 ring-white/70 shadow-[0_0_22px_rgba(255,255,255,0.45)]' : ''}`}
      style={{ width }}
    >
      <img
        src={microbe.image}
        alt={microbe.name}
        className="h-36 sm:h-44 w-full rounded-2xl object-cover"
      />

      <h2 className="mt-4 text-lg sm:text-xl font-semibold tracking-tight text-slate-950">
        {microbe.name}
      </h2>

      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-slate-700">
        {sectionLabel}
      </p>

      <p key={sectionKey} className="mt-3 min-h-[92px] text-[15px] sm:text-base font-normal leading-7 text-slate-800">
        {microbe[sectionKey]}
      </p>

      <div className="mt-5 flex items-center gap-2 text-xs text-slate-600/80">
        <span className="h-px w-10 bg-slate-600/60" />
        <span>Approximate view: 10 μm scale</span>
      </div>
    </article>
  )
}

export default Card