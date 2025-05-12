import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firebaseAnalyticsService from '../services/firebaseAnalyticsService';

/**
 * ServiceInitializer component that handles service initialization
 * This component doesn't render anything but initializes services
 * when the application loads
 */
const ServiceInitializer: React.FC = () => {
  const { user } = useAuth();  // Initialize services when the component mounts
  useEffect(() => {
    // Firestore is already configured with persistence in firebase.ts
    console.log('Database service initialized with Firestore');
  }, []);
  
  // Track user online status
  useEffect(() => {
    if (user) {
      // Set user as online when logged in
      firebaseAnalyticsService.setUserOnlineStatus(true);
      
      // Set up event listeners for page visibility and unload
      const handleVisibilityChange = () => {
        firebaseAnalyticsService.setUserOnlineStatus(!document.hidden);
      };
        const handleBeforeUnload = () => {
        firebaseAnalyticsService.setUserOnlineStatus(false);
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        // Remove event listeners when component unmounts
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('beforeunload', handleBeforeUnload);
        // Set user as offline
        firebaseAnalyticsService.setUserOnlineStatus(false);
      };
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default ServiceInitializer;
