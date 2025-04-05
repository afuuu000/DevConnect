import React, { useState, useContext } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { AuthContext } from "../context/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { googleLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(formData);
      setMessage(
        "Registration successful! Please check your email for verification."
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setMessage(
        err.response?.data?.error || "Registration failed. Try again."
      );
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const user = await googleLogin(response);

      console.log("✅ Google Login Successful:", user);

      if (user?.role === "admin") {
        console.log(
          "⚠️ Admin logged in via Google, but still redirecting to /explore"
        );
      }

      navigate("/explore"); // ✅ Always redirect to /explore
    } catch (error) {
      console.error("❌ Google Login Failed:", error.message);
      setMessage("Google login failed. Try again.");
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
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Create Account
          </h2>
          <p className="text-xs sm:text-sm text-gray-300">
            Join the DevConnect community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-700/70 text-white transition-all outline-none text-xs sm:text-sm"
                placeholder="Create a password"
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

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-1.5 sm:py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 focus:ring-4 focus:ring-cyan-500/50 transition-all text-xs sm:text-sm"
          >
            Create Account
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-800 text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage("Google signup failed. Try again.")}
            text="continue_with"
            theme="filled_black"
            size="medium"
            shape="rectangular"
          />
        </div>

        {/* Error/Success Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center text-xs ${
                message.includes("successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign In Link */}
        <p className="text-center text-gray-400 text-xs">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </motion.div>
  );
};
export default Signup;
