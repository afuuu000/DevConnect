import { motion } from 'framer-motion';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        {children}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}