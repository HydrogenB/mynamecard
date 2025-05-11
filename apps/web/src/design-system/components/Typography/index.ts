import React from 'react';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'body' | 'body-sm' | 'body-xs' | 'heading-1' | 'heading-2' | 'heading-3' | 'heading-4' | 'caption';
  color?: string;
  as?: keyof JSX.IntrinsicElements;
}

const variantClasses = {
  'heading-1': 'text-4xl font-bold',
  'heading-2': 'text-3xl font-bold',
  'heading-3': 'text-2xl font-bold',
  'heading-4': 'text-xl font-semibold',
  'body': 'text-base',
  'body-sm': 'text-sm',
  'body-xs': 'text-xs',
  'caption': 'text-xs text-gray-500',
};

export const Text: React.FC<TextProps> = ({
  children,
  className = '',
  variant = 'body',
  color = '',
  as: Component = 'p',
}) => {
  return (
    <Component className={`${variantClasses[variant]} ${color} ${className}`}>
      {children}
    </Component>
  );
};

export const Heading1 = (props: Omit<TextProps, 'variant' | 'as'>) => 
  <Text variant="heading-1" as="h1" {...props} />;

export const Heading2 = (props: Omit<TextProps, 'variant' | 'as'>) => 
  <Text variant="heading-2" as="h2" {...props} />;

export const Heading3 = (props: Omit<TextProps, 'variant' | 'as'>) => 
  <Text variant="heading-3" as="h3" {...props} />;

export const Heading4 = (props: Omit<TextProps, 'variant' | 'as'>) => 
  <Text variant="heading-4" as="h4" {...props} />;

export const BodyText = (props: Omit<TextProps, 'variant'>) => 
  <Text variant="body" {...props} />;

export const SmallText = (props: Omit<TextProps, 'variant'>) => 
  <Text variant="body-sm" {...props} />;

export const Caption = (props: Omit<TextProps, 'variant'>) => 
  <Text variant="caption" {...props} />;
