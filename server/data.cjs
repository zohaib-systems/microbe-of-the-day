const microbes = [
  {
    name: 'Deinococcus radiodurans',
    image: '/assets/images/Deinococcus-radiodurans.webp',
    history:
      'First isolated in 1956 during food irradiation studies, this bacterium became iconic for surviving extreme DNA-damaging conditions.',
    pathogenesis:
      'It is generally non-pathogenic and is mainly studied as a model for stress tolerance, DNA repair, and cellular resilience.',
    biotech:
      'Used in bioremediation research where engineered strains can help process radioactive waste environments safely.',
    industrial:
      'Its robust enzymes inspire industrial process design for high-stress manufacturing and advanced bio-based-systems.',
  },
  {
    name: 'Vibrio fischeri',
    image: '/assets/images/Vibrio-fischeri.webp',
    history:
      "Discovered in the 19th century, this marine bacterium is famous for its symbiotic relationship with squid, producing light through bioluminescence.",
    pathogenesis:
      "Generally not a pathogen to humans, its study has been crucial for understanding quorum sensing, a form of bacterial communication.",
    biotech:
      "Its luciferase enzyme system is a workhorse in molecular biology, used as a reporter gene to study gene expression and cellular processes.",
    industrial:
      "The principles of quorum sensing it demonstrates are being explored for applications in controlling biofilm formation and virulence in pathogenic bacteria.",
  },
  {
    name: 'Halobacterium salinarum',
    image: '/assets/images/Halobacterium-salinarum.webp',
    history:
      "This archaeon was first studied in the 1970s and is known for thriving in extreme salt environments like salt lakes and salterns.",
    pathogenesis: "Non-pathogenic, it's a model organism for studying archaeal genetics and how life adapts to hypersaline conditions.",
    biotech:
      'Its bacteriorhodopsin, a light-driven proton pump, is a key area of research for bio-nanotechnology, including retinal implants and holographic data storage.',
    industrial:
      "Studying its strategies for survival in high-salt conditions provides insights for food preservation and the development of salt-tolerant crops.",
  },
]

const getDayOfYear = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  return Math.floor(diff / oneDay)
}

const dayOfYear = getDayOfYear()
const microbeIndex = dayOfYear % microbes.length

const microbeOfDay = microbes[microbeIndex]

module.exports = { microbes, microbeOfDay };