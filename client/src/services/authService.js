import API from './api';
import axios from 'axios';
export const loginUser = async (data) => {
  try {
    const response = await API.post("/auth/login", data);
    console.log("📡 API Response from Backend:", response.data); // ✅ Log response
    return response.data;
  } catch (error) {
    console.error("❌ API Login Error:", error.response?.data || error);
    throw error;
  }
};





export const signup = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    if (!response.data || !response.data.id) {
      console.error("❌ Invalid profile data:", response.data);
      throw new Error("Invalid user profile received.");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching profile:", error.response?.data || error);
    return null;
  }
};


export const getUserById = async (userId) => {
  try {
    console.log(`📡 Fetching user with ID: ${userId}`);
    const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    console.log("✅ User Data:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching user by ID:", error.response?.data || error);
    return null;
  }
};




export const followUser = async (userId) => {
  try {
    console.log(`📡 Sending follow request for user: ${userId}`);

    const response = await axios.post(
      "http://localhost:5000/api/follows",  // ✅ FIX: Changed from `/api/follow` to `/api/follows`
      { userId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    console.log("✅ Follow success:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error following user:", error.response?.data || error);
    throw error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await axios.put("http://localhost:5000/api/users/profile", data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
};



