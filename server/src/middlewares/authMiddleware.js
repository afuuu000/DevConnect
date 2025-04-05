import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, { attributes: ["id", "name", "email", "role"] });

    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
