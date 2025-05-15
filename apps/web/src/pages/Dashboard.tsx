import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../db/db';
import LanguageSwitch from '../components/LanguageSwitch';
import PricingModal from '../components/PricingModal';
import QRModal from '../components/QRModal';
import AuthNotice from '../components/AuthNotice';
import { useAuth } from '../contexts/AuthContext';
import cardAPI from '../services/cardAPI';
import simpleUserService from '../services/simpleUserService';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showQR, setShowQR] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [limits, setLimits] = useState({ cardLimit: 2, cardsCreated: 0 });

  // Load cards
  useEffect(() => {
    const loadCards = async () => {
      if (!user) {
        setLoading(false);
        return; // Exit early if no user
      }
      
      try {
        setLoading(true);
        
        // Load all user cards using the cardAPI
        const fetchedCards = await cardAPI.getUserCards(user.uid);
        setCards(fetchedCards);
        
        // Get user profile for limits
        const profile = await simpleUserService.getUserProfile(user.uid);
        if (profile) {
          setLimits({
            cardLimit: profile.cardLimit || 2,
            cardsCreated: profile.cardsCreated || 0
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading cards:", error);
        setLoading(false);
        setCards([]);
      }
    };
    
    loadCards();
  }, [user]);

  // Create a new card
  const handleCreateCard = () => {
    const canCreateCard = limits.cardsCreated < limits.cardLimit;
    
    if (!canCreateCard) {
      setShowPricing(true);
      return;
    }
    
    navigate('/create');
  };

  // Edit a card
  const handleEditCard = (id: string) => {
    navigate(`/edit/${id}`);
  };

  // Delete a card
  const handleDeleteCard = async (id: string) => {
    if (!window.confirm(t('dashboard.deleteConfirm'))) return;
    
    try {
      if (!user) return;
      
      // Delete the card using cardAPI
      await cardAPI.deleteCard(id);
      
      // Update the cards list
      setCards(prevCards => prevCards.filter(card => card.id !== id));
      
      // Update limits
      const profile = await simpleUserService.getUserProfile(user.uid);
      if (profile) {
        setLimits({
          cardLimit: profile.cardLimit || 2,
          cardsCreated: profile.cardsCreated || 0
        });
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  // Toggle card active status
  const handleToggleActive = async (card: Card) => {
    if (!card.id) return;
    
    const newActiveStatus = !card.active;
    
    try {
      // Update the card active status
      await cardAPI.toggleCardActive(card.id, newActiveStatus);
      
      // Update the cards list
      setCards(prevCards =>
        prevCards.map(c =>
          c.id === card.id ? { ...c, active: newActiveStatus } : c
        )
      );
    } catch (error) {
      console.error('Error toggling card status:', error);
    }
  };

  // Share a card
  const handleShare = (card: Card) => {
    setShowQR(card);
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
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
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M8 11a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1zm0-4a1 1 0 011-1h4a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">{t('dashboard.cardLimits')}</h3>
              <p className="text-gray-500">
                {t('dashboard.cardLimitsInfo', { created: limits.cardsCreated, total: limits.cardLimit })}
              </p>
            </div>
          </div>
          <button 
            onClick={handleCreateCard}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {t('dashboard.createBtn')}
          </button>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && (!cards || cards.length === 0) && (
        <div className="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">{t('dashboard.noCards')}</h3>
          <p className="mt-1 text-gray-500">{t('dashboard.noCardsMessage')}</p>
          <div className="mt-6">
            <button
              onClick={handleCreateCard}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('dashboard.createFirstCard')}
            </button>
          </div>
        </div>
      )}
      
      {/* Cards grid */}
      {!loading && cards && cards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100 ${
                !card.active ? 'opacity-75' : ''
              }`}
            >
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                <div className="flex items-center">
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
                </div>
              </div>
              
              {/* Button Group */}
              <div className="px-6 py-4 flex gap-3 border-t border-gray-100">
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
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
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
      )}
      
      {showPricing && (
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
