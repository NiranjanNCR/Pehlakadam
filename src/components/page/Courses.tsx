import { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { 
  PlayCircle, CheckCircle, Lock, ShieldCheck, FileText, Download, 
  Search, ChevronRight, Sparkles, GraduationCap, Clock, BookOpen, 
  UserCheck, X, ExternalLink, ArrowRight, Video, Layers, ChevronDown
} from "lucide-react";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import PaymentModal from "../PaymentModal";
import CourseCheckoutModal from "../CourseCheckoutModal";
import { Course, UserTier } from "../../types";

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTier, setSelectedTier] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");

  // Course Direct Checkout Modal
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Curriculum Syllabus Preview Modal (Preview without video playback)
  const [previewCurriculumCourse, setPreviewCurriculumCourse] = useState<Course | null>(null);
  const [expandedSyllabusChapters, setExpandedSyllabusChapters] = useState<Record<string, boolean>>({});

  // Student Auth State
  const [studentPhone, setStudentPhone] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [studentSessionId, setStudentSessionId] = useState<string>("");
  const [authStatus, setAuthStatus] = useState<{
    checked: boolean;
    authorized: boolean;
    tier: UserTier | null;
    message: string;
  }>({
    checked: false,
    authorized: false,
    tier: null,
    message: "",
  });
  const [isVerifying, setIsVerifying] = useState(false);

  // Check saved student phone on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem("pehlakadam_student_phone");
    const savedSession = localStorage.getItem("pehlakadam_student_session_id");
    if (savedSession) setStudentSessionId(savedSession);
    if (savedPhone) {
      setStudentPhone(savedPhone);
      setInputPhone(savedPhone);
      verifyStudentAccess(savedPhone, false, savedSession || undefined);
    }
    fetchCourses();
  }, []);

  // Heartbeat polling to enforce single-device session restriction in real time
  useEffect(() => {
    if (!authStatus.authorized || !studentPhone || !studentSessionId) return;

    const interval = setInterval(async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: studentPhone, sessionId: studentSessionId })
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.valid && data.sessionConflict) {
            console.warn("[Courses] Session conflict detected! Logging out.");
            setAuthStatus({
              checked: true,
              authorized: false,
              tier: null,
              message: "⚠️ Account Logged Out: Your phone number was accessed on another device or tab. Parallel viewing on multiple devices is restricted to 1 active user at a time."
            });
            setStudentPhone("");
            setStudentSessionId("");
            localStorage.removeItem("pehlakadam_student_phone");
            localStorage.removeItem("pehlakadam_student_session_id");
          }
        }
      } catch (err) {
        // Transient network or server reconnect — silently ignore to prevent false log noise
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [authStatus.authorized, studentPhone, studentSessionId]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("[Courses] Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const verifyStudentAccess = async (phoneToVerify: string, isExplicitLogin = false, existingSessionId?: string) => {
    if (!phoneToVerify.trim()) return;
    setIsVerifying(true);
    try {
      const rawDigits = phoneToVerify.replace(/[^0-9]/g, "");
      const cleanNum = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
      const sessId = existingSessionId || studentSessionId || localStorage.getItem("pehlakadam_student_session_id") || undefined;

      const res = await fetch("/api/check-premium-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: cleanNum,
          sessionId: sessId,
          action: isExplicitLogin ? "login" : "verify"
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authorized) {
          const userTier: UserTier = data.tier || "pro";
          const newSessId = data.sessionId || sessId || "";
          setAuthStatus({
            checked: true,
            authorized: true,
            tier: userTier,
            message: `🎉 Phone ${cleanNum} authorized! ${userTier.toUpperCase()} Tier active.`
          });
          setStudentPhone(cleanNum);
          setStudentSessionId(newSessId);
          localStorage.setItem("pehlakadam_student_phone", cleanNum);
          if (newSessId) {
            localStorage.setItem("pehlakadam_student_session_id", newSessId);
          }
        } else if (data.sessionConflict) {
          setAuthStatus({
            checked: true,
            authorized: false,
            tier: null,
            message: data.message || "⚠️ Session Conflict: Your phone number is logged in on another device. Parallel access on multiple devices is restricted to 1 active device at a time."
          });
          setStudentPhone("");
          setStudentSessionId("");
          localStorage.removeItem("pehlakadam_student_phone");
          localStorage.removeItem("pehlakadam_student_session_id");
        } else {
          setAuthStatus({
            checked: true,
            authorized: false,
            tier: null,
            message: "🔒 Mobile number not found in authorized list. Please enroll to unlock."
          });
        }
      }
    } catch (err) {
      console.error("[Courses] Error verifying access:", err);
      setAuthStatus({
        checked: true,
        authorized: false,
        tier: null,
        message: "Network error verifying access."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhoneSubmit = (e: FormEvent) => {
    e.preventDefault();
    verifyStudentAccess(inputPhone, true);
  };

  const handleLogoutStudent = () => {
    if (studentPhone) {
      fetch("/api/logout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: studentPhone, sessionId: studentSessionId })
      }).catch(() => {});
    }
    localStorage.removeItem("pehlakadam_student_phone");
    localStorage.removeItem("pehlakadam_student_session_id");
    setStudentPhone("");
    setInputPhone("");
    setStudentSessionId("");
    setAuthStatus({
      checked: false,
      authorized: false,
      tier: null,
      message: ""
    });
  };

  // Helper to check if user tier permits access to a course
  const canAccessCourse = (courseTier: UserTier): boolean => {
    if (!authStatus.authorized || !authStatus.tier) return false;
    const tierHierarchy: Record<UserTier, number> = {
      basic: 1,
      advance: 2,
      pro: 3
    };
    const userLevel = tierHierarchy[authStatus.tier] || 0;
    const requiredLevel = tierHierarchy[courseTier] || 1;
    return userLevel >= requiredLevel;
  };

  // Deep-link to student dashboard for unified LMS player
  const handleOpenCourseInDashboard = (course: Course) => {
    const phoneParam = studentPhone ? `&phone=${encodeURIComponent(studentPhone)}` : "";
    navigate(`/dashboard?courseId=${encodeURIComponent(course.id)}${phoneParam}`);
  };

  // Open Curriculum Syllabus Preview
  const handleOpenSyllabusPreview = (course: Course) => {
    setPreviewCurriculumCourse(course);
    const exp: Record<string, boolean> = {};
    (course.chapters || []).forEach(ch => { exp[ch.id] = true; });
    setExpandedSyllabusChapters(exp);
  };

  const toggleSyllabusChapter = (chapterId: string) => {
    setExpandedSyllabusChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.batch && course.batch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = selectedTier === "all" || course.tier === selectedTier;
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesBatch = selectedBatch === "all" || course.batch === selectedBatch;
    return matchesSearch && matchesTier && matchesCategory && matchesBatch;
  });

  const categories = Array.from(new Set(courses.map(c => c.category)));
  const batches = Array.from(new Set(courses.map(c => c.batch).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex flex-col font-sans">
      <NavigationBar />

      {/* 🚀 ACADEMY HERO & TIER BANNER */}
      <section className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
                <GraduationCap className="h-4 w-4" />
                PEHLAKADAM COURSE CATALOG & SYLLABUS DISCOVERY
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                Master Your Future with <span className="text-emerald-400">Structured Video Modules</span>
              </h1>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Explore comprehensive curriculum masterclasses, chapter worksheets, and career blueprints designed by senior mentors from BITS Pilani. Enrolled learners can launch their unified workspace directly in the Student Dashboard.
              </p>

              {/* Tier Legend Badges */}
              <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium">
                <span className="px-3 py-1.5 rounded-xl bg-blue-950/80 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Basic Tier: PDFs & Resource Guides
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Advance Tier: Interactive Video Courses
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Pro Tier: All Custom Courses + 1:1 Mentorship
                </span>
              </div>
            </div>

            {/* 🔑 STUDENT AUTHORIZATION STATUS / LOGIN CARD */}
            <div className="w-full md:w-96 rounded-3xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-2xl backdrop-blur-xl shrink-0">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Student Portal Access</h3>
                </div>
                {authStatus.authorized && (
                  <button
                    onClick={handleLogoutStudent}
                    className="text-[11px] font-semibold text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    Change Phone
                  </button>
                )}
              </div>

              {authStatus.authorized ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    Access Verified!
                  </div>
                  <p className="text-[11px] text-emerald-200/90">
                    Authorized Mobile: <span className="font-mono text-white font-bold">{studentPhone}</span>
                  </p>
                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold uppercase text-[10px] border border-emerald-500/40">
                      <Sparkles className="h-3 w-3" />
                      Tier: {authStatus.tier}
                    </div>

                    <Link
                      to={`/dashboard?phone=${studentPhone}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-900/40 cursor-pointer"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Open My Dashboard
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePhoneSubmit} className="space-y-3">
                  <p className="text-xs text-zinc-400">
                    Enter your registered student mobile number to verify your courses and open your dashboard:
                  </p>
                  <div>
                    <input
                      type="tel"
                      value={inputPhone}
                      onChange={(e) => setInputPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      required
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <span className="animate-pulse">Checking Authorization...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify Student Access
                      </>
                    )}
                  </button>
                  {authStatus.checked && !authStatus.authorized && (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[11px]">
                      {authStatus.message}
                      <div className="mt-2">
                        <PaymentModal buttonText="Enroll Now with Discount" buttonClassName="text-[10px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold w-full" />
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 🔍 FILTER & SEARCH BAR */}
      <section className="sticky top-20 z-30 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, topics, streams..."
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700/80 pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Tier, Category & Batch Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">All Access Tiers</option>
              <option value="basic">Basic Tier</option>
              <option value="advance">Advance Tier</option>
              <option value="pro">Pro Tier</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">All Categories & Grades</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>

            {batches.length > 0 && (
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="rounded-xl bg-zinc-800 border border-emerald-500/40 px-3 py-2 text-xs text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">All Course Batches</option>
                {batches.map((batch, idx) => (
                  <option key={idx} value={batch}>Batch: {batch}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      {/* 📚 COURSE CATALOG GRID */}
      <main className="flex-1 mx-auto max-w-7xl px-6 py-10 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-xs font-semibold text-zinc-400">Loading Pehlakadam LMS Courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 p-8">
            <BookOpen className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Courses Found</h3>
            <p className="text-xs text-zinc-400 mb-4">Try adjusting your search query or filters.</p>
            <button
              onClick={() => { setSearchQuery(""); setSelectedTier("all"); setSelectedCategory("all"); setSelectedBatch("all"); }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const hasAccess = canAccessCourse(course.tier);
              const totalLessons = course.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0) || 0;

              return (
                <div
                  key={course.id}
                  className={`group relative flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden ${
                    hasAccess
                      ? "border-emerald-500/40 bg-zinc-950 hover:border-emerald-500 shadow-xl shadow-emerald-950/20"
                      : "border-zinc-800 bg-zinc-950/80 hover:border-zinc-700"
                  }`}
                >
                  {/* Thumbnail / Preview Canvas */}
                  <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-850 to-emerald-950/40 p-6">
                        <Video className="h-12 w-12 text-emerald-500/40" />
                      </div>
                    )}

                    {/* Tier Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border shadow-md ${
                        course.tier === "basic"
                          ? "bg-blue-950/90 text-blue-300 border-blue-500/40"
                          : course.tier === "advance"
                          ? "bg-purple-950/90 text-purple-300 border-purple-500/40"
                          : "bg-amber-950/90 text-amber-300 border-amber-500/40"
                      }`}>
                        {course.tier} Tier
                      </span>
                    </div>

                    {/* Category Tag */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 rounded-lg bg-zinc-950/80 text-[10px] font-semibold text-zinc-300 border border-zinc-800">
                        {course.category}
                      </span>
                    </div>

                    {/* Access Status Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
                  </div>

                  {/* Course Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mb-1">
                      {course.title}
                    </h3>

                    {course.batch && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <Sparkles className="h-3 w-3 text-emerald-400" />
                          Batch: {course.batch}
                        </span>
                      </div>
                    )}

                    <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="mt-auto grid grid-cols-2 gap-2 text-[11px] text-zinc-400 mb-4 border-t border-b border-zinc-800/80 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{course.chapters?.length || 0} Chapters ({totalLessons} Videos)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>{course.duration || "Self-Paced"}</span>
                      </div>
                    </div>

                    {/* Pricing & Deep-Link Action */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div>
                        <div className="text-[10px] text-zinc-500 line-through">₹{course.originalPrice.toLocaleString("en-IN")}</div>
                        <div className="text-base font-black text-emerald-400">₹{course.discountPrice.toLocaleString("en-IN")}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Curriculum Syllabus Preview Button */}
                        <button
                          onClick={() => handleOpenSyllabusPreview(course)}
                          className="px-2.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs font-semibold transition-all cursor-pointer"
                          title="Preview Syllabus & Chapters"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                        </button>

                        {hasAccess ? (
                          <button
                            onClick={() => handleOpenCourseInDashboard(course)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
                          >
                            <PlayCircle className="h-4 w-4" />
                            Resume in Dashboard
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCheckoutCourse(course);
                              setIsCheckoutOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/80 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 hover:scale-[1.02] cursor-pointer"
                          >
                            <ShieldCheck className="h-4 w-4" />
                            Enroll Now ({course.tier.toUpperCase()})
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 📖 SYLLABUS / CURRICULUM PREVIEW MODAL */}
      {previewCurriculumCourse && typeof document !== "undefined" && createPortal(
        <div 
          onClick={() => setPreviewCurriculumCourse(null)}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl overflow-hidden text-zinc-100 max-h-[90vh] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">
                    {previewCurriculumCourse.tier} Tier Course
                  </span>
                  <span className="text-xs text-zinc-400">{previewCurriculumCourse.category}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{previewCurriculumCourse.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{previewCurriculumCourse.description}</p>
              </div>
              <button
                onClick={() => setPreviewCurriculumCourse(null)}
                className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chapters & Lesson Breakdown */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-medium">
                <span>{previewCurriculumCourse.chapters?.length || 0} Chapters in this Masterclass</span>
                <span>Total Duration: {previewCurriculumCourse.duration || "Self-Paced"}</span>
              </div>

              {previewCurriculumCourse.chapters && previewCurriculumCourse.chapters.length > 0 ? (
                previewCurriculumCourse.chapters.map((ch, chIdx) => (
                  <div key={ch.id || chIdx} className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden">
                    <button
                      onClick={() => toggleSyllabusChapter(ch.id)}
                      className="w-full flex items-center justify-between p-3.5 text-left hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center justify-center h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                          {chIdx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{ch.title}</h4>
                          <span className="text-[10px] text-zinc-400">{ch.lessons?.length || 0} Lessons</span>
                        </div>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-zinc-400 transition-transform ${expandedSyllabusChapters[ch.id] ? "rotate-180" : ""}`} />
                    </button>

                    {expandedSyllabusChapters[ch.id] && (
                      <div className="bg-zinc-950/70 border-t border-zinc-800/60 divide-y divide-zinc-800/40">
                        {ch.lessons?.map((les, lIdx) => (
                          <div key={les.id || lIdx} className="p-3 pl-11 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              <span className="text-zinc-300">{les.title}</span>
                            </div>
                            <span className="text-[10px] text-zinc-500 font-mono">{les.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic p-4 text-center">Curriculum details being updated by advisors.</p>
              )}
            </div>

            {/* Footer Action */}
            <div className="border-t border-zinc-800 pt-4 mt-4 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-zinc-500 block">Complete Access</span>
                <span className="text-lg font-black text-emerald-400">₹{previewCurriculumCourse.discountPrice.toLocaleString("en-IN")}</span>
              </div>

              {canAccessCourse(previewCurriculumCourse.tier) ? (
                <button
                  onClick={() => {
                    const c = previewCurriculumCourse;
                    setPreviewCurriculumCourse(null);
                    handleOpenCourseInDashboard(c);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume in Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    const c = previewCurriculumCourse;
                    setPreviewCurriculumCourse(null);
                    setCheckoutCourse(c);
                    setIsCheckoutOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Enroll in Course ({previewCurriculumCourse.tier.toUpperCase()})
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 💳 COURSE DIRECT ZERO-FEE CHECKOUT & AUTO-ENROLLMENT MODAL */}
      <CourseCheckoutModal
        course={checkoutCourse}
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutCourse(null);
        }}
        onEnrollSuccess={(phone, tier) => {
          setStudentPhone(phone);
          setInputPhone(phone);
          setAuthStatus({
            checked: true,
            authorized: true,
            tier: (tier as UserTier) || "advance",
            message: `Instant access activated for +91 ${phone} (${tier.toUpperCase()} Tier)`
          });
        }}
      />

      <Footer />
    </div>
  );
}
