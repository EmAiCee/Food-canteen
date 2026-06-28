"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Utensils, 
  ShoppingCart, 
  User, 
  Menu as MenuIcon, 
  X, 
  Home, 
  Info, 
  Phone, 
  LogIn,
  LogOut,
  ClipboardList,
  LayoutDashboard,
  Settings,
  ShoppingBag
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, userRole, cartCount, user, logout, refreshUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "");

  // Update display name when user changes
  useEffect(() => {
    setDisplayName(user?.name || "");
  }, [user]);

  // Listen for profile updates
  useEffect(() => {
    const handleUserUpdate = async () => {
      await refreshUser();
    };
    
    window.addEventListener('profileUpdated', handleUserUpdate);
    window.addEventListener('userUpdated', handleUserUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleUserUpdate);
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [refreshUser]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Public navigation (not logged in)
  const publicNavItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Phone },
  ];

  // Staff navigation (logged in as staff)
  const staffNavItems = [
    { href: "/dashboard", label: "Menu", icon: Utensils },
    { href: "/dashboard/orders", label: "My Orders", icon: ClipboardList },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  // Admin navigation (logged in as admin)
  const adminNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/staff", label: "Staff", icon: Settings },
    { href: "/admin/menu", label: "Menu", icon: Utensils },
    { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  ];

  // Determine which nav items to show based on role
  const getNavItems = () => {
    if (!isLoggedIn) return publicNavItems;
    if (userRole === "admin") return adminNavItems;
    return staffNavItems;
  };

  const navItems = getNavItems();

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (!isLoggedIn) return "/";
    if (userRole === "admin") return "/admin";
    return "/dashboard";
  };

  // Check if a path is active (handles nested routes)
  const isPathActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/admin") return pathname === "/admin";
    if (href === "/dashboard") return pathname === "/dashboard";
    // For nested routes like /admin/orders, check if pathname starts with href
    if (href !== "/" && href !== "/admin" && href !== "/dashboard") {
      return pathname?.startsWith(href);
    }
    return pathname === href;
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={getDashboardLink()} className="flex items-center space-x-2 group">
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
              const isActive = isPathActive(item.href);
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

            {/* Cart Icon - Only visible when logged in as staff - goes to checkout */}
            {isLoggedIn && userRole === "staff" && (
              <Link
                href="/dashboard/checkout"
                className="relative ml-2 p-2 rounded-lg hover:bg-gray-100 transition group"
              >
                <ShoppingBag className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* User Info & Auth Button */}
            {isLoggedIn ? (
              <div className="ml-4 flex items-center gap-3">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">{displayName || user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
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
                <span> Login</span>
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
              <MenuIcon className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = isPathActive(item.href);
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

              {/* Cart in mobile menu - Only for staff - goes to checkout */}
              {isLoggedIn && userRole === "staff" && (
                <Link
                  href="/dashboard/checkout"
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-50 transition"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="h-5 w-5 text-gray-600" />
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

            {/* User Info Footer */}
            {isLoggedIn && user && (
              <div className="mt-4 pt-4 border-t border-gray-200 px-4">
                <p className="text-sm font-medium text-gray-900">{displayName || user.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Logged in as {userRole === "admin" ? "Administrator" : "Staff Member"}
                </p>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}