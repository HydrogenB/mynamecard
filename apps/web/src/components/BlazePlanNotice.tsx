import React, { useState } from 'react';

/**
 * Notice to inform users about the need to upgrade to Firebase Blaze plan
 * for full Cloud Functions functionality
 */
const BlazePlanNotice: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Firebase Plan Notice
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Our app now uses Firebase Cloud Functions for improved security and reliability.
              For full functionality, please upgrade to the Firebase Blaze plan.
            </p>
            <p className="mt-2">
              The <strong>Spark plan (free)</strong> has limitations on outbound network requests
              from Cloud Functions, which may affect some features.
            </p>
            <p className="mt-2">
              <a 
                href="https://firebase.google.com/pricing" 
                target="_blank" 
                rel="noreferrer"
                className="text-yellow-800 font-medium underline"
              >
                Learn more about Firebase pricing
              </a>
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="text-sm text-yellow-600 hover:text-yellow-500 focus:outline-none"
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
