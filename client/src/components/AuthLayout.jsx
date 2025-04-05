import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex flex-col items-center justify-center px-3 py-6 sm:py-12">
      {/* Animated Background Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        className="absolute inset-0 bg-[radial-gradient(#4b5563_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"
      />

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.2 }}
        className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-blue-500/20 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="mb-4 sm:mb-6 flex flex-col items-center space-y-1"
        >
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            DEVCONNECT
          </h1>
          <motion.p
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-xs sm:text-sm text-gray-300 font-medium"
          >
            Connect · Collaborate · Create
          </motion.p>
        </motion.div>

        {/* Auth Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full"
        >
          <Outlet />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-xs text-gray-400 font-medium"
        >
          © {new Date().getFullYear()} DevConnect. All rights reserved.
        </motion.div>
      </div>
    </div>
  );
}
