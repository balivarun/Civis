import { useEffect, useState } from 'react'
import { useTranslation } from '../context/TranslationContext'
import '../App.css'

export default function LanguageModal() {
  const { setLanguage } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const selected = localStorage.getItem('appLangSelected')
    // show banner for first-time visitors only
    if (!selected) {
      const t = setTimeout(() => setVisible(true), 650)
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
    <div className="lang-banner-modal" role="dialog" aria-label="Choose language">
      <div className="lang-banner-inner">
        <div className="lang-banner-text">
          <strong>Choose language</strong>
          <span className="lang-banner-sub">भाषा चुनें</span>
        </div>
        <div className="lang-banner-actions">
          <button className="lang-btn lang-en" onClick={() => choose('en')} aria-label="English">🇬🇧 English</button>
          <button className="lang-btn lang-hi" onClick={() => choose('hi')} aria-label="Hindi">🇮🇳 हिन्दी</button>
        </div>
        <button className="lang-dismiss" onClick={dismiss} aria-label="Maybe later">Maybe later</button>
      </div>
    </div>
  )
}
