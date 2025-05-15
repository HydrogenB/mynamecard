import React from 'react';
import { motion } from 'framer-motion';

export interface StepperProps {
  steps: string[];
  currentStep: number;
  onChange?: (step: number) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  variant?: 'default' | 'numbered' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  completedColor?: string;
}

export const EnhancedStepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onChange,
  className = '',
  orientation = 'horizontal',
  showLabels = true,
  variant = 'default',
  size = 'md',
  activeColor = 'bg-primary-600',
  completedColor = 'bg-primary-400',
}) => {
  const isVertical = orientation === 'vertical';
  
  const sizeClasses = {
    sm: {
      container: 'gap-2',
      step: 'h-2 w-2',
      line: isVertical ? 'w-0.5 h-4' : 'h-0.5 w-4',
      number: 'w-5 h-5 text-xs',
      label: 'text-xs',
    },
    md: {
      container: 'gap-3',
      step: 'h-3 w-3',
      line: isVertical ? 'w-0.5 h-8' : 'h-0.5 w-8',
      number: 'w-6 h-6 text-sm',
      label: 'text-sm',
    },
    lg: {
      container: 'gap-4',
      step: 'h-4 w-4',
      line: isVertical ? 'w-0.5 h-12' : 'h-0.5 w-12',
      number: 'w-8 h-8 text-base',
      label: 'text-base',
    },
  };

  return (
    <div
      className={`
        flex 
        ${isVertical ? 'flex-col' : 'flex-row'} 
        items-center 
        ${isVertical ? 'items-start' : 'items-center'} 
        ${sizeClasses[size].container} 
        ${className}
      `}
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              {/* Step dot/number */}
              <motion.div
                onClick={() => onChange?.(index)}
                className={`
                  rounded-full 
                  flex items-center justify-center 
                  cursor-pointer 
                  transition-all duration-300
                  ${variant === 'numbered' ? sizeClasses[size].number : sizeClasses[size].step}
                  ${isActive 
                    ? `${activeColor} ${variant === 'numbered' ? 'text-white' : ''}` 
                    : isCompleted 
                      ? `${completedColor} ${variant === 'numbered' ? 'text-white' : ''}` 
                      : 'bg-gray-300'
                  }
                `}
                initial={false}
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                transition={{ duration: 0.3, type: 'spring' }}
                whileHover={{ scale: 1.1 }}
              >
                {variant === 'numbered' && (
                  isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3/5 h-3/5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )
                )}
              </motion.div>
              
              {/* Step label */}
              {showLabels && (
                <div 
                  className={`
                    mt-2 
                    ${sizeClasses[size].label} 
                    ${isActive ? 'font-medium text-gray-900' : 'text-gray-600'}
                  `}
                >
                  {step}
                </div>
              )}
            </div>

            {/* Connector line */}
            {!isLast && (
              <div 
                className={`
                  ${sizeClasses[size].line}
                  ${isCompleted ? completedColor : 'bg-gray-300'}
                  transition-all duration-300
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
