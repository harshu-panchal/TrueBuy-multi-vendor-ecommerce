// API Configuration
const runtimeDefaultApiBase =
  typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || runtimeDefaultApiBase;

// App Constants
export const APP_NAME = 'Tru Buy';
export const APP_DESCRIPTION = 'Multi Vendor E-commerce Platform';

// Animation Durations
export const ANIMATION_DURATION = {
  FAST: 0.3,
  NORMAL: 0.5,
  SLOW: 0.8,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
