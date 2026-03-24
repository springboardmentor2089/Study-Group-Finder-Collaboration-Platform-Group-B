import { useState, useEffect } from "react";
import { createPageUrl } from "@/utils/index.js";
import TopBar from "../components/dashboard/TopBar";
import Sidebar from "../components/dashboard/Sidebar";
import NotificationBar from "../components/notifications/NotificationBar";
import ChatNotificationBar from "../components/notifications/ChatNotificationBar";
import InlineChat from "../components/groups/InlineChat";
import { BookOpen, Users, Clock, Star, CheckCircle, X, User, MessageCircle, Trash2 } from "lucide-react";

const COURSES_DATA = [
  {
    id: "cse",
    title: "Computer Science Engineering",
    description: "Learn programming, algorithms, data structures, and software development fundamentals.",
    instructor: "Dr. Rajesh Kumar",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 320,
    rating: 4.7,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad1)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3ECSE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EProgramming • Algorithms • Software%3C/text%3E%3C/svg%3E",
    topics: ["Programming", "Data Structures", "Algorithms", "Software Engineering", "Database", "Web Development"],
    price: "Free"
  },
  {
    id: "aiml",
    title: "Artificial Intelligence & Machine Learning",
    description: "Master AI concepts, machine learning algorithms, deep learning, and neural networks.",
    instructor: "Dr. Priya Sharma",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 280,
    rating: 4.8,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f093fb;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f5576c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad2)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EAIML%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EAI • Machine Learning • Deep Learning%3C/text%3E%3C/svg%3E",
    topics: ["AI Fundamentals", "Machine Learning", "Deep Learning", "Neural Networks", "Python", "Data Science"],
    price: "Free"
  },
  {
    id: "eee",
    title: "Electrical and Electronics Engineering",
    description: "Study electrical circuits, power systems, electronics, and renewable energy technologies.",
    instructor: "Dr. Anand Reddy",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 245,
    rating: 4.6,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234facfe;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%2300f2fe;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad3)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EEEE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EElectrical • Electronics • Power Systems%3C/text%3E%3C/svg%3E",
    topics: ["Electrical Circuits", "Electronics", "Power Systems", "Control Systems", "Renewable Energy", "Signal Processing"],
    price: "Free"
  },
  {
    id: "it",
    title: "Information Technology",
    description: "Learn network security, database management, cloud computing, and IT infrastructure.",
    instructor: "Dr. Suresh Babu",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 267,
    rating: 4.7,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fa709a;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23fee140;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad4)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EIT%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3ENetworks • Security • Cloud Computing%3C/text%3E%3C/svg%3E",
    topics: ["Network Security", "Database Management", "Cloud Computing", "IT Infrastructure", "Cybersecurity", "Web Development"],
    price: "Free"
  },
  {
    id: "eie",
    title: "Electronics and Instrumentation Engineering",
    description: "Study electronic devices, instrumentation, control systems, and industrial automation.",
    instructor: "Dr. Lakshmi Narayanan",
    duration: "4 years",
    level: "Undergraduate",
    enrolled: 198,
    rating: 4.5,
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad5' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%2330cfd0;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23330868;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad5)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3EEIE%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3EElectronics • Instrumentation • Control%3C/text%3E%3C/svg%3E",
    topics: ["Electronic Devices", "Instrumentation", "Control Systems", "Industrial Automation", "Sensors", "Signal Processing"],
    price: "Free"
  }
];

export default function Courses() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [customCourses, setCustomCourses] = useState([]);
  const [showCustomCourseInput, setShowCustomCourseInput] = useState(false);
  const [customCourseName, setCustomCourseName] = useState("");
  const [chatCourseId, setChatCourseId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("studyconnect_user");
    if (!stored) { window.location.href = createPageUrl("Auth"); return; }
    setUser(JSON.parse(stored));

    // Load enrolled courses
    const enrolled = JSON.parse(localStorage.getItem("studyconnect_enrolled_courses") || "[]");
    setEnrolledCourses(enrolled);

    // Load custom courses
    const storedCustomCourses = JSON.parse(localStorage.getItem("studyconnect_custom_courses") || "[]");
    setCustomCourses(storedCustomCourses);
  }, []);

  const handleAddCustomCourse = () => {
    if (!customCourseName.trim()) {
      alert("Please enter a course name");
      return;
    }

    const newCustomCourse = {
      id: `custom-${Date.now()}`,
      title: customCourseName,
      description: `Custom course: ${customCourseName}`,
      instructor: "Custom Instructor",
      duration: "Custom",
      level: "Custom",
      enrolled: 0,
      rating: 0,
      image: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Cdefs%3E%3ClinearGradient id='grad-custom' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%238b5cf6;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ec4899;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad-custom)' width='400' height='200'/%3E%3Ctext x='50%25' y='40%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='24' font-weight='bold'%3E${encodeURIComponent(customCourseName)}%3C/text%3E%3Ctext x='50%25' y='60%25' text-anchor='middle' dy='.3em' fill='white' font-family='Arial' font-size='14' opacity='0.9'%3ECustom Course%3C/text%3E%3C/svg%3E`,
      topics: ["Custom Topics"],
      price: "Free",
      isCustom: true
    };

    const updatedCustomCourses = [...customCourses, newCustomCourse];
    setCustomCourses(updatedCustomCourses);
    localStorage.setItem("studyconnect_custom_courses", JSON.stringify(updatedCustomCourses));
    
    setCustomCourseName("");
    setShowCustomCourseInput(false);
    
    alert(`Custom course "${customCourseName}" added successfully!`);
  };

  const handleDisenroll = (courseId) => {
    if (!confirm("Are you sure you want to leave this course?")) return;
    
    const updatedEnrollments = enrolledCourses.filter(c => c.id !== courseId);
    setEnrolledCourses(updatedEnrollments);
    localStorage.setItem("studyconnect_enrolled_courses", JSON.stringify(updatedEnrollments));
    
    alert("You have successfully left the course.");
  };

  const handleEnroll = (course) => {
    // Check if already enrolled
    if (enrolledCourses.some(c => c.id === course.id)) {
      alert("You are already enrolled in this course!");
      return;
    }

    // Add to enrolled courses
    const newEnrollment = {
      ...course,
      enrolledAt: new Date().toISOString(),
      progress: 0
    };
    
    const updatedEnrollments = [...enrolledCourses, newEnrollment];
    setEnrolledCourses(updatedEnrollments);
    localStorage.setItem("studyconnect_enrolled_courses", JSON.stringify(updatedEnrollments));
    
    alert(`Successfully enrolled in ${course.title}!`);
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(c => c.id === courseId);
  };

  const allCourses = [...COURSES_DATA, ...customCourses];
  
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar user={user} extraContent={<NotificationBar user={user} />} />
      <div className="flex">
        <Sidebar currentPage="Courses" user={user} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
              <p className="text-gray-600">Browse and enroll in courses to enhance your skills.</p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-400"
              >
                <option value="All">All Levels</option>
                <option value="Undergraduate">Undergraduate</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* My Enrollments */}
            {enrolledCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Enrollments</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map(course => (
                    <div key={course.id} className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                      <div className="relative">
                        <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Enrolled
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded">{course.level}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setChatCourseId(course.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                            >
                              <MessageCircle className="w-3 h-3" />
                              Chat
                            </button>
                            <button
                              onClick={() => handleDisenroll(course.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium transition"
                            >
                              Unenroll
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Courses */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                    <img src={course.image} alt={course.title} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.instructor}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-orange-500">{course.price}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">{course.level}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                        <span className="text-xs text-gray-500">({course.enrolled} enrolled)</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {course.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                          {course.topics.length > 3 && (
                            <span className="text-xs text-gray-500">+{course.topics.length - 3} more</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleEnroll(course)}
                        disabled={isEnrolled(course.id)}
                        className={`w-full py-2 rounded-lg font-medium transition ${
                          isEnrolled(course.id)
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        {isEnrolled(course.id) ? "Already Enrolled" : "Enroll Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No courses found matching your criteria.</p>
                </div>
              )}

              {/* Other Course Option */}
              <div className="mt-8">
                {!showCustomCourseInput ? (
                  <button
                    onClick={() => setShowCustomCourseInput(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-orange-400 hover:text-orange-500 transition"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span className="font-medium">Other - Add Custom Course</span>
                    </div>
                  </button>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Course</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Enter your course name..."
                        value={customCourseName}
                        onChange={(e) => setCustomCourseName(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCourse()}
                      />
                      <button
                        onClick={handleAddCustomCourse}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded font-medium transition"
                      >
                        Add Course
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomCourseInput(false);
                          setCustomCourseName("");
                        }}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {chatCourseId && (
        <InlineChat 
          group={{
            id: chatCourseId,
            name: COURSES_DATA.find(c => c.id === chatCourseId)?.title || customCourses.find(c => c.id === chatCourseId)?.title || 'Course Chat',
            course: COURSES_DATA.find(c => c.id === chatCourseId)?.title || customCourses.find(c => c.id === chatCourseId)?.title || 'Course',
            members: enrolledCourses.filter(c => c.id === chatCourseId).map(() => ({ email: user.email, name: user.fullName || user.name }))
          }}
          user={user} 
          onClose={() => setChatCourseId(null)}
        />
      )}
      
      <ChatNotificationBar user={user} />
    </div>
  );
}