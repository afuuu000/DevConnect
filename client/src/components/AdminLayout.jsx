import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const { user, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    console.log("✅ AdminLayout Mounted");
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    console.log("❌ Access Denied: Not an admin", user);
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        {/* Top bar */}
        <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center px-4 lg:px-6">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-white lg:hidden">
            Admin
          </h1>
          <div className="ml-auto flex items-center">
            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-2">{user?.name}</span>
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-cyan-500 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
