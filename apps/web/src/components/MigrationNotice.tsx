import React from 'react';

/**
 * MigrationNotice component is kept for backward compatibility
 * but doesn't display anything as we're using Firestore directly
 */
const MigrationNotice: React.FC = () => {
  return null; // Don't show anything as we're using Firestore directly
}
  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
      <div className="flex">
        <div>
          <p className="text-sm text-blue-700">
            {t('migration.notice')}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            {t('migration.explanation')}
          </p>
          <button
            onClick={handleMigrationStart}
            disabled={isMigrating}
            className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isMigrating ? (
              <>
                <span className="inline-block animate-spin mr-1">⟳</span>
                {t('migration.inProgress')}
              </>
            ) : (
              t('migration.startButton')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MigrationNotice;
