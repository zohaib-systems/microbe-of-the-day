function CategoryButton({
  label,
  color,
  x,
  y,
  isActive,
  onClick,
  isPulseRunning,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPulseRunning}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-3 py-2 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-medium uppercase tracking-[0.08em] sm:tracking-[0.12em] text-white shadow-lg transition ${isActive ? 'scale-105' : 'scale-100'} ${isPulseRunning ? 'cursor-wait opacity-75' : 'hover:scale-105'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        borderColor: `${color}80`,
        background: `linear-gradient(145deg, ${color}4A, #0b1226B5)`,
        boxShadow: `0 0 12px ${color}44`,
      }}
    >
      {label}
    </button>
  )
}

export default CategoryButton