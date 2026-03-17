import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authApi.getMe();
          setUser(response.data.data.user);
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login(email, password);
    const { token, user } = response.data.data;

    // Save token and user data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    return { token, user };
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    const { token, user } = response.data.data;

    // Save token and user data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
    return { token, user };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getMe();
      setUser(response.data.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
