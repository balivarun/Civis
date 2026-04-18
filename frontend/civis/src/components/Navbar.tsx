import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/TranslationContext'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState('')
  const { user, isLoggedIn, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const profileShellRef = useRef<HTMLLIElement | null>(null)
  const profileFileInputRef = useRef<HTMLInputElement | null>(null)
  const close = () => setMenuOpen(false)

  useEffect(() => {
    if (!user) {
      setProfileImage('')
      setProfileOpen(false)
      return
    }

    const savedImage = window.localStorage.getItem(`civis-profile-image:${user.id}`) ?? ''
    setProfileImage(savedImage)
  }, [user])

  useEffect(() => {
    if (!profileOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!profileShellRef.current?.contains(event.target as Node)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [profileOpen])

  function handleLogout() {
    void logout()
    setProfileOpen(false)
    close()
    navigate('/')
  }

  function handleProfileImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !user) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setProfileImage(result)
      window.localStorage.setItem(`civis-profile-image:${user.id}`, result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function handleRemoveProfileImage() {
    if (!user) return
    setProfileImage('')
    window.localStorage.removeItem(`civis-profile-image:${user.id}`)
  }

  const primaryContact = user?.email || user?.mobile || 'Not available'
  const accountType = user?.admin ? 'Admin account' : 'Citizen account'
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.createdAt))
    : 'Not available'

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" onClick={close}>
          <div className="brand-logo-icon">
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
              <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 17c-3 0-5.7-1.5-7.3-3.8.03-2.4 4.9-3.7 7.3-3.7 2.4 0 7.3 1.3 7.3 3.7C25.7 27.5 23 28 20 28z" fill="white"/>
            </svg>
          </div>
          <span className="brand-name">Civis</span>
        </Link>

        <button className="hamburger" aria-label="Toggle menu"
          onClick={() => setMenuOpen((p) => !p)}>
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
          <span className={`bar ${menuOpen ? 'open' : ''}`} />
        </button>

        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li>
            <button
              type="button"
              className="theme-trigger"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </li>
          <li><NavLink to="/" end onClick={close}>{t('nav.home')}</NavLink></li>
          <li><NavLink to="/how-it-works" onClick={close}>{t('nav.howItWorks')}</NavLink></li>
          <li><a href="/#categories" onClick={close}>{t('nav.categories')}</a></li>
          <li><NavLink to="/faq" onClick={close}>{t('nav.faq')}</NavLink></li>

          {isLoggedIn ? (
            <>
              <li><NavLink to="/dashboard" onClick={close}>{t('nav.dashboard')}</NavLink></li>
              {user?.admin && <li><NavLink to="/admin/dashboard" onClick={close}>{t('nav.adminDashboard')}</NavLink></li>}
              <li><NavLink to="/report" className="btn-report" onClick={close}>{t('nav.reportIssue')}</NavLink></li>
              <li className="nav-user-shell" ref={profileShellRef}>
                <div className="nav-user-row">
                  <button
                    type="button"
                    className={`nav-profile-trigger ${profileOpen ? 'open' : ''}`}
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-expanded={profileOpen}
                    aria-label="Open profile"
                  >
                    {profileImage ? (
                      <img className="nav-avatar-image" src={profileImage} alt={user?.name ?? 'Profile'} />
                    ) : (
                      <div className="nav-avatar">{user?.name.charAt(0).toUpperCase()}</div>
                    )}
                    <span className="nav-user-name">{user?.name.split(' ')[0]}</span>
                    <span className="nav-profile-caret">{profileOpen ? '▴' : '▾'}</span>
                  </button>
                  <button className="btn-logout" onClick={handleLogout}>{t('nav.signOut')}</button>
                </div>

                {profileOpen && (
                  <div className="nav-profile-card">
                    <div className="nav-profile-header">
                      {profileImage ? (
                        <img className="nav-profile-image" src={profileImage} alt={user?.name ?? 'Profile'} />
                      ) : (
                        <div className="nav-profile-avatar">{user?.name.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="nav-profile-intro">
                        <p className="nav-profile-kicker">Profile</p>
                        <h3>{user?.name}</h3>
                        <p>{primaryContact}</p>
                      </div>
                    </div>

                    <div className="nav-profile-image-actions">
                      <input
                        ref={profileFileInputRef}
                        type="file"
                        accept="image/*"
                        className="nav-profile-file-input"
                        onChange={handleProfileImageSelect}
                      />
                      <button
                        type="button"
                        className="nav-profile-secondary-btn"
                        onClick={() => profileFileInputRef.current?.click()}
                      >
                        Change profile image
                      </button>
                      {profileImage && (
                        <button
                          type="button"
                          className="nav-profile-text-btn"
                          onClick={handleRemoveProfileImage}
                        >
                          Remove image
                        </button>
                      )}
                    </div>

                    <div className="nav-profile-details">
                      <div className="nav-profile-detail">
                        <span>Full name</span>
                        <strong>{user?.name}</strong>
                      </div>
                      <div className="nav-profile-detail">
                        <span>{user?.email ? 'Email' : 'Mobile'}</span>
                        <strong>{primaryContact}</strong>
                      </div>
                      <div className="nav-profile-detail">
                        <span>Account type</span>
                        <strong>{accountType}</strong>
                      </div>
                      <div className="nav-profile-detail">
                        <span>Member since</span>
                        <strong>{memberSince}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn-login" onClick={close}>{t('nav.login')}</Link></li>
              <li><Link to="/register" className="btn-report" onClick={close}>{t('nav.getStarted')}</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}
