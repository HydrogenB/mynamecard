import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  borderLeft?: boolean;
  borderLeftColor?: string;
  animate?: boolean;
  animationVariant?: 'fade' | 'slide' | 'scale' | 'rotate' | 'flip';
  duration?: number;
  delay?: number;
  whileHover?: 'scale' | 'glow' | 'lift' | 'highlight' | 'none';
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const shadowMap = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
};

const getAnimationVariant = (variant: string, duration: number) => {
  const baseTransition = { duration: duration / 1000, ease: 'easeOut' };
  
  switch (variant) {
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };
    case 'slide':
      return {
        initial: { x: -20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 20, opacity: 0 },
        transition: baseTransition,
      };
    case 'scale':
      return {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.8, opacity: 0 },
        transition: baseTransition,
      };
    case 'rotate':
      return {
        initial: { rotate: -5, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: 5, opacity: 0 },
        transition: baseTransition,
      };
    case 'flip':
      return {
        initial: { rotateY: 90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0 },
        transition: { ...baseTransition, duration: (duration / 1000) * 1.5 },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: baseTransition,
      };
  }
};

const getHoverEffect = (effect: string) => {
  switch (effect) {
    case 'scale':
      return {
        whileHover: { scale: 1.02 },
        transition: { type: 'spring', stiffness: 300 },
      };
    case 'glow':
      return {
        whileHover: { boxShadow: '0 0 15px rgba(14, 165, 233, 0.5)' },
      };
    case 'lift':
      return {
        whileHover: { y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
      };
    case 'highlight':
      return {
        whileHover: { backgroundColor: '#f0f9ff', borderColor: '#38bdf8' },
      };
    default:
      return {};
  }
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  padding = 'md',
  border = false,
  shadow = 'md',
  borderLeft = false,
  borderLeftColor = 'border-gray-300',
  animate = true,
  animationVariant = 'fade',
  duration = 500,
  delay = 0,
  whileHover = 'none',
}) => {
  const borderClasses = border ? 'border border-gray-200' : '';
  const borderLeftClasses = borderLeft ? `border-l-4 ${borderLeftColor}` : '';
  
  const animationProps = animate ? getAnimationVariant(animationVariant, duration) : {};
  const hoverEffects = whileHover !== 'none' ? getHoverEffect(whileHover) : {};
  
  return (
    <AnimatePresence>
      <motion.div
        className={`
          bg-white rounded-lg 
          ${paddingMap[padding]} 
          ${shadowMap[shadow]}
          ${borderClasses}
          ${borderLeftClasses}
          ${className}
        `}
        {...animationProps}
        {...hoverEffects}
        initial={animate ? animationProps.initial : undefined}
        animate={animate ? animationProps.animate : undefined}
        exit={animate ? animationProps.exit : undefined}
        transition={animate ? { ...animationProps.transition, delay: delay / 1000 } : undefined}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
