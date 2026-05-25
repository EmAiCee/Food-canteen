import Link from "next/link";
import { Utensils, Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Utensils className="h-5 w-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">NNGW Canteen</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your trusted workplace canteen serving fresh, delicious meals to NNGW staff members.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition flex items-center gap-2">
                  <span>→</span> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition flex items-center gap-2">
                  <span>→</span> Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-400 transition flex items-center gap-2">
                  <span>→</span>  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-blue-400 mt-0.5" />
                <span>NNGW Headquarters, Main Building</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400" />
                <span>+234 (0) 123 456 7890</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400" />
                <span>canteen@nngw.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Monday - Friday:</span>
                <span className="text-white">8:00 AM - 5:00 PM</span>
              </li>
              {/* <li className="flex justify-between">
                <span>Saturday:</span>
                <span className="text-white">9:00 AM - 2:00 PM</span>
              </li> */}
              <li className="flex justify-between">
                <span>Weekend:</span>
                <span className="text-gray-500">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>© {currentYear} NNGW Canteen</span>
            <Heart className="h-3 w-3 text-red-500" />
            <span>All rights reserved</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-400 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}