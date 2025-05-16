import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NotFound from './NotFound';
// Replace QRCode import with our design system component
import { QRCode } from '../design-system';
import { generateVCard } from '../utils/vcardGenerator';
import cardAPI from '../services/cardAPI';

// Import the Card type and extend it for our component
import { Card as DBCard } from '../db/db';

// Extend the DB Card type with the specific types we need
interface Card extends Omit<DBCard, 'theme' | 'address' | 'createdAt' | 'updatedAt'> {
  theme: string; // Make theme required
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const PublicCard: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { t } = useTranslation();
  
  useEffect(() => {
    const fetchCard = async () => {
      try {
        if (!slug) {
          setError(true);
          return;
        }
        
        // Get the card from Firestore database - use public card method
        const result = await cardService.getCardBySlug(slug);
        
        if (result) {
          // Only display active cards
          if (!result.active) {
            setError(true);
            return;
          }
          
          // Ensure theme is defined (use blue as default if undefined)
          const cardWithTheme = {
            ...result,
            theme: result.theme || 'blue'
          };
          setCard(cardWithTheme as unknown as Card);
          
          // Track the view in the simple system
          const currentUser = auth.currentUser;
          
          // Analytics tracking would go here in a more complete implementation
          console.log(`Card view: ${result.id || slug} by ${currentUser?.uid || 'anonymous visitor'}`);
          
          // Update card view statistics (simplified)
          console.log(`Card stats updated: ${result.id || slug}, views`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching card:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCard();
  }, [slug]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error || !card) {
    return <NotFound />;
  }
  
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'green':
        return 'bg-green-600 text-white';
      case 'red':
        return 'bg-red-600 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-blue-600 text-white';
    }
  };

  const downloadVCard = async () => {
    if (!card || !card.slug) return;
    
    setIsDownloading(true);
    try {
      // Generate vCard content using our client-side generator
      const vcardString = generateVCard(card as unknown as DBCard);
      
      // Create a Blob with the vCard content
      const vcardBlob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(vcardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${card.firstName}_${card.lastName}.vcf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Track download activity
      if (card.id) {
        // Simplified analytics logging
        console.log(`Card download: ${card.id}`);
      }
    } catch (error) {
      console.error('Error downloading vCard:', error);
      alert(t('errors.generic'));
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className={`p-6 ${getThemeClasses(card.theme)}`}>
          {card.photo && (
            <div className="flex justify-center mb-4">
              <img
                src={card.photo}
                alt={`${card.firstName} ${card.lastName}`}
                className="h-32 w-32 rounded-full border-4 border-white object-cover"
              />
            </div>
          )}
          <h1 className="text-2xl font-bold text-center">
            {card.firstName} {card.lastName}
          </h1>
          <p className="text-center text-gray-100">
            {card.title} {card.organization ? `at ${card.organization}` : ''}
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold mb-2">{t('publicCard.contactInfo')}</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">{t('form.email')}:</span> {card.email}
                </p>
                <p>
                  <span className="font-medium">{t('form.phone')}:</span> {card.phone}
                </p>
                {card.website && (
                  <p>
                    <span className="font-medium">{t('form.website')}:</span>{' '}
                    <a
                      href={card.website.startsWith('http') ? card.website : `https://${card.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {card.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
            
            {/* Address Information */}
            {card.address && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('publicCard.address')}</h2>
                <address className="not-italic">
                  {card.address.street && <p>{card.address.street}</p>}
                  {card.address.city && card.address.state && (
                    <p>
                      {card.address.city}, {card.address.state} {card.address.postalCode}
                    </p>
                  )}
                  {card.address.country && <p>{card.address.country}</p>}
                </address>
              </div>
            )}
            
            {/* Notes */}
            {card.notes && (
              <div>
                <h2 className="text-lg font-semibold mb-2">{t('form.notes')}</h2>
                <p className="whitespace-pre-line">{card.notes}</p>
              </div>
            )}
            
            {/* QR Code */}
            <div className="mt-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{t('publicCard.saveContact')}</h2>
              <div className="border p-4 rounded-lg bg-white">
                <QRCode 
                  value={window.location.href} 
                  size={150}
                  bgColor={"#ffffff"}
                  fgColor={"#000000"}
                  level={"L"}
                  includeMargin={false}
                />
              </div>
            </div>
              {/* Download Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={downloadVCard}
                disabled={isDownloading}
                className={`px-4 py-2 rounded ${getThemeClasses(card.theme)} hover:opacity-90 transition-opacity flex items-center ${isDownloading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isDownloading && (
                  <span className="inline-block mr-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </span>
                )}
                {isDownloading ? t('publicCard.downloading') : t('publicCard.downloadVcf')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCard;
