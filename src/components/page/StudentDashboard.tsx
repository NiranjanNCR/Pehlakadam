import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { 
  GraduationCap, 
  BookOpen, 
  BrainCircuit, 
  History, 
  CheckCircle2, 
  Clock, 
  Play, 
  FileText, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  ArrowRight, 
  Search, 
  Eye, 
  Calendar, 
  Award, 
  ChevronRight, 
  Layers, 
  Check, 
  Compass, 
  User, 
  Phone, 
  Mail, 
  ExternalLink,
  Download,
  Share2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import PdfViewerModal from "../PdfViewerModal";
import YouTubeModal from "../YouTubeModal";
import { Course, DiagnosticRecord, EnrolledProgram, ResourceHistoryItem, StudentDashboardData } from "../../types";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"courses" | "programs" | "diagnostics" | "resources">("courses");

  // State for user identity
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Loaded Dashboard Data
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Playing Course in LMS Mode
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  // Modals for Resource Viewing
  const [selectedPdf, setSelectedPdf] = useState<{ title: string; category?: string; pdfUrl?: string; fileData?: string } | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Modal for Diagnostic Scorecard Inspection
  const [selectedDiagRecord, setSelectedDiagRecord] = useState<DiagnosticRecord | null>(null);
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);

  // Search filter inside resources & tests
  const [resourceSearch, setResourceSearch] = useState("");
  const [diagSearch, setDiagSearch] = useState("");

  // Determine current active credentials
  const getStoredCredentials = () => {
    const urlPhone = searchParams.get("phone");
    const urlEmail = searchParams.get("email");

    const stPhone = localStorage.getItem("pehlakadam_student_phone");
    const prPhone = localStorage.getItem("pehlakadam_premium_phone");
    
    let userObjPhone = "";
    let userObjEmail = "";
    try {
      const u = JSON.parse(localStorage.getItem("pehlakadam_user") || "{}");
      if (u.phone) userObjPhone = u.phone;
      if (u.email) userObjEmail = u.email;
    } catch (e) {}

    const phone = urlPhone || stPhone || prPhone || userObjPhone || "";
    const email = urlEmail || userObjEmail || "";

    return { phone, email };
  };

  const fetchDashboard = async (phone: string, email: string) => {
    setLoading(true);
    setAuthError("");
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const params = new URLSearchParams();
      if (cleanPhone) params.append("phone", cleanPhone);
      if (email) params.append("email", email.trim().toLowerCase());

      const res = await fetch(`/api/student/dashboard-data?${params.toString()}`);
      if (res.ok) {
        const data: StudentDashboardData = await res.json();
        setDashboardData(data);

        // Pre-select first course if available
        if (data.enrolledCourses && data.enrolledCourses.length > 0 && !selectedCourse) {
          const firstCourse = data.enrolledCourses[0];
          setSelectedCourse(firstCourse);
          if (firstCourse.chapters && firstCourse.chapters.length > 0) {
            setSelectedChapterId(firstCourse.chapters[0].id);
            if (firstCourse.chapters[0].lessons && firstCourse.chapters[0].lessons.length > 0) {
              setSelectedLessonId(firstCourse.chapters[0].lessons[0].id);
            }
          }
        }
      } else {
        const err = await res.json();
        setAuthError(err.error || "Failed to load dashboard data.");
      }
    } catch (e: any) {
      console.error("Dashboard fetch error:", e);
      setAuthError("Network error while connecting to student portal.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const creds = getStoredCredentials();
    if (creds.phone || creds.email) {
      setPhoneInput(creds.phone);
      setEmailInput(creds.email);
      fetchDashboard(creds.phone, creds.email);
    } else {
      setLoading(false);
    }
  }, []);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/[^0-9]/g, "");
    if (!cleanPhone && !emailInput.trim()) {
      setAuthError("Please enter your registered mobile number or email address.");
      return;
    }

    setIsLoggingIn(true);
    if (cleanPhone) {
      localStorage.setItem("pehlakadam_student_phone", cleanPhone);
      localStorage.setItem("pehlakadam_premium_phone", cleanPhone);
    }
    if (emailInput.trim()) {
      const u = { name: "Pehlakadam Student", phone: cleanPhone, email: emailInput.trim(), role: "Student" };
      localStorage.setItem("pehlakadam_user", JSON.stringify(u));
    }

    await fetchDashboard(cleanPhone, emailInput.trim());
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("pehlakadam_student_phone");
    localStorage.removeItem("pehlakadam_student_session_id");
    localStorage.removeItem("pehlakadam_premium_phone");
    localStorage.removeItem("pehlakadam_premium_session_id");
    localStorage.removeItem("pehlakadam_user");
    setDashboardData(null);
    setPhoneInput("");
    setEmailInput("");
    setSelectedCourse(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    const creds = getStoredCredentials();
    fetchDashboard(creds.phone || phoneInput, creds.email || emailInput);
  };

  // Toggle Lesson Completion
  const handleToggleLessonComplete = async (courseId: string, lessonId: string) => {
    const isCompleted = completedLessonIds.includes(lessonId);
    const updated = isCompleted 
      ? completedLessonIds.filter(id => id !== lessonId)
      : [...completedLessonIds, lessonId];
    
    setCompletedLessonIds(updated);

    // Calculate percentage
    let totalLessons = 0;
    if (selectedCourse?.chapters) {
      selectedCourse.chapters.forEach(c => {
        totalLessons += c.lessons ? c.lessons.length : 0;
      });
    }
    const pct = totalLessons > 0 ? Math.round((updated.length / totalLessons) * 100) : 0;

    try {
      const creds = getStoredCredentials();
      await fetch("/api/student/update-course-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: creds.phone || phoneInput,
          email: creds.email || emailInput,
          courseId,
          lessonId,
          completed: !isCompleted,
          completedLessons: updated,
          progressPercentage: pct
        })
      });

      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          progress: {
            ...dashboardData.progress,
            [courseId]: pct
          }
        });
      }
    } catch (e) {
      console.error("Error syncing lesson progress:", e);
    }
  };

  // Open PDF Resource
  const handleOpenPdf = (item: { title: string; category?: string; url?: string; fileData?: string }) => {
    setSelectedPdf({
      title: item.title,
      category: item.category || "Study Material",
      pdfUrl: item.url,
      fileData: item.fileData
    });
    setIsPdfModalOpen(true);
  };

  // Open Video Resource
  const handleOpenVideo = (url: string) => {
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setSelectedVideoUrl(embedUrl);
    setIsVideoModalOpen(true);
  };

  // Filtered resources and diagnostics
  const filteredResources = (dashboardData?.resourceHistory || []).filter(item => {
    if (!resourceSearch.trim()) return true;
    const q = resourceSearch.toLowerCase();
    return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  const filteredDiagnostics = (dashboardData?.diagnosticHistory || []).filter(item => {
    if (!diagSearch.trim()) return true;
    const q = diagSearch.toLowerCase();
    return item.testTitle.toLowerCase().includes(q) || (item.dominant && item.dominant.toLowerCase().includes(q));
  });

  // Active Lesson in selected course
  const currentChapter = selectedCourse?.chapters?.find(c => c.id === selectedChapterId) || selectedCourse?.chapters?.[0];
  const currentLesson = currentChapter?.lessons?.find(l => l.id === selectedLessonId) || currentChapter?.lessons?.[0];

  return (
    <div id="student-dashboard-page" className="min-h-screen bg-zinc-50 flex flex-col justify-between font-sans">
      <div>
        <NavigationBar />

        {/* Dashboard Top Header Bar */}
        <section className="bg-zinc-950 text-white border-b border-zinc-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Profile Intro */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/20">
                    Individual Student Portal
                  </span>
                  {dashboardData?.student.isAuthorized && (
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                      {dashboardData.student.tier.toUpperCase()} TIER ACTIVE
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                  <GraduationCap className="h-9 w-9 text-emerald-400 shrink-0" />
                  {dashboardData ? `Welcome, ${dashboardData.student.name || "Student"}` : "Student Learning Dashboard"}
                </h1>
                
                <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
                  Track your personalized study materials, diagnostic assessment scorecards, and enrolled course curriculums in one centralized workspace.
                </p>
              </div>

              {/* Quick Actions / Session Status */}
              {dashboardData ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
                    Sync Data
                  </button>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/50 hover:bg-red-900/60 px-4 py-2.5 text-xs font-bold text-red-300 transition-all cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Exit / Switch Account
                  </button>
                </div>
              ) : null}
            </div>

            {/* Quick Profile Meta Pill if logged in */}
            {dashboardData && (
              <div className="mt-6 pt-6 border-t border-zinc-900/80 flex flex-wrap gap-4 text-xs text-zinc-400">
                {dashboardData.student.phone && (
                  <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    Phone: <span className="font-mono text-zinc-200 font-bold">{dashboardData.student.phone}</span>
                  </span>
                )}
                {dashboardData.student.email && (
                  <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    Email: <span className="text-zinc-200 font-bold">{dashboardData.student.email}</span>
                  </span>
                )}
                {dashboardData.student.role && (
                  <span className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    Academic Track: <span className="text-zinc-200 font-bold">{dashboardData.student.role}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* MAIN BODY CONTENT */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="bg-white rounded-3xl border border-zinc-200 p-16 text-center shadow-sm">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-900">Loading Student Dashboard...</h3>
              <p className="text-zinc-500 text-sm mt-1">Retrieving enrolled courses, test history, and resource files.</p>
            </div>
          ) : !dashboardData ? (
            /* NOT LOGGED IN / SEARCH FORM GATEWAY */
            <div className="max-w-xl mx-auto py-12">
              <div className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-xl space-y-6">
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Access Your Student Dashboard</h2>
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
                    Enter the mobile number or email address you used during enrollment, course registration, or diagnostic assessment.
                  </p>
                </div>

                {authError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleManualLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Registered Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                      Or Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                      <input
                        type="email"
                        placeholder="e.g. arjun@gmail.com"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Fetching Records...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> Open My Dashboard
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2">
                  <p className="text-xs text-zinc-400">
                    Need help or haven't enrolled yet?{" "}
                    <Link to="/courses" className="text-emerald-600 font-bold hover:underline">
                      Browse Courses
                    </Link>{" "}
                    or{" "}
                    <Link to="/diagnostics" className="text-emerald-600 font-bold hover:underline">
                      Take Free Diagnostic Test
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* AUTHENTICATED DASHBOARD CONTENT */
            <div className="space-y-8">
              
              {/* TOP METRIC CARDS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Enrolled Courses</span>
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 font-sans">
                      {dashboardData.enrolledCourses?.length || 0}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">Active</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Academic Programs</span>
                    <Award className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 font-sans">
                      {dashboardData.enrolledPrograms?.length || 0}
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">Tracks</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Completed Tests</span>
                    <BrainCircuit className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 font-sans">
                      {dashboardData.diagnosticHistory?.length || 0}
                    </span>
                    <span className="text-xs text-purple-600 font-semibold">Evaluated</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Study Resources</span>
                    <History className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-zinc-900 font-sans">
                      {dashboardData.resourceHistory?.length || 0}
                    </span>
                    <span className="text-xs text-amber-600 font-semibold">Accessed</span>
                  </div>
                </div>
              </div>

              {/* SEGMENTED NAVIGATION TABS */}
              <div className="flex border-b border-zinc-200 gap-2 sm:gap-6 overflow-x-auto pb-1">
                {[
                  { id: "courses", label: `Enrolled Courses (${dashboardData.enrolledCourses?.length || 0})`, icon: BookOpen },
                  { id: "programs", label: `Enrolled Programs (${dashboardData.enrolledPrograms?.length || 0})`, icon: Award },
                  { id: "diagnostics", label: `Diagnostic Reports (${dashboardData.diagnosticHistory?.length || 0})`, icon: BrainCircuit },
                  { id: "resources", label: `Resource History (${dashboardData.resourceHistory?.length || 0})`, icon: History }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                        isActive
                          ? "border-emerald-600 text-emerald-600 font-extrabold bg-emerald-50/50 rounded-t-xl"
                          : "border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-emerald-600" : "text-zinc-400"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: ENROLLED COURSES & LMS INTERACTIVE VIEWER */}
              {activeTab === "courses" && (
                <div className="space-y-8">
                  {dashboardData.enrolledCourses && dashboardData.enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* Left Column: Course Selector & List */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">
                            Your Course Curriculum
                          </h3>
                          <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            {dashboardData.enrolledCourses.length} Available
                          </span>
                        </div>

                        <div className="space-y-3">
                          {dashboardData.enrolledCourses.map((c, cIdx) => {
                            const isSelected = selectedCourse?.id === c.id;
                            const progressPct = dashboardData.progress[c.id] || 0;
                            return (
                              <div
                                key={c.id ? `course-${c.id}` : `course-idx-${cIdx}`}
                                onClick={() => {
                                  setSelectedCourse(c);
                                  if (c.chapters && c.chapters.length > 0) {
                                    setSelectedChapterId(c.chapters[0].id);
                                    if (c.chapters[0].lessons && c.chapters[0].lessons.length > 0) {
                                      setSelectedLessonId(c.chapters[0].lessons[0].id);
                                    }
                                  }
                                }}
                                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/10"
                                    : "bg-white border-zinc-200 hover:border-zinc-300 shadow-sm"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    {c.category || "General"}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-zinc-500">
                                    {c.duration || "Self-Paced"}
                                  </span>
                                </div>

                                <h4 className={`text-sm font-bold line-clamp-2 ${isSelected ? "text-emerald-700" : "text-zinc-900"}`}>
                                  {c.title}
                                </h4>

                                {/* Progress bar */}
                                <div className="mt-3 space-y-1">
                                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                    <span>Course Progress</span>
                                    <span className="font-bold text-zinc-800">{progressPct}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                      style={{ width: `${progressPct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </div>

                      {/* Right Column: In-Dashboard Interactive Course Player & Syllabus */}
                      <div className="lg:col-span-8 space-y-6">
                        {selectedCourse ? (
                          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
                            {/* Course Header Banner */}
                            <div className="p-6 bg-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                                  Currently Studying
                                </span>
                                <h3 className="text-xl font-bold mt-2 font-sans">{selectedCourse.title}</h3>
                                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{selectedCourse.description}</p>
                              </div>

                              <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                                <span className="text-xs font-mono bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-700 text-emerald-400 font-bold">
                                  {dashboardData.progress[selectedCourse.id] || 0}% Completed
                                </span>
                              </div>
                            </div>

                            {/* Active Lesson Video Player & Content */}
                            <div className="p-6 space-y-6">
                              {currentLesson ? (
                                <div className="space-y-6">
                                  {/* Lesson Title & Completion Toggle */}
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                                    <div>
                                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                                        {currentChapter?.title}
                                      </span>
                                      <h4 className="text-lg font-bold text-zinc-900 mt-0.5 flex items-center gap-2">
                                        <Play className="h-4 w-4 text-emerald-600 fill-current" />
                                        {currentLesson.title}
                                      </h4>
                                    </div>

                                    <button
                                      onClick={() => handleToggleLessonComplete(selectedCourse.id, currentLesson.id)}
                                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        completedLessonIds.includes(currentLesson.id)
                                          ? "bg-emerald-600 text-white shadow-sm"
                                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                                      }`}
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                      {completedLessonIds.includes(currentLesson.id) ? "Completed" : "Mark as Complete"}
                                    </button>
                                  </div>

                                  {/* Embedded Player or Video Frame */}
                                  <div className="relative aspect-video rounded-2xl bg-zinc-950 overflow-hidden shadow-inner border border-zinc-800">
                                    {currentLesson.videoUrl ? (
                                      <iframe
                                        src={
                                          currentLesson.videoUrl.includes("youtube.com/watch?v=")
                                            ? `https://www.youtube.com/embed/${currentLesson.videoUrl.split("v=")[1]?.split("&")[0]}`
                                            : currentLesson.videoUrl.includes("youtu.be/")
                                            ? `https://www.youtube.com/embed/${currentLesson.videoUrl.split("youtu.be/")[1]?.split("?")[0]}`
                                            : currentLesson.videoUrl
                                        }
                                        title={currentLesson.title}
                                        className="w-full h-full border-0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                      />
                                    ) : (
                                      <div className="h-full w-full flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                                        <Play className="h-12 w-12 text-zinc-600 mb-2" />
                                        <p className="text-sm font-semibold">Video lecture streaming active.</p>
                                        <p className="text-xs text-zinc-500 mt-1">Select a video lesson from the syllabus below.</p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Lesson Summary & Notes */}
                                  {currentLesson.summary && (
                                    <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-200/80">
                                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 text-emerald-600" /> Key Lesson Insights
                                      </h5>
                                      <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                                        {currentLesson.summary}
                                      </p>
                                    </div>
                                  )}

                                  {/* Lesson Attachments & PDF Downloads */}
                                  {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                                    <div className="space-y-2">
                                      <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                                        Lesson Handouts & Downloadable Notes:
                                      </h5>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {currentLesson.attachments.map((att, attIdx) => (
                                          <button
                                            key={att.id ? `att-${att.id}` : `att-idx-${attIdx}`}
                                            onClick={() => handleOpenPdf({ title: att.title, url: att.fileUrl, fileData: att.fileData })}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/30 text-left transition-all group cursor-pointer"
                                          >
                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                              <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                                              <span className="text-xs font-bold text-zinc-800 truncate group-hover:text-emerald-700">
                                                {att.title}
                                              </span>
                                            </div>
                                            <Eye className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-600 shrink-0" />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : null}

                              {/* Chapter Syllabus Accordion */}
                              <div className="pt-6 border-t border-zinc-200 space-y-4">
                                <h4 className="text-sm font-black uppercase tracking-wide text-zinc-900 flex items-center gap-2">
                                  <Layers className="h-4 w-4 text-emerald-600" /> Complete Course Syllabus & Lessons
                                </h4>

                                <div className="space-y-4">
                                  {selectedCourse.chapters?.map((ch, chIdx) => (
                                    <div key={ch.id ? `chap-${ch.id}` : `chap-idx-${chIdx}`} className="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/50">
                                      <div className="bg-zinc-100/70 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                                        <h5 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                                          {ch.title}
                                        </h5>
                                        <span className="text-[11px] text-zinc-500 font-semibold">
                                          {ch.lessons?.length || 0} Lessons
                                        </span>
                                      </div>

                                      <div className="divide-y divide-zinc-100 bg-white">
                                        {ch.lessons?.map((les, lesIdx) => {
                                          const isCur = currentLesson?.id === les.id;
                                          const isDone = completedLessonIds.includes(les.id);
                                          return (
                                            <div
                                              key={les.id ? `les-${ch.id || chIdx}-${les.id}` : `les-${chIdx}-${lesIdx}`}
                                              onClick={() => {
                                                setSelectedChapterId(ch.id);
                                                setSelectedLessonId(les.id);
                                              }}
                                              className={`p-3.5 flex items-center justify-between gap-3 hover:bg-emerald-50/30 transition-all cursor-pointer ${
                                                isCur ? "bg-emerald-50/60 border-l-4 border-emerald-600" : ""
                                              }`}
                                            >
                                              <div className="flex items-center gap-3">
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleLessonComplete(selectedCourse.id, les.id);
                                                  }}
                                                  className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                                                    isDone
                                                      ? "bg-emerald-600 text-white"
                                                      : "border border-zinc-300 text-transparent hover:border-emerald-600"
                                                  }`}
                                                >
                                                  <Check className="h-3 w-3 stroke-[3]" />
                                                </button>
                                                <div>
                                                  <p className={`text-xs font-bold ${isCur ? "text-emerald-900" : "text-zinc-800"}`}>
                                                    {lesIdx + 1}. {les.title}
                                                  </p>
                                                  <span className="text-[10px] text-zinc-400 font-mono">
                                                    {les.duration || "10 mins"}
                                                  </span>
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-2">
                                                {isCur && (
                                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                                    Now Playing
                                                  </span>
                                                )}
                                                <ChevronRight className="h-4 w-4 text-zinc-400" />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                            </div>
                          </div>
                        ) : (
                          <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm">
                            <BookOpen className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                            <h4 className="text-base font-bold text-zinc-800">Select a course to view lessons</h4>
                            <p className="text-xs text-zinc-500 mt-1">Choose any course from the curriculum on the left.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm space-y-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-zinc-900">No LMS Courses Enrolled Yet</h3>
                        <p className="text-zinc-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
                          Unlock personalized masterclasses covering psychometric blueprints, aptitude mastery, and career roadmap videos.
                        </p>
                      </div>
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> Explore Courses & Enroll
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ENROLLED ACADEMIC PROGRAMS */}
              {activeTab === "programs" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-zinc-900">Enrolled Academic Programs</h3>
                      <p className="text-xs text-zinc-500">Your personalized 1:1 career counseling and stream selection tracks.</p>
                    </div>
                    <Link
                      to="/contact"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100"
                    >
                      + Request 1:1 Mentor Session
                    </Link>
                  </div>

                  {dashboardData.enrolledPrograms && dashboardData.enrolledPrograms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dashboardData.enrolledPrograms.map((prog, progIdx) => (
                        <div
                          key={`prog-${prog.title || ""}-${prog.path || ""}-${progIdx}`}
                          className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between space-y-6"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                {prog.plan || "Active Track"}
                              </span>
                              <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                {new Date(prog.enrolledAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-lg font-bold text-zinc-900">{prog.title}</h4>
                              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                Complete multi-dimensional assessment, stream selection roadmap, and parent consultation modules.
                              </p>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                            <Link
                              to={prog.path}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                              Open Program Page <ArrowRight className="h-3.5 w-3.5" />
                            </Link>

                            <Link
                              to="/contact"
                              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-200"
                            >
                              Mentorship Connect
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm space-y-4">
                      <Award className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-zinc-900">No Academic Programs Linked</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">
                        Enroll into a targeted counseling program for Grade 6-8, Grade 8-10, Grade 11-12, or Undergraduates.
                      </p>
                      <Link
                        to="/programs/program2"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Explore Academic Programs
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DIAGNOSTIC ASSESSMENT HISTORY & EVALUATION REPORTS */}
              {activeTab === "diagnostics" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-zinc-900">Your Diagnostic Submissions & Scorecards</h3>
                      <p className="text-xs text-zinc-500">Review your psychometric trait breakdowns, MBTI/DISC evaluations, and score reports.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search tests..."
                          value={diagSearch}
                          onChange={(e) => setDiagSearch(e.target.value)}
                          className="pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <Link
                        to="/diagnostics"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        <BrainCircuit className="h-3.5 w-3.5" /> Take New Test
                      </Link>
                    </div>
                  </div>

                  {filteredDiagnostics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDiagnostics.map((rec, recIdx) => (
                        <div
                          key={rec.id ? `diag-${rec.id}` : `diag-${rec.testKey}-${recIdx}`}
                          className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between space-y-6 group"
                        >
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                                {rec.testKey.toUpperCase()}
                              </span>
                              <span className="text-xs text-zinc-400 flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                {new Date(rec.createdAt).toLocaleDateString()}
                              </span>
                            </div>

                            <div>
                              <h4 className="text-base font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">
                                {rec.testTitle}
                              </h4>
                              {rec.dominant && (
                                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-purple-900 bg-purple-100/70 px-3 py-1 rounded-lg border border-purple-200">
                                  <Award className="h-3.5 w-3.5 text-purple-600" />
                                  Archetype: {rec.dominant}
                                </div>
                              )}
                            </div>

                            {/* Score snippet */}
                            {rec.score && (
                              <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-100 text-xs text-zinc-600 space-y-1">
                                {rec.score.percentage !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Score Alignment:</span>
                                    <span className="font-bold text-zinc-800">{rec.score.percentage}%</span>
                                  </div>
                                )}
                                {rec.score.correctCount !== undefined && (
                                  <div className="flex justify-between">
                                    <span className="text-zinc-400">Correct Answers:</span>
                                    <span className="font-bold text-zinc-800">{rec.score.correctCount} / {rec.score.totalQuestions}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setSelectedDiagRecord(rec);
                                setIsDiagModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                            >
                              <Eye className="h-3.5 w-3.5" /> View Scorecard Report
                            </button>

                            <Link
                              to="/diagnostics"
                              className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-700"
                            >
                              Retake
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm space-y-4">
                      <BrainCircuit className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-zinc-900">No Assessment History Found</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">
                        Take our scientific DISC, MBTI, 16PF, or aptitude assessments to unlock your personality profile and career stream recommendations.
                      </p>
                      <Link
                        to="/diagnostics"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Start First Diagnostic Test
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: RESOURCE ACTIVITY & READING HISTORY */}
              {activeTab === "resources" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-black text-zinc-900">Accessed Study Materials & Videos</h3>
                      <p className="text-xs text-zinc-500">History of handbooks, psychometric guides, and masterclass videos you've opened.</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search accessed items..."
                          value={resourceSearch}
                          onChange={(e) => setResourceSearch(e.target.value)}
                          className="pl-8 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>

                      <Link
                        to="/resources"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> Browse Repository
                      </Link>
                    </div>
                  </div>

                  {filteredResources.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
                      <div className="divide-y divide-zinc-100">
                        {filteredResources.map((item, itemIdx) => (
                          <div
                            key={item.id ? `res-${item.id}` : `res-${item.resourceId || ""}-${itemIdx}`}
                            className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/60 transition-all"
                          >
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-2xl shrink-0 ${
                                item.type === "video"
                                  ? "bg-purple-50 text-purple-600 border border-purple-100"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              }`}>
                                {item.type === "video" ? <Play className="h-5 w-5 fill-current" /> : <FileText className="h-5 w-5" />}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">
                                    {item.category}
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {item.type === "video" ? "Masterclass Video" : "PDF Guidebook"}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-zinc-900 mt-1">{item.title}</h4>
                                <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-zinc-400" />
                                  Accessed on {new Date(item.accessedAt).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              {item.type === "video" ? (
                                <button
                                  onClick={() => handleOpenVideo(item.url || "")}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                  <Play className="h-3.5 w-3.5 fill-current" /> Watch Video
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenPdf({ title: item.title, category: item.category, url: item.url, fileData: item.fileData })}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5" /> Re-open PDF
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm space-y-4">
                      <History className="h-10 w-10 text-zinc-300 mx-auto mb-2" />
                      <h3 className="text-lg font-bold text-zinc-900">No Resource History Recorded</h3>
                      <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto">
                        Explore our comprehensive study materials and masterclass videos. Whenever you view or download a resource, it will be automatically archived here.
                      </p>
                      <Link
                        to="/resources"
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                      >
                        Explore Knowledge Repository
                      </Link>
                    </div>
                  )}
                </div>
              )}


            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: PDF Viewer */}
      {selectedPdf && (
        <PdfViewerModal
          isOpen={isPdfModalOpen}
          onClose={() => {
            setIsPdfModalOpen(false);
            setSelectedPdf(null);
          }}
          title={selectedPdf.title}
          category={selectedPdf.category}
          pdfUrl={selectedPdf.pdfUrl}
          fileData={selectedPdf.fileData}
        />
      )}

      {/* MODAL 2: YouTube Video Player */}
      {selectedVideoUrl && (
        <YouTubeModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setSelectedVideoUrl(null);
          }}
          videoUrl={selectedVideoUrl}
        />
      )}

      {/* MODAL 3: Detailed Diagnostic Scorecard Modal */}
      {selectedDiagRecord && isDiagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl border border-zinc-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-100">
                  {selectedDiagRecord.testKey.toUpperCase()} Scorecard
                </span>
                <h3 className="text-xl font-bold text-zinc-900 mt-1 font-sans">{selectedDiagRecord.testTitle}</h3>
              </div>
              <button
                onClick={() => {
                  setIsDiagModalOpen(false);
                  setSelectedDiagRecord(null);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score Overview */}
            <div className="bg-purple-50/80 border border-purple-200/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">Dominant Dimension:</span>
                <span className="text-sm font-black text-purple-900 bg-white px-3 py-1 rounded-lg border border-purple-200">
                  {selectedDiagRecord.dominant || "Evaluated Profile"}
                </span>
              </div>
              <p className="text-xs text-purple-800 leading-relaxed">
                Submitted on {new Date(selectedDiagRecord.createdAt).toLocaleString()}. Evaluated with psychometric calibration matrices.
              </p>
            </div>

            {/* Dimensions Breakdown */}
            {selectedDiagRecord.score?.counts && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Trait Response Distribution</h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedDiagRecord.score.counts).map(([trait, count]: any, tIdx) => (
                    <div key={`trait-${trait}-${tIdx}`} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 uppercase">{trait}</span>
                      <span className="text-xs font-mono font-black text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
                        {count} responses
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Answers Summary */}
            {selectedDiagRecord.answers && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Recorded Responses ({Object.keys(selectedDiagRecord.answers).length} questions)</h4>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs font-mono text-zinc-600">
                  {Object.entries(selectedDiagRecord.answers).map(([qKey, aVal], idx) => (
                    <div key={`ans-${qKey}-${idx}`} className="flex justify-between py-1 border-b border-zinc-200/50 last:border-0">
                      <span className="text-zinc-500">Question {idx + 1}:</span>
                      <span className="font-bold text-zinc-900">{String(aVal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}


            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Print / Save Scorecard
              </button>

              <button
                onClick={() => {
                  setIsDiagModalOpen(false);
                  setSelectedDiagRecord(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
