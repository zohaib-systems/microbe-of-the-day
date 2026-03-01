import { useMemo, useState } from 'react'
import MicrobeCard from './components/MicrobeCard'
import deinococcusImage from './assets/images/Deinococcus-radiodurans.webp'
import halobacteriumImage from './assets/images/Halobacterium-salinarum.webp'
import vibrioImage from './assets/images/Vibrio-fischeri.webp'
import './App.css'

const microbes = [
  {
    id: 'deinococcus-radiodurans',
    name: 'Deinococcus radiodurans',
    color: '#ef4444',
    image: deinococcusImage,
    fact: 'Known as one of the toughest bacteria on Earth, it can survive extreme radiation damage and rebuild its DNA.',
  },
  {
    id: 'vibrio-fischeri',
    name: 'Vibrio fischeri',
    color: '#0ea5e9',
    image: vibrioImage,
    fact: 'This marine bacterium is bioluminescent and helps some squid glow at night for camouflage.',
  },
  {
    id: 'halobacterium-salinarum',
    name: 'Halobacterium salinarum',
    color: '#8b5cf6',
    image: halobacteriumImage,
    fact: 'A salt-loving microbe that thrives in hypersaline lakes and uses light-sensitive proteins for energy.',
  },
]

function App() {
  const orderedMicrobes = useMemo(() => {
    const randomized = [...microbes]

    for (let index = randomized.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1))
      ;[randomized[index], randomized[swapIndex]] = [
        randomized[swapIndex],
        randomized[index],
      ]
    }

    return randomized
  }, [])

  const [currentIndex, setCurrentIndex] = useState(0)
  const currentMicrobe = orderedMicrobes[currentIndex]
  const hasPreviousCard = currentIndex > 0
  const hasMoreCards = currentIndex < orderedMicrobes.length - 1

  const showPreviousCard = () => {
    setCurrentIndex((current) => (current > 0 ? current - 1 : current))
  }

  const revealNextCard = () => {
    setCurrentIndex((current) =>
      current < orderedMicrobes.length - 1 ? current + 1 : current
    )
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <h1>
          <span className="title-icon" aria-hidden="true">
            🧫
          </span>{' '}
          Microbe of the Day
        </h1>
        <p>Discover one extraordinary microbe every day—small life, big science.</p>
      </header>

      <section className="microbe-stack" aria-label="Microbe cards">
        <MicrobeCard
          key={currentMicrobe.id}
          id={currentMicrobe.id}
          image={currentMicrobe.image}
          name={currentMicrobe.name}
          fact={currentMicrobe.fact}
          color={currentMicrobe.color}
        />
      </section>

      <div className="controls">
        <button
          type="button"
          onClick={showPreviousCard}
          className="reveal-btn secondary-btn"
          disabled={!hasPreviousCard}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={revealNextCard}
          className="reveal-btn"
          disabled={!hasMoreCards}
        >
          {hasMoreCards ? 'Next Microbe' : 'All cards revealed'}
        </button>
      </div>
    </main>
  )
}

export default App
