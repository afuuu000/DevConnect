import User from "../models/User.js";
import Post from "../models/Post.js";
import Notification from "../models/notification.js";
import bcrypt from "bcryptjs";
import { sendNotification } from "../server.js"; // Import WebSocket function


// ✅ Get all users
export const getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email", "avatar", "isVerified", "role"],
        where: { role: "user" }, // ✅ Exclude admins
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

// ✅ Create a user (Admin)
export const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: true, // Automatically verified
      role: role || "user", // Default role is "user"
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.destroy({ where: { id: userId } });
    res.json({ message: "User deleted successfully!" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Fetch pending posts for admin review
export const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: "pending" }, // ✅ Fetch only pending posts
      include: { model: User, attributes: ["name", "avatar"] },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching pending posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Approve Post
export const approvePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    post.status = "approved";
    await post.save();

    // ✅ Create a Notification
    await Notification.create({
      userId: post.userId,
      message: "Your post has been approved!",
      type: "post_approved",
    });

    // ✅ Send Real-time Notification via WebSocket
    sendNotification(post.userId, "Your post has been approved!");

    res.json({ message: "Post approved successfully", post });
  } catch (error) {
    console.error("❌ Error approving post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Reject Post
export const rejectPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    await post.destroy();

    // ✅ Create a Notification for Rejection
    await Notification.create({
      userId: post.userId,
      message: "Your post has been rejected!",
      type: "post_rejected",
    });

    // ✅ Send Real-time Notification via WebSocket
    sendNotification(post.userId, "Your post has been rejected!");

    res.json({ message: "Post rejected successfully" });
  } catch (error) {
    console.error("❌ Error rejecting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};