/**
 * @vitest-environment node
 */

// We need to mock Firebase config before any imports that use it
import { vi } from 'vitest';

vi.mock('../config/firebase', () => {
  return {
    firebaseConfig: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id'
    },
    firestore: 'mocked-firestore',
    auth: { currentUser: null },
    storage: 'mocked-storage'
  }
});

import { describe, it, expect, beforeEach, afterEach, SpyInstance } from 'vitest';
import { initializeFirestoreCollections } from '../scripts/initializeFirestoreScript';
import initializeFirestore from '../utils/initializeFirestore';

// Additional mocks
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue('mocked-firestore'),
  enableIndexedDbPersistence: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: null })
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn().mockReturnValue('mocked-storage')
}));

// Mock the initializeFirestore utility
vi.mock('../utils/initializeFirestore', () => {
  return {
    default: vi.fn()
  }
});

describe('initializeFirestoreScript', () => {
  // Setup and teardown
  let consoleSpy: SpyInstance;
  let errorSpy: SpyInstance;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should successfully initialize Firestore collections', async () => {
    // Arrange
    const mockResult = {
      success: true,
      collectionsInitialized: ['users', 'cards', 'system_config'],
      errors: []
    };
    
    vi.mocked(initializeFirestore).mockResolvedValue(mockResult);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(initializeFirestore).toHaveBeenCalledWith({ logProgress: true });
    expect(consoleSpy).toHaveBeenCalledWith('Starting Firestore initialization...');
    expect(consoleSpy).toHaveBeenCalledWith('✅ Firestore initialization completed successfully!');
    expect(consoleSpy).toHaveBeenCalledWith('Collections initialized:', 'users, cards, system_config');
  });

  it('should handle initialization with errors', async () => {
    // Arrange
    const mockResult = {
      success: false,
      collectionsInitialized: ['users'],
      errors: ['Failed to initialize cards collection: Permission denied']
    };
    
    vi.mocked(initializeFirestore).mockResolvedValue(mockResult);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(errorSpy).toHaveBeenCalledWith('⚠️ Firestore initialization completed with errors');
    expect(errorSpy).toHaveBeenCalledWith('Errors:', mockResult.errors);
  });

  it('should handle initialization exceptions', async () => {
    // Arrange
    const mockError = new Error('Initialization failed');
    
    vi.mocked(initializeFirestore).mockRejectedValue(mockError);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(errorSpy).toHaveBeenCalledWith('❌ Error initializing Firestore:', mockError);
  });
});
