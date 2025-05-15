import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import simpleUserService from '../services/simpleUserService';

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
    const loadUserProfile = async () => {
      if (user) {
        setDisplayName(user.displayName || '');
        try {
          await simpleUserService.getUserProfile(user.uid);
        } catch (err) {
          console.error("Error loading user profile data:", err);
        }
      } else {
        // Redirect to sign in if not authenticated
        navigate('/signin');
      }
    };
    
    loadUserProfile();
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {      // Update user profile with new display name
      
      // Update the user profile in the database
      await simpleUserService.updateUserProfile(user.uid, { displayName });
      
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>
      
      {message && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <div className="text-green-700">{message}</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="text-red-700">{error}</div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              {t('profile.email')}
            </label>
            <input
              id="email"
              type="text"
              value={user.email || ''}
              disabled
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
              {t('profile.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? t('common.saving') : t('profile.updateProfile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
