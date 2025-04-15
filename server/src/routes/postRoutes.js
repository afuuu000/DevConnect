import express from "express";
import {
  createPost,
  getPosts,
  searchPosts,
  getPostsByUser,
  getUserPendingPosts,
} from "../controllers/postController.js";
import {
  toggleLike,
  getLikesCount,
  addComment,
  getComments,
} from "../controllers/postController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../services/imageUploadService.js";
import { deletePost } from "../controllers/postController.js";

const router = express.Router();

// ✅ Create Post with Images/Video
router.post("/", authMiddleware, upload.array("files", 10), createPost);

// ✅ Get All Posts (Explore)
router.get("/", getPosts);

// ✅ Get Current User's Pending Posts - This needs to come BEFORE the catch-all user route
router.get("/user/pending", authMiddleware, getUserPendingPosts);

// ✅ Get Posts by Specific User
router.get("/user/:userId", getPostsByUser);

// ✅ Search Posts
router.get("/search", searchPosts);

// ✅ DELETE post route
router.delete("/:id", authMiddleware, deletePost);
// ✅ Like/Unlike a Post
router.post("/:postId/like", authMiddleware, toggleLike);
router.get("/:postId/likes", authMiddleware, getLikesCount);

// ✅ Comment on Post
router.post("/:postId/comment", authMiddleware, addComment);
router.get("/:postId/comments", getComments);

export default router;
