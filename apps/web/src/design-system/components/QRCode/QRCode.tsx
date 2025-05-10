import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../Button';
import { Card } from '../Card';
import { useI18n } from '../../../hooks/useI18n';

export interface QRCodeProps {
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
  className?: string;
  cardPadding?: 'none' | 'sm' | 'md' | 'lg';
}

const QRCode = ({
  value,
  size = 200,
  includeMargin = true,
  imageSettings,
  downloadable = false,
  fileName = 'qrcode',
  className = '',
  cardPadding = 'md',
}: QRCodeProps) => {
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
    <div className={`flex flex-col items-center ${className}`}>
      <Card 
        ref={qrRef}
        variant="elevated"
        padding={cardPadding}
        className="bg-white"
      >
        <QRCodeCanvas
          value={value}
          size={size}
          level="H"
          includeMargin={includeMargin}
          imageSettings={imageSettings}
        />
      </Card>
      
      {downloadable && (
        <Button 
          onClick={handleDownload}
          variant="primary"
          className="mt-4"
        >
          {t('card.qr')}
        </Button>
      )}
    </div>
  );
};

export default QRCode;
