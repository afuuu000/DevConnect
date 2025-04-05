import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // ✅ Ensure credentials (cookies/auth headers) are included
});

// ✅ Explicitly allow CORS headers (DO NOT add Access-Control-Allow-Credentials)
API.defaults.headers.post["Content-Type"] = "application/json";

// ✅ Add request interceptor to include token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't override Content-Type for multipart/form-data requests
    // This is important for file uploads to work properly
    if (
      config.headers["Content-Type"] === "multipart/form-data" ||
      config.data instanceof FormData
    ) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// ✅ Modify response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log("✅ API Response:", response.config.url, response.status);

    if (!response.data) {
      console.error("❌ Empty response received from API");
      throw new Error("No data received from backend");
    }
    return response.data; // Ensure only response.data is returned
  },
  (error) => {
    console.error(
      "❌ API Error:",
      error.response?.status,
      error.response?.data || error
    );

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.warn("🔒 Authentication error detected");
      // Only clear token if it's not a login/register endpoint
      if (!error.config.url.includes("/auth/")) {
        localStorage.removeItem("token");
        // We don't redirect here to avoid unexpected redirects
        // The component should handle the redirect based on the error
      }
    }

    return Promise.reject(error);
  }
);

export default API;

// ✅ Updated API functions with better error handling
export const registerUser = async (data) => {
  try {
    const response = await API.post("/auth/register", data);
    console.log("✅ User Registered:", response);
    return response;
  } catch (error) {
    console.error("❌ Registration Error:", error.response?.data || error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await API.post("/auth/login", credentials);

    if (!response.data || !response.data.token || !response.data.user) {
      throw new Error("Invalid API response: Missing user or token.");
    }

    return response.data; // Ensure returning the correct object
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await API.get(`/auth/verify/${token}`);
    console.log("✅ Email Verification Response:", response);
    return response;
  } catch (error) {
    console.error(
      "❌ Email Verification Error:",
      error.response?.data || error
    );
    throw error;
  }
};
