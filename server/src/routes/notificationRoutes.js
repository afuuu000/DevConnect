import express from "express";
import { markAsRead, getNotifications ,deleteNotification} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNotifications);
router.post("/read", authMiddleware, markAsRead);
router.delete("/:id", authMiddleware, deleteNotification); 
export default router;
