import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import authService from '../services/authService';
import userService from '../services/userService';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  currentUser: User | null; // Added for backwards compatibility
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  ensureUserProfile: (user: User) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);  // Function to ensure user profile exists
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Ensuring user profile exists for:', user.uid);
      let profile = await userService.getUserProfile(user.uid);
      
      // If profile doesn't exist, create one
      if (!profile) {
        console.log('Creating missing user profile for:', user.uid);
        profile = await userService.createUserProfile(user);
        
        // Force refresh the auth token after creating profile
        // This is important for Firestore rules to recognize the new profile
        console.log('Refreshing auth token after profile creation');
        await user.getIdToken(true);
        
        // Wait a moment for token to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log('User profile found:', profile.uid);
        
        // Check if profile has required fields
        const needsUpdate = !profile.cardLimit || profile.cardsCreated === undefined;
        if (needsUpdate) {
          console.log('User profile needs updates, fixing...');
          const updates: Partial<any> = {};
          
          if (!profile.cardLimit) updates.cardLimit = 2; // Default limit
          if (profile.cardsCreated === undefined) updates.cardsCreated = 0;
          
          await userService.updateUserProfile(user.uid, updates);
          console.log('Updated user profile with missing fields');
          
          // Refresh the profile data
          profile = await userService.getUserProfile(user.uid);
          
          // Force refresh the token after updating profile
          await user.getIdToken(true);
        }
      }
      
      return profile;
    } catch (error) {
      console.error("Error ensuring user profile:", error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Get user profile data from Firestore
        try {
          const profile = await ensureUserProfile(authUser);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  const login = async (email: string, password: string) => {
    const { user } = await authService.login(email, password);
    // Ensure user profile exists upon login
    try {
      await ensureUserProfile(user);
      console.log("User profile ensured after login");
    } catch (error) {
      console.error("Error ensuring user profile after login:", error);
    }
    return user;
  };

  const loginWithGoogle = async () => {
    const { user } = await authService.loginWithGoogle();
    // Ensure user profile exists upon Google login
    try {
      await ensureUserProfile(user);
      console.log("User profile ensured after Google login");
    } catch (error) {
      console.error("Error ensuring user profile after Google login:", error);
    }
    return user;
  };

  const register = async (email: string, password: string) => {
    const { user } = await authService.register(email, password);
    await userService.createUserProfile(user);
    return user;
  };

  const logout = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email);
  };  const value = {
    user,
    userProfile,
    loading,
    currentUser: user, // Added for backwards compatibility
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    ensureUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
