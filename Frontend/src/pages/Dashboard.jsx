import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import { Users } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [peers, setPeers] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);

  const handleCourseChatNavigation = () => {
    console.log('Dashboard: Course chat icon clicked, opening course group chat page directly');
    // Navigate to Groups page with course group chat trigger
    navigate('/Groups?openCourseGroupChat=true');
    console.log('Dashboard: Course chat navigation called');
  };

  const handleConnectPeer = (peer) => {
    // Check if already connected or pending
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const existingConnection = connections.find(
      c => (c.user_email === user.email && c.peer_email === peer.email) ||
           (c.peer_email === user.email && c.user_email === peer.email)
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        alert('Connection request already sent!');
      } else {
        alert('Already connected to this peer!');
      }
      return;
    }

    // Create connection request
    const connection = {
      id: Date.now().toString(),
      user_email: user.email,
      peer_email: peer.email,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Save connection
    const allConnections = [...connections, connection];
    localStorage.setItem("studyconnect_connections", JSON.stringify(allConnections));
    setConnectedPeers([...connectedPeers, { ...peer, status: 'pending' }]);

    alert('Connection request sent successfully!');
  };

  const handleDisconnectPeer = (peerEmail) => {
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const filteredConnections = connections.filter(
      c => !(c.user_email === user.email && c.peer_email === peerEmail) &&
           !(c.peer_email === user.email && c.user_email === peerEmail)
    );
    
    localStorage.setItem("studyconnect_connections", JSON.stringify(filteredConnections));
    
    // Update local state
    setConnectedPeers(connectedPeers.filter(p => p.email !== peerEmail));
  };

  useEffect(() => {
    // Load user data
    const userData = JSON.parse(localStorage.getItem("studyconnect_user"));
    if (userData) {
      setUser(userData);
    }

    // Load groups
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const userGroups = allGroups.filter(g => 
      g.owner_email === userData?.email || 
      (g.members || []).some(m => m.email === userData?.email)
    );
    setGroups(userGroups);

    // Load peers
    const allPeers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const otherPeers = allPeers.filter(p => p.email !== userData?.email);
    setPeers(otherPeers);

    // Load connections
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const userConnections = connections.filter(
      c => c.user_email === userData?.email || c.peer_email === userData?.email
    );
    
    const connected = userConnections.map(c => {
      const isUser = c.user_email === userData?.email;
      return {
        id: c.id,
        email: isUser ? c.peer_email : c.user_email,
        peer_name: isUser ? c.peer_name : c.user_name,
        peer_university: isUser ? c.peer_university : c.user_university,
        status: c.status
      };
    });
    setConnectedPeers(connected);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Dashboard" user={user} />
        
        <main className="flex-1 p-8">
          {/* My Courses */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
            <p className="text-sm text-gray-500 mt-1">Continue where you left off.</p>
            <p className="text-sm text-gray-600 mt-3">
              You haven't enrolled in any courses yet.{" "}
              <a href={createPageUrl("Courses")} className="text-orange-500 underline">
                Browse courses to enroll!
              </a>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Joined Groups */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Joined Groups</h3>
              <div className="space-y-3">
                {groups.length === 0 && (
                  <p className="text-sm text-gray-400">No groups joined yet.</p>
                )}
                {groups.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                        {g.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{g.name}</p>
                        <p className="text-xs text-gray-400">{(g.members || []).length} Active Members</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Peers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Connected Peers</h3>
              <div className="space-y-3">
                {connectedPeers.length === 0 && (
                  <p className="text-sm text-gray-400">No connected peers yet.</p>
                )}
                {connectedPeers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        p.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}>
                        {p.peer_name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{p.peer_name}</p>
                        <p className="text-xs text-gray-400">{p.peer_university || "University"}</p>
                        <p className="text-xs text-gray-500">
                          {p.status === 'pending' ? 'Connecting...' : 'Connected'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDisconnectPeer(p.peer_email)}
                      className="border border-red-400 text-red-500 text-xs font-bold px-4 py-1.5 rounded hover:bg-red-50 transition"
                    >
                      DISCONNECT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <ChatNotificationBar user={user} />
      
      {/* Floating Chat Buttons */}
            
      {/* Course Chat Button */}
      <button
        onClick={handleCourseChatNavigation}
        className="fixed bottom-20 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-4 shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl group"
        title="Open Group Chat"
      >
        <Users className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
        <span className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Group Chat
        </span>
      </button>
      
          </div>
  );
}
