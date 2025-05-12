import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import migrateToFirestore from '../utils/migrateToFirestore';

// Key for storing migration state in localStorage
const MIGRATION_COMPLETE_KEY = 'firestore_migration_complete';

/**
 * Hook for managing Firestore migration
 */
export const useMigration = () => {
  const { user } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(() => {
    // Check localStorage first for migration status
    return localStorage.getItem(MIGRATION_COMPLETE_KEY) === 'true';
  });
  
  // Check for migration status when user loads
  useEffect(() => {
    const checkMigrationStatus = async () => {
      if (user && !migrationComplete) {
        try {
          // Check if user has a migration status document
          const migrationDoc = doc(firestore, 'migrations', user.uid);
          const migrationSnapshot = await getDoc(migrationDoc);
          
          if (migrationSnapshot.exists() && migrationSnapshot.data().complete) {
            setMigrationComplete(true);
            localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
          }
        } catch (error) {
          console.error('Error checking migration status:', error);
        }
      }
    };
    
    checkMigrationStatus();
  }, [user, migrationComplete]);

  const triggerMigration = async () => {
    if (!user || isMigrating || migrationComplete) return false;
    
    setIsMigrating(true);
    try {
      // Run the migration utility
      const result = await migrateToFirestore();
      
      if (result.success) {
        // Update migration status in Firestore
        const migrationDoc = doc(firestore, 'migrations', user.uid);
        await setDoc(migrationDoc, {
          complete: true,
          timestamp: new Date(),
          stats: {
            cardStats: result.cardStatsCount,
            cardViews: result.cardViewsCount,
            cardActivities: result.cardActivitiesCount
          }
        });
        
        setMigrationComplete(true);
        localStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during migration:', error);
      return false;
    } finally {
      setIsMigrating(false);
    }
  };

  return {
    isMigrating,
    migrationComplete,
    triggerMigration
  };
};

export default useMigration;
