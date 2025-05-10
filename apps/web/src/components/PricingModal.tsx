import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  if (!isOpen) return null;
  
  const plans = [
    {
      id: 'free',
      name: t('pricing.free'),
      price: '0',
      features: [
        t('pricing.features.basic1'),
        t('pricing.features.basic2'),
        t('pricing.features.basic3')
      ]
    },
    {
      id: 'pro',
      name: t('pricing.pro'),
      price: '9.99',
      popular: true,
      features: [
        t('pricing.features.pro1'),
        t('pricing.features.pro2'),
        t('pricing.features.pro3'),
        t('pricing.features.pro4')
      ]
    },
    {
      id: 'business',
      name: t('pricing.business'),
      price: '29.99',
      features: [
        t('pricing.features.business1'),
        t('pricing.features.business2'),
        t('pricing.features.business3'),
        t('pricing.features.business4'),
        t('pricing.features.business5')
      ]
    }
  ];
  
  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };
  
  const handleSubscribe = () => {
    // Handle subscription logic here
    alert(`${t('pricing.subscribeAlert')} ${selectedPlan}`);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('pricing.title')}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mt-2">{t('pricing.subtitle')}</p>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-lg p-6 transition-all ${
                  selectedPlan === plan.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'relative' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    {t('pricing.popular')}
                  </span>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/{t('pricing.month')}</span>
                </div>
                
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-2 px-4 rounded ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  } transition-colors`}
                >
                  {selectedPlan === plan.id ? t('pricing.selected') : t('pricing.select')}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 mr-2 hover:bg-gray-100"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubscribe}
              disabled={!selectedPlan}
              className={`px-4 py-2 rounded ${
                selectedPlan
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('pricing.subscribe')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
