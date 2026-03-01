function MicrobeCard({ id, image, name, fact, color }) {
  const imageContainerStyle = {
    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
    backgroundColor: color + '33',
  }

  return (
    <article
      className={`microbe-card ${id === 'deinococcus-radiodurans' ? 'microbe-card-deinococcus' : ''}`}
    >
      <div className="microbe-image-container" style={imageContainerStyle}>
        <img
          className={`microbe-image ${id === 'deinococcus-radiodurans' ? 'deinococcus-image' : ''}`}
          src={image}
          alt={name}
          loading="lazy"
        />
      </div>
      <div className="microbe-content">
        <h2 className="microbe-name">{name}</h2>
        <p className="microbe-fact">{fact}</p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '20px',
            opacity: 0.5,
          }}
        >
          <div
            style={{ width: '50px', height: '2px', background: color || '#333' }}
          ></div>
          <span style={{ fontSize: '10px', marginLeft: '5px' }}>10 μm</span>
        </div>
      </div>
    </article>
  )
}

export default MicrobeCard