import React, { forwardRef, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../Spinner/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
  secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
  outline: 'bg-transparent border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
  link: 'bg-transparent text-primary-500 hover:text-primary-600 focus:ring-primary-500 p-0',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm py-1 px-3',
  md: 'text-base py-2 px-4',
  lg: 'text-lg py-2.5 px-5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth,
      isLoading,
      leftIcon,
      rightIcon,
      as = 'button',
      to = '',
      external = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${variant !== 'link' ? 'shadow-sm' : ''} ${className}`;

    const content = (
      <>
        {isLoading && (
          <Spinner
            size="xs"
            color={variant === 'outline' || variant === 'link' ? 'primary' : 'white'}
            className="mr-2"
          />
        )}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    if (as === 'link') {
      if (external) {
        return (
          <a
            href={to}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles}
          >
            {content}
          </a>
        );
      }
      return (
        <Link to={to} className={buttonStyles}>
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={buttonStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
