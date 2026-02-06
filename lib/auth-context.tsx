"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

// =============================================================================
// TYPES
// =============================================================================

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pendingInvitesCount: number;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPendingInvites: () => Promise<void>;
}

// =============================================================================
// CONTEXT
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingInvitesCount, setPendingInvitesCount] = useState(0);
  const router = useRouter();

  // Fetch pending invites count
  const refreshPendingInvites = useCallback(async () => {
    try {
      const response = await fetch("/api/trusted-circle/invites?type=received");
      if (response.ok) {
        const data = await response.json();
        setPendingInvitesCount(data.pendingCount || 0);
      }
    } catch {
      // Silently fail - pending invites is non-critical
    }
  }, []);

  // Fetch current user on mount
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Fetch pending invites when user is authenticated
        refreshPendingInvites();
      } else {
        setUser(null);
        setPendingInvitesCount(0);
      }
    } catch {
      setUser(null);
      setPendingInvitesCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [refreshPendingInvites]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // Fetch pending invites after login
        refreshPendingInvites();
        router.push("/dashboard");
        router.refresh();
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }, [router, refreshPendingInvites]);

  // Register
  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        // Fetch pending invites after registration (in case invited before signup)
        refreshPendingInvites();
        router.push("/dashboard");
        router.refresh();
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch {
      return { success: false, error: "Something went wrong. Please try again." };
    }
  }, [router, refreshPendingInvites]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setPendingInvitesCount(0);
      router.push("/");
      router.refresh();
    } catch {
      // Still clear local state even if API fails
      setUser(null);
      setPendingInvitesCount(0);
      router.push("/");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        pendingInvitesCount,
        login,
        register,
        logout,
        refreshUser,
        refreshPendingInvites,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

// Default values for when context is not available (during SSR/build)
const defaultAuthValue: AuthContextType = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  pendingInvitesCount: 0,
  login: async () => ({ success: false, error: "Not available" }),
  register: async () => ({ success: false, error: "Not available" }),
  logout: async () => {},
  refreshUser: async () => {},
  refreshPendingInvites: async () => {},
};

export function useAuth() {
  const context = useContext(AuthContext);
  // Return default values during SSR/build instead of throwing
  if (context === undefined) {
    return defaultAuthValue;
  }
  return context;
}
