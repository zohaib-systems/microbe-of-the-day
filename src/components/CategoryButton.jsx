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
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border px-2.5 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.08em] sm:tracking-[0.14em] text-white shadow-lg transition ${isActive ? 'scale-105' : 'scale-100'} ${isPulseRunning ? 'cursor-wait opacity-75' : 'hover:scale-105'}`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        borderColor: `${color}AA`,
        background: `linear-gradient(145deg, ${color}66, #0b1226CC)`,
        boxShadow: `0 0 20px ${color}66`,
      }}
    >
      {label}
    </button>
  )
}

export default CategoryButton