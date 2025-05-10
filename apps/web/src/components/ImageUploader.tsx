import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  initialImage?: string;
  onImageUpload: (dataUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ initialImage, onImageUpload }) => {
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update preview if initialImage changes
  useEffect(() => {
    if (initialImage) {
      setPreviewUrl(initialImage);
    }
  }, [initialImage]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      alert(t('imageUploader.invalidType'));
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('imageUploader.tooLarge'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      onImageUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setPreviewUrl(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUpload('');
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-full 
          flex items-center justify-center cursor-pointer overflow-hidden relative mb-2"
        onClick={triggerFileInput}
      >
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt={t('imageUploader.preview')} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-4">
            <div className="text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-xs mt-1">{t('imageUploader.addPhoto')}</p>
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif" 
        className="hidden"
      />
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={triggerFileInput}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {previewUrl ? t('imageUploader.change') : t('imageUploader.upload')}
        </button>
        
        {previewUrl && (
          <button
            type="button"
            onClick={removeImage}
            className="text-sm text-red-600 hover:text-red-800"
          >
            {t('imageUploader.remove')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
