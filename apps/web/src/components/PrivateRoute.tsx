import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

/**
 * Private route component that redirects to /signin if not authenticated
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // While checking auth state, show nothing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to sign in page
  if (!user) {
    return <Navigate to="/signin" />;
  }
  
  // If authenticated, render the children
  return <>{children}</>;
};

export default PrivateRoute;
