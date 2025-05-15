import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, firestore } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const FirebaseAuthDebugger: React.FC = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Function to load debug information
  const loadDebugInfo = async () => {
    setIsLoading(true);
    const info: any = {
      authState: {
        isAuthenticated: !!auth.currentUser,
        uid: auth.currentUser?.uid || 'not authenticated',
        email: auth.currentUser?.email || 'not authenticated',
        displayName: auth.currentUser?.displayName || 'not set',
        tokenExpiration: null,
      },
      userProfile: null,
      error: null
    };

    try {
      // Check token expiration
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdTokenResult();
        info.authState.tokenExpiration = new Date(token.expirationTime).toLocaleString();
        
        // Get user profile from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            info.userProfile = userDoc.data();
          } else {
            info.userProfile = 'No user profile found in Firestore';
          }
        } catch (profileError: any) {
          info.error = `Error loading profile: ${profileError.message}`;
        }
      }
    } catch (err: any) {
      info.error = `Error: ${err.message}`;
    }

    setDebugInfo(info);
    setIsLoading(false);
  };

  // Force auth token refresh
  const refreshAuthToken = async () => {
    setIsLoading(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.getIdToken(true);
        await loadDebugInfo();
        alert('Auth token refreshed successfully!');
      } else {
        alert('No authenticated user!');
      }
    } catch (error: any) {
      alert(`Error refreshing token: ${error.message}`);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isExpanded) {
      loadDebugInfo();
    }
  }, [isExpanded, user]);

  if (!isExpanded) {
    return (
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '10px', 
          right: '10px',
          background: '#333',
          color: '#fff',
          padding: '8px',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 9999
        }}
        onClick={() => setIsExpanded(true)}
      >
        🔍 Debug Auth
      </div>
    );
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px',
        background: '#333',
        color: '#fff',
        padding: '16px',
        borderRadius: '4px',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 9999
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ margin: 0 }}>Firebase Auth Debugger</h3>
        <button 
          onClick={() => setIsExpanded(false)} 
          style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px' }}
        >
          ×
        </button>
      </div>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div>
            <h4>Authentication</h4>
            <p><strong>Status:</strong> {debugInfo.authState?.isAuthenticated ? '✅ Logged In' : '❌ Not Authenticated'}</p>
            {debugInfo.authState?.isAuthenticated && (
              <>
                <p><strong>User ID:</strong> {debugInfo.authState?.uid}</p>
                <p><strong>Email:</strong> {debugInfo.authState?.email}</p>
                <p><strong>Token expires:</strong> {debugInfo.authState?.tokenExpiration}</p>
              </>
            )}
          </div>
          
          <div>
            <h4>User Profile</h4>
            {typeof debugInfo.userProfile === 'object' && debugInfo.userProfile ? (
              <>
                <p><strong>Plan:</strong> {debugInfo.userProfile?.plan || 'not set'}</p>
                <p><strong>Card Limit:</strong> {debugInfo.userProfile?.cardLimit || '0'}</p>
                <p><strong>Cards Created:</strong> {debugInfo.userProfile?.cardsCreated || '0'}</p>
                <p><strong>Created:</strong> {debugInfo.userProfile?.createdAt?.toDate?.().toLocaleString() || 'unknown'}</p>
              </>
            ) : (
              <p>{debugInfo.userProfile || 'No profile data'}</p>
            )}
          </div>
          
          {debugInfo.error && (
            <div style={{ color: '#ff6b6b' }}>
              <h4>Error</h4>
              <p>{debugInfo.error}</p>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={loadDebugInfo}
              style={{ 
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Info
            </button>
            <button
              onClick={refreshAuthToken}
              style={{ 
                background: '#2196F3',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh Auth Token
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FirebaseAuthDebugger;
