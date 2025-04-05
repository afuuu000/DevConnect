import express from "express";
import {

  getAllUsers,
  createUserByAdmin,
  deleteUser,
  getPendingPosts,
  approvePost,
  rejectPost,
} from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import isAdmin from "../middlewares/isAdminMiddleware.js";

const router = express.Router();


// ✅ Get all users (Admin Only)
router.get("/users", authMiddleware, isAdmin, getAllUsers);

// ✅ Create a new user (Admin Only)
router.post("/users", authMiddleware, isAdmin, createUserByAdmin);

// ✅ Delete a user (Admin Only)
router.delete("/users/:userId", authMiddleware, isAdmin, deleteUser);

// ✅ Get all pending posts (Admin Only)
router.get("/posts/pending", authMiddleware, isAdmin, getPendingPosts);

router.put("/posts/:id/approve", authMiddleware, isAdmin, approvePost);
router.put("/posts/:id/reject", authMiddleware, isAdmin, rejectPost);


export default router;
