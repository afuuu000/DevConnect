import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-4 sm:p-6 w-full"
    >
      <div className="space-y-3 sm:space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-900/30 mb-3">
            <EnvelopeIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Forgot Password?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-300"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className={`w-full py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 focus:ring-4 focus:ring-cyan-500/50 transition-all flex items-center justify-center text-xs sm:text-sm ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : null}
            {isLoading ? "Sending..." : "Send Reset Instructions"}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 p-2 rounded-lg text-xs ${
                message.includes("error") || message.includes("failed")
                  ? "bg-red-900/30 text-red-400 border border-red-800/50"
                  : "bg-green-900/30 text-green-400 border border-green-800/50"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-3 text-center">
          <Link
            to="/login"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPassword;
