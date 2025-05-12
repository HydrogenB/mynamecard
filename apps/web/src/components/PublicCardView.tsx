import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../db/db';
import useCardAnalytics from '../hooks/useCardAnalytics';
import { downloadVCard } from '../utils/vCardDownloader';
import useCardSharing from '../hooks/useCardSharing';

interface PublicCardViewProps {
  card?: Card;
  isLoading: boolean;
  error?: string;
}

const PublicCardView: React.FC<PublicCardViewProps> = ({ card, isLoading, error }) => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { analytics, logCardView } = useCardAnalytics(card?.id);
  const { shareCard, isSharing } = useCardSharing();
  
  // Log view when card is loaded
  useEffect(() => {
    if (card?.id) {
      logCardView();
    }
  }, [card?.id]);
  
  const handleDownload = async () => {
    if (card) {
      await downloadVCard(card);
    }
  };
  
  const handleShare = async () => {
    if (card) {
      const result = await shareCard(card);
      
      if (result.success) {
        alert(t('publicCard.shareSuccess'));
      } else {
        alert(t('publicCard.shareError'));
      }
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <h2 className="text-xl font-semibold text-red-500 mb-2">{t('publicCard.notFound')}</h2>
        <p className="text-gray-600">{t('publicCard.notFoundDescription', { slug })}</p>
      </div>
    );
  }
  
  return (
    <div className={`max-w-lg mx-auto rounded-lg shadow-lg overflow-hidden ${card.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      <div className="p-6">
        {/* Card header with photo if available */}
        <div className="flex flex-col items-center mb-6">
          {card.photo && (
            <div className="mb-4">
              <img 
                src={card.photo} 
                alt={`${card.firstName} ${card.lastName}`}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          )}
          
          <h1 className="text-2xl font-bold text-center">
            {card.firstName} {card.lastName}
          </h1>
          
          {card.title && (
            <p className={`text-center mt-1 ${card.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {card.title}
            </p>
          )}
          
          {card.organization && (
            <p className={`text-center mt-1 ${card.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {card.organization}
            </p>
          )}
        </div>
        
        {/* Card details */}
        <div className="space-y-4">
          {card.email && (
            <div className="flex items-center">
              <svg className={`h-5 w-5 mr-3 ${card.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <a 
                href={`mailto:${card.email}`}
                className={`${card.theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {card.email}
              </a>
            </div>
          )}
          
          {card.phone && (
            <div className="flex items-center">
              <svg className={`h-5 w-5 mr-3 ${card.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a 
                href={`tel:${card.phone}`}
                className={`${card.theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {card.phone}
              </a>
            </div>
          )}
          
          {card.website && (
            <div className="flex items-center">
              <svg className={`h-5 w-5 mr-3 ${card.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
              </svg>
              <a 
                href={card.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${card.theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
              >
                {new URL(card.website).hostname}
              </a>
            </div>
          )}
          
          {/* Additional fields like address can be added here */}
          
          {card.notes && (
            <div className={`mt-6 p-3 rounded ${card.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className="text-sm">{card.notes}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className={`p-4 flex justify-between ${card.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className={`flex items-center px-4 py-2 rounded ${
            card.theme === 'dark' 
              ? 'bg-gray-600 hover:bg-gray-500 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          {t('publicCard.shareButton')}
        </button>
        
        <button
          onClick={handleDownload}
          className={`flex items-center px-4 py-2 rounded ${
            card.theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {t('publicCard.downloadButton')}
        </button>
      </div>
      
      {/* View counter - optional, remove if not needed */}
      <div className={`text-xs p-2 text-center ${card.theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
        {analytics.views > 0 && t('publicCard.viewCount', { count: analytics.views })}
      </div>
    </div>
  );
};

export default PublicCardView;
