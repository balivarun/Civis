import React, { useState } from 'react'

type Props = { complaints: any[] }

export default function TimelinePanel({ complaints }: Props) {
  const [selected, setSelected] = useState<string | null>(complaints[0]?.id ?? null)
  const item = complaints.find((c) => c.id === selected) ?? null

  return (
    <section className="admin-panel timeline-panel">
      <h3>Complaint timeline</h3>
      <div className="timeline-shell">
        <aside className="timeline-list">
          {complaints.length === 0 && <div className="muted">No complaints</div>}
          {complaints.map((c) => (
            <button key={c.id} className={`timeline-item ${selected === c.id ? 'active' : ''}`} onClick={() => setSelected(c.id)}>
              <strong>{c.title}</strong>
              <small>{c.id}</small>
            </button>
          ))}
        </aside>

        <div className="timeline-view">
          {!item ? (
            <div className="muted">Select a complaint to view timeline</div>
          ) : (
            <div>
              <h4>{item.title} <small>{item.id}</small></h4>
              <ol className="timeline-steps">
                <li>
                  <div className="step-title">Filed</div>
                  <div className="step-meta">{new Date(item.createdAt).toLocaleString()}</div>
                </li>
                <li>
                  <div className="step-title">Current status</div>
                  <div className="step-meta">{item.status} • Last updated {new Date(item.updatedAt).toLocaleString()}</div>
                </li>
              </ol>
              <div className="timeline-notes">
                <h5>Internal notes</h5>
                <div className="muted">No internal notes yet. Use the internal notes feature to add conversation.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
