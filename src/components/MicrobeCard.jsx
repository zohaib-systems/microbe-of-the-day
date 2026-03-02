function MicrobeCard({ image, name, fact, color }) {
  return (
    <article className="microbe-card">
      <img className="microbe-image" src={image} alt={name} loading="lazy" />
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