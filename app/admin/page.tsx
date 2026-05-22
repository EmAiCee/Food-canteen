"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Search, Mail, UserCheck, Trash2, Edit2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Staff {
  _id: string;
  staffId: string;
  email: string;
  name: string;
  department: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userRole, user } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0
  });
  
  const [newStaff, setNewStaff] = useState({ 
    staffId: "", 
    email: "", 
    name: "", 
    department: "",
    role: "staff" 
  });

  // Check authentication and authorization
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push("/login");
      } else if (userRole !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [isLoading, isLoggedIn, userRole, router]);

  // Fetch staff from API
  const fetchStaff = async () => {
    if (!isLoggedIn || userRole !== "admin") return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/staff", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStaffList(data.staff);
      } else if (response.status === 401) {
        router.push("/login");
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch staff' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!isLoggedIn || userRole !== "admin") return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userRole === "admin") {
      fetchStaff();
      fetchStats();
    }
  }, [isLoggedIn, userRole]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading...</p>
      </div>
    );
  }

  // Redirect if not admin
  if (!isLoggedIn || userRole !== "admin") {
    return null;
  }

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add new staff
  const handleAddStaff = async () => {
    if (!newStaff.staffId || !newStaff.email || !newStaff.name) {
      setMessage({ type: 'error', text: 'Please fill all required fields' });
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStaff),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Staff added! Temporary password: password123` });
        setShowAddModal(false);
        setNewStaff({ staffId: "", email: "", name: "", department: "", role: "staff" });
        fetchStaff();
        fetchStats();
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add staff' });
    }
  };

  // Update staff
  const handleUpdateStaff = async () => {
    if (!editingStaff) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/staff/${editingStaff._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingStaff.name,
          department: editingStaff.department,
          role: editingStaff.role,
          status: editingStaff.status,
        }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Staff updated successfully' });
        setEditingStaff(null);
        fetchStaff();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update staff' });
    }
  };

  // Toggle staff status
  const toggleStaffStatus = async (staff: Staff) => {
    const newStatus = staff.status === "active" ? "inactive" : "active";
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/staff/${staff._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...staff,
          status: newStatus,
        }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}` });
        fetchStaff();
        fetchStats();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  // Delete staff
  const deleteStaff = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`/api/admin/staff/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          setMessage({ type: 'success', text: 'Staff deleted successfully' });
          fetchStaff();
          fetchStats();
        } else {
          const data = await response.json();
          setMessage({ type: 'error', text: data.error });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete staff' });
      }
    }
  };

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
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{staffList.length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Staff</p>
              <p className="text-3xl font-bold text-green-600">
                {staffList.filter((s) => s.status === "active").length}
              </p>
            </div>
            <UserCheck className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </div>
        <div className="card cursor-pointer hover:shadow-lg transition" onClick={() => router.push('/admin/orders')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Orders</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalOrders}</p>
            </div>
            <Mail className="h-10 w-10 text-orange-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Staff Management Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                <tr key={staff._id} className="hover:bg-gray-50">
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
                      onClick={() => toggleStaffStatus(staff)}
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
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteStaff(staff._id, staff.name)}
                        className="text-red-600 hover:text-red-800 transition"
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
          <div className="text-center py-8">
            <p className="text-gray-500">No staff members found</p>
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID *</label>
                <input
                  type="text"
                  value={newStaff.staffId}
                  onChange={(e) => setNewStaff({ ...newStaff, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., NNGW1004"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="john@nngw.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={newStaff.department}
                  onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="staff">Staff (Can order food)</option>
                  <option value="admin">Admin (Full access)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStaff}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Add Staff
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-500 text-center">
              New staff will get temporary password: <strong>password123</strong>
            </p>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Staff Member</h3>
              <button onClick={() => setEditingStaff(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff ID</label>
                <input
                  type="text"
                  value={editingStaff.staffId}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editingStaff.department}
                  onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({ ...editingStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateStaff}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Update Staff
              </button>
              <button
                onClick={() => setEditingStaff(null)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}