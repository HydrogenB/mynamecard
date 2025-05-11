import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { updateProfile, User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import realtimeDbService from '../services/realtimeDbService';

const UserProfile: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Load user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    } else {
      // Redirect to sign in if not authenticated
      navigate('/signin');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Update online status with new display name
      await realtimeDbService.setUserOnlineStatus(true);
      
      setMessage('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container-card py-8">
      <h1 className="text-2xl font-bold mb-6">{t('auth.profile')}</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="text-sm text-green-700">{message}</div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {/* User info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              disabled
              className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
              value={user.email || ''}
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="inline-block mr-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </span>
              ) : null}
              {t('cardEditor.saveBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
