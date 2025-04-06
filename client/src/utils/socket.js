import { io } from "socket.io-client";

// Determine the server URL - fallback to localhost if env variable isn't set
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

console.log("🔌 Socket connecting to server:", SERVER_URL);

const socket = io(SERVER_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  reconnectionDelayMax: 10000,
  timeout: 20000,
  autoConnect: true,
  path: "/socket.io/",
  secure: true,
  rejectUnauthorized: false,
});

// Track connection status
let isConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = 5;

// Add event listeners for connection status
socket.on("connect", () => {
  isConnected = true;
  connectionAttempts = 0;
  console.log("✅ Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  connectionAttempts++;
  console.error(
    `❌ Socket connection error (${connectionAttempts}/${maxConnectionAttempts}):`,
    error.message
  );
  console.error(
    "This may happen if the server is not running or CORS is blocking the connection."
  );

  // If we're on a production domain but using localhost, that's a common mistake
  if (
    window.location.hostname !== "localhost" &&
    SERVER_URL.includes("localhost")
  ) {
    console.error(
      "⚠️ You appear to be accessing the site from a non-localhost domain but your VITE_SERVER_URL is set to localhost!"
    );
  }

  // If we've tried too many times, stop trying to reconnect
  if (connectionAttempts >= maxConnectionAttempts) {
    console.error(
      `⛔ Reached maximum connection attempts (${maxConnectionAttempts}). Stopping reconnection.`
    );
    socket.disconnect();
  }
});

socket.on("disconnect", (reason) => {
  isConnected = false;
  console.log("🔌 Socket disconnected:", reason);

  // If the server disconnected us, try to reconnect
  if (reason === "io server disconnect") {
    console.log(
      "🔄 Server disconnected the socket. Attempting to reconnect..."
    );
    socket.connect();
  }
});

socket.on("reconnect", (attemptNumber) => {
  console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
});

socket.on("reconnect_attempt", (attemptNumber) => {
  console.log(`🔄 Socket reconnection attempt ${attemptNumber}...`);
});

socket.on("reconnect_error", (error) => {
  console.error("❌ Socket reconnection error:", error.message);
});

socket.on("error", (error) => {
  console.error("❌ Socket error:", error);
});

// Helper function to check connection status
const isSocketConnected = () => isConnected && socket.connected;

// Helper function to safely emit events
const safeEmit = (event, data, callback) => {
  if (!isSocketConnected()) {
    console.warn(
      `⚠️ Attempted to emit "${event}" while socket is disconnected`
    );
    if (callback) callback({ error: "Socket disconnected" });
    return false;
  }

  try {
    socket.emit(event, data, callback);
    return true;
  } catch (error) {
    console.error(`❌ Error emitting "${event}" event:`, error);
    if (callback) callback({ error: error.message });
    return false;
  }
};

// Export the singleton instance and helper functions
export default socket;
export { isSocketConnected, safeEmit };
