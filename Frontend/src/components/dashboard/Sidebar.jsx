import { createPageUrl } from "@/utils/index.js";
import { LayoutDashboard, BookOpen, Users, Video, User } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { label: "Courses", icon: BookOpen, page: "Courses" },
  { label: "Groups", icon: Users, page: "Groups" },
  { label: "Sessions", icon: Video, page: "Sessions" },
  { label: "Profile", icon: User, page: "Profile" },
];

export default function Sidebar({ currentPage, user }) {
  const initial = user?.full_name?.[0]?.toUpperCase() || "U";
  const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : null;

  return (
    <div className="w-[200px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="flex flex-col items-center py-6 border-b border-gray-100">
        <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-400 flex items-center justify-center text-2xl font-bold text-orange-500 mb-2">
          {initial}
        </div>
        <p className="font-semibold text-gray-800 text-sm">{user?.full_name || "User"}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{user?.role || "STUDENT"}</p>
        {memberSince && (
          <p className="text-xs text-gray-500 mt-1">Member Since {memberSince}</p>
        )}
      </div>
      <nav className="flex-1 py-4">
        {navItems.map(({ label, icon: Icon, page }) => {
          const active = currentPage === page;
          return (
            <a
              key={page}
              href={createPageUrl(page)}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}