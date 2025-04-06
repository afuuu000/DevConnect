// Global application configuration
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const config = {
  // API base URL - used for all requests
  apiUrl: isLocalhost
    ? "http://localhost:5000"
    : "https://dev-connect-theta-nine.vercel.app",

  // WebSocket URL - used for real-time connections
  socketUrl: isLocalhost
    ? "http://localhost:5000"
    : "https://dev-connect-theta-nine.vercel.app",

  // Local storage keys
  storageKeys: {
    token: "token",
    userId: "userId",
    refreshToken: "refreshToken",
  },
};

console.log("🔧 App config:", {
  environment: isLocalhost ? "local" : "production",
  apiUrl: config.apiUrl,
  socketUrl: config.socketUrl,
});

export default config;
