import Post from "../models/Post.js";
import User from "../models/User.js";
import Like from "../models/like.js";
import Comment from "../models/comment.js";
import Notification from "../models/notification.js"; // ✅ Import Notification Model
import { v2 as cloudinary } from "cloudinary";
import { Op } from "sequelize";
import { sendNotification } from "../server.js"; // ✅ Import WebSocket function

// ✅ Create a new post (Set Status as "Pending")
export const createPost = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: "Description is required." });
    }

    let images = [];
    let videoUrl = null;

    // ✅ Process multiple files without duplication
    if (req.files) {
      for (let file of req.files) {
        if (file.mimetype.startsWith("image")) {
          const uploaded = await cloudinary.uploader.upload(file.path);
          if (!images.includes(uploaded.secure_url)) {
            images.push(uploaded.secure_url);
          }
        }
      }
    }

    const newPost = await Post.create({
      description,
      images,
      videoUrl,
      userId: req.user.id,
      status: "pending", // ✅ Post goes into "pending" state
    });

    res
      .status(201)
      .json({ message: "Your post is under verification", post: newPost });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Fetch only approved posts for Explore
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: "approved" }, // ✅ Only approved posts
      include: {
        model: User,
        attributes: ["id", "name", "avatar"],
      },
      order: [["createdAt", "DESC"]], // Show newest posts first
    });

    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.findAll({
      where: {
        userId,
        status: "approved", // ✅ Only fetch approved posts
      },
      include: {
        model: User,
        attributes: ["id", "name", "avatar"],
      },
      order: [["createdAt", "DESC"]], // Show newest posts first
    });

    res.json(posts);
  } catch (error) {
    console.error("❌ Error fetching user posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Search posts by description and user name

export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log("🔍 Searching for:", query);

    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { description: { [Op.iLike]: `%${query}%` } }, // ✅ Search in descriptions
        ],
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "avatar"], // ✅ Ensure name & avatar are included
        },
      ],
    });

    console.log("✅ Found posts:", posts.length > 0 ? posts : "No results");
    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Error in searchPosts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id); // Find post

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId !== req.user.id) {
      // Only allow post owner to delete
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this post" });
    }

    await post.destroy(); // Delete the post

    res.json({ message: "Post deleted successfully!", postId: post.id }); // ✅ Send post ID back
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Toggle Like (Like/Unlike)
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if user already liked the post
    const existingLike = await Like.findOne({ where: { postId, userId } });

    if (existingLike) {
      await existingLike.destroy(); // Remove like
      const updatedCount = await Like.count({ where: { postId } }); // Get new count
      return res.json({
        message: "Like removed!",
        likeCount: updatedCount,
        likedByUser: false,
      });
    } else {
      await Like.create({ postId, userId }); // Add like
      const updatedCount = await Like.count({ where: { postId } }); // Get new count
      return res.json({
        message: "Post liked!",
        likeCount: updatedCount,
        likedByUser: true,
      });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Likes Count
export const getLikesCount = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id; // Get logged-in user ID

    const likeCount = await Like.count({ where: { postId } });

    const likedByUser = await Like.findOne({ where: { postId, userId } });

    res.json({ likeCount, likedByUser: !!likedByUser });
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Comment on Post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ error: "Comment cannot be empty!" });
    }

    // Create the comment
    const comment = await Comment.create({ postId, userId, text });

    // Get the user information to include in the response
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "avatar"],
    });

    // Add the user information to the comment
    const commentWithUser = {
      ...comment.toJSON(),
      User: user,
    };

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Comments for a Post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId },
      include: { model: User, attributes: ["id", "name", "avatar"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get Current User's Pending Posts
export const getUserPendingPosts = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;

    const pendingPosts = await Post.findAll({
      where: {
        userId,
        status: "pending", // Only fetch pending posts
      },
      include: {
        model: User,
        attributes: ["id", "name", "avatar"],
      },
      order: [["createdAt", "DESC"]], // Show newest posts first
    });

    res.json(pendingPosts);
  } catch (error) {
    console.error("❌ Error fetching user pending posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
