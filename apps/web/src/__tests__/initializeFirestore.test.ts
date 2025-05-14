import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import initializeFirestore from '../utils/initializeFirestore';

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  collection: jest.fn().mockImplementation((_, name) => ({ id: name })),
  doc: jest.fn().mockImplementation((coll) => ({ 
    collection: coll,
    id: 'mock-doc-id'
  })),
  writeBatch: jest.fn().mockReturnValue({
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(undefined)
  }),
  serverTimestamp: jest.fn().mockReturnValue({
    toDate: () => new Date()
  })
}));

jest.mock('../config/firebase', () => ({
  firestore: 'mocked-firestore',
  auth: { currentUser: null }
}));

describe('initializeFirestore', () => {
  let mockBatch: any;
  let mockSet: jest.Mock;

  beforeEach(() => {
    mockSet = jest.fn();
    mockBatch = {
      set: mockSet,
      commit: jest.fn().mockResolvedValue(undefined)
    };
    (writeBatch as jest.Mock).mockReturnValue(mockBatch);
    
    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize all collections successfully', async () => {
    // Act
    const result = await initializeFirestore({ logProgress: true });

    // Assert
    expect(writeBatch).toHaveBeenCalledWith(firestore);
    expect(result.success).toBe(true);
    expect(result.collectionsInitialized.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
    // Collection batch sets should be called
    expect(mockSet).toHaveBeenCalled();
    expect(mockBatch.commit).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Initializing Firestore collections...');
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
    expect(console.log).not.toHaveBeenCalledWith('Initializing Firestore collections...');
  });
});
