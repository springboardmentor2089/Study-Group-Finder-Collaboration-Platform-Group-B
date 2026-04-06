import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, MessageCircle, Edit2, Trash2, Paperclip, X, MoreVertical, Download, Eye, Reply, Search, Info, Smile, Heart, Hand, PawPrint, Utensils, Trophy, Package, Star } from 'lucide-react';
import websocketService from '../../services/websocketService';
import chatService from '../../services/chatService';

const InlineChat = ({ group, user, onClose, isInLayout = false, isCourseChat = false, courseInfo = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(true); // Always online for demo
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Get current profile name with overrides
  const getCurrentProfileName = (userEmail) => {
    // Special override for your email to force M.Dinesh
    if (userEmail === 'dineshmatti707@gmail.com') {
      return 'M.Dinesh';
    }
    
    // Special override for chethan707 email to force Chethan Kumar
    if (userEmail === 'chethan707@gmail.com') {
      return 'Chethan Kumar';
    }
    
    // Always check localStorage first for most up-to-date data
    const users = JSON.parse(localStorage.getItem("studyconnect_users") || "[]");
    
    // Check if this is the current user first
    if (user && user.email === userEmail) {
      // Force return fullName if available, otherwise name, then username
      if (user.fullName) {
        return user.fullName;
      }
      if (user.name) {
        return user.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Find user in localStorage
    const foundUser = users.find(u => u.email === userEmail);
    if (foundUser) {
      // Force return fullName if available, otherwise name, then username
      if (foundUser.fullName) {
        return foundUser.fullName;
      }
      if (foundUser.name) {
        return foundUser.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Check if it's a group owner
    if (group && group.owner_email === userEmail) {
      const ownerUser = users.find(u => u.email === userEmail);
      if (ownerUser && ownerUser.fullName) {
        return ownerUser.fullName;
      }
      if (ownerUser && ownerUser.name) {
        return ownerUser.name;
      }
      return userEmail.split('@')[0] || 'User';
    }
    
    // Check if it's a group member
    if (group && group.members) {
      const member = group.members.find(m => m.email === userEmail);
      if (member) {
        const memberUser = users.find(u => u.email === userEmail);
        if (memberUser && memberUser.fullName) {
          return memberUser.fullName;
        }
        if (memberUser && memberUser.name) {
          return memberUser.name;
        }
        return member.fullName || member.name || userEmail.split('@')[0] || 'User';
      }
    }
    
    // Last resort - return username part of email
    return userEmail.split('@')[0] || 'User';
  };

  // Load messages for this group
  const loadMessages = () => {
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const groupMessages = allMessages.filter(msg => msg.group_id === group.id);
    setMessages(groupMessages);
    setLoading(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages on component mount
  useEffect(() => {
    if (user && group) {
      loadMessages();
    }
  }, [user, group]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "studyconnect_messages") {
        loadMessages();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: Date.now().toString(),
      senderEmail: user.email,
      recipient_email: group.members?.map(m => m.email).find(email => email !== user.email) || group.owner_email,
      group_id: group.id,
      group_name: group.name,
      content: newMessage,  // Changed from 'message' to 'content'
      sender_name: user.fullName || user.name,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    // Save to localStorage
    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    allMessages.push(messageData);
    localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));

    // Broadcast to other group members
    const messagePayload = {
      type: 'message',
      data: messageData,
      groupId: group.id,
      groupName: group.name
    };

    // Send via WebSocket service
    websocketService.sendMessage(messagePayload);

    // Clear input
    setNewMessage('');
  };

  const handleEditMessage = (messageId) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setEditingMessage(messageId);
      setEditText(message.content);  // Changed from 'message' to 'content'
    }
  };

  const handleSaveEdit = () => {
    if (!editingMessage || !editText.trim()) return;

    const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
    const messageIndex = allMessages.findIndex(m => m.id === editingMessage);
    
    if (messageIndex !== -1) {
      allMessages[messageIndex] = {
        ...allMessages[messageIndex],
        content: editText,  // Changed from 'message' to 'content'
        edited: true,
        editedAt: new Date().toISOString()
      };
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));
      setMessages([...allMessages]);
    }
    
    setEditingMessage(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleDeleteMessage = (messageId) => {
    if (confirm('Are you sure you want to delete this message?')) {
      const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
      const filteredMessages = allMessages.filter(m => m.id !== messageId);
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
      setMessages(filteredMessages);
      setSelectedMessages(new Set());
      setShowDeleteOptions(false);
    }
  };

  const handleSelectMessage = (messageId) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleDeleteSelected = () => {
    if (confirm(`Delete ${selectedMessages.size} selected messages?`)) {
      const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
      const filteredMessages = allMessages.filter(m => !selectedMessages.has(m.id));
      
      localStorage.setItem("studyconnect_messages", JSON.stringify(filteredMessages));
      setMessages(filteredMessages);
      setSelectedMessages(new Set());
      setShowDeleteOptions(false);
    }
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setNewMessage('');
    setShowDeleteOptions(false);
    setSelectedMessages(new Set());
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewFile = (fileMessage) => {
    let fileUrl;
    
    // Handle both blob URLs and base64 data
    if (fileMessage.fileData) {
      // Create blob URL from base64 data
      const byteCharacters = atob(fileMessage.fileData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: fileMessage.fileType });
      fileUrl = URL.createObjectURL(blob);
    } else if (fileMessage.fileUrl) {
      // Use existing blob URL
      fileUrl = fileMessage.fileUrl;
    } else {
      console.error('No file data available for preview');
      return;
    }
    
    if (fileMessage.fileType && fileMessage.fileType.startsWith('image/')) {
      // For images, open in new tab with full viewer
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${fileMessage.fileName}</title>
            <style>
              body { margin:0; padding:20px; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5; }
              img { max-width:100%; max-height:100%; object-fit:contain; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:8px; }
            </style>
          </head>
          <body>
            <img src="${fileUrl}" alt="${fileMessage.fileName}" />
          </body>
        </html>
      `);
    } else if (fileMessage.fileType && fileMessage.fileType.startsWith('video/')) {
      // For videos, open in new tab with video player
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${fileMessage.fileName}</title>
            <style>
              body { margin:0; padding:20px; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5; }
              video { max-width:100%; max-height:100%; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:8px; }
            </style>
          </head>
          <body>
            <video controls autoplay>
              <source src="${fileUrl}" type="${fileMessage.fileType}">
                Your browser does not support the video tag.
              </video>
          </body>
        </html>
      `);
    } else if (fileMessage.fileType && fileMessage.fileType.includes('pdf')) {
      // For PDFs, open in new tab
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${fileMessage.fileName}</title>
            <style>
              body { margin:0; padding:20px; background:#f5f5f5; }
              iframe { width:100%; height:90vh; border:none; box-shadow:0 4px 6px rgba(0,0,0,0.1); border-radius:8px; }
            </style>
          </head>
          <body>
            <iframe src="${fileUrl}" type="application/pdf"></iframe>
          </body>
        </html>
      `);
    } else if (fileMessage.fileType && (fileMessage.fileType.includes('text') || fileMessage.fileType.includes('document'))) {
      // For text files and documents, show in new tab
      fetch(fileUrl)
        .then(response => response.text())
        .then(text => {
          const newWindow = window.open('', '_blank');
          newWindow.document.write(`
            <html>
              <head>
                <title>${fileMessage.fileName}</title>
                <style>
                  body { margin:0; padding:20px; font-family:monospace; background:#f5f5f5; white-space:pre-wrap; }
                  pre { background:white; padding:20px; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1); }
                </style>
              </head>
              <body>
                <pre>${text}</pre>
              </body>
            </html>
          `);
        })
        .catch(error => {
          console.error('Error loading file:', error);
          // Fallback to download
          handleDownloadFile(fileMessage);
        });
    } else {
      // For other files, show file info and download
      alert(`File: ${fileMessage.fileName}\nSize: ${(fileMessage.fileSize / 1024).toFixed(1)} KB\nType: ${fileMessage.fileType}`);
    }
  };

  const handleDownloadFile = (fileMessage) => {
    try {
      let fileUrl;
      
      // Handle both blob URLs and base64 data
      if (fileMessage.fileData) {
        // Create blob URL from base64 data
        const byteCharacters = atob(fileMessage.fileData.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileMessage.fileType });
        fileUrl = URL.createObjectURL(blob);
      } else if (fileMessage.fileUrl) {
        // Use existing blob URL
        fileUrl = fileMessage.fileUrl;
      } else {
        console.error('No file data available for download');
        return;
      }
      
      // Create download link with correct file
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileMessage.fileName;
      link.style.display = 'none';
      
      // Add to DOM, trigger download, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL after download (delayed to allow download to complete)
      setTimeout(() => {
        URL.revokeObjectURL(fileUrl);
      }, 1000);
      
      // Show success feedback
      console.log(`Downloaded: ${fileMessage.fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open file in new tab
      if (fileMessage.fileUrl) {
        window.open(fileMessage.fileUrl, '_blank');
      }
    }
  };

  const handleSendFiles = () => {
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach(file => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const fileData = e.target.result;
        
        const messageData = {
          id: Date.now().toString(),
          senderEmail: user.email,
          recipient_email: group.members?.map(m => m.email).find(email => email !== user.email) || group.owner_email,
          group_id: group.id,
          group_name: group.name,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: fileData,
          timestamp: new Date().toISOString(),
          type: 'file'
        };

        // Save to localStorage
        const allMessages = JSON.parse(localStorage.getItem("studyconnect_messages") || "[]");
        allMessages.push(messageData);
        localStorage.setItem("studyconnect_messages", JSON.stringify(allMessages));

        // Broadcast to other group members
        const messagePayload = {
          type: 'message',
          data: messageData,
          groupId: group.id,
          groupName: group.name
        };

        websocketService.sendMessage(messagePayload);
      };
      
      reader.readAsDataURL(file);
    });

    // Clear selected files and close upload dialog
    setSelectedFiles([]);
    setShowFileUpload(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading messages...</h3>
            <p className="text-gray-500">Please wait while we set up your chat.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !group) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No group selected</h3>
            <p className="text-gray-500">Please select a group to start chatting.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Only show header if not in layout */}
      {!isInLayout && (
        <>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
              {isCourseChat ? '📚' : (group.name?.charAt(0)?.toUpperCase() || 'G')}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isCourseChat ? courseInfo?.name || 'Course Chat' : group.name}
              </h2>
              <p className="text-xs text-orange-100">
                {isCourseChat 
                  ? `${courseInfo?.courseCode || 'COURSE'} • ${courseInfo?.enrolledStudents?.length || 0} students`
                  : `${group.course} • ${(group.members || []).length + 1} members`
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-orange-700 rounded-lg transition-colors">
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
        </>
      )}

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">Start the conversation!</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderEmail === user?.email ? 'justify-end' : 'justify-start'
                }`}
              >
                {/* Profile name outside message box for all users */}
                <div className={`mb-2 text-sm font-medium ${
                  message.senderEmail === user?.email ? 'text-right' : 'text-left'
                }`}>
                  {getCurrentProfileName(message.senderEmail)}
                </div>
                
                <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2 relative ${
                  message.senderEmail === user?.email 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' 
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {showDeleteOptions && (
                    <input
                      type="checkbox"
                      checked={selectedMessages.has(message.id)}
                      onChange={() => handleSelectMessage(message.id)}
                      className="absolute top-2 left-2 w-4 h-4"
                    />
                  )}
                  
                  {/* Only show avatar for other users */}
                  {message.senderEmail !== user?.email && (
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {getCurrentProfileName(message.senderEmail)?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                  )}
                  
                  {/* Message content with three dots */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {message.replyTo && (
                        <div className="mb-2 p-2 bg-white/10 rounded-lg border-l-2 border-orange-300">
                          <div className="flex items-center space-x-2 mb-1">
                            <Reply className="w-3 h-3 text-orange-200" />
                            <span className="text-xs text-orange-200">Replying to {getCurrentProfileName(message.replyTo.senderEmail)}</span>
                          </div>
                          <p className="text-xs text-orange-100 italic">{message.replyTo.content}</p>
                        </div>
                      )}
                      
                      {message.type === 'file' ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{message.fileName}</p>
                              <p className="text-xs opacity-75">{(message.fileSize / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreviewFile(message)}
                              className="text-xs bg-orange-500 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-600 transition-colors"
                            >
                              <Eye className="w-3 h-3" /> Preview
                            </button>
                            <button
                              onClick={() => handleDownloadFile(message)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Download
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`${
                          message.senderEmail === user?.email ? 'text-white' : 'text-gray-900'
                        }`}>
                          {message.content}
                          {message.edited && (
                            <span className="text-xs opacity-75 ml-1">(edited)</span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    {/* Three dots positioned on the right side of text */}
                    {message.senderEmail === user?.email && !showDeleteOptions && (
                      <div className="ml-2">
                        <button
                          onClick={() => setActiveMenu(activeMenu === message.id ? null : message.id)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenu === message.id && (
                          <div className="absolute right-0 bottom-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                            <button
                              onClick={() => {
                                handleReply(message);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Reply className="w-3 h-3" />
                              <span>Reply</span>
                            </button>
                            <button
                              onClick={() => {
                                handleEditMessage(message.id);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteMessage(message.id);
                                setActiveMenu(null);
                              }}
                              className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shadow-lg">
        {replyingTo && (
          <div className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Reply className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">Replying to {getCurrentProfileName(replyingTo.senderEmail)}</span>
              </div>
              <button
                onClick={handleCancelReply}
                className="text-xs text-orange-500 hover:text-orange-600 underline"
              >
                Cancel
              </button>
            </div>
            <div className="text-xs text-orange-600 italic">{replyingTo.content}</div>
          </div>
        )}
        
        {showDeleteOptions && (
          <div className="mb-3 p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700">
                {selectedMessages.size} message{selectedMessages.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeleteSelected}
                  className="text-xs bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setShowDeleteOptions(false);
                    setSelectedMessages(new Set());
                  }}
                  className="text-xs text-gray-500 hover:text-gray-600 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            {replyingTo && (
              <input
                type="text"
                value={`@${getCurrentProfileName(replyingTo.senderEmail)} `}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 italic"
              />
            )}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${isCourseChat ? 'course' : 'group'}...`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InlineChat;
