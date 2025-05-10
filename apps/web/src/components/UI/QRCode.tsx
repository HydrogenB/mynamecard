import { useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import logo from '../../assets/icon.svg';
import { useI18n } from '../../hooks/useI18n';

interface QRCodeProps {
  value: string;
  size?: number;
  includeMargin?: boolean;
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate: boolean;
  };
  downloadable?: boolean;
  fileName?: string;
}

export default function QRCode({
  value,
  size = 200,
  includeMargin = true,
  imageSettings = {
    src: logo,
    height: 24,
    width: 24,
    excavate: true,
  },
  downloadable = false,
  fileName = 'qrcode',
}: QRCodeProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const { t } = useI18n();
  
  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        ref={qrRef}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <QRCodeCanvas
          value={value}
          size={size}
          level="H"
          includeMargin={includeMargin}
          imageSettings={imageSettings}
        />
      </div>
      
      {downloadable && (
        <button 
          onClick={handleDownload}
          className="btn-primary mt-4"
        >
          {t('card.qr')}
        </button>
      )}
    </div>
  );
}
