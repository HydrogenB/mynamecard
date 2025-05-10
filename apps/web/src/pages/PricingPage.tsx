import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  
  const plans = [
    {
      id: 'free',
      badge: null,
      current: true
    },
    {
      id: 'pro',
      badge: 'Popular',
      current: false
    },
    {
      id: 'business',
      badge: null,
      current: false
    }
  ];
  
  return (
    <div className="max-w-screen-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-12">
        {t('pricing.title')}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative rounded-lg p-6 ${
              plan.current 
                ? 'bg-primary-50 border border-primary-200' 
                : 'bg-white border border-secondary-200'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-3 right-4 bg-primary-500 text-white text-xs px-3 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
            
            <h2 className="text-xl font-bold mb-2">
              {t(`pricing.${plan.id}.name`)}
            </h2>
            
            <div className="text-2xl font-bold mb-6">
              {t(`pricing.${plan.id}.price`)}
            </div>
            
            <ul className="mb-8 space-y-3">
              {/* @ts-ignore - Dynamic key access */}
              {t(`pricing.${plan.id}.features`).map((feature: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary-500 mr-2">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-2 rounded-md font-medium ${
                plan.current 
                  ? 'bg-secondary-200 text-secondary-700 cursor-default' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              disabled={plan.current}
            >
              {t(`pricing.${plan.id}.cta`)}
            </button>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        {!user && (
          <Link to="/login" className="btn-primary px-6 py-3">
            {t('nav.login')} {t('home.cta')}
          </Link>
        )}
      </div>
    </div>
  );
}
