import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Notice to inform users about the need to upgrade to Firebase Blaze plan
 * for full Cloud Functions functionality
 * Enhanced with modern UI design patterns
 */
const BlazePlanNotice: React.FC = () => {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 p-6 mb-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="bg-amber-100 rounded-full p-3 w-12 h-12 flex items-center justify-center">
            <svg className="h-6 w-6 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="sm:ml-5">
          <h3 className="text-lg font-semibold text-amber-800">
            Upgrade Your Experience
          </h3>
          <div className="mt-3 text-base text-amber-700">
            <p className="mb-2">
              MyNameCard now uses Firebase Cloud Functions to provide enhanced security and reliability for managing your digital business cards.
            </p>
            <p className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mr-2">
                Note
              </span>
              The <strong>Spark plan (free)</strong> has limitations on some features. For the best experience, we recommend upgrading to the Firebase Blaze plan.
            </p>
            <div className="mt-3">
              <a 
                href="https://firebase.google.com/pricing" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center text-amber-800 font-medium hover:text-amber-600 transition-colors"
              >
                <span>Learn more about Firebase pricing</span>
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm"
              onClick={() => window.open('https://firebase.google.com/pricing', '_blank')}
            >
              Upgrade now
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-white text-amber-700 text-sm font-medium border border-amber-300 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors shadow-sm"
              onClick={() => setDismissed(true)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlazePlanNotice;
