import React, { createContext, useContext, useState } from 'react';
import { translations } from '../utils/translations';

export type Language = 'en' | 'hi';

type TranslationContextType = {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
};

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('appLang') as Language) || 'en';
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguageState(nextLang);
    localStorage.setItem('appLang', nextLang);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('appLang', lang);
  }

  const t = (key: string, variables?: Record<string, string>): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && result[k]) {
        result = result[k];
      } else {
        return key; // Return the key string itself as a fallback
      }
    }
    
    let translatedArray = result;
    if (typeof translatedArray !== 'string') return key;

    let translated = translatedArray as string;
    if (variables) {
      Object.keys(variables).forEach((v) => {
        translated = translated.replace(`{${v}}`, variables[v]);
      });
    }

    return translated;
  };

  return (
    <TranslationContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within TranslationProvider');
  return context;
};
