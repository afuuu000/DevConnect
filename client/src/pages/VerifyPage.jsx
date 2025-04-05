import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { verifyEmail } from "../services/api";
import { motion } from "framer-motion";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import axios from "axios";
const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const verify = async () => {
      try {
        console.log("🔄 Sending verification request...");
        const response = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
  
        console.log("✅ Verification Response:", response.data);
  
        if (response.data.success) { // ✅ Ensure we check success flag
          setMessage(response.data.message);
          setStatus("success");
  
          if (response.data.redirect) {
            setTimeout(() => navigate(response.data.redirect), 3000);
          }
        } else {
          setMessage("Verification failed. Please try again.");
          setStatus("error");
        }
      } catch (err) {
        console.error("❌ Verification Error:", err.response?.data || err.message);
        setMessage("Verification failed. Please try again or contact support.");
        setStatus("error");
      }
    };
  
    verify();
  }, [token, navigate]);
  

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-4 sm:p-6 w-full max-w-sm mx-auto"
    >
      <div className="space-y-3 sm:space-y-4 text-center">
        {status === "loading" && (
          <div className="flex justify-center">
            <svg
              className="animate-spin h-10 w-10 text-cyan-400"
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
          </div>
        )}

        {status === "success" && (
          <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto" />
        )}

        {status === "error" && (
          <XCircleIcon className="h-12 w-12 text-red-400 mx-auto" />
        )}

        <h2 className="text-xl sm:text-2xl font-bold text-white">
          Email Verification
        </h2>

        <p className="text-xs sm:text-sm text-gray-300">{message}</p>

        <div className="pt-2">
          <Link
            to="/login"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default VerifyPage;
