import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { ContainerWidthKey, containerWidths } from '../../foundations/spacing';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: ContainerWidthKey;
  centered?: boolean;
  fluid?: boolean;
  py?: number;
  px?: number;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(({
  children,
  size = 'lg',
  centered = true,
  fluid = false,
  py = 0,
  px = 4,
  className = '',
  ...props
}, ref) => {
  // Base classes
  const baseClasses = fluid ? 'w-full' : `max-w-${size}`;
  const centerClasses = centered ? 'mx-auto' : '';
  const paddingClasses = `py-${py} px-${px}`;
  
  // Combine all classes
  const allClasses = `${baseClasses} ${centerClasses} ${paddingClasses} ${className}`;
  
  // Set max-width directly from the spacing configuration
  const style = !fluid ? { maxWidth: containerWidths[size] } : undefined;
  
  return (
    <div 
      ref={ref}
      className={allClasses}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
});

Container.displayName = 'Container';

export default Container;
