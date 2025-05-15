import React, { createContext, useContext, useState, useEffect } from 'react';
import simpleAuthService from '../services/simpleAuthService';
import simpleUserService from '../services/simpleUserService';

// Define the simple user interface
interface SimpleUser {
  uid: string;
  email: string;
  displayName: string | null;
}

interface AuthContextType {
  user: SimpleUser | null;
  userProfile: any | null;
  loading: boolean;
  currentUser: SimpleUser | null; // Added for backwards compatibility
  login: (email: string, password: string) => Promise<SimpleUser>;
  logout: () => Promise<void>;
  ensureUserProfile: (user: SimpleUser) => Promise<any>;
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
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Function to ensure user profile exists
  const ensureUserProfile = async (user: SimpleUser) => {
    try {
      console.log('Ensuring user profile exists for:', user.uid);
      let profile = await simpleUserService.getUserProfile(user.uid);
      
      // If profile doesn't exist, create one
      if (!profile) {
        console.log('Creating missing user profile for:', user.uid);
        profile = await simpleUserService.createUserProfile(user);
      } else {
        console.log('User profile found:', profile.uid);
        
        // Check if profile has required fields
        const needsUpdate = !profile.cardLimit || profile.cardsCreated === undefined;
        if (needsUpdate) {
          console.log('User profile needs updates, fixing...');
          const updates: Partial<any> = {};
          
          if (!profile.cardLimit) updates.cardLimit = 2; // Default limit
          if (profile.cardsCreated === undefined) updates.cardsCreated = 0;
          
          await simpleUserService.updateUserProfile(user.uid, updates);
          console.log('Updated user profile with missing fields');
          
          // Refresh the profile data
          profile = await simpleUserService.getUserProfile(user.uid);
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
    const unsubscribe = simpleAuthService.onAuthChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Get user profile data
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
    const { user } = await simpleAuthService.login(email, password);
    // Ensure user profile exists upon login
    try {
      await ensureUserProfile(user);
      console.log("User profile ensured after login");
    } catch (error) {
      console.error("Error ensuring user profile after login:", error);
    }
    return user;
  };

  const logout = async () => {
    await simpleAuthService.signOut();
  };

  const value = {
    user,
    userProfile,
    loading,
    currentUser: user, // Added for backwards compatibility
    login,
    logout,
    ensureUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
