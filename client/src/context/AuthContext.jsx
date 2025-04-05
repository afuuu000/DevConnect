import { createContext, useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom"; // ✅ Keep it here
import API from "../services/api";
import { loginUser } from "../services/api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      API.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`; // ✅ Set token for API requests
    }
  }, []);

  const login = async (formData) => {
    try {
      const response = await API.post("/auth/login", formData);
      console.log("🚀 Full API Response:", response); // Debugging
  
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid API response: User data is missing.");
      }
  
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      API.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
  
      return response;
    } catch (err) {
      console.error("❌ Login Error:", err.response?.data || err.message);
      throw err;
    }
  };
  
  
  
  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/"; // ✅ Use window.location for logout
  };

  const googleLogin = async (credentialResponse) => {
    try {
      console.log("🔹 Full Google Credential Response:", credentialResponse);
  
      if (!credentialResponse || !credentialResponse.credential) {
        throw new Error("❌ No Google token received from frontend.");
      }
  
      const token = credentialResponse.credential;
      console.log("🔹 Extracted Google Token:", token);
  
      const response = await API.post("/auth/google-auth", { token });
      console.log("✅ Full Backend Response:", response);
  
      if (!response.user || !response.token) {
        throw new Error("❌ No token or user received from backend.");
      }
  
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
  
      // ✅ Google login always redirects to explore
      navigate("/explore"); 
    } catch (error) {
      console.error("❌ Google Login Error:", error.message);
    }
  };
  
  

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
