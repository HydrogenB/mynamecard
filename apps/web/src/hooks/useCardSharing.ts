import { useState } from 'react';
import { Card } from '../db/db';
import { cardService } from '../services/cardService';

interface ShareResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Hook to manage card sharing functionality
 */
export function useCardSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);

  /**
   * Share a card via URL and copy to clipboard
   */
  const shareCard = async (card: Card): Promise<ShareResult> => {
    if (!card || !card.id) {
      const error = 'Invalid card data';
      setShareResult({ success: false, error });
      return { success: false, error };
    }

    setIsSharing(true);
    setShareResult(null);

    try {
      // Create the shareable URL
      const shareableUrl = new URL(`/card/${card.slug}`, window.location.origin).toString();
      
      // Log the share event
      await cardService.logCardActivity(card.id, {
        type: 'share',
        uid: card.userId
      });
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableUrl);
      
      const result = { success: true, url: shareableUrl };
      setShareResult(result);
      return result;
    } catch (error) {
      console.error('Error sharing card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to share card';
      
      const result = { success: false, error: errorMessage };
      setShareResult(result);
      return result;
    } finally {
      setIsSharing(false);
    }
  };

  return {
    shareCard,
    isSharing,
    shareResult
  };
}

export default useCardSharing;
