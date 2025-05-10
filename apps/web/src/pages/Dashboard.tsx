import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Card } from '../db/db';
import LanguageSwitch from '../components/LanguageSwitch';
import PricingModal from '../components/PricingModal';
import QRModal from '../components/QRModal';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showPricing, setShowPricing] = useState(false);
  const [showQR, setShowQR] = useState<Card | null>(null);

  const cards = useLiveQuery(() => db.getAllCards(), []);
  const cardCount = useLiveQuery(() => db.getCardCount(), []) || 0;

  const handleCreateCard = () => {
    if (cardCount === 0) {
      navigate('/create');
    } else {
      setShowPricing(true);
    }
  };

  const handleEditCard = (id: number) => {
    navigate(`/edit/${id}`);
  };

  const handleDeleteCard = async (id: number) => {
    if (window.confirm(t('dashboard.deleteConfirm'))) {
      await db.deleteCard(id);
    }
  };

  const handleShare = (card: Card) => {
    setShowQR(card);
  };

  return (
    <div className="container-card min-h-screen py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <LanguageSwitch />
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {t('dashboard.cardCount', { count: cardCount })}
        </p>
        <button
          onClick={handleCreateCard}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition"
        >
          {t('dashboard.createBtn')}
        </button>
      </div>

      {!cards || cards.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">{t('dashboard.emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map(card => (
            <div 
              key={card.id} 
              className="bg-white rounded-lg shadow p-4 flex flex-col"
            >
              <div className="flex items-center mb-3">
                {card.photo && (
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                    <img src={card.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold">{card.firstName} {card.lastName}</h2>
                  <p className="text-sm text-gray-600">{card.title} @ {card.organization}</p>
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
              </div>

              <div className="flex space-x-2 mt-auto">
                <button 
                  onClick={() => handleShare(card)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 rounded text-sm transition"
                >
                  {t('dashboard.shareBtn')}
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

      {showPricing && <PricingModal onClose={() => setShowPricing(false)} onContinue={() => { setShowPricing(false); navigate('/create'); }} />}
      {showQR && <QRModal card={showQR} onClose={() => setShowQR(null)} />}
    </div>
  );
};

export default Dashboard;
