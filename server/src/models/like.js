import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from "./User.js";
import Post from "./Post.js";

const Like = sequelize.define("Like", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",
      key: "id",
    },
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Posts",
      key: "id",
    },
  },
}, {
  timestamps: true,
});

Like.belongsTo(User, { foreignKey: "userId" });
Like.belongsTo(Post, { foreignKey: "postId" });

export default Like;
