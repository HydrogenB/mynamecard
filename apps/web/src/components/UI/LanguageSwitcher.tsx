import { useI18n } from '../../hooks/useI18n';

export default function LanguageSwitcher() {
  const { locale, changeLocale } = useI18n();
  
  const handleChange = () => {
    changeLocale(locale === 'en' ? 'th' : 'en');
  };
  
  return (
    <button 
      onClick={handleChange}
      className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-sm"
      aria-label={locale === 'en' ? 'Switch to Thai' : 'Switch to English'}
    >
      {locale === 'en' ? 'TH' : 'EN'}
    </button>
  );
}
