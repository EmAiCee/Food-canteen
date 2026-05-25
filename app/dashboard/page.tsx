"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, ShoppingBag, Search, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, user, updateCartCount } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState("");

  // Updated categories with Nigerian foods
  const categories = [
    "All", 
    "Swallow", 
    "Fast Food", 
    "Vegetarian", 
    "Rice Dishes", 
    "Soups & Stews",
    "Beverages", 
    "Desserts"
  ];

  // Fetch menu items from API
  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (response.ok) {
        setMenuItems(data.menuItems);
        setFilteredItems(data.menuItems);
      }
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart data
  const updateCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push("/login");
      return;
    }
    
    if (isLoggedIn) {
      fetchMenuItems();
      updateCart();
    }
  }, [isLoggedIn, authLoading, router]);

  // Filter items when search or category changes
  useEffect(() => {
    let filtered = menuItems;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    // Only show available items
    filtered = filtered.filter(item => item.available);
    
    setFilteredItems(filtered);
  }, [searchTerm, selectedCategory, menuItems]);

  const addToCart = (item: MenuItem) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItemIndex = existingCart.findIndex((cartItem: any) => cartItem.id === item._id);
    
    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        description: item.description,
        imageUrl: item.imageUrl
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
  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2">Loading menu...</p>
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
        <div className="bg-blue-100 p-1.5 rounded-full">
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </div>
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
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <p className="text-gray-500 mb-2">No menu items available</p>
            <p className="text-sm text-gray-400">
              {searchTerm || selectedCategory !== "All" 
                ? "Try adjusting your search or filter criteria" 
                : "Check back later for new items"}
            </p>
            {(searchTerm || selectedCategory !== "All") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item._id} className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Image with fallback */}
              <div className="relative w-full h-48 rounded-lg mb-4 overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white';
                        placeholder.innerHTML = `<span class="text-lg font-semibold">${item.name.substring(0, 20)}</span>`;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    <span className="text-lg font-semibold">{item.name.substring(0, 20)}</span>
                  </div>
                )}
              </div>
              
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