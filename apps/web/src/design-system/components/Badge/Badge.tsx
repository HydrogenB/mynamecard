import { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) => {
  // Variant specific classes
  const variantClasses = {
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-200 text-secondary-800',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };
  
  // Size specific classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3 py-1',
  };
  
  // Base classes
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  // Combine all classes
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={allClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
