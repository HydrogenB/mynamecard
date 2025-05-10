import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import logo from '../../assets/icon.svg';

export default function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="bg-secondary-800 text-white py-8">
      <div className="max-w-screen-lg mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={logo} alt="Smart Name Card" className="h-8 w-8 mr-2" />
            <span className="font-semibold">{t('app.name')}</span>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link to="/" className="text-white/80 hover:text-white">{t('nav.home')}</Link>
            <Link to="/pricing" className="text-white/80 hover:text-white">{t('nav.pricing')}</Link>
            <Link to="/dashboard" className="text-white/80 hover:text-white">{t('nav.dashboard')}</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center text-sm text-white/60">
          © {new Date().getFullYear()} Smart Name Card. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
