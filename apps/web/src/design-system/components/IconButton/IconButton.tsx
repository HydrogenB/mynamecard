import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ButtonVariant } from '../Button/Button';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel: string;
  isRound?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  isRound = true,
  className = '',
  disabled = false,
  ...props
}, ref) => {
  // Size specific classes
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };
  
  // Shape classes
  const shapeClasses = isRound ? 'rounded-full' : 'rounded-md';
  
  // Variant specific classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
    secondary: 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300 active:bg-secondary-400 disabled:bg-secondary-100 disabled:text-secondary-400',
    outline: 'bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 disabled:bg-white disabled:text-secondary-300',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 active:text-primary-800 disabled:text-primary-300',
  };
  
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  // Combine all classes
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses} ${className}`;
  
  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={allClasses}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
