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
import { configureCardLimits } from '../scripts/configureCardLimits';
import { doc, setDoc } from 'firebase/firestore';

// Additional mocks
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue('mocked-firestore'),
  doc: vi.fn().mockReturnValue('mocked-doc-ref'),
  setDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn().mockReturnValue({
    toDate: () => new Date()
  }),
  enableIndexedDbPersistence: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn().mockReturnValue({ currentUser: null })
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn().mockReturnValue('mocked-storage')
}));

describe('configureCardLimits Script', () => {
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

  it('should set default card limits in Firestore', async () => {
    // Act
    await configureCardLimits();

    // Assert
    expect(doc).toHaveBeenCalledWith('mocked-firestore', 'system_config', 'card_limits');
    expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', {
      free: 2,
      pro: 999,
      updatedAt: expect.any(Object)
    });
    expect(consoleSpy).toHaveBeenCalledWith('Setting default card limits:', expect.any(Object));
    expect(consoleSpy).toHaveBeenCalledWith('Default card limits configured successfully!');
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const mockError = new Error('Failed to set card limits');
    vi.mocked(setDoc).mockRejectedValueOnce(mockError);

    // Act
    await configureCardLimits();

    // Assert
    expect(errorSpy).toHaveBeenCalledWith('Error configuring card limits:', mockError);
  });
});
