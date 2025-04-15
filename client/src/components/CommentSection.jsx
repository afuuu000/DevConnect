import { useState, useContext, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  Send,
  Trash2,
  MessageCircle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CommentSection({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
}) {
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const { user: loggedInUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const commentInputRef = useRef(null);
  const commentsContainerRef = useRef(null);

  // Sort comments by date (newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Get the top comment (most recent)
  const topComment = sortedComments[0];

  // Auto-scroll to bottom of comments when new ones are added
  useEffect(() => {
    if (showAllComments && commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop =
        commentsContainerRef.current.scrollHeight;
    }
  }, [comments.length, showAllComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = newComment.trim();

    if (!text) return;

    try {
      // Add the user's avatar and name to the comment before sending
      const commentWithUserInfo = await onAddComment(text);

      // Ensure the comment has the user's info for immediate display
      if (commentWithUserInfo && !commentWithUserInfo.User) {
        commentWithUserInfo.User = {
          id: loggedInUser.id,
          name: loggedInUser.name,
          avatar: loggedInUser.avatar,
        };
      }

      setNewComment("");
      // Show all comments after posting
      setShowAllComments(true);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleProfileClick = (userId) => {
    if (userId) {
      navigate(`/profile/${userId}`);
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

  const getAvatarPath = (comment) => {
    // If the comment has a User object with avatar, use that
    if (comment.User?.avatar) return comment.User.avatar;

    // If the comment has a direct avatar property, use that
    if (comment.avatar) return comment.avatar;

    // If the comment's userId matches the logged-in user, use their avatar
    if (loggedInUser && comment.userId === loggedInUser.id) {
      return loggedInUser.avatar;
    }

    // No avatar found
    return null;
  };

  const getUserName = (comment) => {
    // If the comment has a User object with name, use that
    if (comment.User?.name) return comment.User.name;

    // If the comment has a direct userName property, use that
    if (comment.userName) return comment.userName;

    // If the comment's userId matches the logged-in user, use their name
    if (loggedInUser && comment.userId === loggedInUser.id) {
      return loggedInUser.name;
    }

    // Fallback
    return "User";
  };

  const canDeleteComment = (comment) => {
    if (!loggedInUser) return false;

    // Check if user is the comment owner
    const commentUserId = comment.userId || comment.User?.id;
    return loggedInUser.id === commentUserId || loggedInUser.isAdmin;
  };

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
      setIsInputFocused(true);
    }
  };

  const toggleComments = () => {
    setShowAllComments(!showAllComments);
  };

  return (
    <div className="space-y-2 pt-1">
      {/* Collapsed View - Show only top comment */}
      {!showAllComments && (
        <div className="space-y-1 px-3">
          {topComment && (
            <div className="flex items-center">
              <span
                className="font-medium text-xs text-white hover:text-cyan-400 cursor-pointer transition-colors"
                onClick={() =>
                  handleProfileClick(topComment.userId || topComment.User?.id)
                }
              >
                {getUserName(topComment)}
              </span>
              <span className="text-gray-300 text-xs mx-1.5">
                {topComment.text}
              </span>
            </div>
          )}

          {/* Simplified text indicating comment count, clicking anywhere will expand comments */}
          {comments.length > 0 && (
            <div onClick={toggleComments} className="cursor-pointer">
              <span className="text-xs text-gray-400 hover:text-gray-300 transition-colors">
                {comments.length === 1
                  ? "View 1 comment"
                  : `View all ${comments.length} comments`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Expanded View - Show all comments */}
      <AnimatePresence>
        {showAllComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative"
          >
            <div className="px-3 py-1.5 border-b border-gray-700/30 flex justify-between items-center">
              <h3 className="font-medium text-sm text-white">
                Comments {comments.length > 0 && `(${comments.length})`}
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleComments}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full transition-colors"
              >
                <ChevronUp size={14} />
              </motion.button>
            </div>

            {/* Comments list */}
            <div
              ref={commentsContainerRef}
              className="space-y-3 max-h-60 overflow-y-auto px-3 pt-2 pb-1.5 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
              {sortedComments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6 bg-gray-800/20 rounded-lg"
                >
                  <MessageCircle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs">
                    No comments yet. Be the first to comment!
                  </p>
                </motion.div>
              ) : (
                sortedComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 group"
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() =>
                        handleProfileClick(comment.userId || comment.User?.id)
                      }
                      whileHover={{ scale: 1.05 }}
                    >
                      {getAvatarPath(comment) ? (
                        <img
                          src={getAvatarPath(comment)}
                          alt={`${getUserName(comment)}'s avatar`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.classList.add(
                              getAvatarColor(getUserName(comment))
                            );
                            e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold">${getInitial(
                              getUserName(comment)
                            )}</div>`;
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                            getUserName(comment)
                          )}`}
                        >
                          {getInitial(getUserName(comment))}
                        </div>
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <div className="bg-gray-800/60 rounded-lg p-2 relative group">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4
                              className="font-medium text-xs text-white hover:text-cyan-400 cursor-pointer transition-colors"
                              onClick={() =>
                                handleProfileClick(
                                  comment.userId || comment.User?.id
                                )
                              }
                            >
                              {getUserName(comment)}
                            </h4>
                            <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>

                        {/* Delete button - shown directly */}
                        {canDeleteComment(comment) && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDeleteComment(comment.id)}
                            className="absolute -top-1 -right-1 p-1 bg-gray-800 text-rose-400 hover:bg-rose-500/10 rounded-full transition-all shadow-md"
                            title="Delete comment"
                          >
                            <Trash2 size={12} />
                          </motion.button>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 ml-2 mt-0.5 inline-block">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Input */}
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-2 px-3 py-2 transition-all ${
          isInputFocused || showAllComments
            ? "bg-gray-800/30 border-t border-gray-700/30"
            : ""
        }`}
        id={`comment-form-${postId}`}
      >
        <div
          className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => handleProfileClick(loggedInUser?.id)}
        >
          {loggedInUser?.avatar ? (
            <img
              src={loggedInUser.avatar}
              alt="Your avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = "none";
                e.target.parentNode.classList.add(
                  getAvatarColor(loggedInUser?.name)
                );
                e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-white font-bold">${getInitial(
                  loggedInUser?.name
                )}</div>`;
              }}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center text-white font-bold ${getAvatarColor(
                loggedInUser?.name
              )}`}
            >
              {getInitial(loggedInUser?.name)}
            </div>
          )}
        </div>
        <div className="flex-1 flex items-center gap-1 bg-gray-800/60 rounded-full px-3 py-1">
          <input
            ref={commentInputRef}
            id={`comment-input-${postId}`}
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-xs focus:outline-none text-gray-100 placeholder-gray-500"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!newComment.trim()}
            className={`p-1 rounded-full transition-colors ${
              newComment.trim()
                ? "text-cyan-400 hover:bg-cyan-900/20"
                : "text-gray-600 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </motion.button>
        </div>
      </form>

      
    </div>
  );
}
