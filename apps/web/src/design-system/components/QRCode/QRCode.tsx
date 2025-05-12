import React from 'react';
import QRCodeReact from 'qrcode.react';

export interface QRCodeProps {
  value: string;
  url?: string; // For backward compatibility
  size?: number;
  className?: string;
  bgColor?: string;
  fgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  includeMargin?: boolean;
  renderAs?: 'canvas' | 'svg';
  title?: string;
  containerClassName?: string;
}

export const QRCode: React.FC<QRCodeProps> = ({
  value,
  url,
  size = 200,
  className = '',
  bgColor = '#FFFFFF',
  fgColor = '#000000',
  level = 'L',
  includeMargin = false,
  renderAs = 'canvas',
  title,
  containerClassName = '',
}) => {
  // Support both value and url props (url for backwards compatibility)
  const qrValue = value || url || '';
  
  return (
    <div className={`flex items-center justify-center ${containerClassName}`}>
      <QRCodeReact
        value={qrValue}
        size={size}
        bgColor={bgColor}
        fgColor={fgColor}
        level={level}
        includeMargin={includeMargin}
        renderAs={renderAs}
        className={className}
      />
      {title && (
        <div className="mt-2 text-center text-sm text-gray-600">{title}</div>
      )}
    </div>
  );
};
