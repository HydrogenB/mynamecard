import React, { forwardRef } from 'react';

export type CardVariant = 'default' | 'outline' | 'elevated';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  isHighlighted?: boolean;
  maxWidth?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white',
  outline: 'bg-white border border-slate-200',
  elevated: 'bg-white shadow-md',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className = '',
      variant = 'default',
      padding = 'md',
      isHighlighted = false,
      maxWidth,
      children,
      ...props
    },
    ref
  ) => {
    const cardStyles = `
      rounded-lg
      ${variantStyles[variant]}
      ${paddingStyles[padding]}
      ${isHighlighted ? 'ring-2 ring-primary-500' : ''}
      ${maxWidth ? `max-w-${maxWidth}` : ''}
      ${className}
    `;

    return (
      <div ref={ref} className={cardStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
