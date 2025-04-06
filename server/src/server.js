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
  "https://dev-connect-client.vercel.app",
  "https://dev-connect-eight-rosy.vercel.app",

  // Netlify domains - add your actual Netlify domain here
  "https://resonant-travesseiro-f21083.netlify.app",
  "https://devconnect-app.netlify.app",
  "https://main--devconnect-social.netlify.app",

  // Allow Netlify preview deployments
  /\.netlify\.app$/,
];

const app = express();
app.use(express.json()); // ✅ Ensures JSON request bodies are parsed
app.use(express.urlencoded({ extended: true })); // ✅ Allows form data

const server = http.createServer(app); // Create HTTP Server
const io = new Server(server, {
  cors: {
    // For Socket.io, we need to handle both string and regex origins
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches any string in allowedOrigins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches any regex in allowedOrigins
      for (const pattern of allowedOrigins) {
        if (pattern instanceof RegExp && pattern.test(origin)) {
          return callback(null, true);
        }
      }

      // Origin not allowed
      console.log(`❌ Origin blocked by CORS: ${origin}`);
      return callback(
        new Error(`CORS not allowed for origin: ${origin}`),
        false
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
  // Additional Socket.io configuration for better stability
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
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
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);

      // Check if origin matches any string in allowedOrigins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Check if origin matches any regex in allowedOrigins
      for (const pattern of allowedOrigins) {
        if (pattern instanceof RegExp && pattern.test(origin)) {
          return callback(null, true);
        }
      }

      // Origin not allowed
      console.log(`❌ Express CORS blocked origin: ${origin}`);
      return callback(
        new Error(`CORS not allowed for origin: ${origin}`),
        false
      );
    },
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
