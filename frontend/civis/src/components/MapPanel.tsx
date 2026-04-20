import React from 'react'

type Props = { complaints: any[] }

export default function MapPanel({ complaints }: Props) {
  // Simple UI-only map: embed OpenStreetMap and show a list of locations.
  return (
    <section className="admin-panel map-panel">
      <h3>Location map</h3>
      <div className="map-shell">
        <div className="map-frame">
          <iframe
            title="osm"
            src="https://www.openstreetmap.org/export/embed.html?bbox=72.5%2C18.8%2C73.0%2C19.3&layer=mapnik"
            style={{ border: 0, width: '100%', height: '100%' }}
          />
        </div>
        <aside className="map-list">
          {complaints.length === 0 && <div className="muted">No complaint locations</div>}
          {complaints.map((c) => (
            <a key={c.id} className="map-location" href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(c.location)}`} target="_blank" rel="noreferrer">
              <strong>{c.title}</strong>
              <small>{c.location}</small>
            </a>
          ))}
        </aside>
      </div>
    </section>
  )
}
