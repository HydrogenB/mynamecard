import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { planUpgradeService } from '../services/planUpgradeService';

interface PricingModalProps {
  onClose: () => void;
  onContinue: () => void;
  onUpgradeSuccess?: () => void;
  currentLimit: number;
  cardsCreated: number;
}

const PricingModal: React.FC<PricingModalProps> = ({ 
  onClose, 
  onContinue, 
  onUpgradeSuccess,
  currentLimit, 
  cardsCreated 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  
  const handleUpgrade = async () => {
    if (!user) return;
    
    setUpgrading(true);
    setError(null);
    
    try {
      // This would normally create and collect payment token from a payment processor
      // For demo purposes, we'll use a mock token
      const paymentToken = `mock_payment_${Date.now()}`;
      
      // Call our plan upgrade service
      const result = await planUpgradeService.upgradeToPro(user.uid, paymentToken);
      
      if (result.success) {
        // Call the success callback if provided
        if (onUpgradeSuccess) {
          onUpgradeSuccess();
        }
        // Continue with the normal flow
        onContinue();
      } else {
        setError(t('pricingModal.upgradeError'));
      }
    } catch (err: any) {
      console.error('Error upgrading plan:', err);
      setError(err.message || t('pricingModal.upgradeError'));
    } finally {
      setUpgrading(false);
    }
  };
    return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-fadeIn">
        <div className="p-6 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 text-transparent bg-clip-text">
            {t('pricingModal.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-4 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-amber-200 rounded-full p-2 mt-0.5">
                <svg className="h-5 w-5 text-amber-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  {t('pricingModal.limitReachedTitle', 'Card Limit Reached')}
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  {t('pricingModal.limitReached', { current: cardsCreated, limit: currentLimit })}
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold mb-6 text-gray-900">{t('pricingModal.choosePlan')}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div 
              className={`rounded-xl p-6 border transition-all ${
                selectedPlan === 'basic' 
                  ? 'border-primary-400 ring-2 ring-primary-200 shadow-md' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan('basic')}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">{t('pricingModal.freePlan')}</h4>
                  <span className="bg-primary-100 text-primary-800 px-2.5 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                    {t('pricingModal.current')}
                  </span>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-500">🆓</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600 ml-1 text-sm">/forever</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-5">{t('pricingModal.freeDescription')}</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature1', { count: 2 })}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature3')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-500">{t('pricingModal.feature4')}</span>
                </li>
              </ul>
            </div>
            
            {/* Pro Plan */}
            <div 
              className={`rounded-xl p-6 relative transition-all ${
                selectedPlan === 'pro' 
                  ? 'border-2 border-primary-500 ring-2 ring-primary-200 shadow-lg bg-primary-50' 
                  : 'border border-primary-300 hover:shadow-md bg-primary-50'
              }`}
              onClick={() => setSelectedPlan('pro')}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {t('pricingModal.recommended', 'Recommended')}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-primary-800">{t('pricingModal.proPlan')}</h4>
                  <span className="bg-primary-200 text-primary-800 px-2.5 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                    Most popular
                  </span>
                </div>
                <div className="h-12 w-12 bg-primary-200 rounded-full flex items-center justify-center">
                  <span className="text-primary-700">⭐</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">$5</span>
                <span className="text-gray-600 ml-1 text-sm">/ {t('pricingModal.month')}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-5">{t('pricingModal.proDescription')}</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature1', { count: 10 })}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature2')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature3')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature4')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.feature5')}</span>
                </li>
              </ul>
              
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className={`w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors font-medium ${
                  upgrading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {upgrading ? t('pricingModal.upgrading') : t('pricingModal.upgradeBtn')}
              </button>
              
              {error && (
                <p className="text-red-500 text-sm mt-3 bg-red-50 p-2 rounded-md border border-red-100">
                  {error}
                </p>
              )}
            </div>
            
            {/* Enterprise Plan */}
            <div 
              className={`rounded-xl p-6 border transition-all ${
                selectedPlan === 'enterprise' 
                  ? 'border-primary-400 ring-2 ring-primary-200 shadow-md' 
                  : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
              }`}
              onClick={() => setSelectedPlan('enterprise')}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-gray-800">{t('pricingModal.enterprisePlan', 'Enterprise')}</h4>
                  <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                    {t('pricingModal.customized', 'Customized')}
                  </span>
                </div>
                <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-700">🏢</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">{t('pricingModal.contact', 'Contact us')}</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-5">{t('pricingModal.enterpriseDescription', 'Tailored solutions for organizations with specific needs and volume requirements.')}</p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.enterpriseFeature1', 'Unlimited cards')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.enterpriseFeature2', 'Custom branding')}</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-indigo-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">{t('pricingModal.enterpriseFeature3', 'Premium support')}</span>
                </li>
              </ul>
              
              <button
                onClick={() => window.open('mailto:enterprise@mynamecard.com')}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg shadow-sm transition-colors font-medium"
              >
                {t('pricingModal.contactUs', 'Contact Sales')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
          <p className="text-sm text-gray-500">{t('pricingModal.satisfaction', '100% satisfaction guarantee. Cancel anytime.')}</p>
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors shadow-sm font-medium"
          >
            {t('pricingModal.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
