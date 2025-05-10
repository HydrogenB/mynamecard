import React from 'react';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardUrl: string;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, cardUrl }) => {
  const { t } = useTranslation();
  
  if (!isOpen) return null;
  
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{t('qrModal.title')}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg border mb-4">
            <QRCode 
              id="qr-code-canvas"
              value={cardUrl} 
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={true}
            />
          </div>
          
          <p className="text-center text-sm text-gray-600 mb-4">
            {t('qrModal.scanInstructions')}
          </p>
          
          <div className="text-center">
            <p className="text-sm font-medium mb-2">{t('qrModal.cardLink')}</p>
            <div className="flex items-center">
              <input 
                type="text" 
                readOnly 
                value={cardUrl}
                className="border rounded-l px-3 py-2 w-full text-sm bg-gray-50"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={() => navigator.clipboard.writeText(cardUrl)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r border-y border-r"
                title={t('qrModal.copyToClipboard')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
