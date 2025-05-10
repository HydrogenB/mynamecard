import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import QRCode from '../components/UI/QRCode';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../lib/firebase';

interface Card {
  id: string;
  slug: string;
  fullName: string;
  company?: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchUserCards = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      const q = query(
        collection(db, 'cards'),
        where('owner', '==', user.uid),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      const userCards = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          slug: data.slug,
          fullName: data.vcard?.FN || data.fullName,
          company: data.vcard?.ORG || data.company,
          title: data.vcard?.TITLE || data.title,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        };
      });
      
      setCards(userCards);
      
      // Log analytics event
      if (analytics) {
        logEvent(analytics, 'dashboard_viewed', {
          card_count: userCards.length
        });
      }
      
    } catch (err) {
      console.error('Error fetching cards:', err);
      setError('Failed to load your cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserCards();
  }, [user]);
  
  if (loading) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-12">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="max-w-screen-md mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
        <Link 
          to="/dashboard/create" 
          className="btn-primary"
          aria-disabled={cards.length >= 1}
          style={{ opacity: cards.length >= 1 ? 0.5 : 1, pointerEvents: cards.length >= 1 ? 'none' : 'auto' }}
        >
          {t('dashboard.create')}
        </Link>
      </div>
      
      {/* Quota information */}
      <div className="bg-secondary-50 p-4 rounded-lg mb-8">
        <div className="flex justify-between items-center">
          <span>
            {t('dashboard.quota.free', { used: cards.length, total: 1 })}
          </span>
          {cards.length >= 1 && (
            <Link to="/pricing" className="text-sm text-primary-600 hover:text-primary-800 font-medium">
              {t('dashboard.quota.upgrade')}
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}
      
      {cards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-secondary-600 mb-4">{t('dashboard.empty')}</p>
          <Link to="/dashboard/create" className="btn-primary">
            {t('dashboard.create')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-medium">{t('dashboard.cards')}</h2>
          
          {cards.map(card => (
            <div key={card.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="sm:flex justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-medium">{card.fullName}</h3>
                  {card.title && <p className="text-secondary-600">{card.title}</p>}
                  {card.company && <p className="text-secondary-500">{card.company}</p>}
                </div>
                
                <div className="flex flex-col sm:items-end">
                  <div className="mb-4">
                    <QRCode
                      value={`${window.location.origin}/${card.slug}`}
                      size={120}
                      downloadable={true}
                      fileName={card.slug}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Link 
                      to={`/${card.slug}`} 
                      target="_blank" 
                      className="btn-outline text-sm"
                    >
                      {t('card.preview')}
                    </Link>
                    <Link 
                      to={`/dashboard/edit/${card.id}`}
                      className="btn-primary text-sm"
                    >
                      {t('card.edit')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
