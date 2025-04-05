import express from "express";
import {
  register,
  login,
  verifyEmail,
  googleAuth,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getUserProfile } from "../controllers/userController.js"; // ✅ Import user profile function

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.post("/google-auth", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ✅ Add Profile Route
router.get("/profile", authMiddleware, getUserProfile);

export default router;
