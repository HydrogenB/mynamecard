import { forwardRef, HTMLAttributes, ReactNode, ElementType } from 'react';
import { TextStyleKey, textStyles } from '../../foundations/typography';

export interface TextProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: TextStyleKey;
  as?: ElementType;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  truncate?: boolean;
}

export const Text = forwardRef<HTMLElement, TextProps>(({
  children,
  variant = 'body1',
  as: Component = 'p',
  color,
  align,
  truncate = false,
  className = '',
  ...props
}, ref) => {
  // Get style based on variant
  const styleForVariant = textStyles[variant];
  
  // Generate inline styles from the style object
  const variantStyle = {
    fontSize: styleForVariant.fontSize,
    fontWeight: styleForVariant.fontWeight,
    lineHeight: styleForVariant.lineHeight,
    ...(color && { color }),
  };
  
  // Text alignment class
  const alignClass = align ? `text-${align}` : '';
  
  // Truncate class
  const truncateClass = truncate ? 'truncate' : '';
  
  // Combine all classes
  const allClasses = `${alignClass} ${truncateClass} ${className}`;
  
  return (
    <Component
      ref={ref}
      className={allClasses}
      style={variantStyle}
      {...props}
    >
      {children}
    </Component>
  );
});

Text.displayName = 'Text';

export default Text;
