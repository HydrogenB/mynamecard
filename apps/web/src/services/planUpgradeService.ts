import { getFunctions, httpsCallable } from 'firebase/functions';
import { userService } from './userService';

interface UpgradeResult {
  plan: string;
  cardLimit: number;
  success: boolean;
}

/**
 * Service for handling plan upgrades
 */
export const planUpgradeService = {
  /**
   * Upgrade a user's plan to Pro
   * This calls the upgradePlan Cloud Function
   */
  async upgradeToPro(uid: string, paymentToken: string): Promise<UpgradeResult> {
    // Log the upgrade attempt (for analytics)
    console.log('Attempting to upgrade plan for user:', uid);
    
    try {
      // Call the Cloud Function
      const functions = getFunctions();
      const upgradeFunction = httpsCallable(functions, 'upgradePlan');
      
      // Call the function with the required parameters
      const result = await upgradeFunction({
        uid,
        paymentToken
      });
      
      // Extract the data from the result
      const data = result.data as UpgradeResult;
      
      // Log success (for analytics)
      console.log('Successfully upgraded plan for user:', uid);
      
      return data;
    } catch (error) {
      // Log error (for analytics)
      console.error('Error upgrading plan:', error);
      
      // Rethrow the error
      throw new Error('Failed to upgrade plan');
    }
  },
  
  /**
   * Check if a user is on the Pro plan
   */
  async isProUser(uid: string): Promise<boolean> {
    try {
      // Get the user's current plan
      const userLimits = await userService.getUserLimits(uid);
      
      // Return true if the user is on the Pro plan
      return userLimits.plan === 'pro';
    } catch (error) {
      console.error('Error checking if user is Pro:', error);
      return false;
    }
  },
  
  /**
   * Get the plan details (free vs pro)
   */
  async getPlanDetails(): Promise<{
    free: { cardLimit: number };
    pro: { cardLimit: number };
  }> {
    try {
      // This would typically fetch from a configuration in Firestore
      // For simplicity, we're returning hardcoded values
      return {
        free: { cardLimit: 2 },
        pro: { cardLimit: 10 }
      };
    } catch (error) {
      console.error('Error getting plan details:', error);
      return {
        free: { cardLimit: 2 },
        pro: { cardLimit: 10 }
      };
    }
  }
};

export default planUpgradeService;
