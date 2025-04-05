// Updated App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { PostProvider } from "./context/PostContext";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import CreatePost from "./pages/CreatePost";
import Explore from "./pages/Explore";
import Notifications from "./pages/Notifications";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyPage from "./pages/VerifyPage";
import SearchResults from "./pages/SearchResults";
import axios from "axios";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import EditProfile from "./pages/EditProfile";
import FollowersPage from "./pages/FollowersPage";
import FollowingPage from "./pages/FollowingPage";
import AdminDashboard from "./pages/AdminDashboard";
import ManageUsers from "./pages/ManageUsers";
import ManagePosts from "./pages/ManagePosts";
import AdminLayout from "./components/AdminLayout";
import AuthLayout from "./components/AuthLayout";

function App() {
  const [googleClientId, setGoogleClientId] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/config/google").then((res) => {
      setGoogleClientId(res.data.googleClientId);
    });
  }, []);

  if (!googleClientId) return <div>Loading...</div>;

  return (
    <Router>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <PostProvider>
            <AnimatePresence>
              <Routes>
                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/" element={<Signup />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route path="/verify/:token" element={<VerifyPage />} />
                </Route>

                {/* Protected User Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route
                      path="/followers/:userId"
                      element={<FollowersPage />}
                    />
                    <Route
                      path="/following/:userId"
                      element={<FollowingPage />}
                    />
                    <Route path="/create-post" element={<CreatePost />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
                  </Route>
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="posts" element={<ManagePosts />} />
                  </Route>
                </Route>
              </Routes>
            </AnimatePresence>
          </PostProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
