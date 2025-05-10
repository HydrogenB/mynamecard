import { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  as?: 'button' | 'link';
  to?: string;
  external?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  as = 'button',
  to = '',
  external = false,
  disabled,
  ...props
}, ref) => {
  // Base classes that apply to all button variants
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  
  // Size specific classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant specific classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
    secondary: 'bg-secondary-200 text-secondary-800 hover:bg-secondary-300 active:bg-secondary-400 disabled:bg-secondary-100 disabled:text-secondary-400',
    outline: 'bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50 active:bg-secondary-100 disabled:bg-white disabled:text-secondary-300',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 hover:underline active:text-primary-800 disabled:text-primary-300 px-0 py-0',
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all classes
  const allClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`;
  
  // If component should render as Link (react-router-dom)
  if (as === 'link' && to) {
    const linkProps = external ? { as: 'a', href: to, target: '_blank', rel: 'noopener noreferrer' } : { to };
    
    return external ? (
      <a 
        href={to} 
        target="_blank"
        rel="noopener noreferrer"
        className={`${allClasses} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </a>
    ) : (
      <Link 
        to={to} 
        className={`${allClasses} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </Link>
    );
  }
  
  // Default button rendering
  return (
    <button 
      ref={ref}
      className={allClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
