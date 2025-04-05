import express from "express";
import { followUser, unfollowUser, checkFollowStatus, getFollowers, getFollowing } from "../controllers/followController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/status/:userId", authMiddleware, checkFollowStatus);
router.post("/", authMiddleware, followUser);
router.delete("/:userId", authMiddleware, unfollowUser);  // ✅ Fix Unfollow Route
router.get("/followers/:userId", authMiddleware, getFollowers);
router.get("/following/:userId", authMiddleware, getFollowing);


export default router;
