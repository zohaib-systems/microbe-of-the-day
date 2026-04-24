import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, AnimatePresence, motion } from 'framer-motion'
import Card from '../components/Card'
import CategoryButton from '../components/CategoryButton'
import dashboardBackground from '../assets/images/Background.webp'

const BASE_HUB_WIDTH = 900
const BASE_HUB_HEIGHT = 620
const BASE_CARD_WIDTH = 330
const BASE_EDGE_APPROACH_DISTANCE = 64
const BASE_BUTTON_NORMAL_OFFSET = 86
const PULSE_DURATION_SECONDS = 0.8

const traceBlueprint = [
  {
    key: 'history',
    label: 'History',
    color: '#0ea5e9',
    entrySide: 'left',
    entryOffsetY: -92,
  },
  {
    key: 'pathogenesis',
    label: 'Pathogenesis',
    color: '#ef4444',
    entrySide: 'right',
    entryOffsetY: -96,
  },
  {
    key: 'biotech',
    label: 'Biotech Importance',
    color: '#14b8a6',
    entrySide: 'right',
    entryOffsetY: 34,
  },
  {
    key: 'industrial',
    label: 'Industrial Importance',
    color: '#f59e0b',
    entrySide: 'left',
    entryOffsetY: 78,
  },
]

const buildPath = (points) =>
  points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')

const calculateLength = (points) => {
  let total = 0

  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index].x - points[index - 1].x
    const dy = points[index].y - points[index - 1].y
    total += Math.hypot(dx, dy)
  }

  return total
}

const pointOnPolyline = (points, progress) => {
  if (progress <= 0) {
    return points[0]
  }

  if (progress >= 1) {
    return points[points.length - 1]
  }

  const totalLength = calculateLength(points)
  const targetLength = totalLength * progress
  let traversed = 0

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]
    const end = points[index]
    const segmentLength = Math.hypot(end.x - start.x, end.y - start.y)

    if (traversed + segmentLength >= targetLength) {
      const remaining = targetLength - traversed
      const segmentProgress = remaining / segmentLength

      return {
        x: start.x + (end.x - start.x) * segmentProgress,
        y: start.y + (end.y - start.y) * segmentProgress,
      }
    }

    traversed += segmentLength
  }

  return points[points.length - 1]
}

function HomePage() {
  const [currentMicrobe, setCurrentMicrobe] = useState(null)
  const [allMicrobes, setAllMicrobes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMysteryMode, setIsMysteryMode] = useState(true)
  const [isRevealed, setIsRevealed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('name')
  const [activeTrace, setActiveTrace] = useState(null)
  const [pulseState, setPulseState] = useState(null)
  const [isCardEnergized, setIsCardEnergized] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )
  const animationRef = useRef(null)
  const impactTimeoutRef = useRef(null)
  const isMobileLayout = viewportWidth < 768

  const hubWidth = Math.min(BASE_HUB_WIDTH, Math.max(340, viewportWidth - 24))
  const hubHeight = Math.min(680, Math.max(420, hubWidth * 0.68))
  const scaleX = hubWidth / BASE_HUB_WIDTH
  const scaleY = hubHeight / BASE_HUB_HEIGHT
  const visualScale = Math.min(scaleX, scaleY)
  const centerX = hubWidth / 2
  const centerY = hubHeight / 2
  const cardWidth = Math.min(360, Math.max(220, hubWidth * 0.37))
  const cardLeft = centerX - cardWidth / 2
  const cardRight = centerX + cardWidth / 2
  const edgeApproachDistance = Math.max(
    20,
    Math.min(BASE_EDGE_APPROACH_DISTANCE * scaleX, hubWidth * 0.1)
  )
  const buttonNormalOffset = Math.max(
    26,
    Math.min(BASE_BUTTON_NORMAL_OFFSET * scaleX, hubWidth * 0.14)
  )

  const traces = useMemo(() => {
    return traceBlueprint.map((trace) => {
      const targetY = centerY + trace.entryOffsetY * scaleY
      const button = {
        x:
          trace.entrySide === 'right'
            ? cardRight + edgeApproachDistance + buttonNormalOffset
            : cardLeft - edgeApproachDistance - buttonNormalOffset,
        y: targetY,
      }
      const contact = {
        x: trace.entrySide === 'right' ? cardRight : cardLeft,
        y: targetY,
      }
      const routePoints = [button, contact]
      const length = calculateLength(routePoints)

      return {
        ...trace,
        button,
        routePoints,
        path: buildPath(routePoints),
        length,
        terminal: button,
        contact,
      }
    })
  }, [
    scaleY,
    centerY,
    cardLeft,
    cardRight,
    edgeApproachDistance,
    buttonNormalOffset,
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todayRes, allRes] = await Promise.all([
          fetch('/api/today'),
          fetch('/api/microbes'),
        ])
        const todayData = await todayRes.json()
        const allData = await allRes.json()
        setCurrentMicrobe(todayData)
        setAllMicrobes(allData)
        
        // Check if today's mystery was already solved
        const wasRevealed = localStorage.getItem(`revealed_${todayData.id}`) === 'true'
        setIsRevealed(wasRevealed)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    const onResize = () => {
      setViewportWidth(window.innerWidth)
    }

    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      animationRef.current?.stop()
      clearTimeout(impactTimeoutRef.current)
    }
  }, [])

  const filteredMicrobes = useMemo(() => {
    if (!searchQuery.trim()) return allMicrobes
    const query = searchQuery.toLowerCase()
    return allMicrobes.filter((m) =>
      m.name.toLowerCase().includes(query) || m.date.includes(query)
    )
  }, [allMicrobes, searchQuery])

  const selectMicrobe = (microbe) => {
    setCurrentMicrobe(microbe)
    setIsSearchOpen(false)
    // Check if we've already revealed this specific microbe before
    const wasRevealed = localStorage.getItem(`revealed_${microbe.id}`) === 'true'
    setIsRevealed(wasRevealed)
    setActiveSection('name')
  }

  const handleReveal = () => {
    setIsRevealed(true)
    if (currentMicrobe) {
      localStorage.setItem(`revealed_${currentMicrobe.id}`, 'true')
    }
  }

  const deleteMicrobe = async (e, id) => {
    e.stopPropagation() // Prevent selecting the microbe when clicking delete
    if (!window.confirm('Are you sure you want to delete this microbe from history?')) return

    try {
      const response = await fetch(`/api/delete?id=${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setAllMicrobes((current) => current.filter((m) => m.id !== id))
        // If we just deleted the one we are looking at, switch to the first one available
        if (currentMicrobe?.id === id) {
          const remaining = allMicrobes.filter((m) => m.id !== id)
          setCurrentMicrobe(remaining[0] || null)
        }
      }
    } catch (error) {
      console.error('Error deleting microbe:', error)
    }
  }

  const handleLike = async (id) => {
    const stringId = String(id)
    try {
      const response = await fetch(`/api/like?id=${stringId}`, {
        method: 'POST',
      })
      if (response.ok) {
        const updatedMicrobe = await response.json()
        setAllMicrobes((current) =>
          current.map((m) => (String(m.id) === stringId ? updatedMicrobe : m))
        )
        // Check if we are currently viewing the microbe we just liked
        setCurrentMicrobe(prev => {
          if (prev && String(prev.id) === stringId) {
            return updatedMicrobe
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Error liking microbe:', error)
    }
  }

  const navigateMicrobe = (direction) => {
    const currentIndex = allMicrobes.findIndex((m) => m.id === currentMicrobe.id)
    const nextIndex = currentIndex + direction
    if (nextIndex >= 0 && nextIndex < allMicrobes.length) {
      setCurrentMicrobe(allMicrobes[nextIndex])
      setActiveSection('name')
    }
  }

  const currentIndex = allMicrobes.findIndex((m) => m?.id === currentMicrobe?.id)
  const hasNext = currentIndex < allMicrobes.length - 1
  const hasPrev = currentIndex > 0

  const launchPulse = (trace) => {
    if (isMobileLayout) {
      setActiveSection(trace.key)
      setIsCardEnergized(true)
      clearTimeout(impactTimeoutRef.current)
      impactTimeoutRef.current = setTimeout(() => {
        setIsCardEnergized(false)
      }, 360)
      return
    }

    if (activeTrace) {
      return
    }

    setActiveTrace(trace.key)
    setPulseState({
      x: trace.terminal.x,
      y: trace.terminal.y,
      color: trace.color,
      progress: 0,
      side: trace.entrySide,
    })

    animationRef.current?.stop()

    animationRef.current = animate(0, 1, {
      duration: PULSE_DURATION_SECONDS,
      ease: 'linear',
      onUpdate: (latest) => {
        const nextPoint = pointOnPolyline(trace.routePoints, latest)

        setPulseState({
          x: nextPoint.x,
          y: nextPoint.y,
          color: trace.color,
          progress: latest,
          side: trace.entrySide,
        })
      },
      onComplete: () => {
        setPulseState({
          x: trace.contact.x,
          y: trace.contact.y,
          color: trace.color,
          progress: 1,
          side: trace.entrySide,
        })
        setActiveSection(trace.key)
        setIsCardEnergized(true)

        clearTimeout(impactTimeoutRef.current)
        impactTimeoutRef.current = setTimeout(() => {
          setIsCardEnergized(false)
          setPulseState(null)
        }, 520)

        setActiveTrace(null)
      },
    })
  }

  return (
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_center,_#0e1a30_0%,_#050913_58%,_#02040a_100%)] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-cyan-300/15 bg-white/[0.03] px-5 py-6 shadow-[0_0_20px_rgba(14,165,233,0.06)] backdrop-blur-md sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:text-left">
            <div className="text-center md:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">
                Daily intelligence brief
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-[0.08em] sm:text-3xl sm:tracking-[0.12em]">
                Microbe of the Day
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-300">
                {isMysteryMode && !isRevealed 
                  ? "Daily Challenge: Can you identify this microbe based on the data points below?" 
                  : "Select a category to inspect a focused insight for today's microbe profile."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  setIsMysteryMode(!isMysteryMode)
                  setIsRevealed(false)
                }}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${isMysteryMode ? 'border-amber-400/50 bg-amber-400/10 text-amber-200' : 'border-cyan-300/30 bg-slate-800/40 text-cyan-50'}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isMysteryMode ? 'Exit Mystery Mode' : 'Mystery Mode'}
              </button>
              <div className="flex items-center gap-2 rounded-xl border border-cyan-300/15 bg-slate-900/40 p-1">
                <button
                  disabled={!hasPrev}
                  onClick={() => navigateMicrobe(-1)}
                  className="rounded-lg p-2 text-cyan-50 transition hover:bg-white/10 disabled:opacity-20"
                  title="Newer Microbe"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="px-1 text-xs font-medium text-slate-400">
                  {currentIndex + 1} / {allMicrobes.length}
                </span>
                <button
                  disabled={!hasNext}
                  onClick={() => navigateMicrobe(1)}
                  className="rounded-lg p-2 text-cyan-50 transition hover:bg-white/10 disabled:opacity-20"
                  title="Older Microbe"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-400/20"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search History
              </button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="mt-20 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-400"></div>
            <p className="mt-4 text-slate-400">Syncing with biological database...</p>
          </div>
        ) : !currentMicrobe ? (
          <div className="mt-20 text-center">
            <p className="text-slate-400">No microbe profile found for today.</p>
          </div>
        ) : (
          <section
            className="mt-4 rounded-3xl border border-cyan-300/15 bg-white/[0.03] p-3 shadow-[0_0_24px_rgba(14,165,233,0.06)] sm:mt-5 sm:p-5"
            aria-label="Microbe hub dashboard"
          >
            {isMobileLayout ? (
              <div className="space-y-4">
                <Card
                  microbe={currentMicrobe}
                  width="100%"
                  sectionKey={activeSection}
                  isEnergized={isCardEnergized}
                  onLike={handleLike}
                  isMystery={isMysteryMode && !isRevealed}
                  onReveal={handleReveal}
                  sectionLabel={traces.find((trace) => trace.key === activeSection)?.label || 'Name'}
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {traces.map((trace) => (
                    <button
                      key={trace.key}
                      type="button"
                      onClick={() => launchPulse(trace)}
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${activeSection === trace.key ? 'border-cyan-200/55 bg-cyan-300/15 text-cyan-50 shadow-[0_0_12px_rgba(34,211,238,0.28)]' : 'border-cyan-300/25 bg-slate-900/70 text-slate-100 hover:border-cyan-200/45 hover:bg-slate-800/70'}`}
                    >
                      {trace.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className="relative mx-auto w-full overflow-hidden rounded-3xl border border-cyan-300/15 bg-white/[0.03]"
                style={{
                  width: hubWidth,
                  height: hubHeight,
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-18"
                  style={{
                    backgroundImage: `url(${dashboardBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_rgba(5,9,19,0)_56%)]" />

                <svg
                  className="pointer-events-none absolute inset-0"
                  width={hubWidth}
                  height={hubHeight}
                >
                  {traces.map((trace) => (
                    <g key={`trace-${trace.key}`}>
                      <path
                        d={trace.path}
                        stroke={trace.color}
                        strokeOpacity="0.18"
                        strokeWidth="2.1"
                        strokeLinecap="round"
                        fill="none"
                      />

                      {activeTrace === trace.key && pulseState && (
                        <path
                          d={trace.path}
                          stroke={trace.color}
                          strokeWidth="2.6"
                          strokeLinecap="round"
                          fill="none"
                          style={{
                            filter: `drop-shadow(0 0 5px ${trace.color})`,
                            strokeDasharray: `${trace.length * pulseState.progress} ${trace.length}`,
                            strokeDashoffset: 0,
                          }}
                        />
                      )}
                    </g>
                  ))}

                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={Math.max(4, 8 * visualScale)}
                    fill="none"
                    stroke="#67e8f9"
                    strokeOpacity="0.65"
                    strokeWidth={Math.max(1.1, 1.7 * visualScale)}
                  />
                </svg>

                {traces.map((trace) => (
                  <CategoryButton
                    key={trace.key}
                    label={trace.label}
                    color={trace.color}
                    x={trace.button.x}
                    y={trace.button.y}
                    isActive={activeSection === trace.key}
                    isPulseRunning={Boolean(activeTrace)}
                    onClick={() => launchPulse(trace)}
                  />
                ))}

                {pulseState && (
                  <div
                    className="pointer-events-none absolute z-30"
                    style={{
                      width: 7 * Math.max(0.75, visualScale),
                      height: 7 * Math.max(0.75, visualScale),
                      left: pulseState.x - 3.5 * Math.max(0.75, visualScale),
                      top: pulseState.y - 3.5 * Math.max(0.75, visualScale),
                      borderRadius: '9999px',
                      background: pulseState.color,
                      boxShadow: `0 0 0 5px ${pulseState.color}22`,
                    }}
                  />
                )}

                <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                  <Card
                    microbe={currentMicrobe}
                    width={cardWidth}
                    sectionKey={activeSection}
                    isEnergized={isCardEnergized}
                    onLike={handleLike}
                    isMystery={isMysteryMode && !isRevealed}
                    onReveal={handleReveal}
                    sectionLabel={traces.find((trace) => trace.key === activeSection)?.label || 'Name'}
                  />
                </div>
              </div>
            )}
          </section>
        )}

        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl overflow-hidden rounded-3xl border border-cyan-300/20 bg-slate-900 shadow-2xl"
              >
                <div className="border-b border-cyan-300/10 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-cyan-50">Search Microbes</h2>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="relative mt-4">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search by name..."
                      className="w-full rounded-xl border border-cyan-300/20 bg-slate-950 px-4 py-3 pl-11 text-slate-100 outline-none focus:border-cyan-400/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <svg
                      className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="max-h-[60vh] overflow-y-auto p-4">
                  {filteredMicrobes.length > 0 ? (
                    <div className="grid gap-3">
                      {filteredMicrobes.map((microbe) => (
                        <button
                          key={microbe.id}
                          onClick={() => selectMicrobe(microbe)}
                          className="flex items-center gap-4 rounded-2xl border border-cyan-300/5 bg-white/[0.02] p-3 text-left transition hover:border-cyan-300/20 hover:bg-white/[0.05]"
                        >
                          <img
                            src={microbe.imageUrl}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-cyan-50">{microbe.name}</p>
                            <p className="text-xs text-slate-400">{microbe.date}</p>
                          </div>
                          <button
                            onClick={(e) => deleteMicrobe(e, microbe.id)}
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                            title="Delete entry"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-slate-500">No matching microbes found.</p>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

export default HomePage
