import { HTMLAttributes, ReactNode, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  isHighlighted?: boolean;
  maxWidth?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  padding = 'md',
  isHighlighted = false,
  maxWidth,
  className = '',
  ...props
}, ref) => {
  // Base classes
  const baseClasses = 'rounded-lg';
  
  // Variant specific classes
  const variantClasses = {
    default: 'bg-white',
    outline: 'bg-white border border-secondary-200',
    elevated: 'bg-white shadow-md',
  };
  
  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };
  
  // Highlighted class
  const highlightedClass = isHighlighted ? 'border-2 border-primary-500' : '';
  
  // Max width style
  const maxWidthStyle = maxWidth ? { maxWidth } : {};
  
  // Combine all classes
  const allClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${highlightedClass} ${className}`;
  
  return (
    <div 
      ref={ref}
      className={allClasses}
      style={maxWidthStyle}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;
