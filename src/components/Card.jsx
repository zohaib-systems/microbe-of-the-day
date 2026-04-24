function Card({ microbe, sectionKey, sectionLabel, isEnergized, width, onLike, isMystery, onReveal }) {
  return (
    <article
      className={`relative rounded-3xl border border-white/20 bg-white/92 p-4 sm:p-6 shadow-[0_14px_32px_rgba(15,23,42,0.2)] backdrop-blur-md transition-all duration-300 ${isEnergized ? 'ring-1 ring-white/70 shadow-[0_0_22px_rgba(255,255,255,0.45)]' : ''}`}
      style={{ width }}
    >
      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={microbe.imageUrl || microbe.image}
          alt={isMystery ? "Mystery Microbe" : microbe.name}
          className={`h-36 sm:h-44 w-full object-cover transition-all duration-700 ${isMystery ? 'blur-2xl scale-110 brightness-50' : ''}`}
        />
        {isMystery && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={onReveal}
              className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/30"
            >
              Reveal Answer
            </button>
          </div>
        )}
      </div>

      <h2 className="mt-4 text-lg sm:text-xl font-semibold tracking-tight text-slate-950">
        {isMystery ? 'Mystery Organism' : microbe.name}
      </h2>

      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.16em] text-slate-700">
        {sectionLabel}
      </p>

      <p key={sectionKey} className="mt-3 min-h-[92px] text-[15px] sm:text-base font-normal leading-7 text-slate-800">
        {microbe[sectionKey]}
      </p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600/80">
          <span className="h-px w-6 sm:w-10 bg-slate-600/60" />
          <span>10 μm scale</span>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike(microbe.id);
          }}
          className="group flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition-all hover:bg-red-100 active:scale-90"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:scale-110"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clipRule="evenodd"
            />
          </svg>
          <span>{microbe.likes || 0}</span>
        </button>
      </div>
    </article>
  )
}

export default Card