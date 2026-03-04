import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion } from 'framer-motion'
import Card from '../components/Card'
import CategoryButton from '../components/CategoryButton'
import { microbeOfDay } from '../data/microbeData'
import dashboardBackground from '../assets/images/Background.webp'

const STORAGE_KEY = 'microbe_schedule_v1'

const BASE_HUB_WIDTH = 900
const BASE_HUB_HEIGHT = 620
const BASE_CARD_WIDTH = 330
const BASE_EDGE_APPROACH_DISTANCE = 80
const BASE_BUTTON_NORMAL_OFFSET = 90
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
  const [currentMicrobe, setCurrentMicrobe] = useState(microbeOfDay)
  const [activeSection, setActiveSection] = useState('name')
  const [activeTrace, setActiveTrace] = useState(null)
  const [pulseState, setPulseState] = useState(null)
  const [isCardEnergized, setIsCardEnergized] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )
  const animationRef = useRef(null)
  const impactTimeoutRef = useRef(null)

  const hubWidth = Math.min(BASE_HUB_WIDTH, Math.max(320, viewportWidth - 24))
  const scale = hubWidth / BASE_HUB_WIDTH
  const hubHeight = BASE_HUB_HEIGHT * scale
  const centerX = hubWidth / 2
  const centerY = hubHeight / 2
  const cardWidth = BASE_CARD_WIDTH * scale
  const cardLeft = centerX - cardWidth / 2
  const cardRight = centerX + cardWidth / 2
  const edgeApproachDistance = BASE_EDGE_APPROACH_DISTANCE * scale
  const buttonNormalOffset = BASE_BUTTON_NORMAL_OFFSET * scale

  const traces = useMemo(() => {
    return traceBlueprint.map((trace) => {
      const targetY = centerY + trace.entryOffsetY * scale
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
    scale,
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

    const now = new Date()
    const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const schedule = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    const scheduledMicrobe = schedule[todayDateKey]

    if (scheduledMicrobe) {
      setCurrentMicrobe({
        ...microbeOfDay,
        ...scheduledMicrobe,
      })
    }

    return () => {
      window.removeEventListener('resize', onResize)
      animationRef.current?.stop()
      clearTimeout(impactTimeoutRef.current)
    }
  }, [])

  const launchPulse = (trace) => {
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
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_center,_#111b32_0%,_#050913_55%,_#02040a_100%)] p-3 sm:p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-3xl font-bold tracking-[0.14em] md:text-4xl">
          Microbe of the Day
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          Tap any category node to send a data pulse into the core card.
        </p>

        <section className="mt-8 flex justify-center" aria-label="Microbe hub dashboard">
          <div
            className="relative w-full"
            style={{
              width: hubWidth,
              height: hubHeight,
            }}
          >
            <div
              className="relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-white/[0.03] shadow-[0_0_50px_rgba(14,165,233,0.15)] backdrop-blur-md"
              style={{
                width: hubWidth,
                height: hubHeight,
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `url(${dashboardBackground})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

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
                      strokeOpacity="0.22"
                      strokeWidth="2.3"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {activeTrace === trace.key && pulseState && (
                      <path
                        d={trace.path}
                        stroke={trace.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        style={{
                          filter: `drop-shadow(0 0 8px ${trace.color})`,
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
                  r={8 * scale}
                  fill="none"
                  stroke="#67e8f9"
                  strokeOpacity="0.8"
                  strokeWidth={2 * scale}
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
                <motion.div
                  className={`pointer-events-none absolute z-30 ${pulseState.side === 'right' ? 'rotate-180' : ''}`}
                  style={{
                    width: 3 * Math.max(0.8, scale),
                    height: 6 * Math.max(0.8, scale),
                    left:
                      pulseState.side === 'right'
                        ? pulseState.x - 2 * Math.max(0.8, scale)
                        : pulseState.x - 10 * Math.max(0.8, scale),
                    top: pulseState.y - 11 * Math.max(0.8, scale),
                    background: pulseState.color,
                    clipPath: 'polygon(50% 0%, 12% 46%, 36% 46%, 16% 100%, 88% 40%, 58% 40%)',
                    filter: `drop-shadow(0 0 6px ${pulseState.color}) drop-shadow(0 0 14px ${pulseState.color})`,
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
          </div>
        </section>
      </div>
    </main>
  )
}

export default HomePage
