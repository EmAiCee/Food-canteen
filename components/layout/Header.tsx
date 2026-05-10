"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Utensils, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Home, 
  Info, 
  Phone, 
  LogIn,
  LogOut,
  ClipboardList,
  LayoutDashboard
} from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userRole, setUserRole] = useState<"staff" | "admin" | null>(null);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      const role = localStorage.getItem("userRole") as "staff" | "admin" | null;
      setIsLoggedIn(!!token);
      setUserRole(role);
      
      // Get cart count from localStorage
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };

    checkAuth();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };
    
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  // Navigation items for different user types
  const publicNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  const staffNavItems = [
    { href: "/dashboard", label: "Menu", icon: Utensils },
    { href: "/dashboard/orders", label: "My Orders", icon: ClipboardList },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Admin Dashboard", icon: LayoutDashboard },
    { href: "/admin/staff", label: "Staff Management", icon: User },
    { href: "/admin/orders", label: "Order Management", icon: ClipboardList },
  ];

  // Determine which nav items to show
  const getNavItems = () => {
    if (!isLoggedIn) return publicNavItems;
    if (userRole === "admin") return [...staffNavItems, ...adminNavItems];
    return staffNavItems;
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:bg-blue-700 transition">
              <Utensils className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900">NNGW Canteen</span>
              <span className="hidden md:inline-block text-xs text-gray-500 ml-2">
                Staff Food Service
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                              (item.href !== "/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-600 bg-blue-50 font-medium"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Cart Icon - Always visible when logged in */}
            {isLoggedIn && (
              <Link
                href="/dashboard/orders"
                className="relative ml-2 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="ml-4 flex items-center space-x-1 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className={`ml-4 flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                  pathname === "/login"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Staff Login</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

              {/* Cart in mobile menu */}
              {isLoggedIn && (
                <Link
                  href="/dashboard/orders"
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {cartCount} items
                    </span>
                  )}
                </Link>
              )}

              {/* Auth Button in mobile menu */}
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  <span className="font-medium">Staff Login</span>
                </Link>
              )}
            </div>

            {/* Staff Info Footer */}
            {isLoggedIn && (
              <div className="mt-4 pt-4 border-t border-gray-200 px-4">
                <p className="text-xs text-gray-500">
                  Logged in as NNGW Staff Member
                </p>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}