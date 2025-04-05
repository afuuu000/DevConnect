import { useState, useRef, useEffect } from "react";
import { createPost } from "../services/postService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  X,
  Upload,
  Loader2,
  Send,
  ArrowLeft,
  Camera,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function CreatePost() {
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [description]);

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      media.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [media]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      addFiles(files);
    }
  };

  const addFiles = (files) => {
    // Clear any previous error messages
    if (message) {
      setMessage("");
      setMessageType("");
    }

    const validFiles = files.filter((file) => {
      const isValid = file.type.startsWith("image/");
      const isUnder5MB = file.size <= 5 * 1024 * 1024;

      if (!isValid) {
        setMessage("Only images are allowed");
        setMessageType("error");
      }
      if (!isUnder5MB) {
        setMessage("Files must be under 5MB");
        setMessageType("error");
      }

      return isValid && isUnder5MB;
    });

    if (validFiles.length > 0) {
      const filesWithPreview = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      // Limit to 10 images total
      const newMedia = [...media, ...filesWithPreview].slice(0, 10);
      setMedia(newMedia);

      // Show message if some files were dropped but not all were added
      if (files.length > validFiles.length) {
        setMessage(
          `${validFiles.length} of ${files.length} files were added. The rest were invalid or too large.`
        );
        setMessageType("warning");
      } else if (
        newMedia.length === 10 &&
        media.length + filesWithPreview.length > 10
      ) {
        setMessage("Maximum of 10 images reached. Some images were not added.");
        setMessageType("warning");
      }
    }
  };

  const removeFile = (index) => {
    setMedia((prevMedia) => {
      URL.revokeObjectURL(prevMedia[index].preview);
      return prevMedia.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim() && media.length === 0) {
      setMessage("Please add a description or images before posting.");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("description", description.trim());
    media.forEach(({ file }) => formData.append("files", file));

    try {
      const response = await createPost(formData);

      // Check if the response contains a verification message
      if (response.message && response.message.includes("verification")) {
        setIsVerificationSuccess(true);
        setMessage(response.message);
        setMessageType("success");

        // Show verification message for 3 seconds before redirecting to home
        setTimeout(() => navigate("/explore"), 3000);
      } else {
        // Regular success message
        setMessage(response.message || "Post created successfully!");
        setMessageType("success");

        // Show success message for 2 seconds before redirecting
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (error) {
      console.error("Error creating post:", error);

      // Check if it's an authentication error
      if (error.message && error.message.includes("log in")) {
        setMessage("Authentication required. Redirecting to login...");
        setMessageType("error");

        // Redirect to login after showing the message
        setTimeout(() => navigate("/login"), 2000);
      } else {
        // Regular error handling
        setMessage(error.message || "Failed to create post.");
        setMessageType("error");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-4 md:p-6 text-white"
    >
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h1 className="text-xl font-bold">Create Post</h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            form="create-post-form"
            disabled={isSubmitting || isVerificationSuccess}
            className={`py-2 px-4 rounded-lg font-medium flex items-center gap-2 transition-colors ${
              isSubmitting || isVerificationSuccess
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Posting...
              </>
            ) : isVerificationSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Submitted
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Post
              </>
            )}
          </motion.button>
        </div>

        {/* Message Alert */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`px-4 py-3 border-b ${
                messageType === "success"
                  ? "bg-green-900/20 border-green-800/50 text-green-400"
                  : messageType === "warning"
                  ? "bg-yellow-900/20 border-yellow-800/50 text-yellow-400"
                  : "bg-rose-900/20 border-rose-800/50 text-rose-400"
              } flex items-center gap-2`}
            >
              {messageType === "success" ? (
                <CheckCircle2 size={16} />
              ) : messageType === "warning" ? (
                <AlertCircle size={16} />
              ) : (
                <X size={16} />
              )}
              <p className="text-sm">{message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content */}
        <form id="create-post-form" onSubmit={handleSubmit} className="p-4">
          <div className="space-y-6">
            {/* Text Input */}
            <textarea
              ref={textareaRef}
              placeholder="What's on your mind?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || isVerificationSuccess}
              className={`w-full p-4 bg-gray-700/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-white placeholder-gray-400 resize-none min-h-[120px] transition-all ${
                (isSubmitting || isVerificationSuccess) &&
                "opacity-70 cursor-not-allowed"
              }`}
            ></textarea>

            {/* Media Preview Grid */}
            {media.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.map(({ preview }, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-gray-700 bg-gray-700/50"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {!isSubmitting && !isVerificationSuccess && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute top-2 right-2 bg-gray-900/70 text-rose-400 p-1.5 rounded-full hover:bg-gray-900 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}

                {/* Add More Button (if less than 10 images) */}
                {media.length < 10 &&
                  !isSubmitting &&
                  !isVerificationSuccess && (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-900/10 transition-colors"
                    >
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-400">Add More</span>
                    </motion.div>
                  )}
              </div>
            )}

            {/* File Upload Area */}
            {media.length === 0 && !isVerificationSuccess && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isSubmitting
                    ? "border-gray-600 bg-gray-800/50 opacity-50 cursor-not-allowed"
                    : dragActive
                    ? "border-blue-500 bg-blue-900/10"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-300 mb-2">
                  Drag and drop your images here, or{" "}
                  <button
                    type="button"
                    onClick={() =>
                      !isSubmitting && fileInputRef.current?.click()
                    }
                    disabled={isSubmitting}
                    className={`text-blue-400 hover:text-blue-300 font-medium transition-colors ${
                      isSubmitting && "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    browse
                  </button>
                </p>
                <p className="text-sm text-gray-500">
                  Support for images up to 5MB (maximum 10 images)
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
