import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { cardSchema, CardFormData, generateSlug } from '../schemas/cardSchema';
import ImageUploader from '../components/ImageUploader';
import { databaseService } from '../services/databaseService';
import realtimeDbService from '../services/realtimeDbService';
import { Card } from '../db/db';

const CardEditor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [photoData, setPhotoData] = useState<string | undefined>(undefined);

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
      
      try {
        // Use database service to get card data (will try Firestore first, then IndexedDB)
        const card = await databaseService.getCard(Number(id));
        
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
  }, [firstName, lastName, setValue, isEditMode]);  const onSubmit = async (data: CardFormData) => {
    try {
      // Include photo in the data if it exists and ensure address fields are valid
      const cardData = {
        ...data,
        photo: photoData,
        // Ensure address fields are properly defined for database service
        address: data.address ? {
          street: data.address.street || '',
          city: data.address.city || '',
          state: data.address.state || '',
          postalCode: data.address.postalCode || '',
          country: data.address.country || '',
        } : undefined
      };
      
      if (isEditMode && id) {
        // Use database service to update the card in Firestore
        const success = await databaseService.updateCard(id, cardData);
        
        if (!success) {
          throw new Error('Failed to update card');
        }
        
        // Log card update activity in Firebase Realtime Database
        await realtimeDbService.trackCardActivity(id, 'view');
        
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
      } else {
        // Use database service to create the card in Firestore
        const card = await databaseService.createCard(cardData);
        
        if (!card) {
          throw new Error('Failed to create card');
        }
        
        // Log card creation activity in Firebase Realtime Database
        if (card.id) {
          await realtimeDbService.trackCardActivity(card.id, 'view');
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
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving card:', error);
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
  }

  return (
    <div className="container-card py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? t('cardEditor.editTitle') : t('cardEditor.createTitle')}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Photo upload section */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">{t('cardEditor.appearance')}</h2>          <ImageUploader
            initialImage={photoData}
            onImageUpload={(dataUrl) => setPhotoData(dataUrl)}
          />
        </div>
        
        {/* Personal information */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-3">{t('cardEditor.personalInfo')}</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.firstName')}
                </label>
                <input
                  {...register('firstName')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.firstName')}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {t(errors.firstName.message as string)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.lastName')}
                </label>
                <input
                  {...register('lastName')}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder={t('form.lastName')}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
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
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.email')}
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder={t('form.email')}
              />
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
