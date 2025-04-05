import { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    console.log("❌ Access Denied: Not an admin", user);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;