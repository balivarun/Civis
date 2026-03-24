import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type LanguageContextType = {
  language: 'en' | 'hi';
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Use localStorage instead of cookies for absolute reliability in SPAs
  const getInitialLang = () => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('appLang');
      if (stored === 'hi') return 'hi';
    }
    return 'en';
  };
  
  const [language, setLanguage] = useState<'en' | 'hi'>(getInitialLang);

  useEffect(() => {
    // Inject the Google Translate script into the DOM
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // Expose the initialization function globally for the script to call
    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: 'en', includedLanguages: 'en,hi', autoDisplay: false },
        'google_translate_element'
      );
    };

    // Unconditionally hide all Google Translate default UI, popups, and highlights
    const style = document.createElement('style');
    style.innerHTML = `
      #google_translate_element { display: none !important; }
      .skiptranslate.goog-te-banner-frame { display: none !important; }
      body { top: 0px !important; }
      .goog-tooltip { display: none !important; }
      .goog-tooltip:hover { display: none !important; }
      .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const triggerGoogleTranslate = (targetLang: 'en' | 'hi') => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (select) {
        clearInterval(interval);
        // Force reset the translation back to English first to clear cache
        select.value = 'en';
        select.dispatchEvent(new Event('change'));
        
        if (targetLang === 'hi') {
          // Then aggressively force the Hindi translation
          // We use 400ms because 150ms is too fast for Google's iframe IPC
          setTimeout(() => {
            select.value = 'hi';
            select.dispatchEvent(new Event('change'));
          }, 400); 
        }
      }
      if (attempts > 50) clearInterval(interval); // Give up after 5s
    }, 100);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('appLang', nextLang);
    triggerGoogleTranslate(nextLang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      <div id="google_translate_element" style={{ display: 'none' }}></div>
      {children}
    </LanguageContext.Provider>
  );
}

// React Router SPA navigation observer
export function TranslateRouteObserver() {
  const location = useLocation();
  const { language } = useLanguage();
  const [prevPath, setPrevPath] = useState(location.pathname);

  useEffect(() => {
    // If language is Hindi and user navigates manually in the SPA
    if (language === 'hi' && prevPath !== location.pathname) {
      // The only bulletproof way to guarantee that Google Translate processes 
      // heavily dynamic React router pages is to force a native browser reload.
      // This drops the Virtual DOM diff engine and forces a clean parse.
      window.location.reload();
    }
    setPrevPath(location.pathname);
  }, [location.pathname, language, prevPath]);

  useEffect(() => {
    // When the component initially mounts (e.g., after the reload above),
    // trigger the translation vigorously if we are supposed to be in Hindi.
    if (language === 'hi') {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          clearInterval(interval);
          select.value = 'hi';
          select.dispatchEvent(new Event('change'));
        }
        if (attempts > 50) clearInterval(interval);
      }, 100);
      return () => clearInterval(interval);
    }
  }, []); // Only on mount

  return null;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
