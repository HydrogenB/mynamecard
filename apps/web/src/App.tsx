import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Lazy-loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateCardPage = lazy(() => import('./pages/CreateCardPage'));
const EditCardPage = lazy(() => import('./pages/EditCardPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PublicCardPage = lazy(() => import('./pages/PublicCardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="pricing" element={<PricingPage />} />
        </Route>
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="create" element={<CreateCardPage />} />
          <Route path="edit/:cardId" element={<EditCardPage />} />
        </Route>
        
        {/* Public Card View */}
        <Route path="/:slug" element={<PublicLayout />}>
          <Route index element={<PublicCardPage />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
