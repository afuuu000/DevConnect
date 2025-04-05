import { useEffect, useState, useRef } from "react";
import { getProfile, updateProfile } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Loader2,
  Save,
  X,
  User,
  ArrowLeft,
  Mail,
  AtSign,
  Info,
} from "lucide-react";
import axios from "axios";

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

export default function EditProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await getProfile();
      setUser(userData);
      setName(userData.name || "");
      setBio(userData.bio || "");
      setUsername(userData.username || "");
      setAvatar(userData.avatar || "");
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to load profile. Please try again.",
      });
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "Image size should be less than 5MB",
      });
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Please select an image file",
      });
      return;
    }

    setFile(selectedFile);
    setAvatar(URL.createObjectURL(selectedFile));
  };

  const removeAvatar = () => {
    setFile(null);
    setAvatar(user?.avatar || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      let imageUrl = avatar;

      if (file) {
        const formData = new FormData();
        formData.append("image", file);

        const uploadResponse = await axios.post(
          "http://localhost:5000/api/users/upload-avatar",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        imageUrl = uploadResponse.data.imageUrl;
      }

      await axios.put(
        "http://localhost:5000/api/users/profile",
        {
          name,
          avatar: imageUrl,
          bio,
          username: username || undefined,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });

      // Update local storage user data
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            name,
            avatar: imageUrl,
            bio,
            username,
          })
        );
      }

      setTimeout(() => navigate(`/profile/${user.id}`), 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto bg-gray-900 text-white min-h-screen"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center gap-4">
        <button
          onClick={() => navigate(`/profile/${user.id}`)}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="p-6">
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 rounded-lg mb-6 ${
                message.type === "success"
                  ? "bg-green-900/30 text-green-400 border border-green-800"
                  : "bg-red-900/30 text-red-400 border border-red-800"
              }`}
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {avatar ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700">
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center border-4 border-gray-700 ${generateAvatarColor(
                    user.id
                  )}`}
                >
                  <span className="text-3xl font-bold text-white">
                    {getInitials(name || user.name)}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </motion.button>
                  {avatar && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={removeAvatar}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-400">
              Click to change profile picture
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                required
              />
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <AtSign className="w-4 h-4" /> Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white"
                placeholder="username (optional)"
              />
            </div>

            {/* Bio Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <Info className="w-4 h-4" /> Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white resize-none"
                rows={4}
                placeholder="Tell us about yourself (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
