import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Clock, FileQuestion, AlertCircle } from "lucide-react";
import axios from "axios";

export default function PendingPosts() {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingPosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await axios.get(
          "http://localhost:5000/api/posts/user/pending",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPendingPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching pending posts:", err);
        setError("Failed to load pending posts");
        setLoading(false);
      }
    };

    fetchPendingPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-cyan-400">
          Loading your pending posts...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-rose-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-3 mb-6">
        <FileQuestion className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Pending Posts</h1>
        <span className="ml-auto bg-amber-500/20 text-amber-400 text-sm px-3 py-1 rounded-full">
          {pendingPosts.length} post{pendingPosts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {pendingPosts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-800/50 rounded-lg p-8 text-center border border-gray-700"
        >
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-300 mb-2">
            No Pending Posts
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            You don't have any posts awaiting approval. When you create a new
            post, it will appear here until approved.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-amber-600/30 transition-colors"
            >
              {post.images && post.images.length > 0 && (
                <div className="aspect-w-16 aspect-h-9 h-40">
                  <img
                    src={post.images[0]}
                    alt="Post thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-center text-gray-400 text-xs mb-2">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    Posted{" "}
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span className="ml-auto px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">
                    Pending Approval
                  </span>
                </div>

                <p className="text-gray-300 text-sm mb-2 line-clamp-3">
                  {post.description || "No description"}
                </p>

                <div className="text-xs text-gray-500 italic mt-2">
                  An admin will review your post soon
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
