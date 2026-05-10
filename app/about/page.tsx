export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About NNGW Canteen</h1>
        
        <div className="prose prose-lg">
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <p className="text-lg text-gray-700">
              NNGW Canteen is a dedicated food service platform exclusively for NNGW staff members, 
              providing delicious, freshly prepared meals delivered directly to your office desk.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
          <p>
            To provide convenient, healthy, and delicious meal options for NNGW staff, 
              saving time and enhancing workplace satisfaction.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Why Choose Us?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Exclusive access for NNGW staff members</li>
            <li>Free delivery to your office within the organization</li>
            <li>Freshly prepared meals daily</li>
            <li>Quick delivery within 30-45 minutes</li>
            <li>Secure online ordering system</li>
            <li>Variety of menu options to suit all tastes</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">How It Works</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Admin registers staff members using their staff ID or email</li>
            <li>Staff members login with their credentials</li>
            <li>Browse the menu and add items to cart</li>
            <li>Place order with office location details</li>
            <li>Fresh meals delivered to your desk within 45 minutes</li>
          </ol>
        </div>
      </div>
    </div>
  );
}