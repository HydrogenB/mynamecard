import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import logo from '../../assets/icon.svg';
import LanguageSwitcher from '../UI/LanguageSwitcher';

export default function Header() {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-screen-lg mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Smart Name Card" className="h-8 w-8" />
          <span className="font-semibold text-primary-700">{t('app.name')}</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="text-secondary-700 hover:text-primary-600">{t('nav.home')}</Link>
            <Link to="/pricing" className="text-secondary-700 hover:text-primary-600">{t('nav.pricing')}</Link>
            {user && (
              <Link to="/dashboard" className="text-secondary-700 hover:text-primary-600">{t('nav.dashboard')}</Link>
            )}
          </nav>
          
          <LanguageSwitcher />
          
          {user ? (
            <button 
              onClick={handleLogout} 
              className="btn-outline text-sm"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
