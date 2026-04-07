import './LandingPage.css'
import { Link } from 'react-router-dom'
import { useTranslation } from '../context/TranslationContext'

export default function LandingPage() {
  const { t, language, setLanguage } = useTranslation()

  const categories = [
    { icon: '🛣', label: t('categories.roads'), count: '1.2k' },
    { icon: '💡', label: t('categories.lights'), count: '843' },
    { icon: '🚰', label: t('categories.water'), count: '675' },
    { icon: '🗑', label: t('categories.garbage'), count: '920' },
    { icon: '🌳', label: t('categories.parks'), count: '412' },
    { icon: '🚧', label: t('categories.drainage'), count: '560' },
    { icon: '🏗', label: t('categories.bridges'), count: '318' },
    { icon: '📶', label: t('categories.wifi'), count: '240' },
  ]

  const steps = [
    {
      step: '01',
      title: t('landing.step1Title'),
      desc: t('landing.step1Desc'),
    },
    {
      step: '02',
      title: t('landing.step2Title'),
      desc: t('landing.step2Desc'),
    },
    {
      step: '03',
      title: t('landing.step3Title'),
      desc: t('landing.step3Desc'),
    },
  ]

  const stats = [
    { value: '18,400+', label: t('landing.stats.filed') },
    { value: '12,900+', label: t('landing.stats.resolved') },
    { value: '340+', label: t('landing.stats.municipalities') },
    { value: '70%', label: t('landing.stats.rate') },
  ]

  const faqItems = [
    { q: t('landing.faq1q'), a: t('landing.faq1a') },
    { q: t('landing.faq2q'), a: t('landing.faq2a') },
    { q: t('landing.faq3q'), a: t('landing.faq3a') },
    { q: t('landing.faq4q'), a: t('landing.faq4a') },
  ]

  return (
    <main className="landing">

      {/* Original Language toggle the user wanted back */}
      <div className="lang-bar">
        <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>English</button>
        <button className={`lang-btn ${language === 'hi' ? 'active' : ''}`} onClick={() => setLanguage('hi')}>हिन्दी</button>
      </div>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-content">
          <span className="hero-badge">{t('landing.badge')}</span>
          <h1 className="hero-title">
            {t('landing.title1')} <span className="highlight">{t('landing.title2')}</span>
          </h1>
          <p className="hero-subtitle">{t('landing.subtitle')}</p>
          <div className="hero-actions">
            <a href="#report" className="btn-primary">{t('landing.cta1')}</a>
            <Link to="/how-it-works" className="btn-outline">{t('landing.cta2')}</Link>
          </div>
          <div className="hero-trust">
            <span>✔ {t('landing.trust1')}</span>
            <span>✔ {t('landing.trust2')}</span>
            <span>✔ {t('landing.trust3')}</span>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="city-card">
            <div className="city-icon">🏙</div>
            <p>{t('landing.cityCardMsg')}</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-bar" id="stats">
        {stats.map((s) => (
          <div className="stat-item" key={s.label}>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <h2>{t('landing.howItWorksTitle')}</h2>
          <p>{t('landing.howItWorksSub')}</p>
        </div>
        <div className="steps-grid">
          {steps.map((s) => (
            <div className="step-card" key={s.step}>
              <span className="step-number">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="categories" id="categories">
        <div className="section-header">
          <h2>{t('landing.categoriesTitle')}</h2>
          <p>{t('landing.categoriesSub')}</p>
        </div>
        <div className="categories-grid">
          {categories.map((c) => (
            <button className="category-card" key={c.label}>
              <span className="cat-icon">{c.icon}</span>
              <span className="cat-label">{c.label}</span>
              <span className="cat-count">{c.count} {language === 'hi' ? 'रिपोर्ट्स' : 'reports'}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="report">
        <div className="cta-box">
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaSub')}</p>
          <Link to="/register" className="btn-primary btn-large">{t('landing.ctaBtn')}</Link>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="section-header">
          <h2>{t('landing.faqTitle')}</h2>
          <p>{t('landing.faqSub')}</p>
        </div>
        <div className="faq-grid">
          {faqItems.map((item) => (
            <article className="faq-card" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand-block">
              <div className="footer-logo-icon">
                <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="20" fill="white" fillOpacity="0.2"/>
                  <path d="M20 8C13.4 8 8 13.4 8 20s5.4 12 12 12 12-5.4 12-12S26.6 8 20 8zm0 4c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm0 17c-3 0-5.7-1.5-7.3-3.8.03-2.4 4.9-3.7 7.3-3.7 2.4 0 7.3 1.3 7.3 3.7C25.7 27.5 23 28 20 28z" fill="white"/>
                </svg>
              </div>
              <span className="footer-brand-name">Civis</span>
            </div>
            <p className="footer-tagline">{t('landing.footerTagline')}</p>

            <div className="footer-contact">
              <div className="footer-contact-item">
                <span className="fc-label">{t('landing.tollfree')}</span>
                <a href="tel:1800-123-4567" className="fc-value">📞 1800-123-4567</a>
              </div>
              <div className="footer-contact-item">
                <span className="fc-label">{t('landing.helpline')}</span>
                <a href="mailto:varunbali47@gmail.com" className="fc-value">✉ varunbali47@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
              <a href="#">Contact Us</a>
              <a href="#">Accessibility</a>
            </div>
            <p className="footer-copy">© {new Date().getFullYear()} Civis. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  )
}
