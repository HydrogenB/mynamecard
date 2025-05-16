// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// All Firebase-related mocks removed for fresh start. No Firebase in this project.
// If you need to mock your new backend or services, add them here.

// Mock app configuration
jest.mock('../config/firebase', () => ({
  firestore: {},
  auth: {}
}));
