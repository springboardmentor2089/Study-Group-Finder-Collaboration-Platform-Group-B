import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ProfileEdit from "../components/auth/ProfileEdit";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) {
      window.location.href = createPageUrl("Auth");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  const handleSaveProfile = (updatedData) => {
    // Update user in localStorage
    localStorage.setItem("studyconnect_user", JSON.stringify(updatedData));
    
    // Update user in users list
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const userIndex = users.findIndex(u => u.email === updatedData.email);
    if (userIndex !== -1) {
      users[userIndex] = updatedData;
      localStorage.setItem("studyconnect_users", JSON.stringify(users));
    }
    
    // Update local state
    setUser(updatedData);
    setShowEdit(false);
    
    // Show success message
    alert("Profile updated successfully!");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Profile" user={user} />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <button
                  onClick={() => setShowEdit(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Photo Section */}
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center">
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        alt="Profile" 
                        className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 mb-4"
                      />
                    ) : (
                      <div className="w-40 h-40 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center mb-4">
                        <span className="text-gray-500 text-5xl font-bold">
                          {user.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <h2 className="text-xl font-semibold text-gray-900 text-center">
                      {user.full_name}
                    </h2>
                    <p className="text-gray-600 text-center">{user.email}</p>
                  </div>
                </div>

                {/* Profile Information */}
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                          <p className="text-gray-900 font-medium">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-gray-900 font-medium">{user.full_name}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">University</label>
                          <p className="text-gray-900 font-medium">{user.university || "Not specified"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Passing Year</label>
                          <p className="text-gray-900 font-medium">{user.passing_year || "Not specified"}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Passing GPA</label>
                          <p className="text-gray-900 font-medium">{user.passing_gpa || "Not specified"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
                          <p className="text-gray-900 font-medium">
                            {user.created_at ? new Date(user.created_at).getFullYear() : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                          <p className="text-green-600 font-medium">Active</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showEdit && (
        <ProfileEdit
          user={user}
          onSave={handleSaveProfile}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
