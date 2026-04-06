import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import GroupCard from "@/components/groups/GroupCard";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import GroupDetail from "@/components/groups/GroupDetail";
import InlineChat from "@/components/groups/InlineChat";
import ChatLayout from "@/components/groups/ChatLayout";
import { Plus, Search, BookOpen, Users } from "lucide-react";

const COURSES = ["All Courses", "CSE(AIML)", "CSE(DS)", "CSE(Cyber)", "ECE", "EEE", "Mechanical", "Civil", "IT", "MBA", "BBA"];

export default function Groups() {
  const { groupId: urlGroupId } = useParams();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [sizeFilter, setSizeFilter] = useState("All Sizes");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [tab, setTab] = useState("All Groups");
  const [showCreate, setShowCreate] = useState(false);
  const [viewGroupId, setViewGroupId] = useState(null);
  const [chatGroupId, setChatGroupId] = useState(null);
  const [showCourseGroupChat, setShowCourseGroupChat] = useState(false);
  const [autoOpenChat, setAutoOpenChat] = useState(false);
  const [openCourseGroupChat, setOpenCourseGroupChat] = useState(false);

  const loadGroups = () => {
    let allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    
    // Add mock groups if none exist and user is trying to open chat
    const params = new URLSearchParams(window.location.search);
    const openChatParam = params.get("openChat");
    
    if (allGroups.length === 0 && openChatParam === "true" && user) {
      console.log('Groups: No groups found, adding mock groups for chat');
      const mockGroups = [
        {
          id: "group_1",
          name: "Computer Science Study Group",
          course: "Computer Science Engineering",
          description: "Study group for CSE students",
          owner_email: user.email,
          owner_name: user.full_name,
          members: [{ name: user.full_name, email: user.email, role: "Owner" }],
          visibility: "public",
          created_at: new Date().toISOString()
        },
        {
          id: "group_2", 
          name: "AI/ML Study Group",
          course: "Artificial Intelligence & Machine Learning",
          description: "Study group for AI/ML enthusiasts",
          owner_email: user.email,
          owner_name: user.full_name,
          members: [{ name: user.full_name, email: user.email, role: "Owner" }],
          visibility: "public",
          created_at: new Date().toISOString()
        }
      ];
      
      localStorage.setItem("studyconnect_groups", JSON.stringify(mockGroups));
      allGroups = mockGroups;
      console.log('Groups: Mock groups added:', mockGroups);
    }
    
    setGroups(allGroups);
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this group?")) return;
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const filtered = allGroups.filter(g => g.id !== id);
    localStorage.setItem("studyconnect_groups", JSON.stringify(filtered));
    loadGroups();
  };

  const handleRequestJoin = (group) => {
    if (!user) return;

    console.log('Requesting to join group:', group.name);
    console.log('User email:', user.email);
    console.log('Group owner email:', group.owner_email);

    // Check if user is already a member
    if (group.members?.some(m => m.email === user.email)) {
      alert("You are already a member of this group!");
      return;
    }

    // Check if user has already requested
    const notifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const existingRequest = notifications.find(n => 
      n.type === 'group_join_request' &&
      n.sender_email === user.email &&
      n.group_id === group.id
    );
    
    if (existingRequest) {
      alert("Connection request already sent!");
      return;
    }

    // Create notification for group owner
    const notification = {
      id: Date.now(),
      type: 'group_join_request',
      sender_email: user.email,
      sender_name: user.full_name,
      group_id: group.id,
      group_name: group.name,
      message: `${user.full_name} wants to join your group`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    notifications.push(notification);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(notifications));
    alert("Join request sent to group owner!");
  };

  const handleCreate = (newGroup) => {
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    allGroups.push(newGroup);
    localStorage.setItem("studyconnect_groups", JSON.stringify(allGroups));
    setShowCreate(false);
    loadGroups();
  };

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));
    
    // Check URL params for direct group view or chat
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get("view");
    const openChatParam = params.get("openChat");
    const autoOpenChatParam = params.get("autoOpenChat");
    const openCourseGroupChatParam = params.get("openCourseGroupChat");
    
    if (viewParam) setViewGroupId(viewParam);
    
    // Handle auto-open chat parameter (for course chat icon)
    if (autoOpenChatParam === "true") {
      console.log('Groups: Auto-open chat parameter detected, setting autoOpenChat');
      setAutoOpenChat(true);
    }
    
    // Handle open course group chat parameter (for new course chat icon)
    if (openCourseGroupChatParam === "true") {
      console.log('Groups: Open course group chat parameter detected, setting openCourseGroupChat');
      setOpenCourseGroupChat(true);
    }
    
    if (openChatParam === "true") {
      console.log('Groups: Direct chat parameter detected, setting up chat');
      // Load groups first, then open chat with first available group
      loadGroups();
    }
    
    loadGroups();
  }, []);

  // Open direct chat when groups are loaded
  useEffect(() => {
    console.log('Groups: Checking for auto-open chat, groups:', groups.length, 'user:', !!user, 'chatGroupId:', chatGroupId, 'autoOpenChat:', autoOpenChat, 'openCourseGroupChat:', openCourseGroupChat);
    if (groups.length > 0 && user && !chatGroupId) {
      const params = new URLSearchParams(window.location.search);
      const openDirectChatParam = params.get("openDirectChat");
      const autoOpenChatParam = params.get("autoOpenChat");
      const openCourseGroupChatParam = params.get("openCourseGroupChat");
      
      // Handle direct chat parameter
      if (openDirectChatParam === "true") {
        console.log('Groups: Opening direct chat with first group');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
      
      // Handle auto-open chat parameter (for course chat icon)
      if (autoOpenChatParam === "true") {
        console.log('Groups: Auto-opening chat interface (second image)');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
      
      // Handle open course group chat parameter (for new course chat icon)
      if (openCourseGroupChatParam === "true") {
        console.log('Groups: Opening course group chat interface directly');
        setChatGroupId(groups[0].id);
        // Clear the parameter to prevent re-opening
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        return;
      }
    }
  }, [groups, user, chatGroupId, autoOpenChat, openCourseGroupChat]);

  const myGroups = groups.filter(g =>
    g.owner_email === user.email || (g.members || []).some(m => m.email === user.email)
  );

  const filtered = (tab === "My Groups" ? myGroups : groups).filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase());
    const matchCourse = courseFilter === "All Courses" || g.course === courseFilter;
    const matchVis = visibilityFilter === "All" || g.visibility === visibilityFilter;
    const size = (g.members || []).length;
    const matchSize = sizeFilter === "All Sizes" || 
      (sizeFilter === "Small (<10)" && size < 10) ||
      (sizeFilter === "Medium (10-20)" && size >= 10 && size <= 20) ||
      (sizeFilter === "Large (>20)" && size > 20);
    return matchSearch && matchCourse && matchVis && matchSize;
  });

  // Handle individual group view
  if (viewGroupId) {
    const group = groups.find(g => g.id === viewGroupId);
    if (group) return (
      <div className="min-h-screen bg-gray-50 font-sans">
        <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
        <InlineChat 
          group={group} 
          user={user} 
          onClose={() => setViewGroupId(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      
      {/* Show course group chat interface directly when openCourseGroupChat is true */}
      {openCourseGroupChat ? (
        <div className="min-h-screen bg-gray-50 font-sans">
          <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
          <ChatLayout 
            user={user} 
            groupId={chatGroupId}
            onClose={() => {
              setOpenCourseGroupChat(false);
              const newUrl = window.location.pathname;
              window.history.replaceState({}, '', newUrl);
            }}
          />
        </div>
      ) : autoOpenChat && chatGroupId ? (
        /* Show chat interface directly when auto-opening */
        <div className="min-h-screen bg-gray-50 font-sans">
          <TopBar user={user} extraContent={<ChatNotificationBar user={user} />} />
          <InlineChat 
            group={groups.find(g => g.id === chatGroupId)} 
            user={user} 
            onClose={() => setChatGroupId(null)}
          />
        </div>
      ) : (
        /* Show normal Groups page content */
        <div className="flex">
          <Sidebar currentPage="Groups" user={user} />
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
                <p className="text-gray-600">Connect with classmates and collaborate on projects</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCourseGroupChat(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded transition"
                >
                  <BookOpen className="w-4 h-4" /> Course Chat
                </button>
                <button
                  onClick={() => setChatGroupId("all")}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded transition"
                >
                  <Users className="w-4 h-4" /> Group Chat
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded transition"
                >
                  <Plus className="w-4 h-4" /> Create Group
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-5">Find or create groups to study together</p>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-5 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-[160px]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Search groups..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="text-sm outline-none flex-1"
                />
              </div>
              <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
                {["All Sizes", "Small (<10)", "Medium (10-20)", "Large (>20)"].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={visibilityFilter} onChange={e => setVisibilityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
                {["All", "Public", "Private"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {["All Groups", `My Groups (${myGroups.length})`, "Discover"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t.startsWith("My") ? "My Groups" : t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    (t === "All Groups" && tab === "All Groups") ||
                    (t.startsWith("My") && tab === "My Groups") ||
                    (t === "Discover" && tab === "Discover")
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Group Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map(g => (
                <GroupCard
                  key={g.id}
                  group={g}
                  user={user}
                  onDelete={() => handleDelete(g.id)}
                  onView={() => setViewGroupId(g.id)}
                  onRequestJoin={handleRequestJoin}
                  onChatClick={() => setChatGroupId(g.id)}
                />
              ))}
              {filtered.length === 0 && (
                <p className="text-gray-400 text-sm col-span-2">No groups found.</p>
              )}
            </div>
          </main>
        </div>
      )}
      
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
      
      {showCourseGroupChat && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
          <ChatLayout 
            user={user} 
            groupId={chatGroupId}
            onClose={() => setShowCourseGroupChat(false)} 
          />
        </div>
      )}
      
      {chatGroupId && !autoOpenChat && !openCourseGroupChat && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col h-screen">
          <ChatLayout 
            user={user} 
            onClose={() => setChatGroupId(null)} 
            groupId={chatGroupId}
          />
        </div>
      )}
      
      <ChatNotificationBar user={user} />
    </div>
  );
}
