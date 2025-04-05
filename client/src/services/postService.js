import axios from "axios";
import API from "./api";
const API_URL = "http://localhost:5000/api/posts";

export const createPost = async (postData) => {
  try {
    // Check for authentication
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication required. Please log in.");
    }

    // Use the API service which already handles token and proper headers
    const response = await API.post("/posts", postData);

    console.log("✅ Post created successfully:", response);
    return response;
  } catch (error) {
    console.error("❌ Error creating post:", error);

    // Check if it's an authentication error
    if (error.response?.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    // Return a structured error
    throw (
      error.response?.data || {
        message: error.message || "Failed to create post.",
      }
    );
  }
};

export const getPosts = async () => {
  return API.get("/posts").then((res) => res.data);
};

export async function getPostsByUser(userId) {
  try {
    const response = await fetch(
      `http://localhost:5000/api/posts/user/${userId}`
    );
    if (!response.ok) throw new Error("Failed to fetch posts");

    const data = await response.json();
    console.log("✅ Posts from API:", data);
    return data;
  } catch (error) {
    console.error("❌ Error fetching posts by user:", error);
    return [];
  }
}

// ✅ Search posts by query
export const searchPosts = async (query) => {
  return axios.get(`${API_URL}/search?query=${query}`).then((res) => res.data);
};

// ✅ Follow a user
export const followUser = async (userId) => {
  return axios.post(
    "http://localhost:5000/api/follow",
    { userId },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
};

// ✅ Fetch pending posts for admin review
export const getPendingPosts = async () => {
  return axios.get(`${API_URL}/pending`).then((res) => res.data);
};
