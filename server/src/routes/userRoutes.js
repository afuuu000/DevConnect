import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserById,
  searchUsers,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../services/imageUploadService.js";
import User from "../models/User.js"; // ✅ FIX: Import the User model

const router = express.Router();

router.get("/me", authMiddleware, getUserProfile);
router.get("/search", authMiddleware, searchUsers);
router.put("/profile", authMiddleware, updateUserProfile);

router.post(
  "/upload-avatar",
  authMiddleware,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded or format not allowed",
      });
    }
    res.status(200).json({ imageUrl: req.file.path });
  }
);

// ✅ Fix: Use the controller function instead of re-writing logic
router.get("/:userId", getUserById);

export default router;
