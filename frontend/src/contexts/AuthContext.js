import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "../utils/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to verify the token
  const verifyToken = useCallback(async (token) => {
    try {
      const response = await axios.get("/api/auth/verify");
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token verification failed:", error.response?.data || error.message);
      logout(); // Auto logout if token is invalid
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post("/api/auth/login", credentials);
      const { token, user } = response.data;

      // Store token & set headers
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
      setIsAuthenticated(true);
      return user; // Return user data for further use
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Login failed");
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Auto logout if the token is expired (Optional)
  const checkTokenExpiration = () => {
    const token = localStorage.getItem("token");
    if (!token) return logout();

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      if (decodedToken.exp * 1000 < Date.now()) {
        console.warn("Token expired. Logging out...");
        logout();
      }
    } catch (error) {
      console.error("Invalid token format:", error);
      logout();
    }
  };

  useEffect(() => {
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const value = { isAuthenticated, user, loading, login, logout };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
