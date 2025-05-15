import React from 'react';
import { motion } from 'framer-motion';

export interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  once?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up',
  distance = 20,
  once = true,
}) => {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      case 'none': return {};
      default: return { y: distance };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...getDirectionOffset() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  initialScale?: number;
  once?: boolean;
}

export const ScaleIn: React.FC<ScaleInProps> = ({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  initialScale = 0.9,
  once = true,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className = '',
  delayChildren = 0.1,
  staggerChildren = 0.07,
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren,
            staggerChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  direction = 'up',
  distance = 20,
}) => {
  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: distance };
      case 'down': return { y: -distance };
      case 'left': return { x: distance };
      case 'right': return { x: -distance };
      case 'none': return {};
      default: return { y: distance };
    }
  };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, ...getDirectionOffset() },
        visible: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: {
            type: 'spring',
            damping: 15,
            stiffness: 100
          }
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
  animate?: boolean;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  from = 'from-primary-500',
  to = 'to-blue-600',
  animate = false,
}) => {
  return (
    <span
      className={`bg-clip-text text-transparent bg-gradient-to-r ${from} ${to} ${
        animate ? 'animate-gradient-x' : ''
      } ${className}`}
    >
      {children}
    </span>
  );
};

export const GlowEffect: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`absolute blur-3xl opacity-20 bg-gradient-to-r from-primary-300 to-blue-400 -z-10 rounded-full ${className}`}
      aria-hidden="true"
    />
  );
};

export interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  className = '',
  amplitude = 5,
  duration = 3,
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0, amplitude, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
      }}
    >
      {children}
    </motion.div>
  );
};
