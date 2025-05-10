import { HTMLAttributes } from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  color?: string;
}

const Spinner = ({ 
  size = 'md', 
  color = 'primary',
  className = '',
  ...props 
}: SpinnerProps) => {
  // Size specific classes
  const sizeClasses = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };
  
  // Color specific classes
  const colorClasses = {
    primary: 'border-t-primary-500 border-r-primary-500 border-b-primary-200 border-l-primary-200',
    white: 'border-t-white border-r-white border-b-white/30 border-l-white/30',
    secondary: 'border-t-secondary-600 border-r-secondary-600 border-b-secondary-300 border-l-secondary-300',
  };
  
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;
  
  return (
    <div 
      className={`inline-block ${sizeClasses[size]} rounded-full ${colorClass} animate-spin ${className}`}
      role="status"
      aria-label="loading"
      {...props}
    />
  );
};

export default Spinner;
