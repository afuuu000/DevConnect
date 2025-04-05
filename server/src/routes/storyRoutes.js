import express from 'express';
import { getStories, uploadStory } from '../controllers/storyController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/upload", authMiddleware, uploadStory); // ✅ Upload stories
router.get("/", getStories); // ✅ Fetch stories (Ensure this exists)

export default router;
