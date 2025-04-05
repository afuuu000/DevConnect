import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, reported

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/admin/posts/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Log the raw response to see the data structure
      console.log("API Response:", res.data);

      // Use the data as is without transformation
      setPosts(res.data);
    } catch (error) {
      console.error("❌ Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/posts/${postId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("❌ Error approving post:", error);
    }
  };

  const handleReject = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/posts/${postId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("❌ Error rejecting post:", error);
    }
  };

  const filteredPosts =
    filter === "all" ? posts : posts.filter((post) => post.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Manage Posts
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchPosts}
            className="flex items-center space-x-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Posts</option>
            <option value="pending">Pending Only</option>
            <option value="reported">Reported Only</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-300">No posts found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => {
            // Debug each post to see its structure
            console.log("Post data:", post);

            // Extract user name from the post data structure based on the actual data format
            const userName = post.User?.name || "Anonymous User";

            return (
              <div
                key={post.id}
                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col"
              >
                {post.images?.length > 0 ? (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-32 bg-gray-700 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No image</p>
                  </div>
                )}

                <div className="p-4 flex-1">
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-cyan-500 font-semibold mr-2">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {userName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {post.status === "reported" && (
                      <span className="ml-auto px-2 py-1 bg-rose-400/10 text-rose-400 rounded text-xs">
                        Reported
                      </span>
                    )}
                    {post.status === "pending" && (
                      <span className="ml-auto px-2 py-1 bg-amber-400/10 text-amber-400 rounded text-xs">
                        Pending
                      </span>
                    )}
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {post.description}
                  </p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(post.id)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(post.id)}
                      className="flex-1 flex items-center justify-center space-x-1 bg-rose-400/10 hover:bg-rose-400/20 text-rose-400 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
