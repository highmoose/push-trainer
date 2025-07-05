import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "@/lib/axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify auth on mount
  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/user");
      console.log("Server verification successful:", res.data);
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.log(
        "Server verification failed:",
        err.response?.status,
        err.response?.data
      );

      // Clear invalid session data
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");

      setUser(null);
      setError(err.response?.data?.message || "Session invalid");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    // Optimistic update
    setLoading(true);
    setError(null);

    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/register", userData);

      // Set activity timestamp
      localStorage.setItem("lastActivity", Date.now().toString());

      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    // Optimistic update
    setLoading(true);
    setError(null);

    try {
      await api.get("/sanctum/csrf-cookie");
      const res = await api.post("/api/login", credentials);

      // Set activity timestamp
      localStorage.setItem("lastActivity", Date.now().toString());

      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // Optimistic update
    const previousUser = user;
    setUser(null);

    try {
      await api.post("/api/logout");

      // Clear session data
      localStorage.removeItem("user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("lastActivity");
    } catch (err) {
      // Rollback on error
      setUser(previousUser);
      setError(err.response?.data?.message || "Logout failed");
      throw err;
    }
  }, [user]);

  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return;

      // Optimistic update
      const previousUser = user;
      setUser({ ...user, ...updates });

      try {
        const res = await api.put("/api/user/profile", updates);
        setUser(res.data.user);
        setError(null);
        return res.data;
      } catch (err) {
        // Rollback on error
        setUser(previousUser);
        setError(err.response?.data?.message || "Profile update failed");
        throw err;
      }
    },
    [user]
  );

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    verifyAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
