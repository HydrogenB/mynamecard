import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface GradientBannerProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  gradientStart?: string;
  gradientEnd?: string;
  height?: string;
  textColor?: string;
  className?: string;
  textPosition?: 'left' | 'center' | 'right';
  animationVariant?: 'fade' | 'slide' | 'wave';
  wave?: boolean;
  animateGradient?: boolean;
  overlayPattern?: boolean;
}

export const GradientBanner: React.FC<GradientBannerProps> = ({
  title,
  subtitle,
  description,
  children,
  gradientStart = '#0284c7',
  gradientEnd = '#075985',
  height = 'h-72',
  textColor = 'text-white',
  className = '',
  textPosition = 'center',
  animationVariant = 'fade',
  wave = true,
  animateGradient = true,
  overlayPattern = true,
})=> {
  const positionClasses = {
    left: 'items-start text-left pl-8',
    center: 'items-center text-center px-4',
    right: 'items-end text-right pr-8',
  };

  const getAnimationVariant = () => {
    switch (animationVariant) {
      case 'slide':
        return {
          hidden: { opacity: 0, y: 50 },
          visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
              delay: i * 0.2,
              duration: 0.5,
            },
          }),
        };
      case 'wave':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            transition: {
              delay: i * 0.15,
              duration: 0.4,
              type: 'spring',
              stiffness: 100,
            },
          }),
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: i * 0.1,
              duration: 0.3,
            },
          }),
        };
    }
  };

  const animations = getAnimationVariant();
    return (
    <div
      className={`relative overflow-hidden w-full ${height} ${className}`}
    >
      {/* Animated Background Gradient */}
      <motion.div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`,
        }}
        animate={animateGradient ? {
          background: [
            `linear-gradient(60deg, ${gradientStart}, ${gradientEnd})`,
            `linear-gradient(120deg, ${gradientStart}, ${gradientEnd})`,
            `linear-gradient(180deg, ${gradientStart}, ${gradientEnd})`,
            `linear-gradient(240deg, ${gradientStart}, ${gradientEnd})`,
            `linear-gradient(300deg, ${gradientStart}, ${gradientEnd})`,
            `linear-gradient(360deg, ${gradientStart}, ${gradientEnd})`,
          ]
        } : undefined}
        transition={animateGradient ? {
          duration: 20,
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear"
        } : undefined}
      />
      {/* Background animated wave effect */}
      <svg
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.1 }}
      >
        <motion.path
          d="M0 80 Q 25 70 50 80 Q 75 90 100 80 L100 100 L0 100 Z"
          fill="currentColor"
          initial={{ y: 20 }}
          animate={{
            y: 0,
            transition: {
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 3,
            },
          }}
        />
        <motion.path
          d="M0 85 Q 25 95 50 85 Q 75 75 100 85 L100 100 L0 100 Z"
          fill="currentColor"
          initial={{ y: -10 }}
          animate={{
            y: 10,
            transition: {
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 3.5,
              delay: 0.2,
            },
          }}
        />
      </svg>

      {/* Content */}      {/* Content */}
      <div className={`flex flex-col justify-center h-full ${positionClasses[textPosition]} ${textColor}`}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={animations}
          className="space-y-4 max-w-4xl"
        >
          {title && (
            <motion.h1 
              className="text-4xl font-extrabold tracking-tight md:text-5xl" 
              custom={0}
              variants={animations}
            >
              {title}
            </motion.h1>
          )}
          {subtitle && (
            <motion.p 
              className="text-lg md:text-xl opacity-90" 
              custom={1}
              variants={animations}
            >
              {subtitle}
            </motion.p>
          )}
          {description && (
            <motion.p 
              className="text-base md:text-lg opacity-80" 
              custom={1.5}
              variants={animations}
            >
              {description}
            </motion.p>
          )}
          {children && (
            <motion.div 
              custom={2}
              variants={animations}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Wave Divider */}
      {wave && (
        <div className="absolute bottom-0 left-0 right-0">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 120" 
            fill="#ffffff"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,96C960,107,1056,117,1152,112C1248,107,1344,85,1392,74.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      )}
    </div>
  );
};
