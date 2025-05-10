import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useI18n } from '../../hooks/useI18n';
import LoadingSpinner from '../UI/LoadingSpinner';

// Define the schema for card validation
const cardSchema = z.object({
  fullName: z.string().min(1, { message: 'card.errors.required' }),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: 'card.errors.email' }).optional().or(z.literal('')),
  website: z.string().url({ message: 'card.errors.url' }).optional().or(z.literal('')),
  address: z.string().optional(),
  bio: z.string().max(500).optional(),
  social: z.object({
    linkedin: z.string().url({ message: 'card.errors.url' }).optional().or(z.literal('')),
    twitter: z.string().url({ message: 'card.errors.url' }).optional().or(z.literal('')),
    facebook: z.string().url({ message: 'card.errors.url' }).optional().or(z.literal('')),
    instagram: z.string().url({ message: 'card.errors.url' }).optional().or(z.literal(''))
  })
});

export type CardFormData = z.infer<typeof cardSchema>;

interface CardFormProps {
  initialData?: Partial<CardFormData>;
  onSubmit: (data: CardFormData) => Promise<void>;
  isLoading?: boolean;
}

export default function CardForm({ initialData, onSubmit, isLoading = false }: CardFormProps) {
  const { t } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  
  const defaultValues: Partial<CardFormData> = {
    fullName: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    bio: '',
    social: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
    },
    ...initialData
  };
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues
  });
  
  const handleFormSubmit = async (data: CardFormData) => {
    try {
      setSubmitting(true);
      await onSubmit(data);
      // Don't reset form here as the parent component should handle navigation
    } catch (error) {
      console.error('Error submitting card:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Full Name */}
      <div>
        <label htmlFor="fullName" className="form-label">
          {t('card.fields.fullName')} *
        </label>
        <input
          id="fullName"
          type="text"
          className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
          {...register('fullName')}
          disabled={isLoading || submitting}
        />
        {errors.fullName && (
          <p className="form-error">{t(errors.fullName.message || 'card.errors.required')}</p>
        )}
      </div>
      
      {/* Job Title */}
      <div>
        <label htmlFor="title" className="form-label">
          {t('card.fields.title')}
        </label>
        <input
          id="title"
          type="text"
          className="form-input"
          {...register('title')}
          disabled={isLoading || submitting}
        />
      </div>
      
      {/* Company */}
      <div>
        <label htmlFor="company" className="form-label">
          {t('card.fields.company')}
        </label>
        <input
          id="company"
          type="text"
          className="form-input"
          {...register('company')}
          disabled={isLoading || submitting}
        />
      </div>
      
      {/* Phone */}
      <div>
        <label htmlFor="phone" className="form-label">
          {t('card.fields.phone')}
        </label>
        <input
          id="phone"
          type="tel"
          className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
          {...register('phone')}
          disabled={isLoading || submitting}
        />
        {errors.phone && (
          <p className="form-error">{t(errors.phone.message || '')}</p>
        )}
      </div>
      
      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">
          {t('card.fields.email')}
        </label>
        <input
          id="email"
          type="email"
          className={`form-input ${errors.email ? 'border-red-500' : ''}`}
          {...register('email')}
          disabled={isLoading || submitting}
        />
        {errors.email && (
          <p className="form-error">{t(errors.email.message || '')}</p>
        )}
      </div>
      
      {/* Website */}
      <div>
        <label htmlFor="website" className="form-label">
          {t('card.fields.website')}
        </label>
        <input
          id="website"
          type="url"
          className={`form-input ${errors.website ? 'border-red-500' : ''}`}
          {...register('website')}
          disabled={isLoading || submitting}
        />
        {errors.website && (
          <p className="form-error">{t(errors.website.message || '')}</p>
        )}
      </div>
      
      {/* Address */}
      <div>
        <label htmlFor="address" className="form-label">
          {t('card.fields.address')}
        </label>
        <textarea
          id="address"
          rows={2}
          className="form-input"
          {...register('address')}
          disabled={isLoading || submitting}
        />
      </div>
      
      {/* Bio */}
      <div>
        <label htmlFor="bio" className="form-label">
          {t('card.fields.bio')}
        </label>
        <textarea
          id="bio"
          rows={3}
          className="form-input"
          {...register('bio')}
          disabled={isLoading || submitting}
        />
      </div>
      
      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">{t('card.fields.social')}</h3>
        
        {/* LinkedIn */}
        <div>
          <label htmlFor="linkedin" className="form-label">LinkedIn</label>
          <input
            id="linkedin"
            type="url"
            className={`form-input ${errors.social?.linkedin ? 'border-red-500' : ''}`}
            {...register('social.linkedin')}
            disabled={isLoading || submitting}
          />
          {errors.social?.linkedin && (
            <p className="form-error">{t(errors.social.linkedin.message || '')}</p>
          )}
        </div>
        
        {/* Twitter */}
        <div>
          <label htmlFor="twitter" className="form-label">Twitter</label>
          <input
            id="twitter"
            type="url"
            className={`form-input ${errors.social?.twitter ? 'border-red-500' : ''}`}
            {...register('social.twitter')}
            disabled={isLoading || submitting}
          />
          {errors.social?.twitter && (
            <p className="form-error">{t(errors.social.twitter.message || '')}</p>
          )}
        </div>
        
        {/* Facebook */}
        <div>
          <label htmlFor="facebook" className="form-label">Facebook</label>
          <input
            id="facebook"
            type="url"
            className={`form-input ${errors.social?.facebook ? 'border-red-500' : ''}`}
            {...register('social.facebook')}
            disabled={isLoading || submitting}
          />
          {errors.social?.facebook && (
            <p className="form-error">{t(errors.social.facebook.message || '')}</p>
          )}
        </div>
        
        {/* Instagram */}
        <div>
          <label htmlFor="instagram" className="form-label">Instagram</label>
          <input
            id="instagram"
            type="url"
            className={`form-input ${errors.social?.instagram ? 'border-red-500' : ''}`}
            {...register('social.instagram')}
            disabled={isLoading || submitting}
          />
          {errors.social?.instagram && (
            <p className="form-error">{t(errors.social.instagram.message || '')}</p>
          )}
        </div>
      </div>
      
      {/* Submit button */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          className="btn-primary px-6 py-2"
          disabled={isLoading || submitting}
        >
          {submitting ? <LoadingSpinner size="sm" /> : t('card.save')}
        </button>
      </div>
    </form>
  );
}
