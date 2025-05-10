import React from 'react';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';
import Button from '../design-system/components/Button';
import Card from '../design-system/components/Card';

const PricingPage: React.FC = () => {
  const { t } = useI18n();
  const { isAuthenticated, signInWithGoogle } = useAuth();

  const plans = [
    {
      name: t('pricing.free.title'),
      description: t('pricing.free.description'),
      price: '0',
      currency: '$',
      period: '/month',
      features: [
        '1 business card',
        'QR code generation',
        'Basic analytics',
        'Public sharing link',
      ],
      cta: t('pricing.cta.free'),
      isCurrent: true,
      isPopular: false,
    },
    {
      name: t('pricing.pro.title'),
      description: t('pricing.pro.description'),
      price: '9.99',
      currency: '$',
      period: '/month',
      features: [
        'Unlimited business cards',
        'Advanced analytics',
        'Custom branding',
        'No watermark',
        'Export as PDF/VCF',
      ],
      cta: t('pricing.cta.pro'),
      isCurrent: false,
      isPopular: true,
    },
    {
      name: t('pricing.enterprise.title'),
      description: t('pricing.enterprise.description'),
      price: 'Custom',
      currency: '',
      period: '',
      features: [
        'Team management',
        'Custom integrations',
        'Dedicated support',
        'Single sign-on (SSO)',
        'Custom domain',
      ],
      cta: t('pricing.cta.enterprise'),
      isCurrent: false,
      isPopular: false,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
          {t('pricing.title')}
        </h1>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            variant={plan.isPopular ? 'elevated' : 'outline'}
            className={`flex flex-col ${plan.isPopular ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="p-6">
              {plan.isPopular && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-500">{plan.description}</p>
              
              <div className="mt-4 flex items-baseline">
                <span className="text-2xl font-extrabold">{plan.currency}</span>
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className="ml-1 text-gray-500">{plan.period}</span>
              </div>
            </div>

            <div className="flex-grow p-6 pt-0">
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <span className="mr-2">✅</span>
                    <span className="text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 pt-0">
              <Button
                fullWidth
                variant={plan.isPopular ? 'primary' : 'outline'}
                onClick={isAuthenticated ? undefined : signInWithGoogle}
                as={isAuthenticated ? 'link' : 'button'}
                to={isAuthenticated ? '/dashboard' : ''}
              >
                {plan.cta}
              </Button>

              {plan.isCurrent && (
                <div className="mt-2 text-sm text-center text-gray-500">
                  Current plan
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingPage;
