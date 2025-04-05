import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ children, onClick, className = '' }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.button>
  );
}