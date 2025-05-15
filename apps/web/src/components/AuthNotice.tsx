import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component to inform users about the authentication changes and API-based approach
 */
const AuthNotice: React.FC = () => {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 my-4 rounded shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">
            Authentication Update
          </h3>          <div className="mt-2 text-sm text-green-700">            <p>
              We've enhanced our card management system with secure Cloud Functions. 
              New users can now create cards without encountering permission issues.
            </p>
            <p className="mt-2">
              Instead of your browser directly accessing the database, requests are now handled through secure
              Firebase Cloud Functions, ensuring consistent permissions and improved security.
            </p>
            <p className="mt-2 text-xs">
              Note: For full functionality, please make sure you're using a Firebase Blaze plan. 
              The free Spark plan has limitations on outbound network requests from Cloud Functions.
            </p>
            <p className="mt-2">
              If you encounter any issues, please try refreshing your browser or 
              <Link to="/signin" className="underline font-medium ml-1">sign out and sign back in</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthNotice;
