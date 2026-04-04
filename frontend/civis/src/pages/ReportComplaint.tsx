import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'
import { createComplaint } from '../api/client'
import './ReportComplaint.css'

const MIN_DESCRIPTION_LENGTH = 30

function generateDescriptionFromTitle(rawTitle: string) {
  const title = rawTitle.trim().replace(/\.$/, '')
  if (!title) return ''

  return `Issue reported: ${title}. This problem is affecting nearby residents and needs attention from the concerned civic department.`
}

export default function ReportComplaint() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const categories = [
    { icon: '🛣', label: t('categories.roads'), val: 'Roads & Potholes' },
    { icon: '💡', label: t('categories.lights'), val: 'Street Lights' },
    { icon: '🚰', label: t('categories.water'), val: 'Water Supply' },
    { icon: '🗑', label: t('categories.garbage'), val: 'Garbage & Sanitation' },
    { icon: '🌳', label: t('categories.parks'), val: 'Parks & Trees' },
    { icon: '🚧', label: t('categories.drainage'), val: 'Drainage & Flooding' },
    { icon: '🏗', label: t('categories.bridges'), val: 'Footpaths & Bridges' },
    { icon: '📶', label: t('categories.wifi'), val: 'Public WiFi & Signals' },
    { icon: '🚌', label: t('categories.transport'), val: 'Public Transport' },
    { icon: '🐕', label: t('categories.animals'), val: 'Stray Animals' },
  ]

  const priorities = [
    { value: 'Low', display: t('priorities.low'), desc: t('priorities.lowDesc') },
    { value: 'Medium', display: t('priorities.medium'), desc: t('priorities.mediumDesc') },
    { value: 'High', display: t('priorities.high'), desc: t('priorities.highDesc') },
  ]

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
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  function goNext() {
    setError('')
    if (step === 1 && !category) { setError(t('report.errCategory')); return }
    if (step === 2) {
      if (!title.trim()) { setError(t('report.errTitle')); return }
      if (description.trim().length < MIN_DESCRIPTION_LENGTH) { setError(t('report.errDesc')); return }
    }
    if (step === 3 && !location.trim()) { setError(t('report.errLoc')); return }
    setStep((s) => s + 1)
  }

  function handleGenerateDescription() {
    if (!title.trim()) {
      setError(t('report.errTitle'))
      return
    }

    setError('')
    setIsGeneratingDescription(true)
    window.setTimeout(() => {
      setDescription(generateDescriptionFromTitle(title))
      setIsGeneratingDescription(false)
    }, 350)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    createComplaint({
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

  const getStepName = (i: number) => {
    if (i === 1) return t('report.step1');
    if (i === 2) return t('report.step2');
    if (i === 3) return t('report.step3');
    if (i === 4) return t('report.step4');
    return '';
  }

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
          {[1,2,3,4].map((i) => (
            <div key={i} className={`rstep ${step === i ? 'active' : ''} ${step > i ? 'done' : ''}`}>
              <div className="rstep-dot">{step > i ? '✓' : i}</div>
              <span>{getStepName(i)}</span>
            </div>
          ))}
        </div>
        <div className="report-tip">
          <span>💡</span>
          <p>{t('report.tip')}</p>
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
              {step === 1 && t('report.title1')}
              {step === 2 && t('report.title2')}
              {step === 3 && t('report.title3')}
              {step === 4 && t('report.title4')}
            </h1>
            <p>{t('report.stepXof4', { step: step.toString() })}</p>
          </div>

          {/* Step 1: Category */}
          {step === 1 && (
            <div className="cat-grid">
              {categories.map((c) => (
                <button
                  key={c.val}
                  className={`cat-option ${category === c.val ? 'selected' : ''}`}
                  onClick={() => { setCategory(c.val); setCategoryIcon(c.icon); setError('') }}
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
                <label>{t('report.titleLabel')} <span className="req">*</span></label>
                <input type="text" placeholder={t('report.titlePlaceholder')}
                  value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                <span className="char-hint">{title.length}/100</span>
              </div>
              <div className="field-group">
                <div className="field-label-row">
                  <label>{t('report.descLabel')} <span className="req">*</span></label>
                  <button
                    type="button"
                    className="ai-generate-btn"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription ? t('report.aiGenerating') : t('report.aiGenerate')}
                  </button>
                </div>
                <p className="field-helper">{t('report.aiHelp')}</p>
                <textarea placeholder={t('report.descPlaceholder')}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  rows={5} maxLength={500} />
                <span className="char-hint">{description.length}/500</span>
              </div>
              <div className="field-group">
                <label>{t('report.priorityLabel')}</label>
                <div className="priority-options">
                  {priorities.map((p) => (
                    <button key={p.value} type="button"
                      className={`priority-opt ${priority === p.value ? 'selected' : ''}`}
                      data-p={p.value}
                      onClick={() => setPriority(p.value as 'Low' | 'Medium' | 'High')}>
                      <strong>{p.display}</strong>
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
                <label>{t('report.locLabel')} <span className="req">*</span></label>
                <input type="text" placeholder={t('report.locPlaceholder')}
                  value={location} onChange={(e) => setLocation(e.target.value)} autoFocus />
              </div>
              <div className="field-group">
                <label>{t('report.landmarkLabel')}</label>
                <input type="text" placeholder={t('report.landmarkPlaceholder')}
                  value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              </div>
              <div className="map-placeholder">
                <span>🗺</span>
                <p>{t('report.mapComingSoon')}</p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <form onSubmit={handleSubmit}>
              <div className="review-card">
                <div className="review-row">
                  <span>{t('report.step1')}</span>
                  <strong>{categoryIcon} {categories.find(c => c.val === category)?.label || category}</strong>
                </div>
                <div className="review-row">
                  <span>{t('report.titleLabel')}</span>
                  <strong>{title}</strong>
                </div>
                <div className="review-row">
                  <span>{t('report.descLabel')}</span>
                  <strong>{description}</strong>
                </div>
                <div className="review-row">
                  <span>{t('report.locLabel')}</span>
                  <strong>{location}{landmark ? `, near ${landmark}` : ''}</strong>
                </div>
                <div className="review-row">
                  <span>{t('report.priorityLabel')}</span>
                  <strong data-p={priority}>{priorities.find(p => p.value === priority)?.display || priority}</strong>
                </div>
                <div className="review-row">
                  <span>{t('report.reviewFiledBy')}</span>
                  <strong>{user?.name}</strong>
                </div>
              </div>
              {error && <div className="form-error">⚠ {error}</div>}
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <span className="btn-spinner" /> : t('report.submitBtn')}
              </button>
            </form>
          )}

          {/* Navigation */}
          {error && step !== 4 && <div className="form-error" style={{ marginTop: '1rem' }}>⚠ {error}</div>}

          {step < 4 && (
            <div className="report-nav-btns">
              {step > 1 && (
                <button className="back-btn" onClick={() => { setStep((s) => s - 1); setError('') }}>
                  {t('report.backBtn')}
                </button>
              )}
              <button className="next-btn" onClick={goNext}>
                {step === 3 ? t('report.reviewNextBtn') : t('report.nextBtn')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
