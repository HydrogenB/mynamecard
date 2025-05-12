import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import migrateToFirestore from '../utils/migrateToFirestore';

/**
 * Migration Notice component for alerting users about the migration
 * from Firebase Realtime Database to Firestore
 */
const MigrationNotice: React.FC = () => {
  const { t } = useTranslation();
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    cardStatsCount: number;
    cardViewsCount: number;
    cardActivitiesCount: number;
  } | null>(null);

  const handleMigrationStart = async () => {
    if (isMigrating) return;
    
    setIsMigrating(true);
    try {
      const migrationResult = await migrateToFirestore();
      setResult(migrationResult);
      setMigrationComplete(true);
    } catch (error) {
      console.error('Error during migration:', error);
      setResult({
        success: false,
        cardStatsCount: 0,
        cardViewsCount: 0,
        cardActivitiesCount: 0
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex flex-col">
        <div>
          <p className="text-sm text-blue-700 font-medium">
            {t('migration.notice', 'Database Migration Required')}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {t('migration.explanation', 'We\'ve upgraded our database system to Firestore for better performance. Click below to migrate your data.')}
          </p>
          {!migrationComplete ? (
            <button
              onClick={handleMigrationStart}
              disabled={isMigrating}
              className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isMigrating ? (
                <>
                  <span className="inline-block animate-spin mr-1">⟳</span>
                  {t('migration.inProgress', 'Migrating...')}
                </>
              ) : (
                t('migration.startButton', 'Start Migration')
              )}
            </button>
          ) : result && result.success ? (
            <div className="mt-2 text-green-600 text-sm">
              <p>✓ {t('migration.success', 'Migration successful!')}</p>
              <p className="text-xs mt-1">
                {t('migration.migratedItems', 'Migrated {{total}} items', { 
                  total: result.cardStatsCount + result.cardViewsCount + result.cardActivitiesCount 
                })}
              </p>
            </div>
          ) : (
            <div className="mt-2 text-red-600 text-sm">
              <p>❌ {t('migration.failed', 'Migration failed. Try again later or contact support.')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MigrationNotice;
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigrationNotice;
