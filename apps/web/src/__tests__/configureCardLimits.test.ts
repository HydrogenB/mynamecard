import { doc, setDoc } from 'firebase/firestore';
import { configureCardLimits } from '../scripts/configureCardLimits';

// Firebase mocks are imported from setupTests.ts

// Mock console methods to verify outputs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('configureCardLimits Script', () => {
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

  it('should set default card limits in Firestore', async () => {
    // Arrange
    (doc as jest.Mock).mockReturnValue('mocked-doc-ref');
    (setDoc as jest.Mock).mockResolvedValue(undefined);

    // Act
    await configureCardLimits();

    // Assert
    expect(doc).toHaveBeenCalledWith('mocked-firestore', 'system_config', 'card_limits');
    expect(setDoc).toHaveBeenCalledWith('mocked-doc-ref', {
      free: 2,
      pro: 999,
      updatedAt: expect.any(Object)
    });
    expect(console.log).toHaveBeenCalledWith('Setting default card limits:', expect.any(Object));
    expect(console.log).toHaveBeenCalledWith('Default card limits configured successfully!');
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const mockError = new Error('Failed to set card limits');
    (setDoc as jest.Mock).mockRejectedValue(mockError);

    // Act
    await configureCardLimits();

    // Assert
    expect(console.error).toHaveBeenCalledWith('Error configuring card limits:', mockError);
  });
});
