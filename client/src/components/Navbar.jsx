import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";
import { motion } from "framer-motion";
import { Menu, Bell, PlusSquare, Home, User } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import NotificationList from "./NotificationList";
import socket from "../utils/socket";
import config from "../config";

export default function Navbar({ onMenuClick }) {
  const { user } = useContext(AuthContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const location = useLocation();

  // Check if we're on the explore page
  const isExplorePage = location.pathname === "/explore";

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showNotifications) {
      // Mark as read in UI when closing notifications
      setHasUnreadNotifications(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const checkUnreadNotifications = async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        setHasUnreadNotifications(
          data.some((notification) => !notification.isRead)
        );
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    checkUnreadNotifications();

    // Use the shared socket instance
    socket.on("notification", (data) => {
      if (data.userId === user.id) {
        setHasUnreadNotifications(true);
      }
    });

    // Join user's notification room
    socket.emit("join", user.id);

    return () => {
      socket.off("notification");
    };
  }, [user]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border-b border-gray-800 p-3 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left section: Logo and menu button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link
            to="/"
            className="text-xl font-bold text-white hover:text-cyan-400 transition-colors"
          >
            DevConnect
          </Link>
        </div>

        {/* Middle section: Search Bar (desktop only) - only on explore page */}
        {isExplorePage && (
          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>
        )}

        {/* Right section: Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile navigation icons */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              to="/explore"
              className="p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to={`/profile/${user?.id}`}
              className="p-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/notifications"
              className="p-2 text-gray-300 hover:text-cyan-400 transition-colors relative"
              onClick={() => setHasUnreadNotifications(false)}
            >
              <Bell className="w-5 h-5" />
              {/* Notification indicator */}
              {hasUnreadNotifications && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 rounded-full"></span>
              )}
            </Link>
          </div>

          {/* Create post button */}
          <Link
            to="/create-post"
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95 transform transition-all font-medium"
          >
            <PlusSquare className="w-4 h-4" />
            <span>New Post</span>
          </Link>

          {/* Mobile create button */}
          <Link
            to="/create-post"
            className="md:hidden p-2 text-gray-300 hover:text-cyan-400 transition-colors"
          >
            <PlusSquare className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar - only on explore page */}
      {isExplorePage && (
        <div className="md:hidden mt-3">
          <SearchBar />
        </div>
      )}

      {/* Notifications dropdown (desktop only) */}
      {showNotifications && (
        <div className="absolute right-2 top-16 z-50 w-80 max-w-[calc(100vw-1rem)] bg-gray-900 border border-gray-800 rounded-lg shadow-xl">
          <NotificationList onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </motion.nav>
  );
}
