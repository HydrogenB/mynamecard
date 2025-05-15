import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import { Card } from '../db/db';

interface QRModalProps {
  isOpen?: boolean;
  onClose: () => void;
  cardUrl?: string;
  card?: Card;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen = true, onClose, cardUrl, card }) => {
  const { t } = useTranslation();
  
  // If a Card object is provided, generate the URL
  const qrUrl = cardUrl || (card ? `${window.location.origin}/card/${card.slug}` : '');
  
  if (!isOpen || (!qrUrl && !card)) return null;
  
  const handleDownload = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'namecard-qrcode.png';
    link.href = url;
    link.click();
  };
    return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('qrModal.title')}</h2>
            {card && (
              <p className="text-sm text-gray-500 mt-1">{card.firstName} {card.lastName}</p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 flex flex-col items-center">
          {/* Card Preview */}
          {card && (
            <div className="mb-6 flex items-center">
              {card.photo && (
                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 border border-gray-200">
                  <img src={card.photo} alt={`${card.firstName} ${card.lastName}`} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{card.firstName} {card.lastName}</h3>
                <p className="text-sm text-gray-600">{card.title} {card.organization ? `@ ${card.organization}` : ''}</p>
              </div>
            </div>
          )}

          {/* QR Code */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-100 shadow-inner mb-6 transform hover:scale-105 transition-transform duration-300">
            <QRCode 
              id="qr-code-canvas"
              value={qrUrl || ''} 
              size={220}
              bgColor={"#ffffff"}
              fgColor={"#0284c7"} // primary-600
              level={"H"}
              includeMargin={true}
              className="rounded-md"
            />
          </div>
          
          <div className="w-full space-y-4">
            <div>
              <p className="text-center text-sm text-gray-700 font-medium mb-2">
                {t('qrModal.scanInstructions')}
              </p>
            </div>
            
            <div className="w-full">
              <p className="text-sm font-medium mb-2 text-gray-700">{t('qrModal.cardLink')}</p>
              <div className="flex items-stretch w-full">
                <input 
                  type="text" 
                  readOnly 
                  value={qrUrl}
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-3 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={() => qrUrl && navigator.clipboard.writeText(qrUrl)}
                  className="bg-primary-100 hover:bg-primary-200 px-4 py-3 rounded-r-lg border-y border-r border-primary-200 text-primary-700 transition-colors"
                  title={t('qrModal.copyToClipboard')}
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Copy</span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Share to social media */}
            <div className="pt-2">
              <p className="text-sm font-medium mb-3 text-gray-700">{t('qrModal.shareOn', 'Share on:')}</p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(qrUrl)}`, '_blank')}
                  className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my digital business card: ${qrUrl}`)}`, '_blank')}
                  className="bg-sky-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(qrUrl)}`, '_blank')}
                  className="bg-blue-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button 
                  onClick={() => window.open(`mailto:?subject=My Digital Business Card&body=Check out my digital business card: ${qrUrl}`, '_blank')}
                  className="bg-gray-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Share via Email"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {t('qrModal.close', 'Close')}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('qrModal.download')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
