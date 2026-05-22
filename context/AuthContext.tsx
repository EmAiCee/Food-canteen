"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateCartCount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"staff" | "admin" | null>(null);
  const [cartCount, setCartCount] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");
      const role = localStorage.getItem("userRole") as "staff" | "admin" | null;
      
      if (token && userData) {
        setIsLoggedIn(true);
        setUser(JSON.parse(userData));
        setUserRole(role);
      }
      
      updateCartCount();
      setIsLoading(false); // Mark loading as complete
    };
    
    checkAuth();
    
    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      const newToken = localStorage.getItem("authToken");
      const newUserData = localStorage.getItem("userData");
      const newRole = localStorage.getItem("userRole") as "staff" | "admin" | null;
      
      setIsLoggedIn(!!newToken);
      setUser(newUserData ? JSON.parse(newUserData) : null);
      setUserRole(newRole);
      updateCartCount();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);
  };

  const login = (token: string, userData: User) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("userRole", userData.role);
    
    setIsLoggedIn(true);
    setUser(userData);
    setUserRole(userData.role);
    updateCartCount();
    
    // Dispatch event for other components
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("storage"));
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    localStorage.removeItem("cart");
    
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
    setCartCount(0);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event("authChange"));
    window.dispatchEvent(new Event("storage"));
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