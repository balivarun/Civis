import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'
import {
  loginWithEmail,
  requestLoginOtp,
  verifyLoginOtp,
} from '../api/client'
import './Auth.css'

type Tab = 'mobile' | 'gmail'
type Stage = 'input' | 'otp'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [tab, setTab] = useState<Tab>('mobile')
  const [stage, setStage] = useState<Stage>('input')

  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [demoOtp, setDemoOtp] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ── Mobile: send OTP ── */
  async function handleMobileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    try {
      const response = await requestLoginOtp(mobile)
      setDemoOtp(response.otp)
      setLoading(false)
      setStage('otp')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to send OTP.')
    }
  }

  /* ── OTP: verify ── */
  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  function handleOtpKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits.'); return }
    setLoading(true)
    try {
      const user = await verifyLoginOtp(mobile, code)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to verify OTP.')
    }
  }

  /* ── Gmail: sign in ── */
  async function handleGmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.includes('@') || !email.includes('.')) {
      setError('Enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const user = await loginWithEmail(email, password)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to sign in.')
    }
  }

  function resetForm() {
    setStage('input')
    setOtp(['', '', '', '', '', ''])
    setDemoOtp('')
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-brand">
            <div className="auth-brand-logo">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.15"/>
                <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 17c-3 0-5.7-1.5-7.3-3.8.03-2.4 4.9-3.7 7.3-3.7 2.4 0 7.3 1.3 7.3 3.7C25.7 27.5 23 28 20 28z" fill="white"/>
              </svg>
            </div>
            <span>Civis</span>
          </Link>
          <h2>{t('auth.loginSub')}</h2>
          <ul className="auth-perks">
            <li><span>🛣</span> {t('categories.roads')}</li>
            <li><span>💡</span> {t('categories.lights')}</li>
            <li><span>🚰</span> {t('categories.water')}</li>
            <li><span>🗑</span> {t('categories.garbage')}</li>
            <li><span>🌳</span> {t('categories.parks')}</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">

          {stage === 'input' ? (
            <>
              <div className="auth-card-header">
                <h1>{t('auth.loginTitle')}</h1>
                <p>{t('auth.loginSub')}</p>
              </div>

              <div className="tab-row">
                <button className={`tab-btn ${tab === 'mobile' ? 'active' : ''}`}
                  onClick={() => { setTab('mobile'); setError('') }}>
                  📱 Mobile OTP
                </button>
                <button className={`tab-btn ${tab === 'gmail' ? 'active' : ''}`}
                  onClick={() => { setTab('gmail'); setError('') }}>
                  ✉ Email
                </button>
              </div>

              {tab === 'mobile' && (
                <form className="auth-form" onSubmit={handleMobileSubmit} noValidate>
                  <div className="field-group">
                    <label htmlFor="mobile">{t('auth.mobileLabel')}</label>
                    <div className="phone-wrap">
                      <span className="dial-code">+91</span>
                      <input id="mobile" type="tel" inputMode="numeric" maxLength={10}
                        placeholder="98765 43210" value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        autoFocus required />
                    </div>
                  </div>
                  {error && <div className="form-error">⚠ {error}</div>}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : 'Send OTP'}
                  </button>
                </form>
              )}

              {tab === 'gmail' && (
                <form className="auth-form" onSubmit={handleGmailSubmit} noValidate>
                  <div className="field-group">
                    <label htmlFor="email">{t('auth.emailLabel')}</label>
                    <input id="email" type="email" placeholder="you@gmail.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      autoFocus required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="password">{t('auth.passLabel')}</label>
                    <div className="pass-wrap">
                      <input id="password" type={showPass ? 'text' : 'password'}
                        placeholder="Your password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="eye-btn"
                        onClick={() => setShowPass((p) => !p)}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  {error && <div className="form-error">⚠ {error}</div>}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : t('auth.loginBtn')}
                  </button>
                </form>
              )}

              <p className="switch-prompt">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="switch-link">{t('auth.signUp')}</Link>
              </p>
              
              <div style={{marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center'}}>
                {t('auth.testCreds')}
              </div>
            </>
          ) : (
            <>
              <div className="auth-card-header">
                <h1>Verify OTP</h1>
                <p>Sent to +91 {mobile}</p>
              </div>

              {demoOtp && (
               <div className="demo-otp-box">
                  <span className="demo-label">Demo OTP (no SMS service)</span>
                  <span className="demo-code">{demoOtp}</span>
                </div>
              )}

              <form className="auth-form" onSubmit={handleOtpSubmit} noValidate>
                <div className="otp-grid">
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} className="otp-cell"
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      autoFocus={i === 0} />
                  ))}
                </div>
                {error && <div className="form-error">⚠ {error}</div>}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Verify & Sign In'}
                </button>
                <p className="resend-row">
                  Wrong number?{' '}
                  <button type="button" className="text-btn" onClick={resetForm}>Go back</button>
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
