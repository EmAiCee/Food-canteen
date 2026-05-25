import Link from "next/link";
import { Utensils, Users, Clock, Footprints, Coffee, Soup, Pizza } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Utensils className="h-16 w-16" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              NNGW Staff Canteen
            </h1>
            <p className="text-xl text-blue-100 mb-2">
              Your Workplace Dining Solution
            </p>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Order delicious meals delivered directly to your office 
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make workplace dining convenient, fast, and delicious
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Only Access</h3>
            <p className="text-gray-600 text-sm">
              Exclusively for NNGW employees only
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-emerald-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Footprints className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Desk Delivery</h3>
            <p className="text-gray-600 text-sm">
              delivery right to your office 
            </p>
          </div>
          
          <div className="text-center p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Service</h3>
            <p className="text-gray-600 text-sm">
              Freshly prepared meals in 15-20 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">50+</div>
              <p className="text-gray-600 text-sm">Menu Items</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">15-20 min</div>
              <p className="text-gray-600 text-sm">Delivery Time</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
              <p className="text-gray-600 text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse menu featuring local Nigerian cuisine
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: "Swallow", icon: Soup, color: "bg-orange-100", iconColor: "text-orange-600" },
            { name: "Rice Dishes", icon: Utensils, color: "bg-yellow-100", iconColor: "text-yellow-600" },
            { name: "Fast Food", icon: Pizza, color: "bg-red-100", iconColor: "text-red-600" },
            { name: "Beverages", icon: Coffee, color: "bg-green-100", iconColor: "text-green-600" },
          ].map((category) => (
            <div key={category.name} className="text-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className={`${category.color} rounded-full p-3 w-14 h-14 mx-auto mb-3 flex items-center justify-center`}>
                <category.icon className={`h-7 w-7 ${category.iconColor}`} />
              </div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}