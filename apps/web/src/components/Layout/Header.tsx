import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import logo from '../../assets/icon.svg';
import { 
  Button, 
  Container, 
  LanguageSwitcher 
} from '../../design-system';

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
      <Container py={3} size="lg">
        <div className="flex justify-between items-center">
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
              <Button 
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                {t('nav.logout')}
              </Button>
            ) : (
              <Button 
                variant="primary"
                size="sm"
                as="link"
                to="/login"
              >
                {t('nav.login')}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
