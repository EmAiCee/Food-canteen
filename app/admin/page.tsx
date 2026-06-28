"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, Mail, UserCheck, Trash2, Edit2, X, Loader2, TrendingUp, Clock, Package, DollarSign, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Staff {
  _id: string;
  staffId: string;
  email: string;
  name: string;
  department: string;
  role: string;
  status: string;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  readyOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  pendingPayment: number;
  totalCollected: number;
  cashPayments: number;
  cardPayments: number;
  paidOrdersCount: number;
  pendingPaymentCount: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    pendingPayment: 0,
    totalCollected: 0,
    cashPayments: 0,
    cardPayments: 0,
    paidOrdersCount: 0,
    pendingPaymentCount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [newStaff, setNewStaff] = useState({ 
    staffId: "", 
    email: "", 
    name: "", 
    department: "",
    role: "staff" 
  });

  // Auth check
  useEffect(() => {
    if (!isLoading && (!isLoggedIn || userRole !== "admin")) {
      router.push(isLoggedIn ? "/dashboard" : "/login");
    }
  }, [isLoading, isLoggedIn, userRole, router]);

  // Fetch staff
  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch staff' });
    }
  };

  // Fetch order statistics
  const fetchOrderStats = async () => {
    try {
      const res = await fetch("/api/admin/orders/stats");
      if (res.ok) {
        const data = await res.json();
        setOrderStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userRole === "admin") {
      fetchStaff();
      fetchOrderStats();
    }
  }, [isLoggedIn, userRole]);

  // Add staff
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStaff,
          staffId: newStaff.staffId.toUpperCase(),
          email: newStaff.email.toLowerCase()
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: `✅ Staff added! Login with password: ${data.tempPassword}` });
        setShowAddModal(false);
        setNewStaff({ staffId: "", email: "", name: "", department: "", role: "staff" });
        fetchStaff();
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add staff' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Update staff
  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    setSubmitting(true);
    
    try {
      const res = await fetch(`/api/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingStaff.name,
          department: editingStaff.department,
          role: editingStaff.role,
          status: editingStaff.status,
        }),
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Staff updated successfully' });
        setEditingStaff(null);
        fetchStaff();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Update failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Update failed' });
    }
    setSubmitting(false);
  };

  // Toggle status
  const toggleStatus = async (staff: Staff) => {
    const newStatus = staff.status === "active" ? "inactive" : "active";
    try {
      await fetch(`/api/admin/staff/${staff._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...staff, status: newStatus }),
      });
      fetchStaff();
      setMessage({ type: 'success', text: `Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}` });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Status update failed' });
    }
  };

  // Delete staff
  const deleteStaff = async (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Staff deleted' });
        fetchStaff();
        setTimeout(() => setMessage(null), 2000);
      }
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (!isLoggedIn || userRole !== "admin") return null;

  const filteredStaff = staffList.filter(s =>
    s.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage staff access and monitor orders</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Staff Member
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="font-bold">×</button>
          </div>
        </div>
      )}

      {/* Stats Cards - Staff Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Staff Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{staffList.length}</p>
              <p className="text-xs text-green-600 mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +{staffList.filter(s => s.status === "active").length} active
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        
        {/* Active Staff Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Active Staff</p>
              <p className="text-3xl font-bold text-green-600">
                {staffList.filter((s) => s.status === "active").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Out of {staffList.length} total
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-full">
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition cursor-pointer" onClick={() => router.push('/admin/orders')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{orderStats.totalOrders}</p>
              <p className="text-xs text-gray-500 mt-1">
                <Package className="inline h-3 w-3 mr-1" />
                All time orders
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-emerald-600">₦{orderStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                From {orderStats.deliveredOrders} delivered orders
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 mb-1">Pending Collection</p>
              <p className="text-2xl font-bold text-orange-800">₦{orderStats.pendingPayment.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-1">{orderStats.pendingPaymentCount} orders awaiting payment</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-green-800">₦{orderStats.totalCollected.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">{orderStats.paidOrdersCount} orders paid</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 mb-1">Cash Payments</p>
              <p className="text-xl font-bold text-blue-800">₦{orderStats.cashPayments.toLocaleString()}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 mb-1">Card Payments</p>
              <p className="text-xl font-bold text-purple-800">₦{orderStats.cardPayments.toLocaleString()}</p>
            </div>
            <CreditCard className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Order Status Cards - Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl p-4 cursor-pointer hover:bg-yellow-100 transition" onClick={() => router.push('/admin/orders?status=pending')}>
          <p className="text-xs text-yellow-700 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-800">{orderStats.pendingOrders}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 cursor-pointer hover:bg-blue-100 transition" onClick={() => router.push('/admin/orders?status=confirmed')}>
          <p className="text-xs text-blue-700 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-800">{orderStats.confirmedOrders}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 cursor-pointer hover:bg-purple-100 transition" onClick={() => router.push('/admin/orders?status=preparing')}>
          <p className="text-xs text-purple-700 mb-1">Preparing</p>
          <p className="text-2xl font-bold text-purple-800">{orderStats.preparingOrders}</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 cursor-pointer hover:bg-indigo-100 transition" onClick={() => router.push('/admin/orders?status=ready')}>
          <p className="text-xs text-indigo-700 mb-1">Ready</p>
          <p className="text-2xl font-bold text-indigo-800">{orderStats.readyOrders}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 cursor-pointer hover:bg-green-100 transition" onClick={() => router.push('/admin/orders?status=delivered')}>
          <p className="text-xs text-green-700 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-800">{orderStats.deliveredOrders}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 cursor-pointer hover:bg-red-100 transition" onClick={() => router.push('/admin/orders?status=cancelled')}>
          <p className="text-xs text-red-700 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-800">{orderStats.cancelledOrders}</p>
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{staff.staffId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{staff.department || "—"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      staff.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(staff)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold transition ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {staff.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStaff(staff)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteStaff(staff._id, staff.name)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No staff members found</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Add New Staff Member</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.staffId}
                  onChange={(e) => setNewStaff({ ...newStaff, staffId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g., NNGW1004"
                />
                <p className="text-xs text-gray-500 mt-1">Letters and numbers only</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="john@nngw.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Engineering"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="staff">Staff (Can order food)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    'Add Staff'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                New staff will get temporary password: <strong className="text-blue-600">password123</strong>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Edit Staff Member</h3>
                <button
                  onClick={() => setEditingStaff(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID
                </label>
                <input
                  type="text"
                  value={editingStaff.staffId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editingStaff.department || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Update Staff'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStaff(null)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}