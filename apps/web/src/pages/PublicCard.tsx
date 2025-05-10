import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { db } from '../db/db';
import NotFound from './NotFound';
import QRCode from 'qrcode.react';

interface Card {
  id?: number;
  slug: string;
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  email: string;
  phone: string;
  photo?: string;
  website?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notes?: string;
  theme: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PublicCard: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useTranslation();
  
  useEffect(() => {
    const fetchCard = async () => {
      try {
        if (!slug) {
          setError(true);
          return;
        }
        
        const result = await db.cards
          .where('slug')
          .equals(slug)
          .first();
        
        if (result) {
          setCard(result);
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
  
  const downloadVCard = () => {
    // Implement vCard download logic
    alert('Download vCard feature coming soon!');
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
              <h2 className="text-lg font-semibold mb-2">{t('card.contactInfo')}</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">{t('card.email')}:</span> {card.email}
                </p>
                <p>
                  <span className="font-medium">{t('card.phone')}:</span> {card.phone}
                </p>
                {card.website && (
                  <p>
                    <span className="font-medium">{t('card.website')}:</span>{' '}
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
                <h2 className="text-lg font-semibold mb-2">{t('card.address')}</h2>
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
                <h2 className="text-lg font-semibold mb-2">{t('card.notes')}</h2>
                <p className="whitespace-pre-line">{card.notes}</p>
              </div>
            )}
            
            {/* QR Code */}
            <div className="mt-6 flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">{t('card.scanMe')}</h2>
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
                className={`px-4 py-2 rounded ${getThemeClasses(card.theme)} hover:opacity-90 transition-opacity`}
              >
                {t('card.downloadVcard')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCard;
