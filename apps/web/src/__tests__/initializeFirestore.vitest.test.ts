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
import initializeFirestore from '../utils/initializeFirestore';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';

// Additional mocks
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn().mockImplementation((_, name) => ({ id: name })),
  doc: vi.fn().mockImplementation((coll) => ({ 
    collection: coll,
    id: 'mock-doc-id'
  })),
  writeBatch: vi.fn(),
  serverTimestamp: vi.fn().mockReturnValue({
    toDate: () => new Date()
  }),
  getFirestore: vi.fn().mockReturnValue('mocked-firestore'),
  enableIndexedDbPersistence: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: null })
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn().mockReturnValue('mocked-storage')
}));

describe('initializeFirestore', () => {
  let mockBatch: any;
  let mockSet: any;
  let consoleSpy: SpyInstance;
  let errorSpy: SpyInstance;

  beforeEach(() => {
    mockSet = vi.fn();
    mockBatch = {
      set: mockSet,
      commit: vi.fn().mockResolvedValue(undefined)
    };
    
    vi.mocked(writeBatch).mockReturnValue(mockBatch);
    
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
    vi.clearAllMocks();
  });

  it('should initialize all collections successfully', async () => {
    // Act
    const result = await initializeFirestore({ logProgress: true });

    // Assert
    expect(writeBatch).toHaveBeenCalledWith('mocked-firestore');
    expect(result.success).toBe(true);
    expect(result.collectionsInitialized.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
    // Collection batch sets should be called
    expect(mockSet).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Initializing Firestore collections...');
  });

  it('should handle errors during initialization', async () => {
    // Arrange
    mockBatch.commit.mockRejectedValue(new Error('Failed to commit batch'));

    // Act
    const result = await initializeFirestore({ logProgress: true });

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Failed to commit batch');
  });

  it('should not log progress when logProgress option is false', async () => {
    // Act
    await initializeFirestore({ logProgress: false });

    // Assert
    // Check that initialization messages weren't logged
    expect(consoleSpy).not.toHaveBeenCalledWith('Initializing Firestore collections...');
  });
});
