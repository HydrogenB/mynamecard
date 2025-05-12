import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { auth } from '../config/firebase';

/**
 * Debug helper to check the current user profile
 * This can be used to diagnose issues with user profiles and card creation
 */
export const checkUserProfile = async (): Promise<{
  isLoggedIn: boolean;
  uid?: string;
  userProfileExists: boolean;
  userProfile?: any;
  error?: string;
}> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return {
        isLoggedIn: false,
        userProfileExists: false,
      };
    }
    
    const userRef = doc(firestore, 'users', currentUser.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      return {
        isLoggedIn: true,
        uid: currentUser.uid,
        userProfileExists: false,
      };
    }
    
    const userProfile = {
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt,
    };
    
    return {
      isLoggedIn: true,
      uid: currentUser.uid,
      userProfileExists: true,
      userProfile,
    };
  } catch (error: any) {
    return {
      isLoggedIn: !!auth.currentUser,
      uid: auth.currentUser?.uid,
      userProfileExists: false,
      error: error.message || 'Unknown error checking user profile',
    };
  }
};
