import { useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion } from 'framer-motion'
import Card from './components/Card'
import CategoryButton from './components/CategoryButton'
import { microbeOfDay } from './data/microbeData'

const HUB_WIDTH = 980
const HUB_HEIGHT = 680
const CENTER_X = HUB_WIDTH / 2
const CENTER_Y = HUB_HEIGHT / 2
const CARD_WIDTH = 330
const CARD_HEIGHT = 360
const CARD_LEFT = CENTER_X - CARD_WIDTH / 2
const CARD_RIGHT = CENTER_X + CARD_WIDTH / 2
const PULSE_DURATION_SECONDS = 0.8

const traceBlueprint = [
  {
    key: 'history',
    label: 'History',
    color: '#0ea5e9',
    button: { x: 210, y: 130 },
    entrySide: 'left',
    entryOffsetY: -92,
    points: [
      { x: 280, y: 190 },
      { x: 330, y: 240 },
      { x: 280, y: 240 },
      { x: 280, y: 248 },
    ],
  },
  {
    key: 'pathogenesis',
    label: 'Pathogenesis',
    color: '#ef4444',
    button: { x: 790, y: 140 },
    entrySide: 'right',
    entryOffsetY: -96,
    points: [
      { x: 700, y: 210 },
      { x: 650, y: 260 },
      { x: 700, y: 260 },
      { x: 700, y: 244 },
    ],
  },
  {
    key: 'biotech',
    label: 'Biotech Importance',
    color: '#14b8a6',
    button: { x: 870, y: 340 },
    entrySide: 'right',
    entryOffsetY: 34,
    points: [
      { x: 780, y: 340 },
      { x: 730, y: 390 },
      { x: 700, y: 390 },
      { x: 700, y: 374 },
    ],
  },
  {
    key: 'industrial',
    label: 'Industrial Importance',
    color: '#f59e0b',
    button: { x: 220, y: 560 },
    entrySide: 'left',
    entryOffsetY: 78,
    points: [
      { x: 300, y: 490 },
      { x: 350, y: 440 },
      { x: 280, y: 390 },
      { x: 280, y: 418 },
    ],
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

function App() {
  const [activeSection, setActiveSection] = useState('name')
  const [activeTrace, setActiveTrace] = useState(null)
  const [pulseState, setPulseState] = useState(null)
  const [isCardEnergized, setIsCardEnergized] = useState(false)
  const animationRef = useRef(null)
  const impactTimeoutRef = useRef(null)

  const traces = useMemo(() => {
    return traceBlueprint.map((trace) => {
      const contact = {
        x: trace.entrySide === 'right' ? CARD_RIGHT : CARD_LEFT,
        y: CENTER_Y + trace.entryOffsetY,
      }
      const routePoints = [trace.button, ...trace.points, contact]
      const length = calculateLength(routePoints)

      return {
        ...trace,
        routePoints,
        path: buildPath(routePoints),
        length,
        terminal: trace.button,
        contact,
      }
    })
  }, [])

  useEffect(() => {
    return () => {
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
        })
      },
      onComplete: () => {
        setPulseState({
          x: trace.contact.x,
          y: trace.contact.y,
          color: trace.color,
          progress: 1,
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
    <main className="min-h-screen bg-slate-950 bg-[radial-gradient(circle_at_center,_#111b32_0%,_#050913_55%,_#02040a_100%)] p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-center text-3xl font-bold tracking-[0.14em] md:text-4xl">
          Microbe of the Day
        </h1>
        <p className="mt-2 text-center text-sm text-slate-300">
          Tap any category node to send a data pulse into the core card.
        </p>

        <section className="mt-8 flex justify-center" aria-label="Microbe hub dashboard">
          <div
            className="relative overflow-hidden rounded-[36px] border border-cyan-300/20 bg-white/[0.03] shadow-[0_0_50px_rgba(14,165,233,0.15)] backdrop-blur-md"
            style={{ width: HUB_WIDTH, height: HUB_HEIGHT }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <svg
              className="pointer-events-none absolute inset-0"
              width={HUB_WIDTH}
              height={HUB_HEIGHT}
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
                cx={CENTER_X}
                cy={CENTER_Y}
                r="8"
                fill="none"
                stroke="#67e8f9"
                strokeOpacity="0.8"
                strokeWidth="2"
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
                className="pointer-events-none absolute z-30 h-5 w-3"
                style={{
                  left: pulseState.x - 6,
                  top: pulseState.y - 10,
                  background: pulseState.color,
                  clipPath:
                    'polygon(50% 0%, 12% 46%, 36% 46%, 16% 100%, 88% 40%, 58% 40%)',
                  filter: `drop-shadow(0 0 6px ${pulseState.color}) drop-shadow(0 0 14px ${pulseState.color})`,
                }}
              />
            )}

            <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
              <Card
                microbe={microbeOfDay}
                sectionKey={activeSection}
                isEnergized={isCardEnergized}
                sectionLabel={
                  traces.find((trace) => trace.key === activeSection)
                    ?.label || 'Name'
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default App
