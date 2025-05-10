import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('notFound.title')}</h2>
        <p className="text-gray-600 mb-6">{t('notFound.message')}</p>
        <Link 
          to="/" 
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
