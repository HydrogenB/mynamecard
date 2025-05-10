import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'th';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.pricing': 'Pricing',
    'nav.dashboard': 'Dashboard',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Home page
    'home.title': 'Your Digital Business Card',
    'home.subtitle': 'Create, share, and manage your digital business card',
    'home.cta': 'Get Started',
    
    // Pricing page
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.free.title': 'Free',
    'pricing.free.description': 'Perfect for individual professionals',
    'pricing.pro.title': 'Pro',
    'pricing.pro.description': 'For businesses and teams',
    'pricing.enterprise.title': 'Enterprise',
    'pricing.enterprise.description': 'Custom solutions for large organizations',
    'pricing.cta.free': 'Get Started',
    'pricing.cta.pro': 'Go Pro',
    'pricing.cta.enterprise': 'Contact Sales',
    
    // Dashboard
    'dashboard.greeting': 'Welcome back, {name}',
    'dashboard.cards': 'Your Business Cards',
    'dashboard.newCard': 'Create New Card',
    'dashboard.noCards': 'You have no business cards yet',
    
    // Auth
    'auth.signIn': 'Sign in with Google',
    'auth.processing': 'Processing...',
  },
  th: {
    // Navigation
    'nav.home': 'หน้าหลัก',
    'nav.pricing': 'ราคา',
    'nav.dashboard': 'แดชบอร์ด',
    'nav.signIn': 'เข้าสู่ระบบ',
    'nav.signOut': 'ออกจากระบบ',
    
    // Home page
    'home.title': 'นามบัตรดิจิทัลของคุณ',
    'home.subtitle': 'สร้าง แชร์ และจัดการนามบัตรดิจิทัลของคุณ',
    'home.cta': 'เริ่มต้นใช้งาน',
    
    // Pricing page
    'pricing.title': 'ราคาที่เรียบง่ายและโปร่งใส',
    'pricing.free.title': 'ฟรี',
    'pricing.free.description': 'เหมาะสำหรับมืออาชีพรายบุคคล',
    'pricing.pro.title': 'โปร',
    'pricing.pro.description': 'สำหรับธุรกิจและทีม',
    'pricing.enterprise.title': 'เอนเตอร์ไพรส์',
    'pricing.enterprise.description': 'โซลูชั่นแบบกำหนดเองสำหรับองค์กรขนาดใหญ่',
    'pricing.cta.free': 'เริ่มต้นใช้งาน',
    'pricing.cta.pro': 'ไปที่โปร',
    'pricing.cta.enterprise': 'ติดต่อฝ่ายขาย',
    
    // Dashboard
    'dashboard.greeting': 'ยินดีต้อนรับกลับ {name}',
    'dashboard.cards': 'นามบัตรของคุณ',
    'dashboard.newCard': 'สร้างนามบัตรใหม่',
    'dashboard.noCards': 'คุณยังไม่มีนามบัตรธุรกิจ',
    
    // Auth
    'auth.signIn': 'เข้าสู่ระบบด้วย Google',
    'auth.processing': 'กำลังประมวลผล...',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: Record<string, string>) => {
    let translated = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translated = translated.replace(`{${param}}`, value);
      });
    }
    
    return translated;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
