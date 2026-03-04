import { useEffect, useMemo, useRef, useState } from 'react'
import { animate } from 'framer-motion'
import Card from '../components/Card'
import CategoryButton from '../components/CategoryButton'
import { microbeOfDay } from '../data/microbeData'
import dashboardBackground from '../assets/images/Background.webp'

const STORAGE_KEY = 'microbe_schedule_v1'

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

const getScheduledMicrobeForToday = () => {
  if (typeof window === 'undefined') {
    return microbeOfDay
  }

  const now = new Date()
  const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const schedule = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  const scheduledMicrobe = schedule[todayDateKey]

  if (!scheduledMicrobe) {
    return microbeOfDay
  }

  return {
    ...microbeOfDay,
    ...scheduledMicrobe,
  }
}

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
  const [currentMicrobe] = useState(() => getScheduledMicrobeForToday())
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
          <div className="text-center">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/70">
                Daily intelligence brief
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-[0.08em] sm:text-3xl sm:tracking-[0.12em]">
                Microbe of the Day
              </h1>
              <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-300">
                Select a category to inspect a focused insight for today&apos;s microbe profile.
              </p>
            </div>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-cyan-300/15 bg-white/[0.03] p-3 shadow-[0_0_24px_rgba(14,165,233,0.06)] sm:p-5" aria-label="Microbe hub dashboard">
          {isMobileLayout ? (
            <div className="space-y-4">
              <Card
                microbe={currentMicrobe}
                width="100%"
                sectionKey={activeSection}
                isEnergized={isCardEnergized}
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
                  sectionLabel={traces.find((trace) => trace.key === activeSection)?.label || 'Name'}
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default HomePage
