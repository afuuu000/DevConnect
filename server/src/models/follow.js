import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js";

const Follow = sequelize.define("Follow", {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "CASCADE",
  },
  followeeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "CASCADE",
  },
});

// Define the associations
User.hasMany(Follow, { foreignKey: "followerId", as: "Following" });
User.hasMany(Follow, { foreignKey: "followeeId", as: "Followers" });

Follow.belongsTo(User, { foreignKey: "followerId", as: "Follower" });
Follow.belongsTo(User, { foreignKey: "followeeId", as: "Followee" });

export default Follow;
