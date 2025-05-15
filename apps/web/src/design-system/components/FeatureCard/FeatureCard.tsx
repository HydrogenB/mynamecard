import React from 'react';
import { motion } from 'framer-motion';

export interface FeatureCardProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  accentColor?: string;
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className = '',
  accentColor = 'primary-500',
  index = 0,
}) => {
  return (
    <motion.div
      className={`p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
    >
      {icon && (
        <div className={`mb-4 p-3 inline-flex items-center justify-center rounded-full bg-${accentColor} bg-opacity-10`}>
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};
