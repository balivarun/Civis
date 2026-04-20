import { useEffect, useState } from 'react'
import { useTranslation } from '../context/TranslationContext'
import '../pages/AdminPanels.css'

export default function LanguageModal() {
  const { setLanguage } = useTranslation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const existing = localStorage.getItem('appLang')
    const selectedFlag = localStorage.getItem('appLangSelected')
    // Show modal if the user has not explicitly selected a language before
    if (!existing && !selectedFlag) setShow(true)
  }, [])

  function choose(lang: 'en' | 'hi') {
    setLanguage(lang)
    // mark that user explicitly chose so modal won't reappear
    try { localStorage.setItem('appLang', lang); localStorage.setItem('appLangSelected', '1') } catch (e) { /* ignore */ }
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="lang-modal-overlay" role="dialog" aria-modal="true">
      <div className="lang-modal">
        <h3>Choose language / भाषा चुनें</h3>
        <p>Please select your preferred language. / कृपया अपनी पसंदीदा भाषा चुनें।</p>
        <div className="lang-choices">
          <button className="panel-btn" onClick={() => choose('en')}>English</button>
          <button className="panel-btn" onClick={() => choose('hi')}>हिन्दी</button>
        </div>
      </div>
    </div>
  )
}
