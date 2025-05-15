import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../db/db';
import LanguageSwitch from '../components/LanguageSwitch';
import PricingModal from '../components/PricingModal';
import QRModal from '../components/QRModal';
import FirebaseDebugger from '../components/FirebaseDebugger';
import AuthNotice from '../components/AuthNotice';
import { useAuth } from '../contexts/AuthContext';
import cardAPI from '../services/cardAPI';
import firebaseAnalyticsService from '../services/firebaseAnalyticsService';
import useCardLimits from '../hooks/useCardLimits';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showQR, setShowQR] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);  const { limits, canCreateCard, refreshLimits } = useCardLimits();
  const [loading, setLoading] = useState(true);
  const [cardStats, setCardStats] = useState<Record<string, {views: number, downloads: number, shares: number}>>({});
    // Load cards from Firestore
  useEffect(() => {
    const loadCards = async () => {
      if (!user) {
        setLoading(false);
        return; // Exit early if no user
      }
      
      try {
        setLoading(true);        // Load all user cards using the cardAPI
        const fetchedCards = await cardAPI.getUserCards(user.uid);
        setCards(fetchedCards);
        
        // Refresh card limits and usage after loading cards
        await refreshLimits();
        
        // Load card statistics
        const stats: Record<string, {views: number, downloads: number, shares: number}> = {};
        
        // Get stats for each card
        for (const card of fetchedCards) {
          if (card.id) {
            const cardStat = await firebaseAnalyticsService.getCardStats(card.id);
            if (cardStat) {
              stats[card.id.toString()] = cardStat;
            } else {
              // Initialize with zero stats if none found
              stats[card.id.toString()] = { views: 0, downloads: 0, shares: 0 };
            }
          }
        }
        
        setCardStats(stats);      } catch (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, [user]);
    const handleCreateCard = () => {
    // Check if user can create more cards
    if (canCreateCard) {
      navigate('/create');
    } else {
      setShowPricing(true);
    }
  };
  
  const handleEditCard = (id: string | number) => {
    navigate(`/edit/${id}`);
  };  const handleDeleteCard = async (id: string | number) => {
    if (window.confirm(t('dashboard.deleteConfirm'))) {
      try {        // Delete the card using cardAPI
        await cardAPI.deleteCard(id.toString());
        
        // Update the local state to reflect the deletion
        setCards(prevCards => prevCards.filter(card => card.id !== id));
        
        // Refresh card limits after deletion
        await refreshLimits();
      } catch (error) {
        console.error('Error deleting card:', error);
      }
    }
  };
    const handleToggleActive = async (card: Card) => {
    if (!card.id) return;
    
    const newActiveStatus = !card.active;
    
    try {
      await cardAPI.toggleCardActive(card.id, newActiveStatus);
      
      // Update local card state
      setCards(prevCards => 
        prevCards.map(c => 
          c.id === card.id ? { ...c, active: newActiveStatus } : c
        )
      );
    } catch (error) {
      console.error('Error toggling card active state:', error);
    }
  };
  
  const handleShare = async (card: Card) => {
    setShowQR(card);
      // Track share activity in Firestore
    if (card.id) {
      await firebaseAnalyticsService.trackCardActivity(card.id, 'share');
      await firebaseAnalyticsService.updateCardStats(card.id, 'shares');
      
      // Update local stats
      setCardStats(prev => {
        const cardId = card.id!.toString();
        const currentStats = prev[cardId] || { views: 0, downloads: 0, shares: 0 };
        return {
          ...prev,
          [cardId]: {
            ...currentStats,
            shares: (currentStats.shares || 0) + 1
          }
        };
      });
    }
  };  return (
    <div className="container-card min-h-screen py-6 sm:py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your digital business cards</p>
        </div>
        <LanguageSwitch />
      </div>
      
      <AuthNotice />
      
      <div className="mb-8 mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-primary-50 rounded-full p-3 hidden sm:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                <path d="M8 11a1 1 0 100-2 1 1 0 000 2zm0 0a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Your Card Usage</p>
              <div className="mt-1 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[150px]">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (limits.cardsCreated / limits.cardLimit) * 100)}%` }}
                  ></div>
                </div>
                <p className="ml-3 text-sm text-gray-700 font-medium">
                  <span className="font-semibold">{limits.cardsCreated}</span> / {limits.cardLimit}
                </p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleCreateCard}
            className={`bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition flex items-center justify-center shadow-sm ${
              !canCreateCard ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={!canCreateCard}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('dashboard.createBtn')}
          </button>
        </div>
      </div>
      
      {/* ...existing loading and empty state code... */}
        {!loading && cards && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 ${
                !card.active ? 'border-l-4 border-gray-300' : ''
              }`}
            >
              {/* Card Header with Photo */}
              <div className="relative">
                <div className="h-24 bg-gradient-to-r from-primary-500 to-primary-700"></div>
                {card.photo ? (
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2 w-16 h-16 rounded-full overflow-hidden border-2 border-white">
                    <img src={card.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="absolute bottom-0 left-6 transform translate-y-1/2 w-16 h-16 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center">
                    <span className="text-primary-700 text-xl font-bold">{card.firstName?.[0]}{card.lastName?.[0]}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    card.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.active ? t('dashboard.statusActive') : t('dashboard.statusInactive')}
                  </span>
                </div>
              </div>
              
              {/* Card Content */}
              <div className="p-6 pt-12 flex-grow">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{card.firstName} {card.lastName}</h2>
                    {(card.title || card.organization) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {card.title}{card.title && card.organization ? ` @ ${card.organization}` : card.organization}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 space-y-2 text-sm">
                  {card.email && (
                    <div className="flex items-center text-gray-700">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{card.email}</span>
                    </div>
                  )}
                  {card.phone && (
                    <div className="flex items-center text-gray-700">
                      <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{card.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center text-primary-600 mt-2">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <Link to={`/${card.slug}`} className="hover:underline truncate">
                      {window.location.origin}/{card.slug}
                    </Link>
                  </div>
                </div>
                
                {/* Card Statistics */}                {card.id && cardStats[card.id.toString()] && (
                  <div className="mt-4 flex space-x-6 text-xs text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center" title={t('dashboard.viewCount')}>
                      <svg className="h-4 w-4 mr-1 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      <span>{cardStats[card.id.toString()]?.views || 0}</span>
                    </div>                    <div className="flex items-center" title={t('dashboard.downloadCount')}>
                      <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>{cardStats[card.id.toString()]?.downloads || 0}</span>
                    </div>
                    <div className="flex items-center" title={t('dashboard.shareCount')}>
                      <svg className="h-4 w-4 mr-1 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      <span>{cardStats[card.id.toString()]?.shares || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
                <button 
                  onClick={() => handleShare(card)}
                  className="flex items-center justify-center py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-medium transition shadow-sm flex-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  {t('dashboard.shareBtn')}
                </button>
                <button 
                  onClick={() => handleToggleActive(card)}
                  className={`flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition shadow-sm flex-1 ${
                    card.active 
                      ? 'bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800' 
                      : 'bg-green-50 border border-green-200 hover:bg-green-100 text-green-800'
                  }`}
                >
                  {card.active ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                      {t('dashboard.deactivateBtn')}
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      {t('dashboard.activateBtn')}
                    </>
                  )}
                </button>
                <button 
                  onClick={() => card.id && handleEditCard(card.id)}
                  className="flex items-center justify-center py-2 px-3 bg-primary-50 border border-primary-200 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-medium transition shadow-sm flex-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  {t('dashboard.editBtn')}
                </button>
              </div>
              
              {/* Delete Button */}
              <div className="border-t border-gray-100 px-4 py-3 flex justify-end">
                <button 
                  onClick={() => card.id && handleDeleteCard(card.id)}
                  className="inline-flex items-center py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded text-xs font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {t('dashboard.deleteBtn')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}      {showPricing && (
        <PricingModal 
          onClose={() => setShowPricing(false)} 
          onContinue={() => { setShowPricing(false); navigate('/create'); }} 
          currentLimit={limits.cardLimit}
          cardsCreated={limits.cardsCreated}
        />
      )}
      
      {showQR && <QRModal card={showQR} onClose={() => setShowQR(null)} />}
    </div>
  );
};

export default Dashboard;
