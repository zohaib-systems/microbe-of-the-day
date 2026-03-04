import { motion, AnimatePresence } from 'framer-motion'

function Card({ microbe, sectionKey, sectionLabel, isEnergized, width }) {
  return (
    <article
      className={`relative rounded-3xl border border-white/30 bg-white/90 p-3 sm:p-5 shadow-2xl backdrop-blur-md transition-all duration-300 ${isEnergized ? 'ring-2 ring-white/80 shadow-[0_0_45px_rgba(255,255,255,0.9)]' : ''}`}
      style={{ width }}
    >
      <img
        src={microbe.image}
        alt={microbe.name}
        className="h-28 sm:h-40 w-full rounded-2xl object-cover"
      />

      <h2 className="mt-3 sm:mt-4 text-base sm:text-xl font-bold tracking-wide text-slate-950">
        {microbe.name}
      </h2>

      <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-slate-700">
        {sectionLabel}
      </p>

      <AnimatePresence mode="wait">
        <motion.p
          key={sectionKey}
          initial={{ opacity: 0, y: 8, filter: 'blur(5px)' }}
          animate={{
            opacity: [0, 0.35, 1],
            y: [8, 0, 0],
            x: [0, -2, 2, 0],
            filter: ['blur(5px)', 'blur(1px)', 'blur(0px)'],
          }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-2 sm:mt-3 min-h-[72px] sm:min-h-[92px] text-sm sm:text-base font-medium leading-relaxed text-slate-800"
        >
          {microbe[sectionKey]}
        </motion.p>
      </AnimatePresence>
    </article>
  )
}

export default Card