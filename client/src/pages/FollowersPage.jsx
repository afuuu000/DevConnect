import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, ArrowLeft, Search, UserX } from "lucide-react";

// Helper function to generate avatar initials
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

// Helper function to generate a consistent color based on user ID
const generateAvatarColor = (userId) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];

  if (!userId) return colors[0];
  const index = parseInt(userId) % colors.length;
  return colors[index];
};

export default function FollowersPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchFollowers = async () => {
      setIsLoading(true);
      try {
        // Fetch user info to display username
        const userResponse = await fetch(
          `http://localhost:5000/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUsername(userData.name);
        }

        // Fetch followers
        const response = await fetch(
          `http://localhost:5000/api/follows/followers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch followers");

        const data = await response.json();
        setFollowers(data);
      } catch (error) {
        console.error("Error fetching followers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  // Filter followers based on search query
  const filteredFollowers = followers.filter((follower) =>
    follower.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto bg-gray-900 text-white min-h-screen"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <button
          onClick={() => navigate(`/profile/${userId}`)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Followers</h1>
          {username && (
            <p className="text-sm text-gray-400">People following {username}</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search followers"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
        </div>
      </div>

      {/* Followers List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex flex-col gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFollowers.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <UserX className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No followers match your search</p>
          </div>
        ) : filteredFollowers.length === 0 ? (
          <div className="text-center py-12">
            <UserX className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No followers yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFollowers.map((follower) => (
              <motion.div
                key={follower.id}
                whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }}
                className="p-3 rounded-lg transition-colors"
              >
                <Link
                  to={`/profile/${follower.id}`}
                  className="flex items-center gap-3"
                >
                  {follower.avatar ? (
                    <img
                      src={follower.avatar}
                      alt={`${follower.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover border border-gray-700"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${generateAvatarColor(
                        follower.id
                      )}`}
                    >
                      <span className="text-sm font-bold text-white">
                        {getInitials(follower.name)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">{follower.name}</h3>
                    {follower.username && (
                      <p className="text-sm text-gray-400">
                        @{follower.username}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
