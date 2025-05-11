import React from 'react';

export interface QRCodeProps {
  url: string;
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  url,
  size = 200,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
}) => {
  // In a real implementation, you would use a QR code generation library
  // like qrcode.react or another solution.
  // For now, we'll create a placeholder component that can be replaced.
  
  return (
    <div 
      className={`qr-code-container flex items-center justify-center border rounded ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="text-center p-4">
        <div className="mb-2">[QR Code for URL]</div>
        <div className="text-xs text-gray-500 truncate max-w-full">{url}</div>
      </div>
    </div>
  );
};
