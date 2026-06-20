import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import api from "./api";
import type { User } from "./types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ requiresOtp: boolean; email?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Warmup ping — wakes Render free-tier before user tries to act
    fetch("/api/health").catch(() => {});
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        setUser(response.data as User);
      }
    } catch {
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.data) {
      const userData = response.data as User;
      setUser(userData);
      toast.success(`Welcome back, ${userData.name?.split(" ")[0]}! ✈️`);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.register(name, email, password);
    if ((response as { requiresOtp?: boolean }).requiresOtp) {
      return { requiresOtp: true, email };
    }
    if (response.success && response.data) {
      const userData = response.data as User;
      setUser(userData);
      toast.success(`Welcome to DHARAVU JOURNEYS, ${userData.name?.split(" ")[0]}! 🌍`);
    }
    return { requiresOtp: false };
  };

  const refreshUser = async () => {
    const response = await api.getMe();
    if (response.success && response.data) {
      setUser(response.data as User);
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    toast.success("You've been signed out. Safe travels! 👋");
  };

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  }) => {
    const response = await api.updateProfile(data);
    if (response.success && response.data) {
      setUser(response.data as User);
      toast.success("Profile updated successfully! ✅");
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin" || user?.role === "owner",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
