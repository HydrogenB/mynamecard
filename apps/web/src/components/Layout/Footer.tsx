import { Link } from 'react-router-dom';
import { useI18n } from '../../hooks/useI18n';
import logo from '../../assets/icon.svg';
import { Container, Text } from '../../design-system';

export default function Footer() {
  const { t } = useI18n();
  
  return (
    <footer className="bg-secondary-800 text-white py-8">
      <Container size="lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src={logo} alt="Smart Name Card" className="h-8 w-8 mr-2" />
            <Text variant="h4" as="span" color="white" className="font-semibold">
              {t('app.name')}
            </Text>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            <Link to="/" className="text-white/80 hover:text-white">{t('nav.home')}</Link>
            <Link to="/pricing" className="text-white/80 hover:text-white">{t('nav.pricing')}</Link>
            <Link to="/dashboard" className="text-white/80 hover:text-white">{t('nav.dashboard')}</Link>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <Text variant="caption" color="rgba(255,255,255,0.6)">
            © {new Date().getFullYear()} Smart Name Card. All rights reserved.
          </Text>
        </div>
      </Container>
    </footer>
  );
}
