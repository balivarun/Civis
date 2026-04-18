import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { deleteAccountSession } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, logout, profileImage, setProfileImage, clearProfileImage } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [deleteStep, setDeleteStep] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null

  const primaryContact = user.email || user.mobile || 'Not available'
  const accountType = user.admin ? 'Admin account' : 'Citizen account'
  const memberSince = user.createdAt
    ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(user.createdAt))
    : 'Not available'

  function handleProfileImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setProfileImage(result)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setError('')
    try {
      await deleteAccountSession()
      await logout()
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <header className="profile-hero">
          <div>
            <p className="profile-eyebrow">Account Settings</p>
            <h1>My Profile</h1>
            <p className="profile-subtitle">Manage your profile details, theme, and account access from one place.</p>
          </div>
          <button type="button" className="profile-theme-btn" onClick={toggleTheme}>
            {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          </button>
        </header>

        <div className="profile-grid">
          <section className="profile-card profile-card-main">
            <div className="profile-identity">
              {profileImage ? (
                <img className="profile-image" src={profileImage} alt={user.name} />
              ) : (
                <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
              )}

              <div className="profile-identity-copy">
                <p className="profile-label">Visible profile</p>
                <h2>{user.name}</h2>
                <p>{primaryContact}</p>
              </div>
            </div>

            <div className="profile-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="profile-file-input"
                onChange={handleProfileImageSelect}
              />
              <button type="button" className="profile-primary-btn" onClick={() => fileInputRef.current?.click()}>
                Change profile image
              </button>
              {profileImage && (
                <button type="button" className="profile-secondary-btn" onClick={clearProfileImage}>
                  Remove current image
                </button>
              )}
            </div>
          </section>

          <section className="profile-card">
            <p className="profile-label">Profile details</p>
            <div className="profile-detail-list">
              <div className="profile-detail-item">
                <span>Full name</span>
                <strong>{user.name}</strong>
              </div>
              <div className="profile-detail-item">
                <span>{user.email ? 'Email address' : 'Mobile number'}</span>
                <strong>{primaryContact}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Account type</span>
                <strong>{accountType}</strong>
              </div>
              <div className="profile-detail-item">
                <span>Member since</span>
                <strong>{memberSince}</strong>
              </div>
            </div>
          </section>

          <section className="profile-card profile-danger">
            <p className="profile-label">Danger zone</p>
            <h3>Delete my account</h3>
            <p>This removes your account, complaints, and active sessions from Civis.</p>
            {error && <p className="profile-error">{error}</p>}
            {!deleteStep ? (
              <button type="button" className="profile-danger-btn" onClick={() => setDeleteStep(true)}>
                Delete my account
              </button>
            ) : (
              <div className="profile-danger-actions">
                <button type="button" className="profile-danger-btn" onClick={() => void handleDeleteAccount()} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Confirm delete'}
                </button>
                <button type="button" className="profile-secondary-btn" onClick={() => setDeleteStep(false)} disabled={deleting}>
                  Cancel
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
