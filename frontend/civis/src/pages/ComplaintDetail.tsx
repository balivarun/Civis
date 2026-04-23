import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getComplaintById, type Complaint } from '../api/client'
import { useTranslation } from '../context/TranslationContext'
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
  const [error, setError] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    async function loadComplaint() {
      if (!id) {
        setLoading(false)
        return
      }
      try {
        setError('')
        setComplaint(await getComplaintById(id))
      } catch (err) {
        setComplaint(null)
        setError(err instanceof Error ? err.message : 'Failed to load complaint.')
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
        <h2>{t('detail.loadingBtn')}</h2>
        <p>{t('detail.loadingDesc')}</p>
      </div>
    )
  }

  if (!complaint) {
    return (
      <div className="cd-not-found">
        <div className="cd-nf-icon">🔍</div>
        <h2>{error ? 'Unable to load complaint' : t('detail.notFoundBtn')}</h2>
        <p>{error || t('detail.notFoundDesc').replace('{id}', id || '')}</p>
        <Link to="/dashboard" className="cd-back-btn">{t('detail.backDashboard')}</Link>
      </div>
    )
  }

  const currentIdx = statusOrder.indexOf(complaint.status)

  const getStatusDisplay = (s: string) => {
    if (s === 'Submitted') return t('howItWorks.stages.submitted');
    if (s === 'Acknowledged') return t('howItWorks.stages.acknowledged');
    if (s === 'Under Review') return t('howItWorks.stages.underReview');
    if (s === 'In Progress') return t('howItWorks.stages.inProgress');
    if (s === 'Resolved') return t('howItWorks.stages.resolved');
    return s;
  }

  return (
    <div className="cd-page">
      <div className="cd-topbar">
        <Link to="/dashboard" className="cd-back">{t('detail.backDashSlim')}</Link>
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
                {t('detail.filedOn')} {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
                &nbsp;·&nbsp; {complaint.location}
                {complaint.landmark && <>&nbsp;·&nbsp; {t('detail.near')} {complaint.landmark}</>}
              </p>
            </div>
          </div>
          <div className="cd-header-right">
            <span className="cd-status-badge"
              style={{ background: statusColor[complaint.status] + '22', color: statusColor[complaint.status] }}>
              {getStatusDisplay(complaint.status)}
            </span>
            <span className="cd-priority-badge" data-p={complaint.priority}>
              {complaint.priority} {t('detail.priority')}
            </span>
          </div>
        </div>

        {/* Status tracker */}
        <div className="cd-tracker-card">
          <h2>{t('detail.trackerTitle')}</h2>
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
                  <strong className={i <= currentIdx ? 'active-label' : ''}>{getStatusDisplay(s)}</strong>
                  {i < currentIdx && <p>{t('detail.completed')}</p>}
                  {i === currentIdx && <p className="current-p">{t('detail.currentStage')}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="cd-section-card">
          <h2>{t('detail.descTitle')}</h2>
          <p>{complaint.description}</p>
        </div>

        {complaint.imageDataUrl && (
          <div className="cd-section-card">
            <h2>{t('detail.photoTitle')}</h2>
            <img
              src={complaint.imageDataUrl}
              alt={t('detail.photoTitle')}
              className="cd-complaint-image"
            />
          </div>
        )}

        {/* Timeline */}
        <div className="cd-section-card">
          <h2>{t('detail.timelineTitle')}</h2>
          <div className="cd-timeline">
            {complaint.timeline.map((tItem, i) => (
              <div key={i} className="cd-timeline-item">
                <div className="cd-tl-dot"
                  style={{ background: statusColor[tItem.status] || '#6366f1' }} />
                <div className="cd-tl-body">
                  <strong>{getStatusDisplay(tItem.status)}</strong>
                  <p>{tItem.note}</p>
                  <span>{new Date(tItem.date).toLocaleString('en-IN', {
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
          <Link to="/report" className="cd-action-btn primary">{t('detail.fileAnother')}</Link>
          <Link to="/dashboard" className="cd-action-btn ghost">{t('detail.backDashboard')}</Link>
        </div>
      </div>
    </div>
  )
}
