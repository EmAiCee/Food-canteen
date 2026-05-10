"use client";

import { useState } from "react";
import { Users, Plus, Search, Mail, UserCheck, Trash2 } from "lucide-react";

// Mock staff data
const mockStaff = [
  { id: "1", staffId: "NNGW1001", email: "john.doe@nngw.com", name: "John Doe", department: "Engineering", status: "active" },
  { id: "2", staffId: "NNGW1002", email: "jane.smith@nngw.com", name: "Jane Smith", department: "HR", status: "active" },
  { id: "3", staffId: "NNGW1003", email: "mike.johnson@nngw.com", name: "Mike Johnson", department: "Sales", status: "inactive" },
];

export default function AdminDashboard() {
  const [staffList, setStaffList] = useState(mockStaff);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ staffId: "", email: "", name: "", department: "" });

  const filteredStaff = staffList.filter(
    (staff) =>
      staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStaff = () => {
    if (newStaff.staffId && newStaff.email && newStaff.name) {
      const newStaffMember = {
        id: Date.now().toString(),
        ...newStaff,
        status: "active",
      };
      setStaffList([...staffList, newStaffMember]);
      setShowAddModal(false);
      setNewStaff({ staffId: "", email: "", name: "", department: "" });
    }
  };

  const toggleStaffStatus = (id: string) => {
    setStaffList(
      staffList.map((staff) =>
        staff.id === id
          ? { ...staff, status: staff.status === "active" ? "inactive" : "active" }
          : staff
      )
    );
  };

  const deleteStaff = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaffList(staffList.filter((staff) => staff.id !== id));
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
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Today's Orders</p>
              <p className="text-3xl font-bold text-orange-600">24</p>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {staff.staffId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {staff.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {staff.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {staff.department || "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStaffStatus(staff.id)}
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {staff.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => deleteStaff(staff.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
            <h3 className="text-xl font-semibold mb-4">Add New Staff Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff ID *
                </label>
                <input
                  type="text"
                  value={newStaff.staffId}
                  onChange={(e) => setNewStaff({ ...newStaff, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g., NNGW1001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Engineering"
                />
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
          </div>
        </div>
      )}
    </div>
  );
}