import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import authService from '../services/authService';
import userService from '../services/userService';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthChange(async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // Get user profile data from Firestore
        try {
          const profile = await userService.getUserProfile(authUser.uid);
          
          // If profile doesn't exist, create one
          if (!profile) {
            const newProfile = await userService.createUserProfile(authUser);
            setUserProfile(newProfile);
          } else {
            setUserProfile(profile);
          }
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
    return user;
  };

  const loginWithGoogle = async () => {
    const { user } = await authService.loginWithGoogle();
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
  };

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
