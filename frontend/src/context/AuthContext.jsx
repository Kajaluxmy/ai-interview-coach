import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      if (response.data?.success && response.data?.user) {
        setUser(response.data.user);
        return response.data.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.warn("Logout error:", err.message);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
