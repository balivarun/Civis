import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createComplaint } from '../api/client'
import './ReportComplaint.css'

const categories = [
  { icon: '🛣', label: 'Roads & Potholes' },
  { icon: '💡', label: 'Street Lights' },
  { icon: '🚰', label: 'Water Supply' },
  { icon: '🗑', label: 'Garbage & Sanitation' },
  { icon: '🌳', label: 'Parks & Trees' },
  { icon: '🚧', label: 'Drainage & Flooding' },
  { icon: '🏗', label: 'Footpaths & Bridges' },
  { icon: '📶', label: 'Public WiFi & Signals' },
  { icon: '🚌', label: 'Public Transport' },
  { icon: '🐕', label: 'Stray Animals' },
]

const priorities = [
  { value: 'Low', desc: 'Minor inconvenience, not urgent' },
  { value: 'Medium', desc: 'Affects daily commute or routine' },
  { value: 'High', desc: 'Safety risk, needs immediate action' },
]

export default function ReportComplaint() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [category, setCategory] = useState('')
  const [categoryIcon, setCategoryIcon] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [landmark, setLandmark] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function goNext() {
    setError('')
    if (step === 1 && !category) { setError('Please select a category.'); return }
    if (step === 2) {
      if (!title.trim()) { setError('Please enter a complaint title.'); return }
      if (description.trim().length < 20) { setError('Description must be at least 20 characters.'); return }
    }
    if (step === 3 && !location.trim()) { setError('Please enter the location.'); return }
    setStep((s) => s + 1)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    createComplaint({
      userId: user.id,
      category,
      categoryIcon,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      landmark: landmark.trim(),
      priority,
    })
      .then((complaint) => {
        navigate(`/complaint/${complaint.id}`)
      })
      .catch((err) => {
        setSubmitting(false)
        setError(err instanceof Error ? err.message : 'Failed to submit complaint.')
      })
  }

  const progressPct = (step / 4) * 100

  return (
    <div className="report-page">
      <div className="report-left">
        <Link to="/dashboard" className="report-brand">
          <div className="report-brand-icon">
            <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
              <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 17c-3 0-5.7-1.5-7.3-3.8.03-2.4 4.9-3.7 7.3-3.7 2.4 0 7.3 1.3 7.3 3.7C25.7 27.5 23 28 20 28z" fill="white"/>
            </svg>
          </div>
          <span>Civis</span>
        </Link>
        <div className="report-steps-nav">
          {['Category', 'Details', 'Location', 'Review'].map((s, i) => (
            <div key={s} className={`rstep ${step === i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
              <div className="rstep-dot">{step > i + 1 ? '✓' : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="report-tip">
          <span>💡</span>
          <p>Clear complaints with exact location get resolved 2x faster.</p>
        </div>
      </div>

      <div className="report-right">
        <div className="report-card">
          {/* Progress bar */}
          <div className="report-progress-bar">
            <div className="report-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="report-card-header">
            <h1>
              {step === 1 && 'What type of issue is it?'}
              {step === 2 && 'Describe the problem'}
              {step === 3 && 'Where is the issue?'}
              {step === 4 && 'Review & Submit'}
            </h1>
            <p>Step {step} of 4</p>
          </div>

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="cat-grid">
              {categories.map((c) => (
                <button
                  key={c.label}
                  className={`cat-option ${category === c.label ? 'selected' : ''}`}
                  onClick={() => { setCategory(c.label); setCategoryIcon(c.icon); setError('') }}
                  type="button"
                >
                  <span className="cat-opt-icon">{c.icon}</span>
                  <span className="cat-opt-label">{c.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="report-fields">
              <div className="field-group">
                <label>Complaint Title <span className="req">*</span></label>
                <input type="text" placeholder="e.g. Deep pothole on MG Road near bus stop"
                  value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                <span className="char-hint">{title.length}/100</span>
              </div>
              <div className="field-group">
                <label>Description <span className="req">*</span></label>
                <textarea placeholder="Describe the issue in detail — size, how long it's been there, how it affects you..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={5} maxLength={500} />
                <span className="char-hint">{description.length}/500</span>
              </div>
              <div className="field-group">
                <label>Priority</label>
                <div className="priority-options">
                  {priorities.map((p) => (
                    <button key={p.value} type="button"
                      className={`priority-opt ${priority === p.value ? 'selected' : ''}`}
                      data-p={p.value}
                      onClick={() => setPriority(p.value as 'Low' | 'Medium' | 'High')}>
                      <strong>{p.value}</strong>
                      <span>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="report-fields">
              <div className="field-group">
                <label>Area / Street / Ward <span className="req">*</span></label>
                <input type="text" placeholder="e.g. Sector 14, MG Road, Ward 7"
                  value={location} onChange={(e) => setLocation(e.target.value)} autoFocus />
              </div>
              <div className="field-group">
                <label>Landmark (optional)</label>
                <input type="text" placeholder="e.g. Near HDFC Bank, behind City Mall"
                  value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              </div>
              <div className="map-placeholder">
                <span>🗺</span>
                <p>Map pin coming soon (connect to Maps API)</p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <div className="review-card">
                <div className="review-row">
                  <span>Category</span>
                  <strong>{categoryIcon} {category}</strong>
                </div>
                <div className="review-row">
                  <span>Title</span>
                  <strong>{title}</strong>
                </div>
                <div className="review-row">
                  <span>Description</span>
                  <strong>{description}</strong>
                </div>
                <div className="review-row">
                  <span>Location</span>
                  <strong>{location}{landmark ? `, near ${landmark}` : ''}</strong>
                </div>
                <div className="review-row">
                  <span>Priority</span>
                  <strong data-p={priority}>{priority}</strong>
                </div>
                <div className="review-row">
                  <span>Filed by</span>
                  <strong>{user?.name}</strong>
                </div>
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="btn-spinner" /> : '✅ Submit Complaint'}
              </button>
            </form>
          )}

          {/* Navigation */}
          {error && step !== 4 && <div className="form-error" style={{ marginTop: '1rem' }}>⚠ {error}</div>}

          {step < 4 && (
            <div className="report-nav-btns">
              {step > 1 && (
                <button className="back-btn" onClick={() => { setStep((s) => s - 1); setError('') }}>
                  ← Back
                </button>
              )}
              <button className="next-btn" onClick={goNext}>
                {step === 3 ? 'Review →' : 'Next →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
