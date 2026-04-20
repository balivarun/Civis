import { useEffect, useState } from 'react'
import { useTranslation } from '../context/TranslationContext'
import '../App.css'

export default function LanguageModal() {
  const { setLanguage } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const selected = localStorage.getItem('appLangSelected')
    // show modal for first-time visitors only
    if (!selected) {
      const t = setTimeout(() => setVisible(true), 450)
      return () => clearTimeout(t)
    }
  }, [])

  function choose(lang: 'en' | 'hi') {
    try {
      localStorage.setItem('appLang', lang)
      localStorage.setItem('appLangSelected', '1')
    } catch (e) {
      // ignore
    }
    setLanguage(lang)
    setVisible(false)
  }

  function dismiss() {
    try { localStorage.setItem('appLangSelected', '1') } catch (e) {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="lang-modal-overlay" role="dialog" aria-modal="true" aria-label="Choose language">
      <div className="lang-modal-card">
        <div className="lang-modal-left">
          <h2>Choose your language</h2>
          <p className="lang-modal-sub">कृपया अपनी पसंदीदा भाषा चुनें — Please select your preferred language</p>
        </div>

        <div className="lang-modal-actions">
          <button className="lang-btn lang-en" onClick={() => choose('en')} aria-label="English">🇬🇧 English</button>
          <button className="lang-btn lang-hi" onClick={() => choose('hi')} aria-label="Hindi">🇮🇳 हिन्दी</button>
        </div>

        <button className="lang-modal-close" onClick={dismiss} aria-label="Maybe later">Maybe later</button>
      </div>
    </div>
  )
}
