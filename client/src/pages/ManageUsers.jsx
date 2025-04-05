import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  UserPlus,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error.response?.data || error);
      toast.error(error.response?.data?.error || "Unauthorized Access");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:5000/api/admin/users",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers([...users, response.data]);
      setShowCreateUser(false);
      setNewUser({ name: "", email: "", password: "", role: "user" });
      toast.success("User created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create user");
    }
  };

  const openDeleteModal = (id) => {
    setDeleteModal({ show: true, userId: id });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, userId: null });
  };

  const confirmDeleteUser = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(
        `http://localhost:5000/api/admin/users/${deleteModal.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(users.filter((user) => user.id !== deleteModal.userId));
      toast.success("User deleted successfully!");
      closeDeleteModal();
    } catch (err) {
      toast.error("Failed to delete user");
      closeDeleteModal();
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-gray-900/30">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center mb-4">
              <div className="p-2 rounded-full bg-rose-400/10 mr-3">
                <AlertTriangle className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={closeDeleteModal}
                className="ml-auto p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this user? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Manage Users
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowCreateUser(!showCreateUser)}
            className="flex items-center space-x-1 text-xs bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{showCreateUser ? "Cancel" : "Add User"}</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Create User Form */}
      {showCreateUser && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Create New User
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCreateUser}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition-colors"
            >
              Create User
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <p className="text-gray-300">No users found matching your search</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 text-left">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Role
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="bg-gray-800 hover:bg-gray-750">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-cyan-500 font-semibold mr-3">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400 sm:hidden">
                          {user.email}
                        </p>
                        <div className="flex items-center space-x-2 mt-1 sm:hidden">
                          <span
                            className={`px-1.5 py-0.5 text-xs rounded-full ${
                              user.role === "admin"
                                ? "bg-cyan-400/10 text-cyan-400"
                                : "bg-emerald-400/10 text-emerald-400"
                            }`}
                          >
                            {user.role}
                          </span>
                          {user.isVerified ? (
                            <span className="flex items-center text-emerald-400 text-xs">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center text-amber-400 text-xs">
                              <XCircle className="w-3 h-3 mr-0.5" />
                              Unverified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 hidden sm:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        user.role === "admin"
                          ? "bg-cyan-400/10 text-cyan-400"
                          : "bg-emerald-400/10 text-emerald-400"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {user.isVerified ? (
                      <span className="flex items-center text-emerald-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-400 text-sm">
                        <XCircle className="w-4 h-4 mr-1" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openDeleteModal(user.id)}
                      className="flex items-center text-rose-400 hover:text-rose-300 text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
