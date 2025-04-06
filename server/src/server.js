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

// Define allowed origins for CORS
const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",

  // Production domains
  "https://dev-connect-theta-nine.vercel.app/",
  "https://dev-connect-eight-rosy.vercel.app",
  "dev-connect-eight-rosy.vercel.app",
  "https://dev-connect-eight.vercel.app",
  "dev-connect-eight.vercel.app",

  // Netlify domains
  "https://resonant-travesseiro-f21083.netlify.app",
  "https://devconnect-app.netlify.app",
  "https://main--devconnect-social.netlify.app",

  // Allow Netlify preview deployments
  /\.netlify\.app$/,
  /\.vercel\.app$/,
];

const app = express();
app.use(express.json()); // ✅ Ensures JSON request bodies are parsed
app.use(express.urlencoded({ extended: true })); // ✅ Allows form data

// Configure CORS for Express
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Configure Helmet with relaxed settings for WebSocket
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    contentSecurityPolicy: false,
  })
);

const server = http.createServer(app);

// Configure Socket.IO with more detailed settings
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  allowEIO3: true,
  path: "/socket.io/",
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false,
  serveClient: false,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8,
});

// ✅ Store active user connections
const onlineUsers = new Map();

// Database connection
db.authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.error("Error connecting to database:", err));

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

    // Send acknowledgment back to client
    socket.emit("joinAcknowledged", {
      userId,
      success: true,
      message: "Successfully joined your notification channel",
    });
  });

  // ✅ Handle follow/unfollow events
  socket.on("followAction", (data) => {
    console.log("👥 Follow action event:", data);
    const { followerId, targetUserId, isFollowing } = data;

    if (!followerId || !targetUserId) {
      console.log("⚠️ Invalid follow action data:", data);
      return;
    }

    try {
      // Broadcast to all connected clients
      io.emit("followUpdate", {
        followerId,
        targetUserId,
        isFollowing,
      });

      // Send notification to target user
      if (isFollowing) {
        io.to(targetUserId.toString()).emit("notification", {
          userId: targetUserId,
          type: "follow",
          message: `Someone started following you!`,
        });
      }
    } catch (error) {
      console.error("❌ Error in followAction event:", error);
    }
  });

  // ✅ Handle post approval/rejection notifications
  socket.on("postStatus", (data) => {
    console.log("📩 Post status event:", data);
    try {
      const { userId, message } = data;
      if (!userId) {
        console.log("⚠️ Invalid postStatus data:", data);
        return;
      }
      io.to(userId.toString()).emit("newNotification", { message }); // Notify user about post status
    } catch (error) {
      console.error("❌ Error in postStatus event:", error);
    }
  });

  // Handle errors on this socket
  socket.on("error", (error) => {
    console.error("❌ Socket error:", socket.id, error);
  });

  // ✅ Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log("🔴 User disconnected:", socket.id, "Reason:", reason);
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
  if (!userId) {
    console.error("❌ sendNotification called without userId:", {
      userId,
      message,
    });
    return;
  }

  try {
    io.to(userId.toString()).emit("newNotification", { message });
    console.log(`✅ Notification sent to user ${userId}: ${message}`);
  } catch (error) {
    console.error(`❌ Error sending notification to user ${userId}:`, error);
  }
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
