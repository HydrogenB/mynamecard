import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageSwitch: React.FC = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
    const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang as 'en' | 'th');
  };
  
  return (
    <div className="flex space-x-2">
      <button
        className={`px-2 py-1 rounded ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => handleLanguageChange('en')}
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded ${language === 'th' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        onClick={() => handleLanguageChange('th')}
      >
        ไทย
      </button>
    </div>
  );
};

export default LanguageSwitch;
