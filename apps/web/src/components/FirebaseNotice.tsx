import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Notice to inform users about the transition to Firebase Firestore
 * as the primary data storage solution
 */
const FirebaseNotice: React.FC = () => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            {t('firebaseNotice.title', 'Now using Firebase Firestore')}
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              {t('firebaseNotice.description', 'We have upgraded our storage system to use Firebase Firestore for better performance and reliability. Your data is now securely stored in the cloud, allowing you to access your cards from any device.')}
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setDismissed(true)}
              className="text-sm font-medium text-blue-800 hover:text-blue-600 transition-colors"
            >
              {t('firebaseNotice.dismiss', 'Dismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseNotice;
