import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import logo from '../../assets/icon.svg';
import LanguageSwitcher from '../UI/LanguageSwitcher';

export default function PublicLayout() {
  const { t } = useI18n();
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm p-3">
        <div className="max-w-card mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Smart Name Card" className="h-6 w-6" />
            <span className="text-sm font-medium text-primary-700">{t('app.name')}</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-white py-4 text-center text-sm text-secondary-500">
        <div className="max-w-card mx-auto px-4">
          {t('app.name')} © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
