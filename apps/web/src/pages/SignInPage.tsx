import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import Button from '../design-system/components/Button';
import Card from '../design-system/components/Card';

const SignInPage: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, isLoading } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSignIn = async () => {
    await signInWithGoogle();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-900">
            MyNameCard
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to manage your digital business cards
          </p>
        </div>

        <Button
          fullWidth
          onClick={handleSignIn}
          isLoading={isLoading}
          leftIcon={'🔑'}
        >
          {isLoading ? t('auth.processing') : t('auth.signIn')}
        </Button>
      </Card>
    </div>
  );
};

export default SignInPage;
