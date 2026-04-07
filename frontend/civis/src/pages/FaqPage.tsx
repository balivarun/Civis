import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/TranslationContext'
import './FaqPage.css'

export default function FaqPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const faqs = [
    { q: t('faq.items.q1'), a: t('faq.items.a1') },
    { q: t('faq.items.q2'), a: t('faq.items.a2') },
    { q: t('faq.items.q3'), a: t('faq.items.a3') },
    { q: t('faq.items.q4'), a: t('faq.items.a4') },
    { q: t('faq.items.q5'), a: t('faq.items.a5') },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (name.trim().length < 2) {
      setError(t('faq.form.errName'))
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError(t('faq.form.errEmail'))
      return
    }
    if (question.trim().length < 10) {
      setError(t('faq.form.errQuestion'))
      return
    }

    setSubmitted(true)
    setName('')
    setEmail('')
    setQuestion('')
  }

  return (
    <div className="faq-page">
      <section className="faq-page-hero">
        <span className="faq-page-badge">{t('faq.badge')}</span>
        <h1>{t('faq.title')}</h1>
        <p>{t('faq.subtitle')}</p>
      </section>

      <section className="faq-page-content">
        <div className="faq-column">
          <div className="faq-section-head">
            <h2>{t('faq.commonTitle')}</h2>
            <p>{t('faq.commonSub')}</p>
          </div>

          <div className="faq-page-list">
            {faqs.map((item) => (
              <details key={item.q} className="faq-page-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="faq-column">
          <div className="faq-ask-card">
            <div className="faq-section-head">
              <h2>{t('faq.askTitle')}</h2>
              <p>{t('faq.askSub')}</p>
            </div>

            <form className="faq-form" onSubmit={handleSubmit} noValidate>
              <label>
                <span>{t('faq.form.name')}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('faq.form.namePlaceholder')} />
              </label>

              <label>
                <span>{t('faq.form.email')}</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('faq.form.emailPlaceholder')} />
              </label>

              <label>
                <span>{t('faq.form.question')}</span>
                <textarea
                  rows={6}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t('faq.form.questionPlaceholder')}
                />
              </label>

              {error && <div className="faq-form-message error">{error}</div>}
              {submitted && <div className="faq-form-message success">{t('faq.form.success')}</div>}

              <button type="submit" className="faq-submit-btn">{t('faq.form.submit')}</button>
            </form>
          </div>
        </div>
      </section>

      <section className="faq-bottom-cta">
        <h2>{t('faq.bottomTitle')}</h2>
        <div className="faq-bottom-actions">
          <Link to="/register" className="faq-btn-primary">{t('faq.bottomPrimary')}</Link>
          <Link to="/" className="faq-btn-ghost">{t('faq.bottomSecondary')}</Link>
        </div>
      </section>
    </div>
  )
}
