import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // Load environment variables
import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import { Server } from "socket.io";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();
app.use(express.json()); // ✅ Ensures JSON request bodies are parsed
app.use(express.urlencoded({ extended: true })); // ✅ Allows form data

const server = http.createServer(app); // Create HTTP Server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// ✅ Store active user connections
const onlineUsers = new Map();

// Database connection
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Error connecting to database:", err));

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true, // ✅ Allow cookies, authorization headers
    methods: ["GET", "POST", "PUT", "DELETE"], // ✅ Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Allow required headers
  })
);

app.use(helmet());

// Attach `io` to `req` object in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ WebSockets for real-time notifications
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // ✅ User joins their notification room
  socket.on("join", (userId) => {
    if (!userId) {
      console.log("⚠️ Join event received without userId");
      return;
    }

    console.log(
      `👤 User ${userId} joined their notification channel (socket: ${socket.id})`
    );
    onlineUsers.set(userId, socket.id);
    socket.join(userId.toString()); // Ensure userId is a string for room name
  });

  // ✅ Handle follow/unfollow events
  socket.on("followAction", (data) => {
    console.log("👥 Follow action event:", data);
    const { followerId, targetUserId, isFollowing } = data;

    // Broadcast to all connected clients
    io.emit("followUpdate", {
      followerId,
      targetUserId,
      isFollowing,
    });

    // Send notification to target user
    if (isFollowing) {
      const followerUser = onlineUsers.get(followerId);
      if (followerUser) {
        io.to(targetUserId.toString()).emit("notification", {
          userId: targetUserId,
          type: "follow",
          message: `Someone started following you!`,
        });
      }
    }
  });

  // ✅ Handle post approval/rejection notifications
  socket.on("postStatus", (data) => {
    console.log("📩 Post status event:", data);
    const { userId, message } = data;
    io.to(userId).emit("newNotification", { message }); // Notify user about post status
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    // Remove user from online users map
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        console.log(`👤 User ${userId} is now offline`);
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// ✅ Helper function to send notifications
export const sendNotification = (userId, message) => {
  io.to(userId).emit("newNotification", { message });
};

// ✅ Routes
app.use("/api/auth", authRoutes);
app.get("/api/config/google", (req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID });
});
app.use("/api/posts", postRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes); // ✅ Ensure this is included

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
