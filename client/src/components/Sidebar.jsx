import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import socket from "../utils/socket";
import {
  Home,
  Search,
  Bell,
  User,
  LogOut,
  X,
  PlusSquare,
  Users,
  Heart,
} from "lucide-react";

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logout } = useContext(AuthContext);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!user) return;

    const fetchFollowers = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/follows/followers/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };

    const fetchFollowing = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/follows/following/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setFollowing(data);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };

    const checkUnreadNotifications = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setHasUnreadNotifications(
          data.some((notification) => !notification.isRead)
        );
      } catch (error) {
        console.error("Error checking notifications:", error);
      }
    };

    fetchFollowers();
    fetchFollowing();
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleLogout = () => {
    logout();
    onToggle();
  };

  const menuItems = [
    { path: "/explore", name: "Explore", icon: Home },
    { path: `/profile/${user?.id}`, name: "Profile", icon: User },
    {
      path: "/notifications",
      name: "Notifications",
      icon: Bell,
      hasIndicator: hasUnreadNotifications,
    },
    { path: "/create-post", name: "Create", icon: PlusSquare },
  ];

  return (
    <>
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className="fixed md:relative top-0 left-0 h-screen bg-gray-900 border-r border-gray-800 w-64 z-50 transform flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <Link to="/" className="text-xl font-bold text-white">
            DevConnect
          </Link>
          <button
            onClick={onToggle}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 flex-1">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-cyan-600/20 text-cyan-400"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
                onClick={() => {
                  if (window.innerWidth < 768) onToggle();
                  // Clear notification indicator if navigating to notifications
                  if (item.path === "/notifications") {
                    setHasUnreadNotifications(false);
                  }
                }}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.hasIndicator && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
                  )}
                </div>
                <span className="font-medium">{item.name}</span>
                {item.hasIndicator && (
                  <span className="ml-auto w-2 h-2 bg-cyan-500 rounded-full"></span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile-only section */}
          <div className="md:hidden mt-6 space-y-1">
            <button
              onClick={toggleMobileMenu}
              className="flex items-center justify-between w-full px-3 py-2.5 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span className="font-medium">Connections</span>
              </div>
              <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">
                {followers.length + following.length}
              </span>
            </button>

            {showMobileMenu && (
              <div className="ml-4 mt-2 space-y-1 border-l border-gray-800 pl-4">
                <Link
                  to={`/followers/${user?.id}`}
                  className="flex items-center justify-between px-3 py-2 text-gray-300 hover:text-cyan-400 rounded-lg transition-colors"
                  onClick={onToggle}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4" />
                    <span>Followers</span>
                  </div>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">
                    {followers.length}
                  </span>
                </Link>
                <Link
                  to={`/following/${user?.id}`}
                  className="flex items-center justify-between px-3 py-2 text-gray-300 hover:text-cyan-400 rounded-lg transition-colors"
                  onClick={onToggle}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" />
                    <span>Following</span>
                  </div>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-full">
                    {following.length}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Desktop Stats Section */}
        <div className="hidden md:block p-4 space-y-3 border-t border-gray-800">
          <div className="flex justify-between">
            <Link
              to={`/followers/${user?.id}`}
              className="flex-1 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors text-center"
            >
              <p className="text-lg font-semibold text-white">
                {followers.length}
              </p>
              <span className="text-xs text-gray-400">Followers</span>
            </Link>
            <div className="w-3"></div>
            <Link
              to={`/following/${user?.id}`}
              className="flex-1 p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors text-center"
            >
              <p className="text-lg font-semibold text-white">
                {following.length}
              </p>
              <span className="text-xs text-gray-400">Following</span>
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        {user && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={onToggle}
          className="fixed inset-0 bg-black md:hidden z-40 backdrop-blur-sm"
        />
      )}
    </>
  );
};

export default Sidebar;
