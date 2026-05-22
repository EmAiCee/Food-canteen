"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Building, 
  Shield, 
  Key, 
  Save, 
  X,
  Edit2,
  LogOut,
  CheckCircle
} from "lucide-react";

interface UserData {
  id: string;
  staffId: string;
  email: string;
  name: string;
  department: string;
  role: string;
  status: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    department: "",
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updating, setUpdating] = useState(false);

  // Load user data
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("userData");
    
    if (!token || !user) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(user);
    setUserData(parsedUser);
    setEditForm({
      name: parsedUser.name || "",
      department: parsedUser.department || "",
    });
    setLoading(false);
  }, [router]);

  // Update profile
  const handleUpdateProfile = async () => {
    setUpdating(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update local storage
        const updatedUser = { ...userData, ...editForm };
        localStorage.setItem("userData", JSON.stringify(updatedUser));
        setUserData(updatedUser);
        
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
        
        // Refresh after 1 second
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    
    setUpdating(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setShowPasswordModal(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Message Alert */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-blue-100 mt-1">View and manage your account information</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-8">
          {/* Profile Picture Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <User className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          
          {/* User Info Display Mode */}
          {!editing ? (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                  <p className="text-lg font-semibold text-gray-900">{userData?.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Staff ID</label>
                  <p className="text-lg font-semibold text-gray-900">{userData?.staffId}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Email Address</label>
                  <p className="text-lg text-gray-900">{userData?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Department</label>
                  <p className="text-lg text-gray-900">{userData?.department || "Not specified"}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    {userData?.role === "admin" ? "Administrator" : "Staff Member"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </button>
                
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  <Key className="h-4 w-4" />
                  Change Password
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            // Edit Mode
            <div className="space-y-6">
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="e.g., Engineering, HR, Sales"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {updating ? (
                      <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditForm({
                        name: userData?.name || "",
                        department: userData?.department || "",
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleChangePassword(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {updating ? "Changing..." : "Change Password"}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
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