"use client";

import { useState } from "react";
import { ShoppingBag, Trash2, ArrowRight, Clock, MapPin } from "lucide-react";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";

// Mock cart items
const mockCartItems = [
  {
    id: 1,
    name: "Grilled Chicken with Rice",
    price: 850,
    quantity: 1,
  },
  {
    id: 2,
    name: "Chicken Shawarma Wrap",
    price: 550,
    quantity: 2,
  },
];

export default function OrdersPage() {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery within organization
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    // Simulate order placement
    setTimeout(() => {
      alert("Order placed successfully! Your meal will be delivered to your office.");
      setCartItems([]);
      setIsPlacingOrder(false);
    }, 1500);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card flex gap-4">
              <PlaceholderImage 
                text={item.name} 
                className="w-20 h-20 rounded-lg flex-shrink-0" 
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-blue-600 font-bold mt-1">
                  ₦{item.price.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <div className="flex items-center gap-1">
                  <span>Delivery Fee</span>
                  <span className="text-xs text-green-600">(Free to office)</span>
                </div>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-xl text-blue-600">₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span>Delivery to your office desk</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Estimated delivery: 30-45 minutes</span>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Location / Notes
              </label>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="e.g., Building B, 3rd floor, Room 304, Extension 1234"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps our delivery team find you faster
              </p>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By placing your order, you agree to our terms and conditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}