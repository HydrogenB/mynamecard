import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  borderLeft?: boolean;
  borderLeftColor?: string;
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowMap = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  border = false,
  shadow = 'md',
  borderLeft = false,
  borderLeftColor = 'border-gray-300',
}) => {
  const borderClasses = border ? 'border border-gray-200' : '';
  const borderLeftClasses = borderLeft ? `border-l-4 ${borderLeftColor}` : '';
  
  return (
    <div
      className={`
        bg-white rounded-lg 
        ${paddingMap[padding]} 
        ${shadowMap[shadow]}
        ${borderClasses}
        ${borderLeftClasses}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
