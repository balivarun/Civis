import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useTranslation } from '../context/TranslationContext'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, isLoggedIn, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const close = () => setMenuOpen(false)

  function handleLogout() {
    void logout()
    close()
    navigate('/')
  }

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

          {isLoggedIn ? (
            <>
              <li><NavLink to="/dashboard" onClick={close}>{t('nav.dashboard')}</NavLink></li>
              <li><NavLink to="/report" className="btn-report" onClick={close}>{t('nav.reportIssue')}</NavLink></li>
              <li>
                <div className="nav-user">
                  <div className="nav-avatar">{user?.name.charAt(0).toUpperCase()}</div>
                  <span className="nav-user-name">{user?.name.split(' ')[0]}</span>
                  <button className="btn-logout" onClick={handleLogout}>{t('nav.signOut')}</button>
                </div>
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
