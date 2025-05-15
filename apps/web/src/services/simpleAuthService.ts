
interface SimpleUser {
  uid: string;
  email: string;
  displayName: string | null;
}

// Simple in-memory user storage
let currentUser: SimpleUser | null = null;
const listeners: ((user: SimpleUser | null) => void)[] = [];

/**
 * Simple authentication service that replaces Firebase auth
 * Only allows login with username "test" and password "test"
 */
export const simpleAuthService = {
  /**
   * Sign in with email and password
   */
  async login(email: string, password: string) {
    if (email === 'test' && password === 'test') {
      currentUser = {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User'
      };
      // Notify listeners
      listeners.forEach(listener => listener(currentUser));
      return { user: currentUser };
    } else {
      throw new Error('Invalid credentials. Use username "test" and password "test"');
    }
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    currentUser = null;
    // Notify listeners
    listeners.forEach(listener => listener(null));
    return true;
  },
  
  /**
   * Get the current user
   */
  getCurrentUser() {
    return currentUser;
  },
  
  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback: (user: SimpleUser | null) => void) {
    listeners.push(callback);
    // Initialize with current state
    setTimeout(() => callback(currentUser), 0);
    
    // Return unsubscribe function
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
};

// Export default instance
const simpleAuthServiceInstance = simpleAuthService;
export default simpleAuthServiceInstance;
