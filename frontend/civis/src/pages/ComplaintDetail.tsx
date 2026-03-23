import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComplaintById, type Complaint } from '../api/client'
import './ComplaintDetail.css'

const statusOrder = ['Submitted', 'Acknowledged', 'Under Review', 'In Progress', 'Resolved']

const statusColor: Record<string, string> = {
  Submitted: '#6366f1',
  Acknowledged: '#f59e0b',
  'Under Review': '#3b82f6',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
}

export default function ComplaintDetail() {
  const { id } = useParams<{ id: string }>()
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadComplaint() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        setComplaint(await getComplaintById(id))
      } catch {
        setComplaint(null)
      } finally {
        setLoading(false)
      }
    }

    void loadComplaint()
  }, [id])

  if (loading) {
    return (
      <div className="cd-not-found">
        <div className="cd-nf-icon">⏳</div>
        <h2>Loading complaint</h2>
        <p>Please wait while we fetch the complaint details.</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="cd-not-found">
        <div className="cd-nf-icon">🔍</div>
        <h2>Complaint not found</h2>
        <p>The complaint ID "{id}" does not exist.</p>
        <Link to="/dashboard" className="cd-back-btn">← Back to Dashboard</Link>
      </div>
    )
  }

  const currentIdx = statusOrder.indexOf(complaint.status)

  return (
    <div className="cd-page">
      <div className="cd-topbar">
        <Link to="/dashboard" className="cd-back">← Dashboard</Link>
        <span className="cd-id-badge">{complaint.id}</span>
      </div>

      <div className="cd-container">
        {/* Header card */}
        <div className="cd-header-card">
          <div className="cd-header-left">
            <span className="cd-cat-icon">{complaint.categoryIcon}</span>
            <div>
              <p className="cd-category">{complaint.category}</p>
              <h1>{complaint.title}</h1>
              <p className="cd-meta">
                Filed on {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
                &nbsp;·&nbsp; {complaint.location}
                {complaint.landmark && <>&nbsp;·&nbsp; near {complaint.landmark}</>}
              </p>
            </div>
          </div>
          <div className="cd-header-right">
            <span className="cd-status-badge"
              style={{ background: statusColor[complaint.status] + '22', color: statusColor[complaint.status] }}>
              {complaint.status}
            </span>
            <span className="cd-priority-badge" data-p={complaint.priority}>
              {complaint.priority} Priority
            </span>
          </div>
        </div>

        {/* Status tracker */}
        <div className="cd-tracker-card">
          <h2>Complaint Status Tracker</h2>
          <div className="cd-tracker">
            {statusOrder.map((s, i) => (
              <div key={s} className="cd-tracker-step">
                <div className="cd-step-col">
                  <div className={`cd-step-circle ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}>
                    {i < currentIdx ? '✓' : i + 1}
                  </div>
                  {i < statusOrder.length - 1 && (
                    <div className={`cd-step-line ${i < currentIdx ? 'filled' : ''}`} />
                  )}
                </div>
                <div className="cd-step-info">
                  <strong className={i <= currentIdx ? 'active-label' : ''}>{s}</strong>
                  {i < currentIdx && <p>Completed</p>}
                  {i === currentIdx && <p className="current-p">Current stage</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="cd-section-card">
          <h2>Description</h2>
          <p>{complaint.description}</p>
        </div>

        {/* Timeline */}
        <div className="cd-section-card">
          <h2>Activity Timeline</h2>
          <div className="cd-timeline">
            {complaint.timeline.map((t, i) => (
              <div key={i} className="cd-timeline-item">
                <div className="cd-tl-dot"
                  style={{ background: statusColor[t.status] || '#6366f1' }} />
                <div className="cd-tl-body">
                  <strong>{t.status}</strong>
                  <p>{t.note}</p>
                  <span>{new Date(t.date).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="cd-actions">
          <Link to="/report" className="cd-action-btn primary">+ File Another Complaint</Link>
          <Link to="/dashboard" className="cd-action-btn ghost">← Back to Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
