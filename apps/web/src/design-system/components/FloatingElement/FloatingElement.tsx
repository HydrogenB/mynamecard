import React from 'react';
import { motion, useAnimation, MotionValue, useMotionValue } from 'framer-motion';

export interface FloatingElementProps {
  children: React.ReactNode;
  maxRotate?: number;
  maxTranslate?: number;
  perspective?: number;
  reset?: boolean;
  smooth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FloatingElement: React.FC<FloatingElementProps> = ({
  children,
  maxRotate = 10,
  maxTranslate = 5,
  perspective = 1000,
  reset = true,
  smooth = true,
  disabled = false,
  className = '',
}) => {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const translateX = useMotionValue(0);
  const translateY = useMotionValue(0);
  const controls = useAnimation();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    
    const element = e.currentTarget;
    const elementRect = element.getBoundingClientRect();
    
    const elementWidth = elementRect.width;
    const elementHeight = elementRect.height;
    
    const mouseX = e.clientX - elementRect.left;
    const mouseY = e.clientY - elementRect.top;
    
    const percentX = mouseX / elementWidth;
    const percentY = mouseY / elementHeight;
    
    const offsetX = (percentX - 0.5) * 2; // -1 to 1
    const offsetY = (percentY - 0.5) * 2; // -1 to 1
    
    const rotateXValue = -offsetY * maxRotate; // Inverted for natural feeling
    const rotateYValue = offsetX * maxRotate;
    const translateXValue = offsetX * maxTranslate;
    const translateYValue = offsetY * maxTranslate;

    if (smooth) {
      // Animate for smooth movement
      controls.start({
        rotateX: rotateXValue,
        rotateY: rotateYValue,
        translateX: translateXValue,
        translateY: translateYValue,
        transition: { type: 'spring', stiffness: 200, damping: 15 },
      });
    } else {
      // Instant update for precise control
      rotateX.set(rotateXValue);
      rotateY.set(rotateYValue);
      translateX.set(translateXValue);
      translateY.set(translateYValue);
    }
  };

  const handleMouseLeave = () => {
    if (!reset || disabled) return;
    
    if (smooth) {
      controls.start({
        rotateX: 0,
        rotateY: 0,
        translateX: 0,
        translateY: 0,
        transition: { type: 'spring', stiffness: 200, damping: 15 },
      });
    } else {
      rotateX.set(0);
      rotateY.set(0);
      translateX.set(0);
      translateY.set(0);
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={controls}
      style={{
        rotateX: !smooth ? rotateX : undefined,
        rotateY: !smooth ? rotateY : undefined,
        translateX: !smooth ? translateX : undefined,
        translateY: !smooth ? translateY : undefined,
        transformPerspective: perspective,
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </motion.div>
  );
};
