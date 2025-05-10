/**
 * Color palette for the design system
 * These match the Tailwind colors from tailwind.config.js
 */

export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  white: '#ffffff',
  black: '#000000',
  red: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  green: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  }
};

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;

export const getColor = (color: ColorKey, shade?: ColorShade): string => {
  if (shade && typeof colors[color] === 'object') {
    return colors[color][shade];
  }
  return colors[color] as string;
};
