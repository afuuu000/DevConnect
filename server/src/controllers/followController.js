import Follow from "../models/Follow.js";
import Notification from "../models/notification.js";
import User from "../models/User.js";
import { sendNotification } from "../server.js"; // Import WebSocket function

// ✅ Follow User
export const followUser = async (req, res) => {
  try {
      const { userId } = req.body;

      if (!req.user || !req.user.id) {
          return res.status(401).json({ error: "Unauthorized" });
      }

      if (req.user.id === userId) {
          return res.status(400).json({ error: "You cannot follow yourself" });
      }

      const existingFollow = await Follow.findOne({
          where: { followerId: req.user.id, followeeId: userId },
      });

      if (existingFollow) {
          return res.status(400).json({ error: "Already following this user" });
      }

      await Follow.create({ followerId: req.user.id, followeeId: userId });

      // ✅ Get Follower User Info
      const follower = await User.findByPk(req.user.id, {
          attributes: ["id", "name"],
      });

      // ✅ Save Notification
      await Notification.create({
          type: "follow",
          message: `${follower.name} followed you.`,
          userId, // The user receiving the notification
      });

      // Emit WebSocket event
      req.io.emit("followUpdate", { userId, followerId: req.user.id, followerName: follower.name });

      res.status(200).json({ message: "User followed successfully" });
  } catch (error) {
      console.error("❌ Error following user:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


export const unfollowUser = async (req, res) => {
  try {
      const { userId } = req.params; // Get userId from URL params

      if (!req.user || !req.user.id) {
          return res.status(401).json({ error: "Unauthorized" });
      }

      const follow = await Follow.findOne({
          where: { followerId: req.user.id, followeeId: userId },
      });

      if (!follow) {
          return res.status(400).json({ error: "You are not following this user" });
      }

      await follow.destroy();
      res.status(200).json({ message: "User unfollowed successfully" });
  } catch (error) {
      console.error("❌ Error unfollowing user:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};



// ✅ Check if a user is following another user
export const checkFollowStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const existingFollow = await Follow.findOne({
            where: { followerId: req.user.id, followeeId: userId },
        });

        res.status(200).json({ isFollowing: !!existingFollow });
    } catch (error) {
        console.error("❌ Error checking follow status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Fetch Followers (users who follow you)
export const getFollowers = async (req, res) => {
  try {
      const { userId } = req.params;

      const followers = await Follow.findAll({
          where: { followeeId: userId }, // ✅ FIXED: Use requested user's ID
          include: { model: User, as: "Follower", attributes: ["id", "name", "avatar"] }
      });

      res.status(200).json(followers.map(f => f.Follower));
  } catch (error) {
      console.error("❌ Error fetching followers:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ Fetch Following (users you follow)
export const getFollowing = async (req, res) => {
  try {
      const { userId } = req.params;

      const following = await Follow.findAll({
          where: { followerId: userId }, // ✅ FIXED: Use requested user's ID
          include: { model: User, as: "Followee", attributes: ["id", "name", "avatar"] }
      });

      res.status(200).json(following.map(f => f.Followee));
  } catch (error) {
      console.error("❌ Error fetching following:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};

