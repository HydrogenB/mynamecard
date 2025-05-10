import { HTMLAttributes } from 'react';

export interface DividerProps extends HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  spacing?: number;
}

const Divider = ({
  orientation = 'horizontal',
  variant = 'solid',
  color = 'secondary-200',
  spacing = 4,
  className = '',
  ...props
}: DividerProps) => {
  // Base classes based on orientation
  const orientationClasses = orientation === 'horizontal' 
    ? `w-full my-${spacing}` 
    : `h-full mx-${spacing}`;
  
  // Variant classes
  const variantClasses = `border-${variant}`;
  
  // Color classes
  const colorClasses = `border-${color}`;
  
  // Border width based on orientation
  const borderClasses = orientation === 'horizontal' ? 'border-t' : 'border-l';
  
  // Combine all classes
  const allClasses = `${orientationClasses} ${borderClasses} ${variantClasses} ${colorClasses} ${className}`;
  
  return <hr className={allClasses} {...props} />;
};

export default Divider;
