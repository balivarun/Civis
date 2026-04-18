import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'
import { getAdminComplaints, updateAdminComplaintStatus, type AdminComplaintSummary, type Complaint } from '../api/client'
import './Dashboard.css'

const statusColor: Record<string, string> = {
  Submitted: '#6366f1',
  Acknowledged: '#f59e0b',
  'Under Review': '#3b82f6',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState<AdminComplaintSummary[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadComplaints() {
      try {
        setComplaints(await getAdminComplaints())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaints.')
      }
    }

    void loadComplaints()
  }, [])

  const statuses = ['All', 'Submitted', 'Acknowledged', 'Under Review', 'In Progress', 'Resolved']
  const adminStatusOptions: Complaint['status'][] = ['Submitted', 'Acknowledged', 'Under Review', 'In Progress', 'Resolved']
  const categories = ['All', ...new Set(complaints.map((c) => c.category))]

  const getStatusDisplay = (s: string) => {
    if (s === 'All') return t('dashboard.filterAll')
    if (s === 'Submitted') return t('howItWorks.stages.submitted')
    if (s === 'Acknowledged') return t('howItWorks.stages.acknowledged')
    if (s === 'Under Review') return t('howItWorks.stages.underReview')
    if (s === 'In Progress') return t('howItWorks.stages.inProgress')
    if (s === 'Resolved') return t('howItWorks.stages.resolved')
    return s
  }

  const filtered = complaints.filter((c) => {
    const matchesStatus = filter === 'All' || c.status === filter
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery =
      !normalizedQuery
      || c.title.toLowerCase().includes(normalizedQuery)
      || c.id.toLowerCase().includes(normalizedQuery)
      || c.location.toLowerCase().includes(normalizedQuery)
      || c.reporterName.toLowerCase().includes(normalizedQuery)
      || c.reporterMobile.toLowerCase().includes(normalizedQuery)
      || c.reporterEmail.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesCategory && matchesQuery
  })
  const resolved = complaints.filter((c) => c.status === 'Resolved').length
  const pending = complaints.filter((c) => c.status !== 'Resolved').length
  const latestComplaint = complaints[0] ?? null

  async function handleStatusChange(complaintId: string, status: Complaint['status']) {
    setError('')
    setUpdatingId(complaintId)
    try {
      const updated = await updateAdminComplaintStatus(complaintId, status)
      setComplaints((current) =>
        current.map((complaint) =>
          complaint.id === complaintId
            ? {
                ...complaint,
                status: updated.status,
                updatedAt: updated.updatedAt,
              }
            : complaint,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update complaint status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="db-page">
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
          <Link to="/admin/dashboard" className="db-nav-item active">
            <span>🛡</span> {t('nav.adminDashboard')}
          </Link>
          <Link to="/dashboard" className="db-nav-item">
            <span>🏠</span> {t('nav.dashboard')}
          </Link>
          <Link to="/report" className="db-nav-item">
            <span>📝</span> {t('nav.reportIssue')}
          </Link>
        </nav>

        <div className="db-user-block">
          <div className="db-user-summary">
            <div className="db-avatar">{user?.name.charAt(0).toUpperCase()}</div>
            <div className="db-user-meta">
              <p className="db-user-name">{user?.name}</p>
              <p className="db-user-contact">{user?.mobile || user?.email}</p>
            </div>
          </div>
          <div className="db-user-actions">
            <button className="db-logout-btn" onClick={logout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      <main className="db-main">
        <header className="db-header db-header-hero">
          <div className="db-header-copy">
            <p className="db-header-eyebrow">Operations Center</p>
            <h1>{t('admin.title')}</h1>
            <p>{t('admin.subtitle')}</p>
          </div>
          <Link to="/dashboard" className="btn-file">
            {t('admin.openUserDashboard')}
          </Link>
        </header>

        <div className="db-stats">
          <div className="db-stat-card">
            <span className="db-stat-icon">🗂</span>
            <span className="db-stat-num">{complaints.length}</span>
            <span className="db-stat-label">{t('admin.totalComplaints')}</span>
          </div>
          <div className="db-stat-card active">
            <span className="db-stat-icon">🛠</span>
            <span className="db-stat-num">{pending}</span>
            <span className="db-stat-label">{t('dashboard.inProgress')}</span>
          </div>
          <div className="db-stat-card resolved">
            <span className="db-stat-icon">✅</span>
            <span className="db-stat-num">{resolved}</span>
            <span className="db-stat-label">{t('dashboard.resolved')}</span>
          </div>
          <div className="db-stat-card rate">
            <span className="db-stat-icon">👥</span>
            <span className="db-stat-num">{new Set(complaints.map((c) => c.userId)).size}</span>
            <span className="db-stat-label">{t('admin.totalCitizens')}</span>
          </div>
        </div>

        <div className="db-filters">
          {statuses.map((s) => (
            <button key={s}
              className={`filter-chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}>
              {getStatusDisplay(s)}
            </button>
          ))}
        </div>

        <div className="admin-toolbar admin-toolbar-panel">
          <input
            className="admin-search"
            type="search"
            placeholder={t('admin.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="admin-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? t('admin.allCategories') : category}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="db-empty">
            <div className="empty-icon">🗂</div>
            <h3>{error ? t('dashboard.emptyTitleError') : t('admin.emptyTitle')}</h3>
            <p>{error || t('admin.emptyDesc')}</p>
          </div>
        ) : (
          <section className="db-complaints-shell admin-shell">
            <div className="db-complaints-head">
              <div>
                <p className="db-section-eyebrow">Admin Queue</p>
                <h2>Citizen complaints</h2>
              </div>
              {latestComplaint && (
                <div className="db-latest-pill">
                  <span>Latest</span>
                  <strong>{latestComplaint.id}</strong>
                </div>
              )}
            </div>
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.tableComplaint')}</th>
                  <th>{t('admin.tableCitizen')}</th>
                  <th>{t('admin.tableCategory')}</th>
                  <th>{t('admin.tableLocation')}</th>
                  <th>{t('admin.tablePriority')}</th>
                  <th>{t('admin.tableStatus')}</th>
                  <th>{t('admin.tableAdminAction')}</th>
                  <th>{t('admin.tableFiledOn')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link to={`/complaint/${c.id}`} className="admin-table-link">
                        <strong>{c.title}</strong>
                        <span>{c.id}</span>
                      </Link>
                    </td>
                    <td>
                      <div className="admin-table-citizen">
                        <strong>{c.reporterName}</strong>
                        <span>{c.reporterMobile || c.reporterEmail || t('admin.noContact')}</span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-table-category">{c.categoryIcon} {c.category}</span>
                    </td>
                    <td>{c.location}</td>
                    <td>
                      <span className="db-priority" data-p={c.priority}>{c.priority}</span>
                    </td>
                    <td>
                      <span
                        className="db-status-badge"
                        style={{ background: statusColor[c.status] + '22', color: statusColor[c.status] }}
                      >
                        {getStatusDisplay(c.status)}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={c.status}
                        disabled={updatingId === c.id}
                        onChange={(e) => void handleStatusChange(c.id, e.target.value as Complaint['status'])}
                      >
                        {adminStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {getStatusDisplay(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
