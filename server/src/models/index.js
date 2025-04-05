import Sequelize from "sequelize";
import db from "../config/db.js";
import User from "./User.js";
import Post from "./Post.js";

// Initialize Sequelize
const sequelize = db;

// Define Associations ✅
User.hasMany(Post, { foreignKey: "userId", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "userId" });

// Add models to Sequelize
const models = {
  User,
  Post,  // ✅ Ensure Post is included
};

// Export Sequelize and models
export default { sequelize, Sequelize, ...models };
