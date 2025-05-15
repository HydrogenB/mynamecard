import React from 'react';
import { motion } from 'framer-motion';

export interface StepperProps {
  steps: string[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepChange,
  className = '',
  orientation = 'horizontal'
}) => {
  const isHorizontal = orientation === 'horizontal';
  
  return (
    <div className={`
      ${isHorizontal ? 'flex' : 'flex flex-col'} 
      ${isHorizontal ? 'items-center' : 'items-start'}
      ${className}
    `}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = onStepChange !== undefined;

        return (
          <React.Fragment key={index}>
            {/* Step indicator */}
            <motion.div
              className={`
                relative flex items-center justify-center 
                rounded-full transition-all duration-300 
                ${isClickable ? 'cursor-pointer' : ''}
                ${isActive || isCompleted 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}
                ${isHorizontal ? 'h-10 w-10' : 'h-8 w-8'}
              `}
              initial={false}
              animate={{
                scale: isActive ? 1.1 : 1,
                boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : '0 0 0 0px rgba(37, 99, 235, 0)',
              }}
              onClick={isClickable ? () => onStepChange(index) : undefined}
              whileHover={isClickable ? { scale: 1.05 } : {}}
              whileTap={isClickable ? { scale: 0.95 } : {}}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </motion.div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  ${isHorizontal ? 'flex-1 h-0.5' : 'w-0.5 h-10 ml-4'}
                  ${isCompleted ? 'bg-primary-500' : 'bg-gray-200'}
                  transition-colors duration-300
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export interface StepContent {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export interface StepperContentProps {
  steps: StepContent[];
  currentStep: number;
  className?: string;
  animationDirection?: 'horizontal' | 'vertical'; 
}

export const StepperContent: React.FC<StepperContentProps> = ({
  steps,
  currentStep,
  className = '',
  animationDirection = 'horizontal'
}) => {
  const slideDirection = animationDirection === 'horizontal' ? 'x' : 'y';
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {steps.map((step, index) => (
        <motion.div
          key={index}
          className="absolute w-full h-full"
          initial={{ opacity: 0, [slideDirection]: currentStep > index ? -40 : 40 }}
          animate={{ 
            opacity: currentStep === index ? 1 : 0,
            [slideDirection]: currentStep === index ? 0 : currentStep > index ? -40 : 40,
          }}
          transition={{ 
            opacity: { duration: 0.3 },
            [slideDirection]: { type: 'spring', stiffness: 300, damping: 30 }
          }}
          style={{
            zIndex: currentStep === index ? 1 : 0,
            pointerEvents: currentStep === index ? 'auto' : 'none'
          }}
        >
          {step.title && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
              {step.subtitle && <p className="mt-1 text-sm text-gray-500">{step.subtitle}</p>}
            </div>
          )}
          <div>{step.content}</div>
        </motion.div>
      ))}
    </div>
  );
};
