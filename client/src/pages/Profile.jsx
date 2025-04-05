import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostsByUser } from "../services/postService";
import { getProfile, getUserById } from "../services/authService";
import { motion } from "framer-motion";
import PostCard from "../components/PostCard";
import socket from "../utils/socket";
import {
  User,
  Users,
  Settings,
  Grid,
  Image,
  MessageCircle,
  RefreshCw,
} from "lucide-react";

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
    "bg-gradient-to-br from-blue-500 to-blue-700",
    "bg-gradient-to-br from-purple-500 to-purple-700",
    "bg-gradient-to-br from-green-500 to-green-700",
    "bg-gradient-to-br from-yellow-500 to-yellow-700",
    "bg-gradient-to-br from-red-500 to-red-700",
    "bg-gradient-to-br from-pink-500 to-pink-700",
    "bg-gradient-to-br from-indigo-500 to-indigo-700",
    "bg-gradient-to-br from-teal-500 to-teal-700",
  ];

  if (!userId) return colors[0];

  // Ensure we have a string to work with
  const id = userId.toString();

  // Create a simple hash from the user ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Get a positive index
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function Profile() {
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define refreshProfile function early to avoid reference errors
  const refreshProfile = useCallback(() => {
    setRefreshing(true);

    // Force a complete refresh of the profile data
    setTimeout(() => {
      // Fetch the latest follower and following counts directly
      Promise.all([
        fetch(`http://localhost:5000/api/follows/followers/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        fetch(`http://localhost:5000/api/follows/following/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ])
        .then(([followersRes, followingRes]) =>
          Promise.all([followersRes.json(), followingRes.json()])
        )
        .then(([followers, following]) => {
          setStats((prev) => ({
            ...prev,
            followers: followers.length || 0,
            following: following.length || 0,
          }));
          console.log("✅ Refreshed counts:", {
            followers: followers.length,
            following: following.length,
          });
          setRefreshing(false);
        })
        .catch((err) => {
          console.error("Error refreshing profile:", err);
          setRefreshing(false);
        });
    }, 300);
  }, [userId]);

  // ✅ Redirect to own profile if userId is not provided
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!userId && storedUser?.id) {
      navigate(`/profile/${storedUser.id}`, { replace: true });
    }
  }, [userId, navigate]);

  // ✅ Fetch the Logged-in User
  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const profile = await getProfile();
        console.log("✅ Logged-in user fetched:", profile);
        setLoggedInUser(profile);
      } catch (error) {
        console.error("❌ Error fetching logged-in user:", error);
      }
    };
    fetchLoggedInUser();
  }, []);

  // ✅ Fetch Profile Data & Posts in Parallel
  useEffect(() => {
    if (!userId || userId === "undefined") return; // Prevent invalid fetches

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("🔍 Fetching data for userId:", userId);

        // Fetch the latest follower and following counts directly from the API
        const profileData = await getUserById(userId);
        const userPosts = await getPostsByUser(userId);

        // Fetch followers and following counts directly
        const followersResponse = await fetch(
          `http://localhost:5000/api/follows/followers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const followingResponse = await fetch(
          `http://localhost:5000/api/follows/following/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const followers = await followersResponse.json();
        const following = await followingResponse.json();

        if (!profileData) {
          console.error("❌ User not found!");
          return;
        }

        setUser(profileData);

        // Sort posts by creation date (newest first)
        const sortedPosts = userPosts
          ? [...userPosts].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            )
          : [];

        setPosts(sortedPosts);

        // Use the actual counts from the followers/following arrays
        setStats({
          posts: sortedPosts.length || 0,
          followers: followers.length || 0,
          following: following.length || 0,
        });

        console.log("✅ Fetched user:", profileData);
        console.log("✅ Fetched posts:", sortedPosts);
        console.log("✅ Fetched followers:", followers.length);
        console.log("✅ Fetched following:", following.length);
      } catch (error) {
        console.error("❌ Error fetching user profile or posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, refreshing]);

  // ✅ Real-time Follow/Unfollow updates
  useEffect(() => {
    const handleFollowUpdate = (data) => {
      console.log("📡 Socket follow update received:", data);

      // When someone follows/unfollows the profile we're viewing
      if (data.targetUserId === parseInt(userId)) {
        console.log(
          `📊 Updating followers count: ${data.isFollowing ? "+1" : "-1"}`
        );
        setStats((prev) => ({
          ...prev,
          followers: data.isFollowing ? prev.followers + 1 : prev.followers - 1,
        }));

        // Refresh the followers list to ensure accuracy
        if (loggedInUser && loggedInUser.id === parseInt(userId)) {
          refreshProfile();
        }
      }

      // When the profile we're viewing follows/unfollows someone else
      if (data.followerId === parseInt(userId)) {
        console.log(
          `📊 Updating following count: ${data.isFollowing ? "+1" : "-1"}`
        );
        setStats((prev) => ({
          ...prev,
          following: data.isFollowing ? prev.following + 1 : prev.following - 1,
        }));

        // Refresh the following list to ensure accuracy
        if (loggedInUser && loggedInUser.id === parseInt(userId)) {
          refreshProfile();
        }
      }

      // Update isFollowing state if the logged-in user is the one who followed/unfollowed
      if (
        loggedInUser &&
        data.followerId === loggedInUser.id &&
        data.targetUserId === parseInt(userId)
      ) {
        setIsFollowing(data.isFollowing);
      }
    };

    socket.on("followUpdate", handleFollowUpdate);

    // Clean up the socket listener when component unmounts
    return () => {
      socket.off("followUpdate", handleFollowUpdate);
    };
  }, [userId, loggedInUser, refreshProfile]);

  // ✅ Check if the user is following
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        if (!userId || !loggedInUser || loggedInUser.id === parseInt(userId))
          return;

        const response = await fetch(
          `http://localhost:5000/api/follows/status/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch follow status");

        const data = await response.json();
        setIsFollowing(data.isFollowing);
      } catch (error) {
        console.error("❌ Error checking follow status:", error);
      }
    };

    if (userId) {
      checkFollowStatus();
    }
  }, [userId, loggedInUser]);

  // ✅ Handle Follow/Unfollow with WebSockets
  const handleFollow = async () => {
    try {
      // Prevent multiple clicks
      if (isSubmitting) return;
      setIsSubmitting(true);

      // Store the current following state before making the request
      const wasFollowing = isFollowing;

      let url = `http://localhost:5000/api/follows`;
      let method = wasFollowing ? "DELETE" : "POST";

      if (wasFollowing) {
        url = `http://localhost:5000/api/follows/${userId}`;
      }

      // Update local state immediately for better UX (optimistic update)
      setIsFollowing(!wasFollowing);
      setStats((prev) => ({
        ...prev,
        followers: wasFollowing ? prev.followers - 1 : prev.followers + 1,
      }));

      // Make the API request
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: wasFollowing ? null : JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Follow request failed");
      }

      // Log the follow/unfollow action
      console.log(
        `${wasFollowing ? "👋 Unfollowed" : "👥 Followed"} user ${userId}`
      );

      // Emit socket event for real-time updates to other clients
      socket.emit("followAction", {
        followerId: loggedInUser.id,
        targetUserId: parseInt(userId),
        isFollowing: !wasFollowing,
      });

      // Force refresh the profile data after a short delay to ensure counts are accurate
      setTimeout(() => {
        refreshProfile();
      }, 1000);
    } catch (error) {
      console.error("❌ Error following/unfollowing user:", error);

      // Revert the optimistic UI update if the request failed
      setIsFollowing(isFollowing);
      setStats((prev) => ({
        ...prev,
        followers: isFollowing ? prev.followers : prev.followers - 1,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    // Update post count
    setStats((prev) => ({
      ...prev,
      posts: prev.posts - 1,
    }));
  };

  // ✅ Refresh profile when returning from edit profile page
  useEffect(() => {
    // Function to handle when the window regains focus
    const handleFocus = () => {
      console.log("🔄 Window focused, refreshing profile data");
      refreshProfile();
    };

    // Add event listener for when the window regains focus
    window.addEventListener("focus", handleFocus);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refreshProfile]);

  // ✅ Scroll to top when profile changes
  useEffect(() => {
    // Scroll to top when userId changes
    window.scrollTo(0, 0);
  }, [userId]);

  // ✅ Get the latest follower and following counts
  useEffect(() => {
    if (!userId || userId === "undefined" || isLoading) return;

    const fetchCounts = async () => {
      try {
        // Direct API call to get the latest counts
        const [followersRes, followingRes] = await Promise.all([
          fetch(`http://localhost:5000/api/follows/followers/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`http://localhost:5000/api/follows/following/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        const followers = await followersRes.json();
        const following = await followingRes.json();

        // Update the stats with the latest counts
        setStats((prev) => ({
          ...prev,
          followers: followers.length || 0,
          following: following.length || 0,
        }));

        console.log("✅ Updated follower/following counts:", {
          followers: followers.length,
          following: following.length,
        });
      } catch (error) {
        console.error("❌ Error fetching counts:", error);
      }
    };

    // Fetch counts immediately and then every 10 seconds
    fetchCounts();
    const intervalId = setInterval(fetchCounts, 10000);

    return () => clearInterval(intervalId);
  }, [userId, isLoading]);

  // ✅ Update followers and following counts when userId changes
  useEffect(() => {
    if (!userId || userId === "undefined") return;

    const updateCounts = async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          fetch(`http://localhost:5000/api/follows/followers/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
          fetch(`http://localhost:5000/api/follows/following/${userId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        const followers = await followersRes.json();
        const following = await followingRes.json();

        setStats((prev) => ({
          ...prev,
          followers: followers.length,
          following: following.length,
        }));

        console.log("🔄 Updated counts on userId change:", {
          followers: followers.length,
          following: following.length,
        });
      } catch (error) {
        console.error("❌ Error updating counts:", error);
      }
    };

    updateCounts();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-700 rounded-full mb-4"></div>
          <div className="h-6 w-40 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 w-60 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-gray-800 rounded-lg shadow-lg">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-300">User not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto bg-gray-900 text-white"
    >
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {user?.avatar ? (
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img
                  src={user.avatar}
                  alt={`${user.name}'s avatar`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Create fallback avatar with initials
                    const parent = e.target.parentNode;

                    // Clear the parent div
                    while (parent.firstChild) {
                      parent.removeChild(parent.firstChild);
                    }

                    // Add the gradient background
                    parent.className = `w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-lg ${generateAvatarColor(
                      user.id
                    )}`;

                    // Add the initials
                    const initialsSpan = document.createElement("span");
                    initialsSpan.className =
                      "text-2xl md:text-3xl font-bold text-white";
                    initialsSpan.textContent = getInitials(user.name);

                    parent.appendChild(initialsSpan);
                  }}
                />
              </div>
            ) : (
              <div
                className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center border-2 border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 ${generateAvatarColor(
                  user.id
                )}`}
              >
                <span className="text-2xl md:text-3xl font-bold text-white">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center md:justify-start">
                {/* ✅ Hide Follow Button if Viewing Own Profile */}
                {loggedInUser && loggedInUser.id !== user.id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isFollowing
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-blue-600 hover:bg-blue-500"
                    }`}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </motion.button>
                )}

                {/* ✅ Show Edit Profile Button if Viewing Own Profile */}
                {loggedInUser && loggedInUser.id === user.id && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/edit-profile")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}

                {/* Refresh Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshProfile}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                  title="Refresh profile data"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </motion.button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start gap-6 mb-4">
              <div className="text-center">
                <span className="font-bold text-lg">{stats.posts}</span>
                <p className="text-gray-400 text-sm">Posts</p>
              </div>
              <Link
                to={`/followers/${userId}`}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-lg">{stats.followers}</span>
                <p className="text-gray-400 text-sm">Followers</p>
              </Link>
              <Link
                to={`/following/${userId}`}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <span className="font-bold text-lg">{stats.following}</span>
                <p className="text-gray-400 text-sm">Following</p>
              </Link>
            </div>

            <p className="text-gray-300">{user?.bio || "No bio yet."}</p>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Grid className="w-5 h-5" /> Posts
          </h2>
        </div>

        {posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <Image className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 mb-2">No posts yet</p>
            {loggedInUser && loggedInUser.id === user.id && (
              <button
                onClick={() => navigate("/create-post")}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Post
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
