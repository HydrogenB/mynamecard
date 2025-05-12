import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card } from '../db/db';
import LanguageSwitch from '../components/LanguageSwitch';
import PricingModal from '../components/PricingModal';
import QRModal from '../components/QRModal';
import { useAuth } from '../contexts/AuthContext';
import { databaseService } from '../services/databaseService';
import realtimeDbService from '../services/realtimeDbService';
import userService from '../services/userService';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPricing, setShowPricing] = useState(false);
  const [showQR, setShowQR] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [cardCount, setCardCount] = useState(0);
  const [cardLimit, setCardLimit] = useState(2); // Default limit
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
        setLoading(true);
        
        // Get user profile to check card limit and plan
        const userProfile = await userService.getUserProfile(user.uid);
        if (userProfile) {
          setCardLimit(userProfile.cardLimit);
        }
        
        // Load all user cards
        const fetchedCards = await databaseService.getAllCards();
        setCards(fetchedCards);
        setCardCount(fetchedCards.length);
        
        // Load card statistics
        const stats: Record<string, {views: number, downloads: number, shares: number}> = {};
        
        // Get stats for each card
        for (const card of fetchedCards) {
          if (card.id) {
            const cardStat = await realtimeDbService.getCardStats(card.id);
            if (cardStat) {
              stats[card.id.toString()] = cardStat;
            } else {
              // Initialize with zero stats if none found
              stats[card.id.toString()] = { views: 0, downloads: 0, shares: 0 };
            }
          }
        }
        
        setCardStats(stats);
      } catch (error) {
        console.error('Error fetching cards:', error);
        setCards([]);
        setCardCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, [user]);
  
  const handleCreateCard = () => {
    // Check if user can create more cards
    if (cardCount < cardLimit) {
      navigate('/create');
    } else {
      setShowPricing(true);
    }
  };
  
  const handleEditCard = (id: string | number) => {
    navigate(`/edit/${id}`);
  };

  const handleDeleteCard = async (id: string | number) => {
    if (window.confirm(t('dashboard.deleteConfirm'))) {
      const success = await databaseService.deleteCard(id);
      if (success) {
        // Update the local state to reflect the deletion
        setCards(prevCards => prevCards.filter(card => card.id !== id));
        setCardCount(prevCount => prevCount - 1);
      }
    }
  };
  
  const handleToggleActive = async (card: Card) => {
    if (!card.id) return;
    
    const newActiveStatus = !card.active;
    const success = await databaseService.toggleCardActive(card.id, newActiveStatus);
    
    if (success) {
      // Update local card state
      setCards(prevCards => 
        prevCards.map(c => 
          c.id === card.id ? { ...c, active: newActiveStatus } : c
        )
      );
    }
  };
  
  const handleShare = async (card: Card) => {
    setShowQR(card);
    
    // Track share activity in Realtime Database
    if (card.id) {
      await realtimeDbService.trackCardActivity(card.id, 'share');
      await realtimeDbService.updateCardStats(card.id, 'shares');
      
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
  };

  return (
    <div className="container-card min-h-screen py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <LanguageSwitch />
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {t('dashboard.cardCount', { count: cardCount })} / {cardLimit}
        </p>
        <button
          onClick={handleCreateCard}
          className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition ${
            cardCount >= cardLimit ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={cardCount >= cardLimit}
        >
          {t('dashboard.createBtn')}
        </button>
      </div>
      
      {/* ...existing loading and empty state code... */}
      
      {!loading && cards && cards.length > 0 && (
        <div className="space-y-4">
          {cards.map(card => (
            <div 
              key={card.id} 
              className={`bg-white rounded-lg shadow p-4 flex flex-col ${
                !card.active ? 'border-l-4 border-gray-300' : ''
              }`}
            >
              <div className="flex items-center mb-3">
                {card.photo && (
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img src={card.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-grow">
                  <h2 className="font-semibold">{card.firstName} {card.lastName}</h2>
                  <p className="text-sm text-gray-600">{card.title} @ {card.organization}</p>
                </div>
                <div className="flex items-center ml-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    card.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {card.active ? t('dashboard.statusActive') : t('dashboard.statusInactive')}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                <p>{card.email}</p>
                <p>{card.phone}</p>
                <p className="text-primary-600">
                  <Link to={`/${card.slug}`}>
                    {window.location.origin}/{card.slug}
                  </Link>
                </p>
                
                {/* Card Statistics */}
                {card.id && cardStats[card.id.toString()] && (
                  <div className="mt-2 flex space-x-4 text-xs text-gray-500">
                    <span title={t('dashboard.viewCount')}>
                      👁️ {cardStats[card.id.toString()]?.views || 0}
                    </span>
                    <span title={t('dashboard.downloadCount')}>
                      ⬇️ {cardStats[card.id.toString()]?.downloads || 0}
                    </span>
                    <span title={t('dashboard.shareCount')}>
                      🔗 {cardStats[card.id.toString()]?.shares || 0}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 mt-auto">
                <button 
                  onClick={() => handleShare(card)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm transition"
                >
                  {t('dashboard.shareBtn')}
                </button>
                <button 
                  onClick={() => handleToggleActive(card)}
                  className={`flex-1 py-2 px-3 rounded text-sm transition ${
                    card.active 
                      ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800' 
                      : 'bg-green-100 hover:bg-green-200 text-green-800'
                  }`}
                >
                  {card.active ? t('dashboard.deactivateBtn') : t('dashboard.activateBtn')}
                </button>
                <button 
                  onClick={() => card.id && handleEditCard(card.id)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm transition"
                >
                  {t('dashboard.editBtn')}
                </button>
                <button 
                  onClick={() => card.id && handleDeleteCard(card.id)}
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded text-sm transition"
                >
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
          currentLimit={cardLimit}
          cardsCreated={cardCount}
        />
      )}
      
      {showQR && <QRModal card={showQR} onClose={() => setShowQR(null)} />}
    </div>
  );
};

export default Dashboard;
