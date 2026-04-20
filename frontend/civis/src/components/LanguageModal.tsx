import { useEffect, useState } from 'react'
import { useTranslation } from '../context/TranslationContext'
import '../App.css'

export default function LanguageModal() {
  const { setLanguage } = useTranslation()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show modal if user has NOT explicitly chosen language
    const isChosen = localStorage.getItem('appLangSelected') === 'true'
    console.log('[LanguageModal] Mount - isChosen:', isChosen, '- showing:', !isChosen)
    
    if (!isChosen) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        console.log('[LanguageModal] Showing modal')
        setVisible(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [])

  function choose(lang: 'en' | 'hi') {
    console.log('[LanguageModal] User chose:', lang)
    try {
      localStorage.setItem('appLang', lang)
      localStorage.setItem('appLangSelected', 'true')
    } catch (e) {
      console.error('[LanguageModal] localStorage error:', e)
    }
    setLanguage(lang)
    setVisible(false)
  }

  function dismiss() {
    console.log('[LanguageModal] User dismissed')
    try { 
      localStorage.setItem('appLangSelected', 'true')
    } catch (e) {
      console.error('[LanguageModal] localStorage error:', e)
    }
    setVisible(false)
  }

  if (!visible) {
    return null
  }

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
