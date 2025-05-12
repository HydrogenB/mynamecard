import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cardService } from '../services/cardService';
import { userService } from '../services/userService';

interface CardAnalytics {
  views: number;
  downloads: number;
  shares: number;
  lastViewed: Date | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage card analytics functionality
 * This is used to track views, downloads, and shares for a card
 */
export function useCardAnalytics(cardId: string | null | undefined) {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<CardAnalytics>({
    views: 0,
    downloads: 0,
    shares: 0,
    lastViewed: null,
    isLoading: false,
    error: null
  });

  // Function to load card analytics
  async function loadAnalytics() {
    if (!cardId) {
      return;
    }

    try {
      setAnalytics(prev => ({ ...prev, isLoading: true, error: null }));
      const stats = await cardService.getCardStats(cardId);
      
      setAnalytics({
        views: stats.views,
        downloads: stats.downloads,
        shares: stats.shares,
        lastViewed: stats.lastViewed,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Error loading card analytics:', error);
      setAnalytics(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Failed to load card analytics')
      }));
    }
  }

  // Function to log card view
  async function logCardView() {
    if (!cardId) {
      return;
    }

    try {
      await cardService.logCardActivity(cardId, {
        type: 'view',
        uid: currentUser?.uid
      });
      
      // Update the analytics after logging
      loadAnalytics();
    } catch (error) {
      console.error('Error logging card view:', error);
    }
  }

  // Function to update user's last seen timestamp
  async function updateLastSeen() {
    if (!currentUser) {
      return;
    }

    try {
      await userService.updateLastSeen(currentUser.uid);
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }

  // Load analytics when the card ID changes
  useEffect(() => {
    if (cardId) {
      loadAnalytics();
    }
  }, [cardId]);

  // Update user's last seen status when the component mounts
  useEffect(() => {
    updateLastSeen();
  }, []);

  return {
    analytics,
    logCardView,
    refreshAnalytics: loadAnalytics,
    updateLastSeen
  };
}

export default useCardAnalytics;
