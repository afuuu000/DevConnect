import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { X, Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationList({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();

        console.log("NotificationList data:", data); // Debug log

        // Process notifications to ensure user data is complete
        const processedNotifications = data.map((notification) => {
          return {
            ...notification,
            user: {
              id: notification.userId || notification.user?.id || "unknown",
              name:
                notification.userName ||
                notification.user?.name ||
                "Unknown User",
              avatar:
                notification.userAvatar ||
                notification.user?.avatar ||
                "/default-avatar.png",
            },
          };
        });

        setNotifications(processedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

  return (
    <div className="overflow-hidden rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <h3 className="font-semibold text-white">Notifications</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[70vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${
                  !notification.read ? "bg-gray-800/80" : ""
                }`}
              >
                <Link
                  to={notification.link || "#"}
                  className="flex items-start gap-3"
                >
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                  
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
                    <p className="text-sm text-gray-300 line-clamp-2">
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
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-cyan-500 mt-2"></div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 text-center">
        <Link
          to="/notifications"
          className="text-sm text-cyan-400 hover:text-cyan-300 font-medium"
          onClick={onClose}
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
}
