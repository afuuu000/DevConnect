import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { formatDistanceToNow } from "date-fns"; // For time formatting
import {
  Heart,
  MessageCircle,
  Trash2,
  Share2,
  AlertTriangle,
} from "lucide-react";
import CommentSection from "./CommentSection";

export default function PostCard({ post, onDelete }) {
  const navigate = useNavigate();
  const { user: loggedInUser } = useContext(AuthContext);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5000/api/posts/${post.id}/likes`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLikes(Number(data.likeCount) || 0);
        setLiked(data.likedByUser);
      });

    fetch(`http://localhost:5000/api/posts/${post.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data));
  }, [post.id]);

  // ✅ Like/Unlike a post
  const handleLike = async () => {
    if (!loggedInUser) return alert("You must be logged in to like posts.");

    const response = await fetch(
      `http://localhost:5000/api/posts/${post.id}/like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) return alert("Error liking post.");

    const data = await response.json();

    setLikes(data.likeCount); // Update like count
    setLiked(data.likedByUser); // Update user like status
  };

  const handleAddComment = async (text) => {
    if (!loggedInUser) return alert("You must be logged in to comment.");
    if (!text.trim()) return alert("Comment cannot be empty.");

    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post.id}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) throw new Error("Error posting comment");

      const comment = await response.json();

      // Add user information to the comment for immediate display
      if (!comment.User) {
        comment.User = {
          id: loggedInUser.id,
          name: loggedInUser.name,
          avatar: loggedInUser.avatar,
        };
      }

      setComments([comment, ...comments]);
      return comment;
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData.message);
        throw new Error(errorData.message || "Error deleting comment");
      }

      // Update the comments state to remove the deleted comment
      setComments(comments.filter((c) => c.id !== commentId));
      console.log("✅ Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Could not delete comment: " + error.message);
    }
  };

  // ✅ Handle deleting a post
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/posts/${post.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete post");
      }

      console.log("✅ Post Deleted:", post.id);

      // ✅ Notify parent component about the deletion
      if (onDelete) {
        onDelete(post.id);
      }

      // Close the confirmation dialog
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("❌ Error deleting post:", error);
    }
  };

  // Get user's first letter for avatar fallback
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Generate a background color based on the user's name
  const getAvatarColor = (name) => {
    if (!name) return "bg-gray-700";

    // Simple hash function to generate a consistent color
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Generate a hue value between 0 and 360
    const hue = Math.abs(hash % 360);

    return `hsl(${hue}, 70%, 30%)`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden mb-4 max-w-xl mx-auto border border-gray-700/50"
    >
      {/* Post Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
            onClick={() => navigate(`/profile/${post.User?.id}`)}
          >
            {post.User?.avatar ? (
              <motion.img
                whileHover={{ scale: 1.1 }}
                src={post.User.avatar}
                alt={post.User?.name || "User"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.parentNode.classList.add(
                    getAvatarColor(post.User?.name)
                  );
                  e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold">${getInitial(
                    post.User?.name
                  )}</div>`;
                }}
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                  post.User?.name
                )}`}
              >
                {getInitial(post.User?.name)}
              </div>
            )}
          </div>
          <div>
            <h3
              className="font-semibold text-white hover:text-cyan-400 cursor-pointer transition-colors text-sm"
              onClick={() => navigate(`/profile/${post.User?.id}`)}
            >
              {post.User?.name}
            </h3>
            <p className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </div>

        {/* Delete button (shown directly if user owns the post) */}
        {loggedInUser?.id === post.User?.id && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowDeleteConfirm(true)}
            className="text-rose-400 hover:text-rose-300 p-1.5 rounded-full hover:bg-gray-700/50 transition-colors"
            title="Delete post"
          >
            <Trash2 size={16} />
          </motion.button>
        )}
      </div>

      {/* Post Content */}
      <div className="space-y-2">
        {/* Description */}
        {post.description && (
          <div className="px-3 pt-2">
            <p
              className={`text-gray-300 text-sm ${
                !isExpanded && post.description.length > 150
                  ? "line-clamp-2"
                  : ""
              }`}
            >
              {post.description}
            </p>
            {post.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-cyan-400 text-xs font-medium mt-1 transition-colors"
              >
                {isExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}

        {/* Media Carousel */}
        {post.images?.length > 0 && (
          <div className="overflow-hidden">
            <Slider
              dots
              infinite={false}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              className="post-slider"
              arrows={true}
              dotsClass="slick-dots custom-dots"
            >
              {post.images.map((image, index) => (
                <div key={index} className="aspect-w-16 aspect-h-9">
                  <img
                    src={image}
                    alt={`Post Image ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </Slider>
          </div>
        )}

        {/* Interactions */}
        <div className="px-3 py-2 flex items-center justify-between border-t border-gray-700/50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-700/50 transition-colors"
          >
            <Heart
              size={16}
              className={
                liked
                  ? "fill-rose-500 text-rose-500"
                  : "text-gray-300 hover:text-rose-400"
              }
            />
            <span
              className={`text-xs ${liked ? "text-rose-400" : "text-gray-400"}`}
            >
              {likes > 0 ? likes : "Like"}
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-2 py-1 rounded-full hover:bg-gray-700/50 transition-colors"
            onClick={() =>
              document.getElementById(`comment-input-${post.id}`)?.focus()
            }
          >
            <MessageCircle
              size={16}
              className="text-gray-300 hover:text-cyan-400"
            />
          </motion.button>
        </div>

        {/* Comments Section */}
        <CommentSection
          postId={post.id}
          comments={comments}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl p-4 z-50 w-[90%] max-w-sm"
            >
              <div className="flex items-center gap-2 mb-3 text-rose-500">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-bold">Delete Post</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to delete this post? This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-lg text-sm text-white transition-colors"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
