import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [peers, setPeers] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);

  const handleConnectPeer = (peer) => {
    // Check if already connected or pending
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const existingConnection = connections.find(
      c => (c.user_email === user.email && c.peer_email === peer.email) ||
           (c.peer_email === user.email && c.user_email === peer.email)
    );

    if (existingConnection) {
      if (existingConnection.status === 'pending') {
        alert("Connection request already sent!");
      } else if (existingConnection.status === 'accepted') {
        alert("Already connected with this peer!");
      }
      return;
    }

    // Create connection notification for peer
    const notifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    
    const connectionNotification = {
      id: Date.now().toString(),
      type: 'chat_message',
      sender_email: user.email,
      recipient_email: peer.email,
      message: `${user.full_name} wants to connect with you!`,
      created_at: new Date().toISOString(),
      read: false
    };

    notifications.push(connectionNotification);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(notifications));

    // Add to connected peers list as pending
    const newConnection = {
      id: Date.now().toString(),
      user_email: user.email,
      peer_email: peer.email,
      peer_name: peer.full_name,
      peer_university: peer.university,
      connected_at: new Date().toISOString(),
      status: 'pending' // pending, accepted, rejected
    };
    connections.push(newConnection);
    localStorage.setItem("studyconnect_connections", JSON.stringify(connections));

    // Update local state to show "Connecting..."
    setPeers(prev => prev.filter(p => p.email !== peer.email));
    loadConnectedPeers(user);

    // Show success message
    alert(`Connection request sent to ${peer.full_name}!`);
  };

  const handleDisconnectPeer = (peerEmail) => {
    if (confirm("Are you sure you want to disconnect from this peer?")) {
      // Remove from connections
      const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
      const updatedConnections = connections.filter(
        c => !(c.user_email === user.email && c.peer_email === peerEmail) &&
             !(c.peer_email === user.email && c.user_email === peerEmail)
      );
      localStorage.setItem("studyconnect_connections", JSON.stringify(updatedConnections));

      // Update local state
      setConnectedPeers(prev => prev.filter(p => p.peer_email !== peerEmail));

      // Show success message
      alert("Disconnected successfully!");
    }
  };

  const loadConnectedPeers = (u) => {
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const userConnections = connections.filter(
      c => (c.user_email === u.email || c.peer_email === u.email)
    );
    
    // Get peer details
    const allUsers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const connectedPeersList = userConnections.map(connection => {
      const peerEmail = connection.user_email === u.email ? connection.peer_email : connection.user_email;
      const peer = allUsers.find(user => user.email === peerEmail);
      return {
        ...connection,
        peer_email: peerEmail,
        peer_name: peer?.full_name || 'Unknown',
        peer_university: peer?.university || 'Unknown'
      };
    }).filter(p => p.peer_email !== u.email);

    // Remove duplicates by keeping only the latest connection for each peer
    const uniquePeers = connectedPeersList.reduce((acc, current) => {
      const existingIndex = acc.findIndex(p => p.peer_email === current.peer_email);
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        // Keep the one with more recent timestamp
        if (new Date(current.connected_at) > new Date(acc[existingIndex].connected_at)) {
          acc[existingIndex] = current;
        }
      }
      return acc;
    }, []);

    setConnectedPeers(uniquePeers);
  };

  const loadData = (u) => {
    // Get groups from localStorage
    const allGroups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const myGroups = allGroups.filter(g =>
      g.owner_email === u.email ||
      (g.members || []).some(m => m.email === u.email)
    );
    setGroups(myGroups.slice(0, 4));

    // Get users from localStorage
    const allUsers = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    
    // Filter out users who are already connected or pending
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const connectedOrPendingEmails = new Set();
    connections.forEach(c => {
      if (c.user_email === u.email || c.peer_email === u.email) {
        connectedOrPendingEmails.add(c.user_email === u.email ? c.peer_email : c.user_email);
      }
    });
    
    const suggested = allUsers.filter(p => 
      p.email !== u.email && !connectedOrPendingEmails.has(p.email)
    ).slice(0, 4);
    setPeers(suggested);

    // Load connected peers
    loadConnectedPeers(u);
  };

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) {
      window.location.href = createPageUrl("Auth");
      return;
    }
    const u = JSON.parse(stored);
    setUser(u);
    loadData(u);
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
                    <a
                      href={createPageUrl(`Groups?view=${g.id}`)}
                      className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded hover:bg-orange-600 transition"
                    >
                      ENTER
                    </a>
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

            {/* Suggested Peers */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Suggested Peers</h3>
              <div className="space-y-3">
                {peers.length === 0 && (
                  <p className="text-sm text-gray-400">No peers found.</p>
                )}
                {peers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold">
                        {p.full_name?.[0] || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{p.full_name}</p>
                        <p className="text-xs text-gray-400">{p.university || "University"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleConnectPeer(p)}
                      className="border border-orange-400 text-orange-500 text-xs font-bold px-4 py-1.5 rounded hover:bg-orange-50 transition"
                    >
                      CONNECT
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}