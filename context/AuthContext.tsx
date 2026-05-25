"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  staffId: string;
  email: string;
  name: string;
  department: string;
  role: "staff" | "admin";
  status: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: User | null;
  userRole: "staff" | "admin" | null;
  cartCount: number;
  login: (userData: User) => void;
  logout: () => void;
  updateCartCount: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"staff" | "admin" | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch user data from API
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserRole(data.user.role);
        setIsLoggedIn(true);
        return data.user;
      } else {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole(null);
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  };

  // Refresh user data (called after profile update)
  const refreshUser = async () => {
    const updatedUser = await fetchUser();
    if (updatedUser) {
      // Dispatch event to notify components
      window.dispatchEvent(new Event('userUpdated'));
    }
  };

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      updateCartCount();
      setIsLoading(false);
    };
    
    checkAuth();
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUser();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('userUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('userUpdated', handleProfileUpdate);
    };
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    setUserRole(userData.role);
    updateCartCount();
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      setUserRole(null);
      localStorage.removeItem("cart");
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isLoading,
      user,
      userRole,
      cartCount,
      login,
      logout,
      updateCartCount,
      refreshUser,
    }}>
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