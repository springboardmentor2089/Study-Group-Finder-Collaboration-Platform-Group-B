import { useState, useEffect } from "react";
import { Bell, X, Check, X as XIcon, User, Users, MessageCircle } from "lucide-react";

export default function NotificationBar({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    
    // Load notifications from localStorage
    const loadNotifications = () => {
      const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      console.log('All notifications in storage:', stored);
      
      const userNotifications = stored.filter(n => n.recipient_email === user.email);
      console.log('Notifications for user', user.email, ':', userNotifications);
      
      setNotifications(userNotifications);
      
      // Calculate unread count
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      console.log('Unread count:', unread);
    };

    // Initial load
    loadNotifications();

    // Set up interval to check for new notifications every 2 seconds
    const interval = setInterval(loadNotifications, 2000);

    return () => clearInterval(interval);
  }, [user]);

  // Mark individual notification as read when clicked
  useEffect(() => {
    // This effect is removed - we don't want to mark all as read automatically
  }, [isOpen, notifications]);

  const markAsRead = (notificationId) => {
    const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updated = stored.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updated));
    
    // Update local state
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const deleteNotification = (notificationId) => {
    const stored = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
    const updated = stored.filter(n => n.id !== notificationId);
    localStorage.setItem("studyconnect_notifications", JSON.stringify(updated));
    
    // Update local state
    const notification = notifications.find(n => n.id === notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'group_join_request':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'group_join_accepted':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'group_join_rejected':
        return <XIcon className="w-5 h-5 text-red-500" />;
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case 'group_join_request':
        return 'Group Join Request';
      case 'group_join_accepted':
        return 'Request Accepted';
      case 'group_join_rejected':
        return 'Request Rejected';
      case 'chat_message':
        return 'New Message';
      default:
        return 'Notification';
    }
  };

  const handleJoinRequestResponse = (notificationId, groupId, requesterEmail, action) => {
    // Get group details
    const groups = JSON.parse(localStorage.getItem("studyconnect_groups") || "[]");
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;

    // Get requester details
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const requester = users.find(u => u.email === requesterEmail);

    if (action === 'accept') {
      // Add member to group
      const updatedGroup = {
        ...group,
        members: [
          ...(group.members || []),
          { 
            email: requesterEmail, 
            name: requester?.full_name || 'Unknown User',
            joined_at: new Date().toISOString(),
            role: 'Member'
          }
        ]
      };
      
      // Update group in localStorage
      const updatedGroups = groups.map(g => g.id === groupId ? updatedGroup : g);
      localStorage.setItem("studyconnect_groups", JSON.stringify(updatedGroups));

      // Send acceptance notification to requester
      const acceptanceNotification = {
        id: Date.now().toString(),
        type: 'group_join_accepted',
        sender_email: user.email,
        recipient_email: requesterEmail,
        group_id: groupId,
        group_name: group.name,
        message: `Your request to join "${group.name}" has been accepted! You are now a member of the group.`,
        created_at: new Date().toISOString(),
        read: false
      };

      const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      allNotifications.push(acceptanceNotification);
      localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

      // Show success message to owner
      alert(`${requester?.full_name || 'User'} has been added to "${group.name}" successfully!`);
      
    } else {
      // Send rejection notification to requester
      const rejectionNotification = {
        id: Date.now().toString(),
        type: 'group_join_rejected',
        sender_email: user.email,
        recipient_email: requesterEmail,
        group_id: groupId,
        group_name: group.name,
        message: `Your request to join "${group.name}" has been rejected by the group owner.`,
        created_at: new Date().toISOString(),
        read: false
      };

      const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
      allNotifications.push(rejectionNotification);
      localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

      // Show confirmation to owner
      alert(`Request from ${requester?.full_name || 'User'} has been rejected.`);
    }

    // Remove the original request notification
    deleteNotification(notificationId);
    
    // Close dropdown
    setIsOpen(false);
  };

  const handleConnectionResponse = (notificationId, senderEmail, action) => {
    // Get sender details
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    const sender = users.find(u => u.email === senderEmail);

    // Update connection status
    const connections = JSON.parse(localStorage.getItem("studyconnect_connections") || "[]");
    const connectionIndex = connections.findIndex(
      c => c.user_email === senderEmail && c.peer_email === user.email && c.status === 'pending'
    );

    if (connectionIndex !== -1) {
      connections[connectionIndex].status = action;
      localStorage.setItem("studyconnect_connections", JSON.stringify(connections));

      if (action === 'accepted') {
        // Create mutual connection
        const mutualConnection = {
          id: Date.now().toString(),
          user_email: user.email,
          peer_email: senderEmail,
          peer_name: sender?.full_name || 'Unknown',
          peer_university: sender?.university || 'Unknown',
          connected_at: new Date().toISOString(),
          status: 'accepted'
        };
        connections.push(mutualConnection);
        localStorage.setItem("studyconnect_connections", JSON.stringify(connections));

        // Send acceptance notification to sender
        const acceptanceNotification = {
          id: Date.now().toString(),
          type: 'chat_message',
          sender_email: user.email,
          recipient_email: senderEmail,
          message: `${user.full_name} has accepted your connection request!`,
          created_at: new Date().toISOString(),
          read: false
        };

        const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
        allNotifications.push(acceptanceNotification);
        localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

        alert(`You are now connected with ${sender?.full_name || 'User'}!`);
      } else {
        // Send rejection notification to sender
        const rejectionNotification = {
          id: Date.now().toString(),
          type: 'chat_message',
          sender_email: user.email,
          recipient_email: senderEmail,
          message: `${user.full_name} has declined your connection request.`,
          created_at: new Date().toISOString(),
          read: false
        };

        const allNotifications = JSON.parse(localStorage.getItem("studyconnect_notifications") || "[]");
        allNotifications.push(rejectionNotification);
        localStorage.setItem("studyconnect_notifications", JSON.stringify(allNotifications));

        alert(`Connection request from ${sender?.full_name || 'User'} has been declined.`);
      }
    }

    // Remove the original request notification
    deleteNotification(notificationId);
    
    // Close dropdown
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9999]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popup Container */}
          <div className="fixed top-20 right-4 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[10000] max-h-96 overflow-hidden transform transition-all duration-300 ease-out animate-in slide-in-from-top-2">
            <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-orange-600 font-medium mt-1">
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {getNotificationTitle(notification.type)}
                          </h4>
                          {!notification.read && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium text-sm leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {new Date(notification.created_at).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {/* Action buttons for join requests */}
                        {notification.type === 'group_join_request' && (
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinRequestResponse(
                                  notification.id,
                                  notification.group_id,
                                  notification.sender_email,
                                  'accept'
                                );
                              }}
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Check className="w-4 h-4" />
                              Accept Request
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJoinRequestResponse(
                                  notification.id,
                                  notification.group_id,
                                  notification.sender_email,
                                  'reject'
                                );
                              }}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <XIcon className="w-4 h-4" />
                              Reject Request
                            </button>
                          </div>
                        )}

                        {/* Action buttons for connection requests */}
                        {notification.type === 'chat_message' && 
                         notification.message.includes('wants to connect with you') && (
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnectionResponse(
                                  notification.id,
                                  notification.sender_email,
                                  'accepted'
                                );
                              }}
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <Check className="w-4 h-4" />
                              Accept Connection
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConnectionResponse(
                                  notification.id,
                                  notification.sender_email,
                                  'rejected'
                                );
                              }}
                              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <XIcon className="w-4 h-4" />
                              Decline Connection
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
