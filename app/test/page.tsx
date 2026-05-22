"use client";

import { useState } from "react";

export default function SimpleTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    const results: any = {};
    
    // Test 1: Database
    try {
      const dbRes = await fetch('/api/test/db');
      results.database = await dbRes.json();
    } catch (e) {
      results.database = { error: "Database not connected" };
    }
    
    // Test 2: Admin Login
    try {
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: "admin@nngw.com", password: "Admin@123" })
      });
      results.login = await loginRes.json();
    } catch (e) {
      results.login = { error: "Login failed" };
    }
    
    setResult(results);
    setLoading(false);
  };

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const seedRes = await fetch('/api/admin/seed', { method: 'POST' });
      const data = await seedRes.json();
      setResult({ seed: data });
    } catch (e) {
      setResult({ seed: { error: "Seed failed" } });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Phase 2 Test Panel</h1>
      
      <div className="space-y-4">
        <button
          onClick={seedDatabase}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          {loading ? "Working..." : "1. Create Admin User (Click First!)"}
        </button>
        
        <button
          onClick={runAllTests}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          {loading ? "Testing..." : "2. Run All Tests"}
        </button>
      </div>
      
      {result && (
        <div className="mt-6">
          <h2 className="font-bold mb-3">Results:</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {/* Simple Pass/Fail Summary */}
          <div className="mt-4 p-4 rounded-lg bg-gray-50">
            <p className="font-bold mb-2">Summary:</p>
            {result.database?.success && <p>✅ Database: Connected</p>}
            {result.database?.error && <p>❌ Database: {result.database.error}</p>}
            
            {result.login?.data?.token && <p>✅ Login API: Working</p>}
            {result.login?.error && <p>❌ Login API: Failed</p>}
            
            {result.seed?.success && <p>✅ Database: Seeded with users</p>}
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-500">
        <p>After seeing ✅ all green, go to <strong>/login</strong> and use:</p>
        <p className="mt-2">Admin: admin@nngw.com / Admin@123</p>
        <p>Staff: NNGW1001 / staff123</p>
      </div>
    </div>
  );
}