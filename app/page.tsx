import Link from "next/link";
import { Utensils, Users, Clock, Truck } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Utensils className="h-16 w-16" />
            </div>
            <h1 className="text-5xl font-bold mb-4">NNGW Staff Canteen</h1>
            <p className="text-xl text-blue-100 mb-8">
              Order delicious meals delivered directly to your office desk
            </p>
            <Link href="/login">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200">
                Access Staff Portal
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Staff Only Access</h3>
            <p className="text-gray-600">Exclusively for NNGW employees with verified staff credentials</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Office Delivery</h3>
            <p className="text-gray-600">Free delivery straight to your office within the organization</p>
          </div>
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quick Service</h3>
            <p className="text-gray-600">Freshly prepared meals delivered in 30-45 minutes</p>
          </div>
        </div>
      </div>
    </div>
  );
}