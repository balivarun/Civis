import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/TranslationContext'
import { getComplaintsByUser, changePassword as changePasswordApi, type Complaint } from '../api/client'
import './Dashboard.css'

const statusColor: Record<string, string> = {
  Submitted: '#6366f1',
  Acknowledged: '#f59e0b',
  'Under Review': '#3b82f6',
  'In Progress': '#f97316',
  Resolved: '#22c55e',
}

const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/
const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.'

export default function Dashboard() {
  const { user, logout, profileImage } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [filter, setFilter] = useState<string>('All')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwSuccess, setPwSuccess] = useState('')

  useEffect(() => {
    async function loadComplaints() {
      if (!user) return
      try {
        setLoading(true)
        setError('')
        setComplaints(await getComplaintsByUser())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load complaints.')
      } finally {
        setLoading(false)
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
  const latestComplaint = complaints[0] ?? null

  function getStatusStep(status: Complaint['status']) {
    if (status === 'Submitted') return 1
    if (status === 'Acknowledged') return 2
    if (status === 'Under Review') return 3
    if (status === 'In Progress') return 4
    return 5
  }

  async function handleChangePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (!oldPassword.trim()) {
      setPwError('Enter your current password.')
      return
    }
    if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
      setPwError(STRONG_PASSWORD_MESSAGE)
      return
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('New passwords do not match.')
      return
    }

    setPwLoading(true)
    try {
      await changePasswordApi(oldPassword, newPassword, confirmNewPassword)
      setShowChangePassword(false)
      setOldPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setPwError('')
      setPwSuccess('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

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

        <button type="button" className="db-theme-toggle" onClick={toggleTheme}>
          <span>{theme === 'light' ? '🌙' : '☀️'}</span>
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>

        <div className="db-user-block">
          <Link to="/profile" className="db-user-summary">
            {profileImage ? (
              <img className="db-avatar-image" src={profileImage} alt={user?.name} />
            ) : (
              <div className="db-avatar">{user?.name.charAt(0).toUpperCase()}</div>
            )}
            <div className="db-user-meta">
              <p className="db-user-name">{user?.name}</p>
              <p className="db-user-contact">{user?.mobile || user?.email}</p>
            </div>
          </Link>
          <div className="db-user-actions">
            <button
              type="button"
              className="db-change-password-btn"
              onClick={() => {
                setShowChangePassword(true)
                setPwError('')
                setPwSuccess('')
                setOldPassword('')
                setNewPassword('')
                setConfirmNewPassword('')
              }}
            >
              Change Password
            </button>
            <button className="db-logout-btn" onClick={logout} title="Sign out">⏻</button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="db-main">
        <header className="db-header db-header-hero">
          <div className="db-header-copy">
            <p className="db-header-eyebrow">Citizen Workspace</p>
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
            <span className="db-stat-icon">📋</span>
            <span className="db-stat-num">{complaints.length}</span>
            <span className="db-stat-label">{t('dashboard.totalFiled')}</span>
          </div>
          <div className="db-stat-card active">
            <span className="db-stat-icon">⏳</span>
            <span className="db-stat-num">{pending}</span>
            <span className="db-stat-label">{t('dashboard.inProgress')}</span>
          </div>
          <div className="db-stat-card resolved">
            <span className="db-stat-icon">✅</span>
            <span className="db-stat-num">{resolved}</span>
            <span className="db-stat-label">{t('dashboard.resolved')}</span>
          </div>
          <div className="db-stat-card rate">
            <span className="db-stat-icon">📈</span>
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
        {loading ? (
          <div className="db-empty db-empty-loading">
            <div className="empty-icon">⏳</div>
            <h3>Loading complaints</h3>
            <p>Your latest complaint data is being fetched.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="db-empty">
            <div className="empty-icon">📋</div>
            <h3>{error ? t('dashboard.emptyTitleError') : t('dashboard.emptyTitle')}</h3>
            <p>{error || t('dashboard.emptyDesc')}</p>
            <Link to="/report" className="btn-file">{t('dashboard.emptyBtn')}</Link>
          </div>
        ) : (
          <section className="db-complaints-shell">
            <div className="db-complaints-head">
              <div>
                <p className="db-section-eyebrow">Complaint Overview</p>
                <h2>All complaints</h2>
              </div>
              {latestComplaint && (
                <div className="db-latest-pill">
                  <span>Latest</span>
                  <strong>{latestComplaint.id}</strong>
                </div>
              )}
            </div>
            <div className="db-list">
            {filtered.map((c) => (
              <Link to={`/complaint/${c.id}`} key={c.id} className="db-card">
                <div className="db-card-top">
                  <div className="db-card-left">
                    <div className="db-cat-badge">
                      <span className="db-cat-icon">{c.categoryIcon}</span>
                    </div>
                    <div className="db-card-copy">
                      <div className="db-card-title-row">
                        <h3>{c.title}</h3>
                        <span className="db-card-id">{c.id}</span>
                      </div>
                      <p className="db-card-meta">
                        <span>{c.location}</span>
                        <span>•</span>
                        <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {c.landmark && (
                          <>
                            <span>•</span>
                            <span>{c.landmark}</span>
                          </>
                        )}
                      </p>
                      <p className="db-card-desc">{c.description}</p>
                    </div>
                  </div>
                  {c.imageDataUrl && (
                    <div className="db-card-thumb-wrap">
                      <img src={c.imageDataUrl} alt={c.title} className="db-card-thumb" />
                    </div>
                  )}
                </div>
                <div className="db-card-bottom">
                  <div className="db-card-progress">
                    <div className="db-card-progress-track">
                      <div
                        className="db-card-progress-fill"
                        style={{ width: `${(getStatusStep(c.status) / 5) * 100}%`, background: statusColor[c.status] }}
                      />
                    </div>
                    <span className="db-card-progress-label">
                      Stage {getStatusStep(c.status)} of 5
                    </span>
                  </div>
                  <div className="db-card-right">
                    <span className="db-priority" data-p={c.priority}>{c.priority}</span>
                    <span className="db-status-badge"
                      style={{ background: statusColor[c.status] + '22', color: statusColor[c.status] }}>
                      {getStatusDisplay(c.status)}
                    </span>
                    <span className="db-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </section>
        )}
      </main>
      {showChangePassword && (
        <div
          className="db-modal-overlay"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setShowChangePassword(false)}
        >
          <div className="db-modal" onMouseDown={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form className="db-change-password-form" onSubmit={handleChangePasswordSubmit} noValidate>
              <div className="db-field-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="db-field-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="db-field-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />
              </div>

              {pwError && <div className="db-form-error">⚠ {pwError}</div>}
              {pwSuccess && <div className="db-form-success">✅ {pwSuccess}</div>}

              <div className="db-modal-actions">
                <button
                  type="button"
                  className="db-btn-secondary"
                  onClick={() => setShowChangePassword(false)}
                  disabled={pwLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="db-btn-primary" disabled={pwLoading}>
                  {pwLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
