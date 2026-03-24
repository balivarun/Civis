import { Link } from 'react-router-dom'
import { useTranslation } from '../context/TranslationContext'
import './HowItWorks.css'

export default function HowItWorks() {
  const { t } = useTranslation()

  const steps = [
    {
      number: '01',
      icon: '📝',
      title: t('howItWorks.step1Title'),
      desc: t('howItWorks.step1Desc'),
      note: t('howItWorks.step1Note'),
    },
    {
      number: '02',
      icon: '📍',
      title: t('howItWorks.step2Title'),
      desc: t('howItWorks.step2Desc'),
      note: t('howItWorks.step2Note'),
    },
    {
      number: '03',
      icon: '🖊',
      title: t('howItWorks.step3Title'),
      desc: t('howItWorks.step3Desc'),
      note: t('howItWorks.step3Note'),
    },
    {
      number: '04',
      icon: '📤',
      title: t('howItWorks.step4Title'),
      desc: t('howItWorks.step4Desc'),
      note: t('howItWorks.step4Note'),
    },
    {
      number: '05',
      icon: '🔔',
      title: t('howItWorks.step5Title'),
      desc: t('howItWorks.step5Desc'),
      note: t('howItWorks.step5Note'),
    },
    {
      number: '06',
      icon: '✅',
      title: t('howItWorks.step6Title'),
      desc: t('howItWorks.step6Desc'),
      note: t('howItWorks.step6Note'),
    },
  ]

  const faqs = [
    {
      q: t('howItWorks.faq1q'),
      a: t('howItWorks.faq1a'),
    },
    {
      q: t('howItWorks.faq2q'),
      a: t('howItWorks.faq2a'),
    },
    {
      q: t('howItWorks.faq3q'),
      a: t('howItWorks.faq3a'),
    },
    {
      q: t('howItWorks.faq4q'),
      a: t('howItWorks.faq4a'),
    },
    {
      q: t('howItWorks.faq5q'),
      a: t('howItWorks.faq5a'),
    },
  ]

  const stagesList = [
    t('howItWorks.stages.submitted'),
    t('howItWorks.stages.acknowledged'),
    t('howItWorks.stages.underReview'),
    t('howItWorks.stages.inProgress'),
    t('howItWorks.stages.resolved')
  ]

  return (
    <div className="hiw-page">

      {/* Header */}
      <section className="hiw-hero">
        <span className="hiw-badge">{t('howItWorks.badge')}</span>
        <h1>{t('howItWorks.title')}</h1>
        <p>{t('howItWorks.subtitle')}</p>
        <Link to="/login" className="hiw-cta-btn">{t('howItWorks.ctaBtn')}</Link>
      </section>

      {/* Step-by-step */}
      <section className="hiw-steps">
        <div className="steps-container">
          {steps.map((s, i) => (
            <div className="hiw-step" key={s.number}>
              <div className="step-left">
                <div className="step-num">{s.number}</div>
                {i < steps.length - 1 && <div className="step-connector" />}
              </div>
              <div className="step-body">
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="step-tip">💡 {s.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Complaint lifecycle */}
      <section className="hiw-lifecycle">
        <h2>{t('howItWorks.lifecycleTitle')}</h2>
        <p className="lifecycle-sub">{t('howItWorks.lifecycleSub')}</p>
        <div className="lifecycle-track">
          {stagesList.map(
            (stage, i, arr) => (
              <div className="lifecycle-item" key={stage}>
                <div className="lifecycle-dot" />
                <span>{stage}</span>
                {i < arr.length - 1 && <div className="lifecycle-line" />}
              </div>
            )
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="hiw-faq">
        <h2>{t('howItWorks.faqTitle')}</h2>
        <div className="faq-list">
          {faqs.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="hiw-bottom-cta">
        <h2>{t('howItWorks.bottomTitle')}</h2>
        <div className="hiw-bottom-actions">
          <Link to="/login" className="btn-primary">{t('howItWorks.bottomSignUp')}</Link>
          <Link to="/" className="btn-ghost">{t('howItWorks.bottomHome')}</Link>
        </div>
      </section>

    </div>
  )
}
