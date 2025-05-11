import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'lg',
  padding = true,
}) => {
  return (
    <div 
      className={`
        mx-auto
        ${maxWidthClasses[maxWidth]} 
        ${padding ? 'px-4 sm:px-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
