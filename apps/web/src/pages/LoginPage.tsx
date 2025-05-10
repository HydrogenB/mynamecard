import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import googleIcon from '../assets/google-icon.svg';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  
  const handleGoogleSignIn = async () => {
    try {
      setIsLoggingIn(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">{t('login.title')}</h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-2 btn-outline py-3 mb-6"
        >
          {isLoggingIn ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <img 
                src={googleIcon} 
                alt="Google" 
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.src = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg';
                }}
              />
              {t('login.google')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
