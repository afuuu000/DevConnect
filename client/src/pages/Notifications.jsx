import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import socket, { safeEmit, isSocketConnected } from "../utils/socket"; // Import shared socket instance and helpers
import {
  Bell,
  Check,
  Trash2,
  X,
  Heart,
  MessageCircle,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [socketConnected, setSocketConnected] = useState(false);
  const userId = localStorage.getItem("userId"); // Get logged-in user ID

  // Track socket connection status
  useEffect(() => {
    const checkConnection = () => {
      setSocketConnected(isSocketConnected());
    };

    // Check initial state
    checkConnection();

    // Set up event listeners
    socket.on("connect", checkConnection);
    socket.on("disconnect", checkConnection);

    return () => {
      socket.off("connect", checkConnection);
      socket.off("disconnect", checkConnection);
    };
  }, []);

  useEffect(() => {
    fetchNotifications();

    // ✅ Connect WebSocket for real-time notifications
    if (userId) {
      // Use the safe emit function that handles errors
      safeEmit("join", userId, (response) => {
        if (response && response.error) {
          console.error("Error joining notification room:", response.error);
        } else {
          console.log("Successfully joined notification room");
        }
      });

      socket.on("newNotification", handleNewNotification);

      // Listen for join acknowledgment
      socket.on("joinAcknowledged", (data) => {
        console.log("Join acknowledged:", data);
      });
    }

    return () => {
      socket.off("newNotification"); // Clean up WebSocket listener
      socket.off("joinAcknowledged");
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // Use the API_URL from environment variable if available
      const API_URL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

      // ✅ Fetch existing notifications from backend
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      console.log("Fetched notifications:", res.data); // Debug log

      // Process notifications to ensure user data is complete
      const processedNotifications = res.data.map((notification) => {
        // Ensure user object exists and has default values if needed
        return {
          ...notification,
          user: {
            id: notification.userId || notification.user?.id || "unknown",
            name:
              notification.userName ||
              notification.user?.name ||
              "Unknown User",
            avatar:
              notification.userAvatar || notification.user?.avatar || null,
          },
        };
      });

      setNotifications(processedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNotification = (notification) => {
    console.log("📩 New Notification Received:", notification);
    // Ensure the notification has a complete user object
    const processedNotification = {
      ...notification,
      user: {
        id: notification.userId || notification.user?.id || "unknown",
        name:
          notification.userName || notification.user?.name || "Unknown User",
        avatar:
          notification.userAvatar ||
          notification.user?.avatar ||
          "/default-avatar.png",
      },
    };
    setNotifications((prev) => [processedNotification, ...prev]); // Add new notification at top
  };

  // ✅ Mark Notification as Read
  const markAsRead = async (notificationId) => {
    try {
      // Update UI instantly
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Send request to backend
      await axios.post(
        "http://localhost:5000/api/notifications/read",
        { id: notificationId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // ✅ Delete Notification
  const deleteNotification = async (notificationId) => {
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.id !== notificationId)
      );

      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, isRead: true }))
      );

      await axios.post(
        "http://localhost:5000/api/notifications/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-rose-400" />;
      case "comment":
        return <MessageCircle className="w-4 h-4 text-cyan-400" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get notification background color based on type
  const getNotificationBg = (type) => {
    switch (type) {
      case "like":
        return "bg-rose-500/10";
      case "comment":
        return "bg-cyan-500/10";
      case "follow":
        return "bg-emerald-500/10";
      default:
        return "bg-gray-800";
    }
  };

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true; // "all" filter
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header with filters */}
      <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 z-10">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Notifications</h1>

            {/* Socket connection indicator */}
            <div
              className="ml-2 flex items-center text-xs"
              title={
                socketConnected
                  ? "Real-time updates connected"
                  : "Real-time updates disconnected"
              }
            >
              {socketConnected ? (
                <>
                  <Wifi size={12} className="text-green-400 mr-1" />{" "}
                  <span className="text-green-400">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-rose-400 mr-1" />{" "}
                  <span className="text-rose-400">Disconnected</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Refresh notifications"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-gray-800 border border-gray-700 text-white rounded-lg py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>

            {notifications.some((n) => !n.isRead) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={markAllAsRead}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-cyan-400 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications content */}
      <div className="divide-y divide-gray-800">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No notifications found</p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                View all notifications
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`p-4 flex items-start gap-4 transition-colors ${
                  !notification.isRead ? "bg-gray-800/50" : ""
                }`}
              >
                {/* User Avatar with notification type indicator */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    {/* Type indicator at the bottom right of avatar - only show for specific types */}
                    {notification.type && notification.type !== "follow" && (
                      <div
                        className={`absolute -bottom-1 -right-1 rounded-full p-1 ${getNotificationBg(
                          notification.type
                        )}`}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={notification.link || "#"}
                    className="block hover:bg-gray-800/30 -m-2 p-2 rounded-lg transition-colors"
                  >
                    <p className="text-gray-200 line-clamp-2">
                      <span className="font-medium text-white">
                        {notification.user.name}
                      </span>{" "}
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!notification.isRead && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => markAsRead(notification.id)}
                      className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full transition-colors"
                      aria-label="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteNotification(notification.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications;
