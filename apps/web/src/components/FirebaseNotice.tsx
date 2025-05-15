import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Notice to inform users about the transition to Firebase Firestore
 * as the primary data storage solution
 * Enhanced with modern UI design patterns
 */
const FirebaseNotice: React.FC = () => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-primary-50 via-blue-50 to-primary-50 border border-primary-200 p-6 mb-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="bg-primary-100 rounded-full p-3 w-12 h-12 flex items-center justify-center">
            <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
        </div>
        <div className="sm:ml-5">
          <h3 className="text-lg font-semibold text-primary-800">
            {t('firebaseNotice.title', 'Enhanced Cloud Storage')}
          </h3>
          <div className="mt-3 text-base text-primary-700">
            <p className="mb-2">
              {t('firebaseNotice.description', 'Your business cards are now securely stored in Firebase Firestore, providing faster performance and enhanced reliability. Access your cards from any device, anytime.')}
            </p>
            <div className="flex items-center mt-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-2 text-sm text-gray-700">Faster loading times</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="ml-2 text-sm text-gray-700">Enhanced security</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setDismissed(true)}
              className="px-4 py-2 bg-white text-primary-700 text-sm font-medium border border-primary-300 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-sm"
            >
              {t('firebaseNotice.dismiss', 'Got it')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseNotice;
