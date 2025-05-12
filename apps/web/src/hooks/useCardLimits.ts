import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';

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
  const { currentUser } = useAuth();
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
    if (!currentUser) {
      setLimits(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setLimits(prev => ({ ...prev, isLoading: true, error: null }));
      const userLimits = await userService.getUserLimits(currentUser.uid);
      
      setLimits({
        plan: userLimits.plan,
        cardsCreated: userLimits.cardsCreated,
        cardLimit: userLimits.cardLimit,
        cardsRemaining: userLimits.cardsRemaining,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading user card limits:', error);
      setLimits(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to load card limits')
      }));
    }
  }

  // Load limits when the user changes
  useEffect(() => {
    loadLimits();
  }, [currentUser?.uid]);

  return {
    limits,
    canCreateCard: limits.cardsRemaining > 0,
    refreshLimits: loadLimits,
    isProPlan: limits.plan === 'pro'
  };
}

export default useCardLimits;
