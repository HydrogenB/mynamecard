import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import simpleUserService from '../services/simpleUserService';

interface CardLimits {
  plan: string;
  cardsCreated: number;
  cardLimit: number;
  cardsRemaining: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage card limits functionality
 * This is used to track how many cards a user has created
 * and how many they are allowed to create based on their plan
 */
export function useCardLimits(): {
  limits: CardLimits;
  canCreateCard: boolean;
  refreshLimits: () => Promise<void>;
  isProPlan: boolean;
} {
  const { user } = useAuth();
  const [limits, setLimits] = useState<CardLimits>({
    plan: 'free',
    cardsCreated: 0,
    cardLimit: 2, // Default free plan limit
    cardsRemaining: 2,
    isLoading: true,
    error: null
  });

  // Function to load the user's card limits
  async function loadLimits() {
    if (!user) {
      setLimits(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setLimits(prev => ({ ...prev, isLoading: true, error: null }));
      
      const userProfile = await simpleUserService.getUserProfile(user.uid);
      if (userProfile) {
        const cardsCreated = userProfile.cardsCreated || 0;
        const cardLimit = userProfile.cardLimit || 2;
        
        setLimits({
          plan: userProfile.plan || 'free',
          cardsCreated,
          cardLimit,
          cardsRemaining: Math.max(0, cardLimit - cardsCreated),
          isLoading: false,
          error: null
        });
      } else {
        // Create a profile if it doesn't exist
        await simpleUserService.createUserProfile(user);
        setLimits({
          plan: 'free',
          cardsCreated: 0,
          cardLimit: 2,
          cardsRemaining: 2,
          isLoading: false,
          error: null
        });
      }
    } catch (error) {
      console.error("Error loading card limits:", error);
      setLimits(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to load limits') 
      }));
    }
  }

  // Load limits on mount or when user changes
  useEffect(() => {
    loadLimits();
  }, [user]);

  // Function to manually refresh limits
  const refreshLimits = async (): Promise<void> => {
    await loadLimits();
  };

  // Calculate if the user can create another card
  const canCreateCard = limits.cardsRemaining > 0;
  
  // Check if the user is on the pro plan
  const isProPlan = limits.plan === 'pro';

  return { 
    limits, 
    canCreateCard, 
    refreshLimits, 
    isProPlan
  };
}

export default useCardLimits;
