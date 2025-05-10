import { createContext, useState, useEffect, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import thTranslations from '../locales/th.json';

type Locale = 'en' | 'th';
type Translations = typeof enTranslations;

interface I18nContextType {
  locale: Locale;
  t: (key: string) => string;
  changeLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextType>({} as I18nContextType);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('locale');
    return (savedLocale as Locale) || 
           (navigator.language.startsWith('th') ? 'th' : 'en');
  });

  const translations: Record<Locale, Translations> = {
    en: enTranslations,
    th: thTranslations,
  };

  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string) => {
    const keys = key.split('.');
    let result = translations[locale];
    
    for (const k of keys) {
      if (result[k as keyof typeof result] === undefined) {
        return key; // Return key if translation doesn't exist
      }
      // @ts-ignore - We're traversing the object dynamically
      result = result[k];
    }
    
    return result as string;
  };

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, t, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
};
