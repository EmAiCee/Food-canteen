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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"staff" | "admin" | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Check auth status by calling /api/auth/me
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(true);
          setUser(data.user);
          setUserRole(data.user.role);
        } else {
          setIsLoggedIn(false);
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    updateCartCount();
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