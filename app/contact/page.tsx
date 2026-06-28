import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Contact Us</h1>
        <p className="text-center text-gray-600 mb-10">
          For inquiries about the canteen, reach out to us through any of the channels below.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Get in Touch</h2>
            
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Location</h3>
                <p className="text-gray-600 text-sm">NNGW Headquarters, Ground Floor</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Phone</h3>
                <p className="text-gray-600 text-sm">Ext: 1234</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email</h3>
                <p className="text-gray-600 text-sm">canteen@nngw.com</p>
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Operating Hours</h2>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-gray-600">Monday - Friday</span>
                <span className="font-medium text-gray-900">8:00 AM - 5:00 PM</span>
              </div>
              
              <div className="flex justify-between py-1 border-t">
                <span className="text-gray-600">Weekend</span>
                <span className="font-medium text-red-500">Closed</span>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 mt-3">
             <strong> <p className="text-xs text-gray-600 text-center">
                Last orders accepted 30 minutes before closing
              </p></strong>
            </div>
          </div>
        </div>

        {/* Simple Message */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            For immediate assistance, please visit the canteen or call extension 1234.
          </p>
        </div>
      </div>
    </div>
  );
}