import { LogOut } from "lucide-react";
import { createPageUrl } from "@/utils/index.js";

export default function TopBar({ user, extraContent }) {
  const handleLogout = () => {
    localStorage.removeItem("studyconnect_user");
    window.location.href = createPageUrl("Auth");
  };

  return (
    <div
      className="h-20 flex items-center justify-between px-6 relative overflow-hidden"
      style={{ background: "#f5f0eb" }}
    >
      <div className="flex items-center gap-3">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80"
          alt="banner"
          className="w-16 h-14 object-cover rounded"
        />
        <div>
          <div className="text-orange-600 font-serif italic text-sm">Study Group &</div>
          <div className="text-gray-900 font-black text-2xl tracking-tight uppercase">COLLABORATION</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {extraContent}
        <div className="flex items-center gap-3">
          {user?.profile_image_url ? (
            <img 
              src={user.profile_image_url} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-xs font-bold">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <span className="font-bold text-orange-500 tracking-widest text-sm uppercase">
            WELCOME, {user?.full_name?.split(" ")[0]?.toUpperCase() || "USER"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded text-sm tracking-wider transition"
        >
          <LogOut className="w-4 h-4" /> LOGOUT
        </button>
      </div>
    </div>
  );
}