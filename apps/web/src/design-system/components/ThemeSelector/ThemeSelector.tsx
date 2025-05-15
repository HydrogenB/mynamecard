import React from 'react';
import { motion } from 'framer-motion';

export interface ThemeOption {
  id: string;
  name: string;
  colors: {
    primary: string;
    background: string;
    text: string;
    accent: string;
  };
  previewClasses: string;
}

export interface ThemeSelectorProps {
  selectedTheme: string;
  onChange: (themeId: string) => void;
  className?: string;
}

export const themeOptions: ThemeOption[] = [
  {
    id: 'blue',
    name: 'Ocean Blue',
    colors: {
      primary: 'bg-blue-600',
      background: 'bg-blue-50',
      text: 'text-blue-900',
      accent: 'bg-blue-200',
    },
    previewClasses: 'bg-blue-600 text-white',
  },
  {
    id: 'green',
    name: 'Emerald',
    colors: {
      primary: 'bg-emerald-600',
      background: 'bg-emerald-50',
      text: 'text-emerald-900',
      accent: 'bg-emerald-200',
    },
    previewClasses: 'bg-emerald-600 text-white',
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    colors: {
      primary: 'bg-purple-600',
      background: 'bg-purple-50',
      text: 'text-purple-900',
      accent: 'bg-purple-200',
    },
    previewClasses: 'bg-purple-600 text-white',
  },
  {
    id: 'red',
    name: 'Ruby Red',
    colors: {
      primary: 'bg-red-600',
      background: 'bg-red-50',
      text: 'text-red-900',
      accent: 'bg-red-200',
    },
    previewClasses: 'bg-red-600 text-white',
  },
  {
    id: 'amber',
    name: 'Amber Gold',
    colors: {
      primary: 'bg-amber-600',
      background: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'bg-amber-200',
    },
    previewClasses: 'bg-amber-600 text-white',
  },
  {
    id: 'teal',
    name: 'Teal Breeze',
    colors: {
      primary: 'bg-teal-600',
      background: 'bg-teal-50',
      text: 'text-teal-900',
      accent: 'bg-teal-200',
    },
    previewClasses: 'bg-teal-600 text-white',
  },
  {
    id: 'indigo',
    name: 'Indigo Night',
    colors: {
      primary: 'bg-indigo-600',
      background: 'bg-indigo-50',
      text: 'text-indigo-900',
      accent: 'bg-indigo-200',
    },
    previewClasses: 'bg-indigo-600 text-white',
  },
  {
    id: 'rose',
    name: 'Rose Petal',
    colors: {
      primary: 'bg-rose-600',
      background: 'bg-rose-50',
      text: 'text-rose-900',
      accent: 'bg-rose-200',
    },
    previewClasses: 'bg-rose-600 text-white',
  },
  {
    id: 'gray',
    name: 'Modern Gray',
    colors: {
      primary: 'bg-gray-700',
      background: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'bg-gray-200',
    },
    previewClasses: 'bg-gray-700 text-white',
  },
  {
    id: 'gradient',
    name: 'Gradient Fusion',
    colors: {
      primary: 'bg-gradient-to-r from-blue-500 to-purple-600',
      background: 'bg-gray-50',
      text: 'text-gray-900',
      accent: 'bg-indigo-100',
    },
    previewClasses: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
  },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  selectedTheme, 
  onChange,
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-5 gap-3 ${className}`}>
      {themeOptions.map((theme) => (
        <motion.div
          key={theme.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(theme.id)}
          className={`
            h-12 rounded-lg cursor-pointer transition-all duration-200
            ${theme.previewClasses}
            ${selectedTheme === theme.id ? 'ring-2 ring-offset-2 ring-primary-500' : 'opacity-80 hover:opacity-100'}
          `}
          title={theme.name}
        />
      ))}
    </div>
  );
};

export const getThemeById = (themeId: string): ThemeOption => {
  return themeOptions.find(theme => theme.id === themeId) || themeOptions[0];
};
