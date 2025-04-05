import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from "./User.js";
import Post from "./Post.js";

const Comment = sequelize.define("Comment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
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

Comment.belongsTo(User, { foreignKey: "userId" });
Comment.belongsTo(Post, { foreignKey: "postId" });

export default Comment;
