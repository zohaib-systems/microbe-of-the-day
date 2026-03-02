import { motion, AnimatePresence } from 'framer-motion'

function Card({ microbe, sectionKey, sectionLabel, isEnergized }) {
  return (
    <article
      className={`relative w-[330px] rounded-3xl border border-white/30 bg-white/90 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 ${isEnergized ? 'ring-2 ring-white/80 shadow-[0_0_45px_rgba(255,255,255,0.9)]' : ''}`}
    >
      <img
        src={microbe.image}
        alt={microbe.name}
        className="h-40 w-full rounded-2xl object-cover"
      />

      <h2 className="mt-4 text-xl font-semibold tracking-wide text-slate-900">
        {microbe.name}
      </h2>

      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
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
          className="mt-3 min-h-[92px] text-sm leading-relaxed text-slate-700"
        >
          {microbe[sectionKey]}
        </motion.p>
      </AnimatePresence>
    </article>
  )
}

export default Card