import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: password,
            confirmPassword: confirmPassword,
          }),
        }
      );

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
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
            <KeyIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Reset Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-2">
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-gray-300"
            >
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm pr-8"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-medium text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm pr-8"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                ) : (
                  <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
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
            {isLoading ? "Resetting..." : "Reset Password"}
          </motion.button>
        </form>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 p-2 rounded-lg text-xs ${
                message.includes("error") || message.includes("match")
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

export default ResetPassword;
