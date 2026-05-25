"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2, X, Save, UserPlus, Loader2, AlertCircle } from "lucide-react";

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

export default function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    staffId: "",
    email: "",
    name: "",
    department: "",
    role: "staff",
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch staff members
  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/admin/staff");
      const data = await response.json();
      
      if (response.ok) {
        setStaff(data.staff);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch staff' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Add or Update staff
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError(null);
    
    try {
      const url = editingStaff 
        ? `/api/admin/staff/${editingStaff._id}`
        : "/api/admin/staff";
      
      const method = editingStaff ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: editingStaff ? 'Staff updated successfully!' : 'Staff added successfully!' 
        });
        setShowModal(false);
        setEditingStaff(null);
        setFormData({ staffId: "", email: "", name: "", department: "", role: "staff" });
        fetchStaff();
        
        if (!editingStaff && data.tempPassword) {
          setTimeout(() => {
            alert(`Staff added! Temporary password: ${data.tempPassword}`);
          }, 500);
        }
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        setModalError(data.error || 'Operation failed');
      }
    } catch (error) {
      setModalError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle staff status
  const toggleStatus = async (staffMember: Staff) => {
    const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/admin/staff/${staffMember._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...staffMember, status: newStatus }),
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: `Staff ${newStatus === 'active' ? 'activated' : 'deactivated'}` });
        fetchStaff();
        setTimeout(() => setMessage(null), 2000);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to update status' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  // Delete staff
  const deleteStaff = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        const response = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
        
        if (response.ok) {
          setMessage({ type: 'success', text: 'Staff deleted successfully' });
          fetchStaff();
          setTimeout(() => setMessage(null), 2000);
        } else {
          const data = await response.json();
          setMessage({ type: 'error', text: data.error });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to delete staff' });
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Loader2 className="inline-block h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-2">Loading staff members...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">Manage staff access to the canteen system</p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setModalError(null);
            setFormData({ staffId: "", email: "", name: "", department: "", role: "staff" });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <UserPlus className="h-5 w-5" />
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
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {member.staffId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {member.role}
                    </span>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(member)}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                        member.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {member.status}
                    </button>
                   </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingStaff(member);
                          setModalError(null);
                          setFormData({
                            staffId: member.staffId,
                            email: member.email,
                            name: member.name,
                            department: member.department || '',
                            role: member.role,
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteStaff(member._id, member.name)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                   </td>
                </td>
              ))}
            </tbody>
          </table>
        </div>
        
        {staff.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No staff members found. Click "Add Staff Member" to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Error inside modal */}
              {modalError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="e.g., NNGW1002"
                  disabled={!!editingStaff}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="john@nngw.com"
                  disabled={!!editingStaff}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Engineering, HR, Sales, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                      <span>{editingStaff ? 'Updating...' : 'Adding...'}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {editingStaff ? 'Update Staff' : 'Add Staff'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            {!editingStaff && (
              <div className="border-t border-gray-200 px-6 py-4">
                <p className="text-xs text-gray-500 text-center">
                  New staff will receive a temporary password: <strong className="text-blue-600">password123</strong>
                  <br />They can change it after first login.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}