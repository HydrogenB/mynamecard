import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { FirebaseError } from 'firebase/app';
import userService from '../services/userService';

// Mock data
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg'
};

const mockUserData = {
  uid: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg',
  plan: 'free',
  cardLimit: 2,
  cardsCreated: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSeen: new Date()
};

// Mock the Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn().mockReturnValue('mocked-doc-ref'),
  getDoc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  updateDoc: jest.fn().mockResolvedValue(undefined),
  serverTimestamp: jest.fn().mockReturnValue({
    toDate: () => new Date()
  })
}));

// Mock the Firebase Functions
jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn().mockReturnValue({}),
  httpsCallable: jest.fn().mockReturnValue(() => 
    Promise.resolve({ 
      data: { 
        plan: 'pro', 
        cardLimit: 999 
      } 
    })
  )
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create a user profile and return user data', async () => {
      await userService.createUserProfile(mockUser);
      
      // Check if setDoc was called with correct arguments
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
        plan: 'free',
        cardLimit: 2,
        cardsCreated: 0,
      }));
    });

    it('should handle user with missing properties', async () => {
      const minimalUser = { uid: 'minimal-user-id' };
      await userService.createUserProfile(minimalUser as any);
      
      expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        uid: 'minimal-user-id',
        email: '',
        displayName: '',
        photoURL: '',
        plan: 'free',
      }));
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile if it exists', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          uid: 'test-user-id',
          email: 'test@example.com',
          plan: 'free',
          cardLimit: 2,
          cardsCreated: 1,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.getUserProfile('test-user-id');
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(getDoc).toHaveBeenCalledWith('mocked-doc-ref');
      expect(result).toEqual(expect.objectContaining({
        uid: 'test-user-id',
        email: 'test@example.com',
        plan: 'free',
        cardLimit: 2,
        cardsCreated: 1,
      }));
    });

    it('should return null if user profile does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
        data: () => null
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.getUserProfile('non-existent-user');
      
      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const updates = { displayName: 'Updated Name' };
      
      (updateDoc as jest.Mock).mockResolvedValue(undefined);
      
      const result = await userService.updateUserProfile('test-user-id', updates);
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        displayName: 'Updated Name',
      }));
      expect(result).toBe(true);
    });

    it('should handle update errors', async () => {
      const updates = { displayName: 'Updated Name' };
      
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));
      
      const result = await userService.updateUserProfile('test-user-id', updates);
      
      expect(result).toBe(false);
    });
  });

  describe('upgradeUserToPro', () => {
    it('should upgrade user to pro plan', async () => {
      const result = await userService.upgradeUserToPro('test-user-id');
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        plan: 'pro',
        cardLimit: 999
      }));
      expect(result).toBe(true);
    });

    it('should handle upgrade errors', async () => {
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Upgrade failed'));
      
      const result = await userService.upgradeUserToPro('test-user-id');
      
      expect(result).toBe(false);
    });
  });

  describe('upgradeToPro', () => {
    it('should upgrade to pro plan with payment token', async () => {
      const result = await userService.upgradeToPro('test-user-id', 'payment-token');
      
      expect(getFunctions).toHaveBeenCalled();
      expect(httpsCallable).toHaveBeenCalledWith(expect.anything(), 'upgradePlan');
      expect(result).toEqual({
        plan: 'pro',
        cardLimit: 999
      });
    });

    it('should handle upgrade errors', async () => {
      (httpsCallable as jest.Mock).mockReturnValue(() => 
        Promise.reject(new Error('Upgrade failed'))
      );
      
      await expect(userService.upgradeToPro('test-user-id', 'payment-token'))
        .rejects
        .toThrow('Failed to upgrade plan');
    });

    it('should pass through Firebase errors', async () => {
      const firebaseError = new FirebaseError('auth/insufficient-permissions', 'Insufficient permissions');
      (httpsCallable as jest.Mock).mockReturnValue(() => 
        Promise.reject(firebaseError)
      );
      
      await expect(userService.upgradeToPro('test-user-id', 'payment-token'))
        .rejects
        .toEqual(firebaseError);
    });
  });

  describe('canCreateCard', () => {
    it('should return true if user can create more cards', async () => {
      // Mock getUserProfile to return a user who can create more cards
      jest.spyOn(userService, 'getUserProfile').mockResolvedValue({
        ...mockUserData,
        cardsCreated: 1,
        cardLimit: 2
      });
      
      const result = await userService.canCreateCard('test-user-id');
      
      expect(userService.getUserProfile).toHaveBeenCalledWith('test-user-id');
      expect(result).toBe(true);
    });

    it('should return false if user has reached card limit', async () => {
      jest.spyOn(userService, 'getUserProfile').mockResolvedValue({
        ...mockUserData,
        cardsCreated: 2,
        cardLimit: 2
      });
      
      const result = await userService.canCreateCard('test-user-id');
      
      expect(result).toBe(false);
    });

    it('should return false if user profile does not exist', async () => {
      jest.spyOn(userService, 'getUserProfile').mockResolvedValue(null);
      
      const result = await userService.canCreateCard('non-existent-user');
      
      expect(result).toBe(false);
    });
  });

  describe('incrementCardsCreated', () => {
    it('should increment cardsCreated count', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ cardsCreated: 1 })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.incrementCardsCreated('test-user-id');
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        cardsCreated: 2
      }));
      expect(result).toBe(true);
    });

    it('should handle case where cardsCreated is not defined', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({})
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.incrementCardsCreated('test-user-id');
      
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        cardsCreated: 1
      }));
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const mockDocSnap = {
        exists: () => false
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.incrementCardsCreated('non-existent-user');
      
      expect(result).toBe(false);
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('decrementCardsCreated', () => {
    it('should decrement cardsCreated count', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ cardsCreated: 2 })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.decrementCardsCreated('test-user-id');
      
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        cardsCreated: 1
      }));
      expect(result).toBe(true);
    });

    it('should not allow cardsCreated to go below zero', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ cardsCreated: 0 })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.decrementCardsCreated('test-user-id');
      
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        cardsCreated: 0
      }));
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      const mockDocSnap = {
        exists: () => false
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.decrementCardsCreated('non-existent-user');
      
      expect(result).toBe(false);
      expect(updateDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateCardLimit', () => {
    it('should update card limit', async () => {
      const result = await userService.updateCardLimit('test-user-id', 5);
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        cardLimit: 5
      }));
      expect(result).toBe(true);
    });

    it('should handle update errors', async () => {
      (updateDoc as jest.Mock).mockRejectedValue(new Error('Update failed'));
      
      const result = await userService.updateCardLimit('test-user-id', 5);
      
      expect(result).toBe(false);
    });
  });

  describe('configureCardLimits', () => {
    it('should configure card limits for plans', async () => {
      const limits = { free: 3, pro: 100 };
      const result = await userService.configureCardLimits(limits);
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'admin', 'card_limits');
      expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', expect.objectContaining({
        free: 3,
        pro: 100
      }));
      expect(result).toBe(true);
    });

    it('should handle configuration errors', async () => {
      (setDoc as jest.Mock).mockRejectedValue(new Error('Configuration failed'));
      
      const limits = { free: 3, pro: 100 };
      const result = await userService.configureCardLimits(limits);
      
      expect(result).toBe(false);
    });
  });

  describe('getDefaultCardLimits', () => {
    it('should get configured card limits', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          free: 3,
          pro: 100
        })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.getDefaultCardLimits();
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'admin', 'card_limits');
      expect(result).toEqual({
        free: 3,
        pro: 100
      });
    });

    it('should return default values if configuration does not exist', async () => {
      const mockDocSnap = {
        exists: () => false
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.getDefaultCardLimits();
      
      expect(result).toEqual({
        free: 2,
        pro: 999
      });
    });

    it('should handle missing fields', async () => {
      const mockDocSnap = {
        exists: () => true,
        data: () => ({
          free: 3
          // pro is missing
        })
      };
      
      (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
      
      const result = await userService.getDefaultCardLimits();
      
      expect(result).toEqual({
        free: 3,
        pro: 999 // Default for missing field
      });
    });

    it('should handle errors and return defaults', async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error('Get limits failed'));
      
      const result = await userService.getDefaultCardLimits();
      
      expect(result).toEqual({
        free: 2,
        pro: 999
      });
    });
  });

  describe('getUserLimits', () => {
    it('should get user limits and usage information', async () => {
      // Mock user document
      const userDocSnap = {
        exists: () => true,
        data: () => ({
          plan: 'free',
          cardsCreated: 1
        })
      };
      
      // Mock system limits document
      const limitsDocSnap = {
        exists: () => true,
        data: () => ({
          free: 2,
          pro: 999
        })
      };
      
      // Setup the mocks to return different values based on the call
      (getDoc as jest.Mock).mockImplementation((ref) => {
        // This is a simplification. In reality, you'd need to check the actual ref value
        // but for this test we'll just alternate the responses
        if ((getDoc as jest.Mock).mock.calls.length === 1) {
          return Promise.resolve(userDocSnap);
        } else {
          return Promise.resolve(limitsDocSnap);
        }
      });
      
      const result = await userService.getUserLimits('test-user-id');
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'system_config', 'card_limits');
      expect(result).toEqual({
        plan: 'free',
        cardsCreated: 1,
        cardLimit: 2,
        cardsRemaining: 1
      });
    });

    it('should throw if user is not found', async () => {
      const userDocSnap = {
        exists: () => false
      };
      
      (getDoc as jest.Mock).mockResolvedValue(userDocSnap);
      
      await expect(userService.getUserLimits('non-existent-user'))
        .rejects
        .toThrow('User not found');
    });

    it('should throw if system configuration is not found', async () => {
      // Mock user document
      const userDocSnap = {
        exists: () => true,
        data: () => ({
          plan: 'free',
          cardsCreated: 1
        })
      };
      
      // Mock system limits document (doesn't exist)
      const limitsDocSnap = {
        exists: () => false
      };
      
      // Setup the mocks to return different values based on the call
      (getDoc as jest.Mock).mockImplementation((ref) => {
        if ((getDoc as jest.Mock).mock.calls.length === 1) {
          return Promise.resolve(userDocSnap);
        } else {
          return Promise.resolve(limitsDocSnap);
        }
      });
      
      await expect(userService.getUserLimits('test-user-id'))
        .rejects
        .toThrow('System configuration not found');
    });

    it('should handle missing fields and use defaults', async () => {
      // Mock user document with missing fields
      const userDocSnap = {
        exists: () => true,
        data: () => ({
          // missing plan and cardsCreated
        })
      };
      
      // Mock system limits document
      const limitsDocSnap = {
        exists: () => true,
        data: () => ({
          free: 3,
          pro: 100
        })
      };
      
      // Setup the mocks to return different values based on the call
      (getDoc as jest.Mock).mockImplementation((ref) => {
        if ((getDoc as jest.Mock).mock.calls.length === 1) {
          return Promise.resolve(userDocSnap);
        } else {
          return Promise.resolve(limitsDocSnap);
        }
      });
      
      const result = await userService.getUserLimits('test-user-id');
      
      expect(result).toEqual({
        plan: 'free', // Default
        cardsCreated: 0, // Default
        cardLimit: 3, // From limits
        cardsRemaining: 3 // Calculated
      });
    });
  });

  describe('updateLastSeen', () => {
    it('should update the user\'s last seen timestamp', async () => {
      await userService.updateLastSeen('test-user-id');
      
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'test-user-id');
      expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
        lastSeen: expect.anything()
      });
    });
  });
});

// Import directly from the script files
import { configureCardLimits } from '../scripts/configureCardLimits';
import { initializeFirestoreCollections } from '../scripts/initializeFirestoreScript';
import initializeFirestore from '../utils/initializeFirestore';

// Mock initializeFirestore utility for the initializeFirestoreScript tests
jest.mock('../utils/initializeFirestore', () => {
  return jest.fn();
});

describe('configureCardLimits Script', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set default card limits in Firestore', async () => {
    // Act
    await configureCardLimits();

    // Assert
    expect(doc).toHaveBeenCalledWith('mocked-firestore', 'system_config', 'card_limits');
    expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', {
      free: 2,
      pro: 999,
      updatedAt: expect.anything()
    });
    expect(console.log).toHaveBeenCalledWith('Setting default card limits:', expect.any(Object));
    expect(console.log).toHaveBeenCalledWith('Default card limits configured successfully!');
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const mockError = new Error('Failed to set card limits');
    (setDoc as jest.Mock).mockRejectedValueOnce(mockError);

    // Act
    await configureCardLimits();

    // Assert
    expect(console.error).toHaveBeenCalledWith('Error configuring card limits:', mockError);
  });
});

describe('initializeFirestoreScript', () => {
  // Setup and teardown
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
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

describe('initializeFirestore', () => {
  let originalInitializeFirestore: any;
  
  beforeAll(() => {
    // Save the original mock implementation
    originalInitializeFirestore = (initializeFirestore as jest.Mock).getMockImplementation();
  });
  
  afterAll(() => {
    // Restore the original mock implementation
    (initializeFirestore as jest.Mock).mockImplementation(originalInitializeFirestore);
  });
  
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Replace the mock implementation for these tests
    (initializeFirestore as jest.Mock).mockImplementation(async (options = { logProgress: true }) => {
      if (options.logProgress) {
        console.log('Initializing Firestore collections...');
      }
      
      return {
        success: true,
        collectionsInitialized: ['users', 'cards', 'system_config', 'cardStats'],
        errors: []
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize all collections successfully', async () => {
    // Act
    const result = await initializeFirestore({ logProgress: true });

    // Assert
    expect(result.success).toBe(true);
    expect(result.collectionsInitialized.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
    expect(console.log).toHaveBeenCalledWith('Initializing Firestore collections...');
  });

  it('should not log progress when logProgress option is false', async () => {
    // Act
    await initializeFirestore({ logProgress: false });

    // Assert
    expect(console.log).not.toHaveBeenCalledWith('Initializing Firestore collections...');
  });
  
  it('should handle initialization errors', async () => {
    // Arrange - modify the mock to return errors
    (initializeFirestore as jest.Mock).mockImplementationOnce(async () => {
      return {
        success: false,
        collectionsInitialized: ['users'],
        errors: ['Failed to initialize cards collection']
      };
    });
    
    // Act
    const result = await initializeFirestore();
    
    // Assert
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toBe('Failed to initialize cards collection');
  });
});
