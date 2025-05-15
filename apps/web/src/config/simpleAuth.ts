/**
 * Simple authentication configuration
 * This replaces Firebase authentication with a simple in-memory implementation
 * that accepts only the username "test" and password "test"
 */

// Get environment from window or default to production
export const env = {
  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
};

// Simple auth configuration
export const simpleAuthConfig = {
  validUsername: 'test',
  validPassword: 'test',
  defaultUser: {
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  }
};

// Export singleton instances for services
export const authServiceInstance = null; // Will be initialized by the simpleAuthService
export const userServiceInstance = null; // Will be initialized by the simpleUserService
export const cardServiceInstance = null; // Will be initialized by the simpleCardService

// Helper function to wait for the specified milliseconds
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
