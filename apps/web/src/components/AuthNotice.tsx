import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Component to inform users about the authentication changes and API-based approach
 * Enhanced for modern UX with improved accessibility and visual appeal
 */
const AuthNotice: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-l-4 border-primary-500 p-6 my-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <div className="flex-shrink-0 mb-4 sm:mb-0">
          <div className="bg-white rounded-full p-2 shadow-sm">
            <svg className="h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="sm:ml-5">
          <h3 className="text-lg font-semibold text-primary-800">
            Welcome to MyNameCard!
          </h3>
          <div className="mt-2 text-base text-primary-700">
            <p>Create professional digital business cards that stand out and are easy to share. Sign in or create an account to get started on your digital networking journey.</p>
          </div>          
          <div className="mt-4">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/signin')}
                className="bg-primary-600 px-6 py-2.5 rounded-md text-sm font-medium text-white hover:bg-primary-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 shadow-sm"
                aria-label="Get started with MyNameCard"
              >
                Get started
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="bg-white px-6 py-2.5 rounded-md text-sm font-medium text-primary-700 border border-primary-300 hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 shadow-sm"
                aria-label="Go to dashboard"
              >
                Go to dashboard
              </button>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
};

export default AuthNotice;
