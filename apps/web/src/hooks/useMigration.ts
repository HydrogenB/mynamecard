import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * This hook is maintained for backwards compatibility
 * but no longer performs migrations as we're using Firestore directly
 */
export const useMigration = () => {
  const { user } = useAuth();
  const [isMigrating] = useState(false);
  const [migrationComplete] = useState(true); // We're always "migrated" now

  // No-op function for compatibility
  const triggerMigration = async () => {
    console.log('Migration is not needed as we use Firestore directly');
    return true;
  };

  return {
    isMigrating,
    migrationComplete,
    triggerMigration
  };
};

export default useMigration;
