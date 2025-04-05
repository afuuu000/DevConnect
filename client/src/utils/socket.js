import { io } from "socket.io-client";

// Create a singleton socket instance with consistent configuration
const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add event listeners for connection status
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("🔌 Socket disconnected:", reason);
});

// Export the singleton instance
export default socket;
