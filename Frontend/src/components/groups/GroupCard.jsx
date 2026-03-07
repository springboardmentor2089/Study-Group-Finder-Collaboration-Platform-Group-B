import { Trash2, Lock, Unlock, ArrowRight, UserPlus } from "lucide-react";

export default function GroupCard({ group, user, onDelete, onView, onRequestJoin }) {
  const memberCount = (group.members || []).length;
  const maxMembers = group.max_members || 100;
  const isOwner = group.owner_email === user?.email;
  const isMember = group.members?.some(m => m.email === user?.email);
  const isFull = memberCount >= maxMembers;

  // Check if user has already requested to join this group
  const hasRequested = () => {
    const notifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    return notifications.some(n => 
      n.type === 'group_join_request' && 
      n.sender_email === user?.email && 
      n.group_id === group.id &&
      !n.read
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">{group.name}</h3>
          {group.visibility === "Private"
            ? <Lock className="w-4 h-4 text-gray-400" />
            : <Unlock className="w-4 h-4 text-green-500" />
          }
        </div>
        {isOwner && (
          <button onClick={onDelete} className="text-red-400 hover:text-red-600 transition">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-2 py-0.5 rounded mb-2">
        {group.course}
      </span>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{group.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
          {memberCount}/{maxMembers}
        </div>
        {isMember ? (
          <button
            onClick={onView}
            className="flex items-center gap-1 bg-green-100 text-green-700 text-sm font-medium px-4 py-1.5 rounded transition"
          >
            Joined <ArrowRight className="w-3 h-3" />
          </button>
        ) : hasRequested() ? (
          <button
            disabled
            className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-sm font-medium px-4 py-1.5 rounded cursor-not-allowed"
          >
            Requested <UserPlus className="w-3 h-3" />
          </button>
        ) : isFull ? (
          <button
            disabled
            className="flex items-center gap-1 bg-gray-100 text-gray-400 text-sm font-medium px-4 py-1.5 rounded cursor-not-allowed"
          >
            Full
          </button>
        ) : (
          <button
            onClick={() => onRequestJoin(group)}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded transition"
          >
            <UserPlus className="w-3 h-3" /> Request to Join
          </button>
        )}
      </div>
    </div>
  );
}