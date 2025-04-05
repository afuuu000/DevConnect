import { useState, useEffect } from "react";
import { Users, FileText, AlertTriangle, Activity } from "lucide-react";
import axios from "axios";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    pendingPosts: 0,
    reportedContent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const [usersRes, postsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/admin/posts/pending", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setStats({
          totalUsers: usersRes.data.length || 0,
          totalPosts: postsRes.data.length || 0,
          pendingPosts:
            postsRes.data.filter((post) => post.status === "pending").length ||
            0,
          reportedContent:
            postsRes.data.filter((post) => post.status === "reported").length ||
            0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className="bg-gray-800 rounded-lg shadow-md border border-gray-700 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${bgColor} mr-4`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">
              {title}
            </p>
            <p className="text-xl font-semibold text-white mt-1">
              {isLoading ? (
                <div className="h-6 w-12 bg-gray-700 rounded animate-pulse"></div>
              ) : (
                value
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Dashboard Overview
        </h1>
        <div className="flex items-center space-x-2 text-gray-400 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 text-xs">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="text-cyan-400"
          bgColor="bg-cyan-400/10"
        />
        <StatCard
          title="Total Posts"
          value={stats.totalPosts}
          icon={FileText}
          color="text-emerald-400"
          bgColor="bg-emerald-400/10"
        />
        <StatCard
          title="Pending Posts"
          value={stats.pendingPosts}
          icon={AlertTriangle}
          color="text-amber-400"
          bgColor="bg-amber-400/10"
        />
        <StatCard
          title="Reported Content"
          value={stats.reportedContent}
          icon={AlertTriangle}
          color="text-rose-400"
          bgColor="bg-rose-400/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-5 rounded-lg shadow-md border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Status</span>
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Storage</span>
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                Available
              </span>
            </div>
          </div>
        </div>

    
      </div>
    </div>
  );
};

export default AdminDashboard;
