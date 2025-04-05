import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "bio", "avatar"],
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Only update fields if they are provided
    user.name = name || user.name;
    user.bio = bio || user.bio;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    console.log(`📡 Fetching user with ID: ${req.params.userId}`);

    const user = await User.findByPk(req.params.userId, {
      attributes: ["id", "name", "email", "bio", "avatar"],
    });

    if (!user) {
      console.error(
        `❌ User with ID ${req.params.userId} not found in database.`
      );
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ Found User:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    console.log("🔍 Searching for users:", query);

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
        ],
        role: "user", // Only search for regular users
      },
      attributes: ["id", "name", "email", "avatar"],
      limit: 10,
    });

    console.log("✅ Found users:", users.length);
    res.json(users);
  } catch (error) {
    console.error("❌ Error searching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
