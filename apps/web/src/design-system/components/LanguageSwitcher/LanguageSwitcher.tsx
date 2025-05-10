import { useI18n } from '../../../hooks/useI18n';
import { IconButton } from '../IconButton';

export interface LanguageSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LanguageSwitcher = ({
  size = 'md',
  className = '',
}: LanguageSwitcherProps) => {
  const { locale, changeLocale } = useI18n();
  
  const handleChange = () => {
    changeLocale(locale === 'en' ? 'th' : 'en');
  };
  
  return (
    <IconButton
      icon={locale === 'en' ? 'TH' : 'EN'}
      variant="outline"
      size={size}
      ariaLabel={locale === 'en' ? 'Switch to Thai' : 'Switch to English'}
      onClick={handleChange}
      className={className}
    />
  );
};

export default LanguageSwitcher;
