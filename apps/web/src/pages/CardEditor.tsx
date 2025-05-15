import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { cardSchema, CardFormData, generateSlug } from '../schemas/cardSchema';
import ImageUploader from '../components/ImageUploader';
import AuthNotice from '../components/AuthNotice';
import firebaseAnalyticsService from '../services/firebaseAnalyticsService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import cardAPI from '../services/cardAPI';
import { motion, AnimatePresence } from 'framer-motion';

// Add a debug helper function 
const logDebugInfo = (title: string, data: any) => {
  console.log(`DEBUG ${title}:`, data);
  if (data && typeof data === 'object') {
    try {
      // Log keys and some values safely
      console.log('Keys:', Object.keys(data));
      if ('uid' in data) console.log('uid:', data.uid);
      if ('email' in data) console.log('email:', data.email);
    } catch (e) {
      console.error('Error logging debug info:', e);
    }
  }
};

// Define the different steps in our editor
type EditorStep = 'appearance' | 'personal' | 'contact' | 'address' | 'additional';

const CardEditor: React.FC = () => {  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, ensureUserProfile } = useAuth();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [photoData, setPhotoData] = useState<string | undefined>(undefined);
  // Add debug state
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Mobile wizard step state
  const [currentStep, setCurrentStep] = useState<EditorStep>('appearance');
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Track window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      theme: 'default',
      address: { street: '', city: '', state: '', postalCode: '', country: '' }
    }
  });  // Watch fields that could affect slug generation
  const firstName = watch('firstName', '');
  const lastName = watch('lastName', '');

  useEffect(() => {
    const loadCard = async () => {
      if (!id) return;
        try {        // Use cardAPI to get card data
        const { default: cardAPI } = await import('../services/cardAPI');
        const card = await cardAPI.getCardById(id);
        
        if (!card) {
          navigate('/dashboard');
          return;
        }
        
        // Populate the form with card data
        setValue('slug', card.slug);
        setValue('firstName', card.firstName);
        setValue('lastName', card.lastName);
        setValue('organization', card.organization);
        setValue('title', card.title);
        setValue('email', card.email);
        setValue('phone', card.phone);
        setValue('website', card.website || '');
        setValue('theme', card.theme || 'default');
        setValue('notes', card.notes || '');
        
        if (card.address) {
          setValue('address', card.address);
        }
        
        if (card.photo) {
          setPhotoData(card.photo);
        }
        
      } catch (error) {
        console.error('Error loading card:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCard();
  }, [id, navigate, setValue]);

  // Auto-generate slug when name changes
  useEffect(() => {
    if (!isEditMode && firstName && lastName) {
      const autoSlug = generateSlug(firstName, lastName);
      setValue('slug', autoSlug);
    }
  }, [firstName, lastName, setValue, isEditMode]);  // Function to move to next step in the mobile wizard
  const goToNextStep = () => {
    switch (currentStep) {
      case 'appearance':
        setCurrentStep('personal');
        break;
      case 'personal':
        setCurrentStep('contact');
        break;
      case 'contact':
        setCurrentStep('address');
        break;
      case 'address':
        setCurrentStep('additional');
        break;
      case 'additional':
        // On the last step, submit the form
        formRef.current?.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        );
        break;
    }
  };
  
  // Function to move to previous step in the mobile wizard
  const goToPrevStep = () => {
    switch (currentStep) {
      case 'personal':
        setCurrentStep('appearance');
        break;
      case 'contact':
        setCurrentStep('personal');
        break;
      case 'address':
        setCurrentStep('contact');
        break;
      case 'additional':
        setCurrentStep('address');
        break;
    }
  };
  
  const onSubmit = async (data: CardFormData) => {
    setIsSubmitting(true);
    try {
      if (!user) {
        alert(t('errors.loginRequired'));
        navigate('/login');
        return;
      }      console.log("Current auth user:", user);
      
      // Import and use authHelper
      try {
        // Import the authHelper
        const { default: authHelper } = await import('../utils/authHelper');
        
        // Fix system configuration first
        console.log("Fixing system configuration...");
        await authHelper.fixSystemConfig();
        
        // Fix user profile to ensure it has all required fields
        console.log("Fixing user profile if needed...");
        await authHelper.fixUserProfile();
        
        // Force refresh token to ensure it has latest claims
        console.log("Refreshing authentication token...");
        await authHelper.forceTokenRefresh();
        
        // Force update the user profile before creating a card to ensure it exists
        const profile = await ensureUserProfile(user);
        console.log("Ensured user profile:", profile);
        
        // Wait longer to ensure Firebase security rules are updated with the new profile
        console.log("Waiting for profile propagation...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Increased to 2 seconds
        console.log("Continuing with card creation after delay");
        
        // Add additional check for card limits
        const cardLimits = await userService.getUserCardLimits(user.uid);
        console.log("Current card limits:", cardLimits);
        
        if (cardLimits && cardLimits.cardsCreated >= cardLimits.cardLimit) {
          alert(t('errors.cardLimitReached'));
          navigate('/dashboard');
          return;
        }
      } catch (profileError) {
        console.error("Failed to ensure user profile:", profileError);
        alert(t('errors.profileCreationFailed'));
        return; // Don't continue if profile creation failed
      }

      // Include photo in the data if it exists and ensure address fields are valid
      const cardData = {
        ...data,
        userId: user.uid, // Explicitly add the user ID to the card data
        photo: photoData,
        active: true, // All new cards start as active
        // Ensure address fields are properly defined for database service
        address: data.address ? {
          street: data.address.street || '',
          city: data.address.city || '',
          state: data.address.state || '',
          postalCode: data.address.postalCode || '',
          country: data.address.country || '',
        } : undefined
      };
        if (isEditMode && id) {        // Use card API to update the card
        const { default: cardAPI } = await import('../services/cardAPI');
        await cardAPI.updateCard(id, cardData);
          // Update successful (no need to check success flag as card API throws errors)
        
        // Log card update activity in Firebase Realtime Database
        await firebaseAnalyticsService.trackCardActivity(id, 'view');
        
        // Update server (for SSR)
        try {
          await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: cardData.slug, data: cardData })
          });
        } catch (err) {
          console.error('Failed to update server cache:', err);
        }      } else {
        // Check if the user has reached their card limit
        if (!user) {
          throw new Error('You must be logged in to create a card');
        }        
        logDebugInfo('User before profile check', user);
        try {
          // Force create/update user profile before proceeding
          const profile = await ensureUserProfile(user);
          console.log('User profile verified or created:', profile);
          
          // Wait a moment to ensure Firebase security rules are updated with the new profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Double check if user can create a card
          const canCreate = await userService.canCreateCard(user.uid);
          if (!canCreate) {
            alert(t('errors.cardLimitReached'));
            navigate('/dashboard');
            return;
          }
        } catch (error) {
          console.error('Error ensuring user profile exists:', error);
          throw new Error('Failed to verify user profile. Please try logging out and back in.');
        }        logDebugInfo('User after profile check', user);        // Use the Card API which abstracts away implementation details
        let card;        try {
          // Import the card API service
          const { default: cardAPI } = await import('../services/cardAPI');
          
          // Use the card API to create card
          console.log('Using Card API to create card');
          const result = await cardAPI.createCard(cardData);
          card = { ...cardData, id: result.cardId, slug: result.slug };
          
          if (!card) {
            throw new Error('Failed to create card - no card data returned');
          }
          console.log('Card created successfully via API:', card.id);
        } catch (cardError: any) {
          console.error('Detailed card creation error:', cardError);
          // Enhanced error message with Firebase error code if available
          const errorCode = cardError?.code ? ` (${cardError.code})` : '';
          throw new Error(`Failed to create card${errorCode}: ${cardError.message}`);
        }
        
        // Log card creation activity in Firebase Realtime Database
        if (card.id) {
          await firebaseAnalyticsService.trackCardActivity(card.id, 'view');
        }
        
        // Update server (for SSR)
        try {
          await fetch('/api/cards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: cardData.slug, data: cardData })
          });
        } catch (err) {
          console.error('Failed to update server cache:', err);
        }
      }        navigate('/dashboard');    } catch (error: any) {      console.error('Error saving card:', error);
      setIsSubmitting(false);
        // Check for specific Firebase permission errors
      if (error?.code === 'permission-denied') {
        console.error('Firebase permission denied error:', error);
        
        // Try to automatically fix permission issues
        try {
          const { default: authHelper } = await import('../utils/authHelper');
          
          // Fix the profile and refresh token
          await authHelper.fixUserProfile();
          await authHelper.forceTokenRefresh();
          
          alert(`${t('errors.saveCardFailed')}: Missing or insufficient permissions. We've attempted to fix the issue. Please try again or try logging out and back in.`);
        } catch (fixError) {
          console.error('Failed to auto-fix permission issue:', fixError);
          alert(`${t('errors.saveCardFailed')}: Missing or insufficient permissions. Please try logging out and back in.`);
        }
      } 
      // Check for invalid document reference errors
      else if (error?.message?.includes('invalid document reference') || error?.message?.includes('Invalid document reference')) {
        console.error('Invalid document reference error:', error);
        
        // Try to create/update the user profile and retry
        try {
          const { default: authHelper } = await import('../utils/authHelper');
          await authHelper.fixUserProfile();
          await authHelper.forceTokenRefresh();
          
          console.log('User profile fixed after error');
          alert(`${t('errors.saveCardFailed')}: We've updated your user profile. Please try saving the card again.`);
        } catch (profileError) {
          console.error('Failed to create user profile after invalid document error:', profileError);
          alert(`${t('errors.saveCardFailed')}: Unable to create your user profile. Please try logging out and back in.`);
        }
      }
      // Check for profile-related errors
      else if (error?.message?.includes('profile')) {
        console.error('User profile error:', error);
        alert(`${t('errors.saveCardFailed')}: Unable to verify your user profile. Please try logging out and back in.`);
      }
      // Handle transaction errors (often related to card limit checks)
      else if (error?.message?.includes('transaction')) {
        console.error('Transaction error:', error);
        alert(`${t('errors.saveCardFailed')}: There was a problem with the database transaction. Please try again in a few moments.`);
      }
      // Handle card limit errors
      else if (error?.message?.includes('limit') || error?.message?.includes('maximum')) {
        console.error('Card limit error:', error);
        alert(t('errors.cardLimitReached'));
        navigate('/dashboard');
        return;
      }
      // Generic error with message
      else {
        // Show more detailed error message if available
        const errorMessage = error?.message 
          ? `${t('errors.saveCardFailed')}: ${error.message}`
          : t('errors.saveCardFailed');
        alert(errorMessage);
      }
    }
  };
  // Add a debug function to test API-based access
  const testFirestoreAccess = async () => {
    try {
      setDebugInfo('Testing API-based access...');
      const { auth } = await import('../config/firebase');

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
    }
  };

  if (loading) {
    return (
      <div className="container-card py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-36 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }  // Mobile step indicator component
  const StepIndicator = () => {
    const steps: EditorStep[] = ['appearance', 'personal', 'contact', 'address', 'additional'];
    
    return (
      <div className="flex justify-center items-center space-x-2 my-6">
        {steps.map((step, index) => (
          <div 
            key={step} 
            className={`flex flex-col items-center ${index > 0 ? 'ml-1' : ''}`}
            onClick={() => setCurrentStep(step)}
          >
            <div className={`
              h-3 w-3 rounded-full transition-all duration-300
              ${currentStep === step 
                ? 'bg-primary-600 scale-125' 
                : steps.indexOf(currentStep) > index 
                  ? 'bg-primary-400'
                  : 'bg-gray-300'
              }
            `}></div>
          </div>
        ))}
      </div>
    );
  };
  
  // Step content with animation
  const StepContent = ({ step, isActive }: { step: EditorStep, isActive: boolean }) => {
    const content = {
      appearance: (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('cardEditor.appearance')}</h2>
          <ImageUploader
            initialImage={photoData}
            onImageUpload={(dataUrl) => setPhotoData(dataUrl)}
          />
        </div>
      ),
      personal: (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('cardEditor.personalInfo')}</h2>
          
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.firstName')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('firstName')}
                  className={`w-full border ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition`}
                  placeholder={t('form.firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t(errors.firstName.message as string)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.lastName')} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('lastName')}
                  className={`w-full border ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition`}
                  placeholder={t('form.lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t(errors.lastName.message as string)}
                  </p>
                )}
              </div>
            </div>
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.organization')}
              </label>
              <input
                {...register('organization')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.organization')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cardEditor.optionalField')}
              </p>
              {errors.organization && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.organization.message as string)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.title')}
              </label>
              <input
                {...register('title')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.title')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cardEditor.optionalField')}
              </p>
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.title.message as string)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('cardEditor.slugLabel')}
              </label>
              <input
                {...register('slug')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="john-doe"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cardEditor.slugHelper')}
              </p>
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.slug.message as string)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Contact information */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">{t('cardEditor.contactInfo')}</h2>
          
          <div className="space-y-4">            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.email')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cardEditor.optionalField')}
              </p>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.email.message as string)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.phone')}
              </label>
              <input
                {...register('phone')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.phone')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('cardEditor.optionalField')}
              </p>
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.phone.message as string)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.website')}
              </label>
              <input
                {...register('website')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="text-red-500 text-xs mt-1">
                  {t(errors.website.message as string)}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Address */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">{t('cardEditor.address')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.street')}
              </label>
              <input
                {...register('address.street')}
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.street')}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.city')}
                </label>
                <input
                  {...register('address.city')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.city')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.state')}
                </label>
                <input
                  {...register('address.state')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.state')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.postalCode')}
                </label>
                <input
                  {...register('address.postalCode')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.postalCode')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.country')}
                </label>
                <input
                  {...register('address.country')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.country')}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">{t('cardEditor.additional')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.notes')}
            </label>
            <textarea
              {...register('notes')}
              className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
              placeholder={t('form.notes')}
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-md transition"
          >
            {t('cardEditor.cancelBtn')}
          </button>
          <button
            type="submit"
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md transition"
          >
            {t('cardEditor.saveBtn')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardEditor;
