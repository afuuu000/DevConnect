import sendEmail from "../services/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "No token received from frontend" });
    }

    console.log("🔹 Received Google Token:", token); // Debugging

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("🔹 Google Payload:", payload); // Debugging

    if (!payload) {
      return res.status(400).json({ error: "Invalid Google Token" });
    }

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({
      where: { email },
      attributes: [
        "id",
        "name",
        "email",
        "role",  // ✅ Ensure we retrieve the role
        "avatar",
        "googleId",
      ],
    });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isVerified: true,
        role: "user",  // ✅ Set default role to "user"
      });
    }

    const authToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = user.toJSON();

    return res.status(200).json({
      token: authToken,
      user: userResponse,
    });
  } catch (error) {
    console.error("❌ Google Auth Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


// ✅ Register User & Send Verification Email
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "All fields (name, email, password) are required" });
    }

    // Prevent role assignment abuse (Only Super Admin can create admins)

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email already registered. Please login." });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log("User registered successfully:", user); // Debugging log

    // Generate Verification Token
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    console.log("Generated Verification Token:", verificationToken);

    // Send Verification Email
    const verificationLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    await sendEmail(email, "Verify Your Email", "verificationEmail", {
      name,
      verificationLink,
    });

    res.status(201).json({
      message:
        "User registered successfully. Check your email for verification.",
    });
  } catch (err) {
    console.error("Error in register function:", err);
    res.status(500).json({ error: "Error registering user." });
  }
};

const login = async (req, res) => {
  try {
    console.log("🔹 Received Login Request:", req.body); // Debugging

    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const { email, password } = req.body;
    console.log("📩 Extracted Email:", email, "🔑 Password:", password); // Debugging

    const user = await User.findOne({
      where: { email },
      attributes: ["id", "name", "email", "password", "role", "avatar"],
    });

    if (!user) {
      return res.status(400).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    };

    console.log("✅ Sending Response:", { token, user: userResponse });

    return res.status(200).json({ token, user: userResponse });
 // ✅ Ensure proper JSON response
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Server error. Try again later." });
  }
};



const verifyEmail = async (req, res) => {
  const { token } = req.params; // ✅ Extract token from URL
  try {
    console.log("📩 Received verification token:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      console.error("❌ User not found for email:", decoded.email);
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isVerified) {
      console.log("✅ User is already verified.");
      return res.json({
        success: true, // ✅ Add success flag
        message: "User already verified.",
        redirect: "/login",
      });
    }

    // Update verification status
    user.isVerified = true;
    await user.save();
    console.log("✅ User verification successful.");

    return res.json({
      success: true, // ✅ Ensure this is included
      message: "Email verified successfully!",
      redirect: "/login",
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    return res.status(400).json({
      success: false, // ✅ Ensure failure is properly flagged
      message: "Invalid or expired verification token.",
    });
  }
};


// Forgot Password Controller
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("Received forgot password request for:", email);

    // Find user using Sequelize
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("Email not registered:", email);
      return res.status(400).json({ message: "Your email is not registered" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "6h",
    });

    // Save reset token in database
    user.reset_token = token;
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Send reset password email
    await sendEmail(user.email, "Reset Your Password", "resetPassword", {
      resetLink,
      name: user.name || "User",
    });

    res.json({ message: "Password reset email sent. Check your inbox." });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  console.log("🔹 Received Reset Token:", token);

  if (!token) {
    console.error("❌ Token is missing!");
    return res.status(400).json({ message: "Token is missing" });
  }

  if (newPassword !== confirmPassword) {
    console.error("❌ Passwords do not match!");
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);

    const user = await User.findOne({ where: { reset_token: token } });

    if (!user) {
      console.error("❌ User not found with token:", token);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null; // Clear token after password reset
    await user.save();

    console.log("✅ Password changed successfully!");
    res.json({
      message: "Password successfully changed. Redirecting to login...",
    });
  } catch (error) {
    console.error("❌ Error verifying token:", error);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

export {
  googleAuth,
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
