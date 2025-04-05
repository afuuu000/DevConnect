import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, LogOut, X } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function AdminSidebar({ closeSidebar }) {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    {
      path: "/admin",
      name: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/admin/users",
      name: "Manage Users",
      icon: Users,
    },
    {
      path: "/admin/posts",
      name: "Manage Posts",
      icon: FileText,
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 border-r border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        <button
          onClick={closeSidebar}
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="px-2 space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/admin"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-700 text-cyan-400"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3  sm:block">{item.name}</span>
                {/* Mobile tooltip */}
                <span className="absolute left-14 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 sm:hidden">
                  {item.name}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="ml-3 hidden sm:block">Logout</span>
        </button>
      </div>
    </div>
  );
}
