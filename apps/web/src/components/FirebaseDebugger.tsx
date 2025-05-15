import React, { useState } from 'react';
import { auth } from '../config/firebase';

const FirebaseDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const testFirestoreAccess = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Testing API-based access...');

      if (!auth.currentUser) {
        setDebugInfo('Error: Not authenticated! Please log in first.');
        return;
      }

      // Log current authentication state
      setDebugInfo(`Current user: ${auth.currentUser.email} (${auth.currentUser.uid})`);
      
      // Import cardAPI and test the API-based approach
      const { default: cardAPI } = await import('../services/cardAPI');
      
      // Try to get the user's cards via the API
      try {
        const userCards = await cardAPI.getUserCards(auth.currentUser.uid);
        setDebugInfo(prev => `${prev}\n✅ API access successful! Found ${userCards.length} cards.`);
      } catch (error) {
        setDebugInfo(prev => `${prev}\n❌ Error accessing API: ${error.message}`);
        throw error;
      }
      
      // If we get here, write was successful
      setDebugInfo(prev => `${prev}\n✅ Write to Firestore successful!`);
      
      // Try to read it back
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        setDebugInfo(prev => `${prev}\n✅ Read from Firestore successful!`);
      } else {
        setDebugInfo(prev => `${prev}\n❌ Read failed: Document doesn't exist after write!`);
      }

      // Try to create/check user profile
      try {
        const userProfileRef = doc(firestore, 'users', auth.currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        
        if (userProfileSnap.exists()) {
          setDebugInfo(prev => `${prev}\n✅ User profile exists! Plan: ${userProfileSnap.data().plan}, Cards created: ${userProfileSnap.data().cardsCreated || 0}`);
        } else {
          setDebugInfo(prev => `${prev}\n⚠️ User profile doesn't exist! Creating now...`);
          
          // Create a basic user profile
          await setDoc(userProfileRef, {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email || '',
            displayName: auth.currentUser.displayName || '',
            photoURL: auth.currentUser.photoURL || '',
            plan: 'free',
            cardLimit: 2,
            cardsCreated: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastSeen: serverTimestamp()
          });
          
          setDebugInfo(prev => `${prev}\n✅ User profile created!`);
        }
      } catch (profileError: any) {
        setDebugInfo(prev => `${prev}\n❌ Error with user profile: ${profileError.message}`);
      }
      
    } catch (error: any) {
      setDebugInfo(`Error testing Firestore: ${error.message}`);
      console.error('Firestore test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateCard = async () => {
    try {
      setIsLoading(true);
      setDebugInfo('Testing direct card creation...');

      if (!auth.currentUser) {
        setDebugInfo('Error: Not authenticated! Please log in first.');
        return;
      }

      // Create a test card directly
      const cardRef = doc(collection(firestore, 'cards'));
      const testCard = {
        userId: auth.currentUser.uid,
        firstName: 'Test',
        lastName: 'User',
        organization: 'Test Org',
        title: 'Tester',
        email: 'test@example.com',
        phone: '123-456-7890',
        slug: `test-${Date.now()}`,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(cardRef, testCard);
      
      setDebugInfo(prev => `${prev}\n✅ Card created successfully with ID: ${cardRef.id}`);
      
      // Update user's card count - this is where we often see permission issues
      try {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const cardsCreated = (userData.cardsCreated || 0) + 1;
          
          await setDoc(userRef, {
            ...userData,
            cardsCreated,
            updatedAt: serverTimestamp()
          }, { merge: true });
          
          setDebugInfo(prev => `${prev}\n✅ User card count updated to ${cardsCreated}`);
        } else {
          setDebugInfo(prev => `${prev}\n❌ User profile not found when updating card count`);
        }
      } catch (userUpdateError: any) {
        setDebugInfo(prev => `${prev}\n❌ Error updating user card count: ${userUpdateError.message}`);
      }

    } catch (error: any) {
      setDebugInfo(prev => `${prev}\n❌ Error creating test card: ${error.message}`);
      console.error('Card creation test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8 p-4 border border-yellow-400 bg-yellow-50 rounded">
      <h2 className="text-lg font-bold mb-4">Firebase Debugging Tools</h2>
      
      <div className="flex space-x-4 mb-4">
        <button 
          onClick={testFirestoreAccess}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded px-4 py-2"
        >
          {isLoading ? 'Testing...' : 'Test Auth & API Access'}
        </button>
        
        <button 
          onClick={testCreateCard}
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded px-4 py-2"
        >
          {isLoading ? 'Creating...' : 'Test Direct Card Creation'}
        </button>
      </div>
      
      {debugInfo && (
        <pre className="whitespace-pre-wrap text-sm bg-gray-800 text-white p-3 rounded mt-2 max-h-60 overflow-auto">
          {debugInfo}
        </pre>
      )}
    </div>
  );
};

export default FirebaseDebugger;
