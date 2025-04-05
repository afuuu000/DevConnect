import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import PostCard from "../components/PostCard";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);

      Promise.all([
        // Search for posts
        axios.get(
          `http://localhost:5000/api/posts/search?query=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        // Search for users
        axios.get(
          `http://localhost:5000/api/users/search?query=${encodeURIComponent(
            query
          )}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
      ])
        .then(([postsRes, usersRes]) => {
          setResults({
            posts: postsRes.data || [],
            users: usersRes.data || [],
          });
        })
        .catch((err) => {
          console.error("❌ Error fetching search results:", err);
          setError("Failed to fetch search results. Please try again.");
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  const hasResults = results.users.length > 0 || results.posts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 max-w-4xl mx-auto space-y-8"
    >
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Search Results for "{query}"
      </h1>

      {!hasResults && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No results found for your search.
        </div>
      )}

      {/* Users Section */}
      {results.users.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Users
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts Section */}
      {results.posts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
            Posts
          </h2>
          <div className="space-y-4">
            {results.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
