import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import initializeFirestore from '../utils/initializeFirestore';

interface InitializationResult {
  success: boolean;
  collectionsInitialized: string[];
  errors: string[];
}

/**
 * Component to initialize Firestore collections
 */
const FirestoreInitializer: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InitializationResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  
  const initializeCollections = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const initResult = await initializeFirestore();
      setResult({
        success: initResult.success,
        collectionsInitialized: initResult.collectionsInitialized,
        errors: initResult.errors
      });
      console.log('Firestore initialization completed with result:', initResult);
    } catch (error) {
      console.error('Error during Firestore initialization:', error);
      setResult({
        success: false,
        collectionsInitialized: [],
        errors: [(error as Error).message || 'Unknown error']
      });
    } finally {
      setLoading(false);
    }
  };

  if (!expanded) {
    return (
      <div className="bg-gray-50 p-4 rounded-md mb-6 border border-blue-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-blue-800">Firestore Setup</h3>
          <button 
            onClick={() => setExpanded(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            {t('Show')}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          This tool initializes Firestore collections for your application. Click "Show" to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Firestore Setup</h2>
        <button
          onClick={() => setExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          {t('Hide')}
        </button>
      </div>
    
      <p className="text-gray-600 mb-6">
        This tool will initialize the necessary Firestore collections for your application.
        Your application uses Firestore for all data storage including cards, analytics, and user status.
      </p>

      {!result ? (
        <button
          onClick={initializeCollections}
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md ${
            loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } transition-colors flex justify-center items-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('Initializing...')}
            </>
          ) : (
            t('Initialize Firestore')
          )}
        </button>
      ) : (
        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <h3 className="font-semibold mb-2">
            {result.success ? t('Initialization Successful') : t('Initialization Failed')}
          </h3>
          
          {result.success && (
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>{t('Collections Initialized')}: {result.collectionsInitialized.length}</li>
              <li>{t('Collections')}: {result.collectionsInitialized.join(', ')}</li>
              <li>{t('Storage System')}: Firestore</li>
            </ul>
          )}
          
          {result.errors.length > 0 && (
            <div className="mt-3">
              <h4 className="font-medium text-red-700">{t('Errors')}:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setResult(null)}
              className="text-sm px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              {t('Clear')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirestoreInitializer;
