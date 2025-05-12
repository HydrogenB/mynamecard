import { Card } from '../db/db';
import { generateVCard } from './vcardGenerator';
import { cardService } from '../services/cardService';

/**
 * Download a vCard for a given card
 * This function:
 * 1. Generates the vCard string
 * 2. Creates a downloadable blob
 * 3. Logs the download event in analytics
 * 4. Triggers the download
 */
export async function downloadVCard(card: Card): Promise<void> {
  try {
    // Generate vCard string from the card data
    const vCardString = generateVCard(card);
    
    // Create a Blob from the vCard string
    const blob = new Blob([vCardString], { type: "text/vcard" });
    
    // Create a download URL
    const url = URL.createObjectURL(blob);
    
    // Create an anchor element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.firstName}-${card.lastName}.vcf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    // Log the download event if a card ID is available
    if (card.id) {
      await cardService.logCardActivity(card.id, { 
        type: 'download',
        uid: card.userId 
      });
    }
  } catch (error) {
    console.error('Error downloading vCard:', error);
    throw new Error('Failed to download vCard');
  }
}

/**
 * Share a card by creating a shareable URL
 * This function:
 * 1. Creates a shareable URL
 * 2. Copies it to clipboard
 * 3. Logs the share event in analytics
 */
export async function shareCard(card: Card): Promise<string> {
  try {
    // Create a shareable URL based on the card's slug
    const shareableUrl = new URL(`/card/${card.slug}`, window.location.origin).toString();
    
    // Copy to clipboard
    await navigator.clipboard.writeText(shareableUrl);
    
    // Log the share event if a card ID is available
    if (card.id) {
      await cardService.logCardActivity(card.id, { 
        type: 'share',
        uid: card.userId 
      });
    }
    
    return shareableUrl;
  } catch (error) {
    console.error('Error sharing card:', error);
    throw new Error('Failed to share card');
  }
}
