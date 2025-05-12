/**
 * Migration utility to initialize Firestore collections and migrate local data
 */
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { Card } from '../db/db';

/**
 * Utility to set up Firestore collections and migrate data from IndexedDB/localStorage to Firestore
 * This should be run once when the user is authenticated
 */
export const migrateToFirestore = async (options = { logProgress: true }): Promise<{
  success: boolean;
  cardsCount: number;
  errors: string[];
}> => {
  const result = {
    success: true,
    cardsCount: 0,
    errors: [] as string[]
  };

  try {
    if (options.logProgress) console.log('Starting migration to Firestore...');

    // 1. Check for localStorage backup first
    await migrateFromLocalStorage(result, options);

    if (options.logProgress) {
      console.log('Migration completed successfully');
      console.log(`Cards migrated: ${result.cardsCount}`);
      if (result.errors.length > 0) {
        console.error('Errors encountered during migration:', result.errors);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    console.error('Migration failed:', error);
  }

  return result;
};

/**
 * Migrate data from localStorage backup
 */
const migrateFromLocalStorage = async (
  result: { cardsCount: number; errors: string[] },
  options: { logProgress: boolean }
): Promise<void> => {
  try {
    const backup = localStorage.getItem('namecard_backup');
    if (!backup) {
      if (options.logProgress) console.log('No localStorage backup found');
      return;
    }

    const cards = JSON.parse(backup) as Card[];
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      if (options.logProgress) console.log('No cards found in localStorage backup');
      return;
    }

    if (options.logProgress) console.log(`Found ${cards.length} cards in localStorage backup`);

    // Process in batches of 500 (Firestore batch limit)
    const BATCH_SIZE = 400;
    let batch = writeBatch(firestore);
    let batchCount = 0;
    let totalProcessed = 0;

    for (const card of cards) {
      try {
        // Create a new document for each card
        const cardData = {
          ...card,
          createdAt: card.createdAt ? Timestamp.fromDate(new Date(card.createdAt)) : serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Remove id before sending to Firestore as it will generate its own
        if (cardData.id) {
          delete cardData.id;
        }

        const cardRef = doc(collection(firestore, 'cards'));
        batch.set(cardRef, cardData);
        
        batchCount++;
        totalProcessed++;

        // Commit batch when it reaches the batch size limit
        if (batchCount >= BATCH_SIZE) {
          if (options.logProgress) console.log(`Committing batch of ${batchCount} cards...`);
          await batch.commit();
          batch = writeBatch(firestore);
          batchCount = 0;
        }
      } catch (error) {
        result.errors.push(`Failed to migrate card: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Commit any remaining cards in the batch
    if (batchCount > 0) {
      if (options.logProgress) console.log(`Committing final batch of ${batchCount} cards...`);
      await batch.commit();
    }

    result.cardsCount = totalProcessed;
    
    if (options.logProgress) console.log(`Successfully migrated ${totalProcessed} cards from localStorage`);
    
    // Clear localStorage after successful migration
    localStorage.removeItem('namecard_backup');
  } catch (error) {
    result.errors.push(`Failed to migrate from localStorage: ${error instanceof Error ? error.message : String(error)}`);
  }
};
