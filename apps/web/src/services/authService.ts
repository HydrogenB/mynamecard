import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

/**
 * Authentication service for handling user authentication
 */
export const authService = {
  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  },
  
  /**
   * Sign in with email and password
   */
  async login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  },
  
  /**
   * Sign in with Google
   */
  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  },
  
  /**
   * Sign out the current user
   */
  async signOut() {
    return firebaseSignOut(auth);
  },
  
  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    return sendPasswordResetEmail(auth, email);
  },
  
  /**
   * Get the current user
   */
  getCurrentUser() {
    return auth.currentUser;
  },
  
  /**
   * Subscribe to auth state changes
   */
  onAuthChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }
};

export default authService;
