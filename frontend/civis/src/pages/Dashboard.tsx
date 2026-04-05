import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'
import { getComplaintsByUser, type Complaint } from '../api/client'
import './Dashboard.css'

const statusColor: Record<string, string> = {
  Submitted: '#6366f1',
  Acknowledged: '#f59e0b',
  'Under Review': '#3b82f6',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadComplaints() {
      if (!user) return
      try {
        setComplaints(await getComplaintsByUser())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaints.')
      }
    }

    void loadComplaints()
  }, [user])

  const statuses = ['All', 'Submitted', 'Acknowledged', 'Under Review', 'In Progress', 'Resolved']
  // To keep internal logic working, 'All' etc. remain English strings, but we can display translated states if needed.
  // We'll leave the chip text mapping to a helper function if needed. Let's map display values for chips:
  const getStatusDisplay = (s: string) => {
    if (s === 'All') return t('dashboard.filterAll');
    if (s === 'Submitted') return t('howItWorks.stages.submitted');
    if (s === 'Acknowledged') return t('howItWorks.stages.acknowledged');
    if (s === 'Under Review') return t('howItWorks.stages.underReview');
    if (s === 'In Progress') return t('howItWorks.stages.inProgress');
    if (s === 'Resolved') return t('howItWorks.stages.resolved');
    return s;
  }

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter)

  const resolved = complaints.filter((c) => c.status === 'Resolved').length
  const pending = complaints.filter((c) => c.status !== 'Resolved').length

  return (
    <div className="db-page">
      {/* Sidebar */}
      <aside className="db-sidebar">
        <Link to="/" className="db-brand">
          <div className="db-brand-icon">
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
              <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 17c-3 0-5.7-1.5-7.3-3.8.03-2.4 4.9-3.7 7.3-3.7 2.4 0 7.3 1.3 7.3 3.7C25.7 27.5 23 28 20 28z" fill="white"/>
            </svg>
          </div>
          <span>Civis</span>
        </Link>

        <nav className="db-nav">
          <Link to="/dashboard" className="db-nav-item active">
            <span>🏠</span> {t('nav.dashboard')}
          </Link>
          {user?.admin && (
            <Link to="/admin/dashboard" className="db-nav-item">
              <span>🛡</span> {t('nav.adminDashboard')}
            </Link>
          )}
          <Link to="/report" className="db-nav-item">
            <span>📝</span> {t('nav.reportIssue')}
          </Link>
          <Link to="/how-it-works" className="db-nav-item">
            <span>❓</span> {t('nav.howItWorks')}
          </Link>
        </nav>

        <div className="db-user-block">
          <div className="db-avatar">{user?.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="db-user-name">{user?.name}</p>
            <p className="db-user-contact">{user?.mobile || user?.email}</p>
          </div>
          <button className="db-logout-btn" onClick={logout} title="Sign out">⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="db-main">
        <header className="db-header">
          <div>
            <h1>{t('dashboard.title')}</h1>
            <p>{t('dashboard.subtitle')}</p>
          </div>
          <Link to="/report" className="btn-file">
            {t('dashboard.fileNew')}
          </Link>
        </header>

        {/* Stats row */}
        <div className="db-stats">
          <div className="db-stat-card">
            <span className="db-stat-num">{complaints.length}</span>
            <span className="db-stat-label">{t('dashboard.totalFiled')}</span>
          </div>
          <div className="db-stat-card active">
            <span className="db-stat-num">{pending}</span>
            <span className="db-stat-label">{t('dashboard.inProgress')}</span>
          </div>
          <div className="db-stat-card resolved">
            <span className="db-stat-num">{resolved}</span>
            <span className="db-stat-label">{t('dashboard.resolved')}</span>
          </div>
          <div className="db-stat-card rate">
            <span className="db-stat-num">
              {complaints.length ? Math.round((resolved / complaints.length) * 100) : 0}%
            </span>
            <span className="db-stat-label">{t('dashboard.resolutionRate')}</span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="db-filters">
          {statuses.map((s) => (
            <button key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>
              {getStatusDisplay(s)}
            </button>
          ))}
        </div>

        {/* Complaint list */}
        {filtered.length === 0 ? (
          <div className="db-empty">
            <div className="empty-icon">📋</div>
            <h3>{error ? t('dashboard.emptyTitleError') : t('dashboard.emptyTitle')}</h3>
            <p>{error || t('dashboard.emptyDesc')}</p>
            <Link to="/report" className="btn-file">{t('dashboard.emptyBtn')}</Link>
          </div>
        ) : (
          <div className="db-list">
            {filtered.map((c) => (
              <Link to={`/complaint/${c.id}`} key={c.id} className="db-card">
                <div className="db-card-left">
                  <span className="db-cat-icon">{c.categoryIcon}</span>
                  <div>
                    <h3>{c.title}</h3>
                    <p className="db-card-meta">
                      <span>{c.id}</span>
                      <span>·</span>
                      <span>{c.location}</span>
                      <span>·</span>
                      <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>
                </div>
                <div className="db-card-right">
                  <span className="db-priority" data-p={c.priority}>{c.priority}</span>
                  <span className="db-status-badge"
                    style={{ background: statusColor[c.status] + '22', color: statusColor[c.status] }}>
                    {getStatusDisplay(c.status)}
                  </span>
                  <span className="db-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
