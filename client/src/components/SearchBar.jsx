import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Hash, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        try {
          // Search for posts
          const postsResponse = await axios.get(
            `http://localhost:5000/api/posts/search?query=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Search for users
          const usersResponse = await axios.get(
            `http://localhost:5000/api/users/search?query=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          // Combine and format results
          const posts = (postsResponse.data || []).map((post) => ({
            type: "post",
            id: post.id,
            title: post.description?.substring(0, 60) + "...",
            description: post.User?.name || "Unknown User",
            avatar: post.User?.avatar,
          }));

          const users = (usersResponse.data || []).map((user) => ({
            type: "user",
            id: user.id,
            name: user.name,
            description: user.email,
            avatar: user.avatar,
          }));

          setResults([...users, ...posts]);
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSearch = (e) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleResultClick = (result) => {
    if (result.type === "user") {
      navigate(`/profile/${result.id}`);
    } else if (result.type === "post") {
      navigate(`/post/${result.id}`);
    }
    setIsFocused(false);
    clearSearch();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      setIsFocused(false);
      clearSearch();
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <motion.div
          initial={false}
          animate={{
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)" : "none",
          }}
          className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden transition-colors duration-300"
        >
          <div className="flex-1 flex items-center px-3 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              onFocus={() => setIsFocused(true)}
              className="ml-2 flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-500 text-sm"
              placeholder="Search users or posts..."
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  type="button"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </form>

      <AnimatePresence>
        {isFocused && (query || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute w-full mt-2 bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden z-50"
          >
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                />
                <span className="ml-2">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <motion.button
                    key={`${result.type}-${result.id || index}`}
                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-2 flex items-center gap-3 text-left transition-colors"
                  >
                    {result.type === "user" ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        <img
                          src={result.avatar || "/default-avatar.png"}
                          alt={result.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-gray-200 text-sm truncate">
                        {result.type === "user" ? result.name : result.title}
                      </div>
                      {result.description && (
                        <div className="text-xs text-gray-400 truncate">
                          {result.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-gray-400">
                No results found
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
