/**
 * Animation variants for staggered animations
 */
export const staggerContainer = (staggerChildren?: number, delayChildren?: number) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: staggerChildren || 0.1,
      delayChildren: delayChildren || 0,
    },
  },
});

/**
 * Fade in animation variant
 */
export const fadeIn = (direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'none', duration = 0.5, delay = 0) => ({
  hidden: {
    x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
    y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
    opacity: 0,
  },
  show: {
    x: 0,
    y: 0,
    opacity: 1,
    transition: {
      type: 'tween',
      duration,
      delay,
      ease: 'easeOut',
    },
  },
});

/**
 * Scale animation variant
 */
export const scaleIn = (duration = 0.5, delay = 0) => ({
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      duration,
      delay,
      stiffness: 100,
    },
  },
});

/**
 * Slide in animation variant for elements appearing from different directions
 */
export const slideIn = (direction: 'up' | 'down' | 'left' | 'right', duration = 0.5, delay = 0) => {
  const directionMap = {
    up: { y: '100%' },
    down: { y: '-100%' },
    left: { x: '-100%' },
    right: { x: '100%' },
  };

  return {
    hidden: {
      ...directionMap[direction],
      opacity: 0,
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        duration,
        delay,
      },
    },
  };
};

/**
 * Custom animation for card flip effect
 */
export const cardFlip = {
  hidden: {
    rotateY: 90,
    opacity: 0,
    scale: 0.9,
  },
  show: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 60,
      damping: 12,
      duration: 0.8,
    },
  },
};

/**
 * Zoom out animation for elements that appear from the center
 */
export const zoomOut = (duration = 0.5, delay = 0) => ({
  hidden: {
    scale: 1.2,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'easeOut',
      duration,
      delay,
    },
  },
});

/**
 * Staggered text animation for revealing text character by character
 */
export const textReveal = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
      delay: i * 0.1,
    },
  }),
};

/**
 * Pulse animation for attention-grabbing elements
 */
export const pulse = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
};

/**
 * Floating animation for elements that should appear to be floating
 */
export const float = {
  floating: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  },
};

/**
 * Wind-like subtle animation for background elements
 */
export const wind = {
  wind: {
    x: [0, 5, 0, -5, 0],
    rotate: [0, 1, 0, -1, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
    },
  },
};
