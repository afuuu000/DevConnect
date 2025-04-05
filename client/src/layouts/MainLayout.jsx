import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn, slideInFromLeft } from "../utils/theme";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar with animation */}
      <AnimatePresence>
        <motion.div
          initial={isMobile ? { x: -250 } : false}
          animate={{ x: sidebarOpen ? 0 : -250 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed md:relative z-30"
        >
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Main content area */}
      <motion.div
        {...fadeIn}
        className="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      >
        {/* Navbar with animation */}
        <motion.div {...slideInFromLeft} className="z-20">
          <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </motion.div>

        {/* Main content with animation */}
        <motion.main
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </motion.main>
      </motion.div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
