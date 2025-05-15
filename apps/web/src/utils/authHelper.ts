import { auth } from '../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../config/firebase';

const DEFAULT_CARD_LIMIT = 2;

/**
 * Auth Helper utility to fix common authentication issues
 */
export const authHelper = {
  /**
   * Force refresh the authentication token
   */
  async forceTokenRefresh(): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        console.error('Cannot refresh token: No authenticated user');
        return false;
      }
      
      console.log('Forcing token refresh...');
      await auth.currentUser.getIdToken(true);
      console.log('Token refresh successful');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  },
  
  /**
   * Fix user profile in Firestore - recreates the user profile if it doesn't exist
   * or updates it with critical fields if they're missing
   */
  async fixUserProfile(): Promise<boolean> {
    try {
      if (!auth.currentUser) {
        console.error('Cannot fix user profile: No authenticated user');
        return false;
      }
      
      const userId = auth.currentUser.uid;
      const userRef = doc(firestore, 'users', userId);
      
      // Check if user profile exists
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new profile
        console.log('User profile missing. Creating new profile...');
        const newUserData = {
          uid: userId,
          email: auth.currentUser.email || '',
          displayName: auth.currentUser.displayName || '',
          photoURL: auth.currentUser.photoURL || '',
          plan: 'free', 
          cardLimit: DEFAULT_CARD_LIMIT,
          cardsCreated: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userRef, newUserData);
        console.log('Created new user profile');
        
        // Force token refresh after profile creation
        await authHelper.forceTokenRefresh();
        return true;
      } else {
        // Check for missing fields and update if necessary
        const userData = userDoc.data();
        const updates: Record<string, any> = { updatedAt: serverTimestamp() };
        let needsUpdate = false;
        
        if (userData.cardLimit === undefined) {
          updates.cardLimit = DEFAULT_CARD_LIMIT;
          needsUpdate = true;
        }
        
        if (userData.cardsCreated === undefined) {
          updates.cardsCreated = 0;
          needsUpdate = true;
        }
        
        if (userData.plan === undefined) {
          updates.plan = 'free';
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log('Updating user profile with missing fields:', updates);
          await setDoc(userRef, updates, { merge: true });
          
          // Force token refresh after profile update
          await authHelper.forceTokenRefresh();
        } else {
          console.log('User profile looks good, no updates needed');
        }
        
        return true;
      }
    } catch (error) {
      console.error('Error fixing user profile:', error);
      return false;
    }
  }
};

export default authHelper;
