// Theme configuration for the application
export const colors = {
  primary: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1", // Main primary color
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b", // Main secondary color
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  accent: {
    50: "#ecfdf5",
    100: "#d1fae5",
    200: "#a7f3d0",
    300: "#6ee7b7",
    400: "#34d399",
    500: "#10b981", // Main accent color
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
};

// Framer Motion animation variants
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
  transition: { duration: 0.3 },
};

export const slideInFromLeft = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: { duration: 0.3 },
};

export const scaleUp = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.3 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Common component styles
export const cardStyles = {
  base: "bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300",
  interactive:
    "cursor-pointer transform hover:-translate-y-1 transition-transform duration-300",
};

export const buttonStyles = {
  primary:
    "bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
  secondary:
    "bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
  accent:
    "bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
  outline:
    "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 font-semibold py-2 px-4 rounded-lg transition-colors duration-300",
};
