import { Link } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import heroImage from '../assets/hero.svg';

export default function HomePage() {
  const { t } = useI18n();
  const { user } = useAuth();
  
  return (
    <div className="max-w-screen-lg mx-auto px-4 py-8">
      {/* Hero section */}
      <section className="flex flex-col md:flex-row items-center gap-6 py-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('home.title')}
          </h1>
          <p className="text-lg text-secondary-600 mb-8">
            {t('home.subtitle')}
          </p>
          <div className="flex gap-4">
            <Link 
              to={user ? '/dashboard' : '/login'} 
              className="btn-primary px-6 py-3"
            >
              {t('home.cta')}
            </Link>
            <Link to="/pricing" className="btn-outline px-6 py-3">
              {t('nav.pricing')}
            </Link>
          </div>
        </div>
        <div className="flex-1">
          <img 
            src={heroImage} 
            alt="Smart Name Card" 
            className="w-full max-w-md mx-auto"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Smart+Name+Card';
            }}
          />
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('home.features.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { key: 'free', icon: '🎁' },
            { key: 'qr', icon: '📱' },
            { key: 'share', icon: '🔗' },
            { key: 'manage', icon: '⚙️' },
            { key: 'mobile', icon: '📱' },
          ].map((feature) => (
            <div key={feature.key} className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">
                {t(`home.features.${feature.key}`)}
              </h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
