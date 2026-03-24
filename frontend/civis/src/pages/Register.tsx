import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'
import {
  registerWithEmail,
  requestRegisterOtp,
  verifyRegisterOtp,
} from '../api/client'
import './Auth.css'

type Tab = 'mobile' | 'gmail'
type Stage = 'form' | 'otp'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [tab, setTab] = useState<Tab>('mobile')
  const [stage, setStage] = useState<Stage>('form')

  // Form fields
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass, setShowPass] = useState(false)

  // OTP
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [demoOtp, setDemoOtp] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  /* ── Mobile registration ── */
  async function handleMobileSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Enter your full name.'); return }
    if (!/^[6-9]\d{9}$/.test(mobile)) { setError('Enter a valid 10-digit mobile number.'); return }
    setLoading(true)
    try {
      const response = await requestRegisterOtp(name.trim(), mobile)
      setDemoOtp(response.otp)
      setLoading(false)
      setStage('otp')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to send OTP.')
    }
  }

  function handleOtpChange(value: string, index: number) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 5) document.getElementById(`rotp-${index + 1}`)?.focus()
  }

  function handleOtpKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`rotp-${index - 1}`)?.focus()
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const code = otp.join('')
    if (code.length < 6) { setError('Enter all 6 digits.'); return }
    setLoading(true)
    try {
      const user = await verifyRegisterOtp(name.trim(), mobile, code)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to verify OTP.')
    }
  }

  /* ── Gmail registration ── */
  async function handleGmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Enter your full name.'); return }
    if (!email.includes('@') || !email.includes('.')) { setError('Enter a valid email address.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirmPass) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      const user = await registerWithEmail(name.trim(), email, password)
      login(user)
      navigate('/dashboard')
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Failed to create account.')
    }
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
          <h2>{t('auth.registerSub')}</h2>
          <div className="auth-steps-mini">
            <div className="mini-step"><span>1</span><p>{t('howItWorks.step1Title')}</p></div>
            <div className="mini-step"><span>2</span><p>{t('howItWorks.step4Title')}</p></div>
            <div className="mini-step"><span>3</span><p>{t('howItWorks.step5Title')}</p></div>
          </div>
          <div className="auth-stat-pill">Free forever &nbsp;·&nbsp; No spam &nbsp;·&nbsp; Anonymous option</div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">

          {stage === 'form' ? (
            <>
              <div className="auth-card-header">
                <h1>{t('auth.registerTitle')}</h1>
                <p>It's free and takes under a minute</p>
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
                    <label>{t('auth.nameLabel')}</label>
                    <input type="text" placeholder="Rahul Sharma" value={name}
                      onChange={(e) => setName(e.target.value)} autoFocus required />
                  </div>
                  <div className="field-group">
                    <label>{t('auth.mobileLabel')}</label>
                    <div className="phone-wrap">
                      <span className="dial-code">+91</span>
                      <input type="tel" inputMode="numeric" maxLength={10}
                        placeholder="98765 43210" value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        required />
                    </div>
                  </div>
                  {error && <div className="form-error">⚠ {error}</div>}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : 'Get OTP'}
                  </button>
                </form>
              )}

              {tab === 'gmail' && (
                <form className="auth-form" onSubmit={handleGmailSubmit} noValidate>
                  <div className="field-group">
                    <label>{t('auth.nameLabel')}</label>
                    <input type="text" placeholder="Rahul Sharma" value={name}
                      onChange={(e) => setName(e.target.value)} autoFocus required />
                  </div>
                  <div className="field-group">
                    <label>{t('auth.emailLabel')}</label>
                    <input type="email" placeholder="you@gmail.com" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="field-group">
                    <label>{t('auth.passLabel')}</label>
                    <div className="pass-wrap">
                      <input type={showPass ? 'text' : 'password'}
                        placeholder="Min. 6 characters" value={password}
                        onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" className="eye-btn"
                        onClick={() => setShowPass((p) => !p)}>
                        {showPass ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Re-enter password"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)} required />
                  </div>
                  {error && <div className="form-error">⚠ {error}</div>}
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <span className="btn-spinner" /> : t('auth.registerBtn')}
                  </button>
                </form>
              )}

              <p className="switch-prompt">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="switch-link">{t('auth.signIn')}</Link>
              </p>
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
                    <input key={i} id={`rotp-${i}`} className="otp-cell"
                      type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      autoFocus={i === 0} />
                  ))}
                </div>
                {error && <div className="form-error">⚠ {error}</div>}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? <span className="btn-spinner" /> : 'Verify & Create Account'}
                </button>
                <p className="resend-row">
                  <button type="button" className="text-btn"
                    onClick={() => { setStage('form'); setOtp(['','','','','','']); setError('') }}>
                    ← Change number
                  </button>
                </p>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
