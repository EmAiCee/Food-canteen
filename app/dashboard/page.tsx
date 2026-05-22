"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, ShoppingBag, Search, User } from "lucide-react";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { useAuth } from "@/context/AuthContext";

// Mock menu data
const menuItems = [
  {
    id: 1,
    name: "Grilled Chicken with Rice",
    description: "Juicy grilled chicken served with seasoned rice and vegetables",
    price: 850,
    category: "Main Course",
    available: true,
  },
  {
    id: 2,
    name: "Beef Burger Combo",
    description: "100% beef patty with cheese, lettuce, tomato, and fries",
    price: 750,
    category: "Fast Food",
    available: true,
  },
  {
    id: 3,
    name: "Vegetable Pasta",
    description: "Penne pasta with fresh vegetables in creamy Alfredo sauce",
    price: 650,
    category: "Vegetarian",
    available: true,
  },
  {
    id: 4,
    name: "Chicken Shawarma Wrap",
    description: "Marinated chicken with garlic sauce and vegetables",
    price: 550,
    category: "Fast Food",
    available: true,
  },
  {
    id: 5,
    name: "Jollof Rice with Fish",
    description: "Spicy jollof rice served with grilled tilapia",
    price: 950,
    category: "Main Course",
    available: true,
  },
  {
    id: 6,
    name: "Fruit Salad Bowl",
    description: "Fresh mixed fruits with honey yogurt dressing",
    price: 400,
    category: "Dessert",
    available: true,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading, user, updateCartCount } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState("");

  const categories = ["All", "Main Course", "Fast Food", "Vegetarian", "Dessert"];

  // Wait for auth to load before checking login status
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  // Load cart count and total on component mount
  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      setCartCount(count);
      setCartTotal(total);
    };
    
    updateCart();
    
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: typeof menuItems[0]) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex((cartItem: any) => cartItem.id === item.id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        description: item.description
      });
    }
    
    localStorage.setItem("cart", JSON.stringify(existingCart));
    
    const newCount = existingCart.reduce((sum: number, i: any) => sum + i.quantity, 0);
    const newTotal = existingCart.reduce((sum: number, i: any) => sum + (i.price * i.quantity), 0);
    setCartCount(newCount);
    setCartTotal(newTotal);
    setLastAddedItem(item.name);
    
    updateCartCount();
    window.dispatchEvent(new Event("cartUpdated"));
    
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 2000);
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Simple Welcome Bar */}
      <div className="bg-blue-50 rounded-lg p-3 mb-6 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600" />
        <span className="text-gray-700">
          Welcome back, <span className="font-semibold">{user?.name?.split(' ')[0] || "Staff"}!</span>
        </span>
      </div>

      {/* Cart Bar */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Your Cart</h3>
              <p className="text-sm text-gray-500">
                {cartCount === 0 ? "No items added yet" : `${cartCount} item(s) in cart`}
              </p>
            </div>
          </div>
          
          {cartCount > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">₦{cartTotal.toLocaleString()}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>View Cart & Checkout</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              Add items from the menu below
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">NNGW Canteen</h1>
            <p className="text-blue-100 mb-4">
              Order delicious meals delivered to your office
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Delivery: 30-45 mins</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4" />
                <span>Free delivery</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-white/5 rounded-l-full"></div>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <PlaceholderImage text={item.name} className="w-full h-48 rounded-lg mb-4" />
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {item.category}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-2xl font-bold text-blue-600">
                ₦{item.price.toLocaleString()}
              </span>
              <button
                onClick={() => addToCart(item)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-1 hover:scale-105"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-500 mb-2">No menu items found</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Cart Notification */}
      {showCartNotification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-bounce z-50 flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          <span>{lastAddedItem} added to cart!</span>
        </div>
      )}
    </div>
  );
}