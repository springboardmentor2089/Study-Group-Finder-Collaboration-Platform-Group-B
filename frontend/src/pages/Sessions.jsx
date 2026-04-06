import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ScheduleSessionModal from "../components/sessions/ScheduleSessionModal";
import { Calendar as CalendarIcon, Plus, Clock, Users, MapPin, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";

export default function Sessions() {
  const [user, setUser] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { 
      window.location.href = createPageUrl("Auth"); 
      return; 
    }
    setUser(JSON.parse(stored));
    
    // Load sessions from localStorage
    const storedSessions = localStorage.getItem("study_sessions");
    if (storedSessions) {
      setSessions(JSON.parse(storedSessions));
    }
  }, []);

  const handleScheduleSession = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: Date.now().toString(),
      createdBy: user?.name || user?.email || "User",
      createdAt: new Date().toISOString()
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem("study_sessions", JSON.stringify(updatedSessions));
    setShowScheduleModal(false);
  };

  const getSessionsForDate = (date) => {
    return sessions.filter(session => 
      isSameDay(parseISO(session.date), date)
    );
  };

  // Dynamic session status calculation - Date-based logic
  const getSessionStatus = (session) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0); // Set to start of session date
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Next day at 12:00 AM

    if (today.getTime() < sessionDate.getTime()) {
      return 'UPCOMING'; // Future date
    } else if (today.getTime() === sessionDate.getTime()) {
      return 'ACTIVE'; // Same date (can join all day)
    } else if (today.getTime() < tomorrow.getTime() && sessionDate.getTime() < today.getTime()) {
      return 'ACTIVE'; // Session date is before today but still same day
    } else {
      return 'COMPLETED'; // Past date (after 12:00 AM of next day)
    }
  };

  const getSessionEndTime = (session) => {
    const sessionDate = new Date(session.date);
    // Return end of session date (23:59:59)
    sessionDate.setHours(23, 59, 59, 999);
    return sessionDate;
  };

  const canJoinSession = (session) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0); // Set to start of session date
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Next day at 12:00 AM

    // Can join if today is same as session date or before session date
    // Cannot join after session date ends (after 12:00 AM next day)
    return today.getTime() <= sessionDate.getTime() || (today.getTime() < tomorrow.getTime() && sessionDate.getTime() < today.getTime());
  };

  const showJoinButton = (session) => {
    // Always show join button for all sessions
    return true;
  };

  const getFormattedStatus = (status) => {
    switch (status) {
      case 'UPCOMING':
        return 'Upcoming';
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const handleJoinSession = async (sessionId) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': user.email
        }
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        
        // If online session, open meeting link
        if (data.meetingLink) {
          window.open(data.meetingLink, '_blank');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    }
  };

  const getUpcomingSessions = () => {
    return sessions
      .filter(session => new Date(session.date).getTime() >= new Date().getTime())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10);
  };

  const formatSessionTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(subMonths(currentMonth, 1));
    } else {
      setCurrentMonth(addMonths(currentMonth, 1));
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleViewSession = (session) => {
    // You can implement view functionality here
    // For now, let's show session details in an alert
    alert(`Session Details:\n\nTitle: ${session.title}\nDate: ${format(parseISO(session.date), "MMMM d, yyyy")}\nTime: ${formatSessionTime(session.time)}\nDuration: ${session.duration} minutes\nMeeting Type: ${session.meetingType}\nLocation: ${session.location || 'Online'}\nDescription: ${session.description || 'No description'}\nCreated by: ${session.createdBy}`);
  };

  const handleDeleteSession = (sessionId) => {
    const sessionToDelete = sessions.find(session => session.id === sessionId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sessionDate = new Date(sessionToDelete.date);
    sessionDate.setHours(0, 0, 0, 0);
    
    const isTodaySession = today.getTime() === sessionDate.getTime();
    const confirmMessage = isTodaySession 
      ? `Are you sure you want to delete today's session "${sessionToDelete.title}"? This action cannot be undone.`
      : `Are you sure you want to delete the session "${sessionToDelete.title}"? This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem("study_sessions", JSON.stringify(updatedSessions));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
        <TopBar user={user} extraContent={<NotificationBar user={user} />} />
        <div className="flex">
          <Sidebar currentPage="Sessions" user={user} />
          <main className="flex-1 p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
                <p className="text-sm text-gray-500">Schedule and join study sessions.</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                Schedule Session
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Horizontal Calendar Widget */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(currentMonth, "MMMM yyyy")}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigateMonth('prev')}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => navigateMonth('next')}
                        className="p-1 hover:bg-gray-100 rounded transition"
                      >
                        <ChevronRight className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth().map((date, index) => {
                      const hasSessions = getSessionsForDate(date).length > 0;
                      const isSelected = isSameDay(date, selectedDate);
                      const isToday = isSameDay(date, new Date());
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className={`
                            relative p-2 text-sm rounded-lg transition-all
                            ${isSelected ? 'bg-orange-500 text-white font-semibold' : ''}
                            ${!isSelected && isToday ? 'bg-orange-100 text-orange-700 font-medium' : ''}
                            ${!isSelected && !isToday ? 'hover:bg-gray-100 text-gray-700' : ''}
                            ${hasSessions && !isSelected ? 'font-semibold' : ''}
                          `}
                        >
                          {format(date, 'd')}
                          {hasSessions && (
                            <div className={`
                              absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full
                              ${isSelected ? 'bg-white' : 'bg-orange-400'}
                            `} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sessions List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                  
                  {getSessionsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-4">
                      {getSessionsForDate(selectedDate).map((session) => {
                        const status = getSessionStatus(session);
                        const canJoin = canJoinSession(session);
                        const showButton = showJoinButton(session);
                        
                        return (
                        <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">{session.title}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                {session.group}
                              </span>
                              {status === 'ACTIVE' && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                  Live Now
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {session.description && (
                            <p className="text-sm text-gray-600 mb-3">{session.description}</p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatSessionTime(session.time)} ({session.duration} min)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {session.meetingType === "online" ? (
                                <Users className="w-4 h-4" />
                              ) : (
                                <MapPin className="w-4 h-4" />
                              )}
                              <span className="truncate max-w-[200px]">
                                {session.meetingType === "online" ? "Online" : session.location}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              Created by {session.createdBy}
                            </span>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewSession(session)}
                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                              >
                                View
                              </button>
                              
                              {/* Join Session Button - Always Visible */}
                              {showButton && (
                                canJoin ? (
                                  <button 
                                    onClick={() => handleJoinSession(session.id)}
                                    className="text-sm bg-orange-500 text-white px-3 py-1 rounded-md hover:bg-orange-600 font-medium"
                                  >
                                    Join Session
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      alert('This session has ended. You cannot join a completed session.');
                                    }}
                                    className="text-sm text-gray-400 px-3 py-1 rounded-md bg-gray-100 font-medium cursor-not-allowed"
                                  >
                                    Session Completed
                                  </button>
                                )
                              )}
                              
                              {session.createdBy === user?.name && (
                                <button
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No sessions scheduled for this date</p>
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="mt-4 text-orange-600 hover:text-orange-700 font-medium text-sm"
                      >
                        Schedule a session
                      </button>
                    </div>
                  )}
                </div>

                {/* Upcoming Sessions */}
                {getUpcomingSessions().length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
                    <div className="space-y-3">
                      {getUpcomingSessions().map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{session.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              <span>{format(parseISO(session.date), "MMM d")}</span>
                              <span>{formatSessionTime(session.time)}</span>
                              <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                                {session.group}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewSession(session)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                            >
                              View
                            </button>
                            {(session.createdBy === user?.name || session.createdBy === user?.email || session.createdBy === "User" || session.createdBy === "Anonymous") && (
                              <button
                                onClick={() => handleDeleteSession(session.id)}
                                className="text-xs text-red-600 hover:text-red-700 font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        {showScheduleModal && (
          <ScheduleSessionModal
            onClose={() => setShowScheduleModal(false)}
            onSchedule={handleScheduleSession}
          />
        )}
      </div>
    );
}