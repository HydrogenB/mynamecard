import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import initializeFirestore from '../utils/initializeFirestore';
import { initializeFirestoreCollections } from '../scripts/initializeFirestoreScript';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn().mockReturnValue('mocked-firestore')
}));

// Mock the initialize firestore utility
jest.mock('../utils/initializeFirestore', () => {
  return {
    __esModule: true,
    default: jest.fn()
  };
});

// Mock console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('initializeFirestoreScript', () => {
  // Setup and teardown
  beforeEach(() => {
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    jest.clearAllMocks();
  });

  it('should successfully initialize Firestore collections', async () => {
    // Arrange
    const mockResult = {
      success: true,
      collectionsInitialized: ['users', 'cards', 'system_config'],
      errors: []
    };
    
    (initializeFirestore as jest.Mock).mockResolvedValue(mockResult);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(initializeFirestore).toHaveBeenCalledWith({ logProgress: true });
    expect(console.log).toHaveBeenCalledWith('Starting Firestore initialization...');
    expect(console.log).toHaveBeenCalledWith('✅ Firestore initialization completed successfully!');
    expect(console.log).toHaveBeenCalledWith('Collections initialized:', 'users, cards, system_config');
  });

  it('should handle initialization with errors', async () => {
    // Arrange
    const mockResult = {
      success: false,
      collectionsInitialized: ['users'],
      errors: ['Failed to initialize cards collection: Permission denied']
    };
    
    (initializeFirestore as jest.Mock).mockResolvedValue(mockResult);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(console.error).toHaveBeenCalledWith('⚠️ Firestore initialization completed with errors');
    expect(console.error).toHaveBeenCalledWith('Errors:', mockResult.errors);
  });

  it('should handle initialization exceptions', async () => {
    // Arrange
    const mockError = new Error('Initialization failed');
    
    (initializeFirestore as jest.Mock).mockRejectedValue(mockError);

    // Act
    await initializeFirestoreCollections();

    // Assert
    expect(console.error).toHaveBeenCalledWith('❌ Error initializing Firestore:', mockError);
  });
});
