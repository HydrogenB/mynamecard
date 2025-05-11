import React from 'react';
import { useTranslation } from 'react-i18next';

interface PricingModalProps {
  onClose: () => void;
  onContinue: () => void;
  currentLimit: number;
  cardsCreated: number;
}

const PricingModal: React.FC<PricingModalProps> = ({ 
  onClose, 
  onContinue, 
  currentLimit, 
  cardsCreated 
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('pricingModal.title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {t('pricingModal.limitReached', { current: cardsCreated, limit: currentLimit })}
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium mb-4">{t('pricingModal.choosePlan')}</h3>
          
          <div className="space-y-4">
            {/* Free Plan */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{t('pricingModal.freePlan')}</h4>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {t('pricingModal.current')}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{t('pricingModal.freeDescription')}</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>✅ {t('pricingModal.feature1', { count: 2 })}</li>
                <li>✅ {t('pricingModal.feature2')}</li>
                <li>✅ {t('pricingModal.feature3')}</li>
                <li>❌ {t('pricingModal.feature4')}</li>
              </ul>
              <p className="font-medium text-lg">$0</p>
            </div>
            
            {/* Pro Plan */}
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
              <h4 className="font-medium text-blue-800 mb-2">{t('pricingModal.proPlan')}</h4>
              <p className="text-gray-600 text-sm mb-2">{t('pricingModal.proDescription')}</p>
              <ul className="text-sm text-gray-600 space-y-1 mb-3">
                <li>✅ {t('pricingModal.feature1', { count: 10 })}</li>
                <li>✅ {t('pricingModal.feature2')}</li>
                <li>✅ {t('pricingModal.feature3')}</li>
                <li>✅ {t('pricingModal.feature4')}</li>
                <li>✅ {t('pricingModal.feature5')}</li>
              </ul>
              <p className="font-medium text-lg">$5 / {t('pricingModal.month')}</p>
              <button
                onClick={onContinue}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
              >
                {t('pricingModal.upgradeBtn')}
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('pricingModal.cancelBtn')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
