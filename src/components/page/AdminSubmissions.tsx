import { useState, useEffect, useMemo, ChangeEvent, FormEvent } from "react";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import AdminProgramsConfig from "../AdminProgramsConfig";
import AdminDiagnostics from "../AdminDiagnostics";
import AdminCourses from "../AdminCourses";
import AdminCoupons from "../AdminCoupons";
import PdfViewerModal from "../PdfViewerModal";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  PlusCircle,
  FileText,
  Film,
  Trash2,
  Send,
  CheckCircle,
  Upload,
  Layers,
  Bell,
  ListFilter,
  Lock,
  Unlock,
  ShieldCheck,
  LogOut,
  CreditCard,
  Download,
  Settings,
  BrainCircuit,
  Globe,
  Sparkles,
  Clock,
  Video,
  ExternalLink,
  X,
  CheckCircle2,
  BookOpen,
  Tag,
  Eye,
  Zap,
  Check,
  Edit3,
  GraduationCap,
  BookMarked,
  UserCheck,
  Filter,
  Image as ImageIcon,
  Database,
  Server,
  HardDrive,
  Cloud
} from "lucide-react";
import { Submission, ResourceMaterial, SessionUpdate, Testimonial } from "../../types";
import { motion, AnimatePresence } from "motion/react";

// =========================================================================================
// 👑 ADMIN DASHBOARD SUB-SYSTEM ROUTING DEFINITION
// =========================================================================================
type AdminTab = "leads" | "payments" | "resources" | "lms-courses" | "coupons" | "broadcast" | "paid-access" | "programs-config" | "diagnostics" | "system-stats" | "subscribers" | "testimonials";

export interface AuthorizedStudent {
  id: string;
  number: string;
  studentName?: string;
  email?: string;
  tier?: "pro" | "advance" | "basic" | string;
  enrolledPrograms?: string[];
  enrolledCourses?: string[];
  createdAt: string;
  updatedAt?: string;
}

export const SYSTEM_PROGRAM_OPTIONS = [
  { key: "kudos", label: "Primary Kudos (Class 1-5)" },
  { key: "6-8", label: "Junior Explorers (Class 6-8)" },
  { key: "9-10", label: "Secondary Steer (Class 9-10)" },
  { key: "11-12", label: "Senior Stream & Career (Class 11-12)" },
  { key: "graduate", label: "Undergraduate & Graduate Launch" },
  { key: "generalist", label: "Generalist to Specialist" },
];

export const SYSTEM_DEFAULT_COURSES = [
  { id: "course-1", title: "Master Psychometric & Career Stream Blueprint" },
  { id: "course-2", title: "Pro Mentorship: Modern Tech & Management Placement Masterclass" },
  { id: "course-disc", title: "DISC Personality Mastery & Behavioral Mapping" },
  { id: "course-mbti", title: "MBTI 16-Personalities Cognitive Framework" },
  { id: "course-ats", title: "ATS Resume Architecture & Corporate Placement Masterclass" }
];

export default function AdminSubmissions() {
  const [activeTab, setActiveTab] = useState<AdminTab>("leads");
  
  // 💾 CORE DATA STATES
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [resources, setResources] = useState<ResourceMaterial[]>([]);
  const [broadcasts, setBroadcasts] = useState<SessionUpdate[]>([]);
  const [authorizedNumbers, setAuthorizedNumbers] = useState<AuthorizedStudent[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isReconciling, setIsReconciling] = useState<boolean>(false);
  const [reconcileMessage, setReconcileMessage] = useState<string>("");
  const [programsConfigs, setProgramsConfigs] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; phone?: string; createdAt: string }[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // ⚡ AUTO-APPROVAL & PAYMENT FILTERS
  const [autoApprovalEnabled, setAutoApprovalEnabled] = useState<boolean>(true);
  const [togglingAutoApproval, setTogglingAutoApproval] = useState<boolean>(false);
  const [paymentSearch, setPaymentSearch] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "auto_approved" | "pending" | "approved" | "revoked">("all");

  // 🎯 COUNSELING SCHEDULING & INDIVIDUAL NOTIFICATION STATES
  const [selectedLeadForCounselling, setSelectedLeadForCounselling] = useState<Submission | null>(null);
  const [counsellingForm, setCounsellingForm] = useState({
    counsellingDate: "",
    counsellingTime: "",
    counsellingTopic: "1-on-1 Stream Selection & Career Strategy Session",
    joiningLink: "",
    counsellingNotes: ""
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [sendingNotifyChannel, setSendingNotifyChannel] = useState<"email" | "whatsapp" | "sms" | null>(null);
  const [notifyResultMsg, setNotifyResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [previewPdf, setPreviewPdf] = useState<{
    isOpen: boolean;
    title: string;
    category: string;
    pdfUrl?: string;
    fileData?: string;
  }>({
    isOpen: false,
    title: "",
    category: ""
  });
  
  // 📝 NEW TESTIMONIAL FORM STATES
  const [testiStudentName, setTestiStudentName] = useState("");
  const [testiStream, setTestiStream] = useState("");
  const [testiAchievement, setTestiAchievement] = useState("");
  const [testiStory, setTestiStory] = useState("");
  const [testiFile, setTestiFile] = useState<File | null>(null);
  const [testiFileData, setTestiFileData] = useState("");
  const [testiCreating, setTestiCreating] = useState(false);
  
  // 📈 SYSTEM STATS STATE FOR ADMIN EDITING
  const [adminStats, setAdminStats] = useState({
    studentsCount: "10K+",
    expertsCount: "15+",
    successRate: "99%",
    upiId: "nrjstudywrk@okicici",
    merchantName: "Niranjan Singh (Pehlakadam)",
    razorpayEnabled: true,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    hasRazorpaySecret: false,
    razorpayWebhookSecret: "",
    hasRazorpayWebhookSecret: false,
    instagramUrl: "#",
    youtubeUrl: "#",
    whatsappSupportUrl: "#",
    whatsappGroupUrl: "",
    forumJoinUrl: "",
    seoTitle: "Pehlakadam - Best Career Counselling & Personality Development",
    seoDescription: "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
    seoKeywords: "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
    seoAuthor: "Pehlakadam",
    faviconUrl: "",
    faviconData: "",
    termsContent: "",
    privacyContent: "",
    refundContent: "",
    disclaimerContent: ""
  });
  const [updatingStats, setUpdatingStats] = useState(false);
  const [updateStatsSuccess, setUpdateStatsSuccess] = useState(false);
  const [faviconMode, setFaviconMode] = useState<"presets" | "upload" | "url">("presets");

  // 🗄️ LIVE DATABASE & PERSISTENCE STATE
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    storageMode: string;
    targetUri: string;
    counts: { courses: number; students: number; submissions: number; testimonials: number; coupons: number };
    isPermanentCloudStorage: boolean;
  } | null>(null);
  const [syncingDb, setSyncingDb] = useState(false);
  const [syncDbMessage, setSyncDbMessage] = useState<string | null>(null);

  // 🌟 BRAND FAVICON PRESET PACKAGES
  const DEFAULT_FAVICON_EMBLEM = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='48' fill='%23059669' stroke='%23047857' stroke-width='4'/%3E%3Ctext x='50' y='63' font-family='system-ui, -apple-system, sans-serif' font-size='42' font-weight='900' fill='white' text-anchor='middle'%3EPK%3C/text%3E%3C/svg%3E";

  const FAVICON_PRESETS = [
    {
      id: "pk-emblem",
      name: "PK Official Emblem",
      desc: "Brand signature emerald circular badge with PK monogram",
      svgData: DEFAULT_FAVICON_EMBLEM
    },
    {
      id: "career-rocket",
      name: "Career Launch Rocket",
      desc: "High-contrast indigo rocket symbolizing speed & career growth",
      svgData: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%234F46E5'/%3E%3Cpath d='M50 18 C62 30 68 46 66 63 L34 63 C32 46 38 30 50 18 Z' fill='%23FFFFFF'/%3E%3Ccircle cx='50' cy='42' r='7' fill='%234F46E5'/%3E%3Cpath d='M34 63 L22 75 L38 75 Z' fill='%23F59E0B'/%3E%3Cpath d='M66 63 L78 75 L62 75 Z' fill='%23F59E0B'/%3E%3Cpath d='M44 75 L50 86 L56 75 Z' fill='%23EF4444'/%3E%3C/svg%3E"
    },
    {
      id: "grad-cap",
      name: "Academic Graduation Cap",
      desc: "Classic mortarboard and gold tassel on emerald tile",
      svgData: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%23047857'/%3E%3Cpolygon points='50,22 86,38 50,54 14,38' fill='%23FFFFFF'/%3E%3Cpath d='M26 48 L26 66 C26 76 74 76 74 66 L74 48' fill='none' stroke='%23FFFFFF' stroke-width='6' stroke-linecap='round'/%3E%3Cpath d='M80 40 L80 62' stroke='%23FCD34D' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='80' cy='65' r='4' fill='%23FCD34D'/%3E%3C/svg%3E"
    },
    {
      id: "mind-spark",
      name: "Psychometric Mind & Assessment",
      desc: "Cognitive spark & assessment compass on vibrant sky tile",
      svgData: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%230284C7'/%3E%3Cpath d='M35 32 C26 32 20 40 22 50 C20 58 26 66 34 66 C36 74 44 78 50 78 C56 78 64 74 66 66 C74 66 80 58 78 50 C80 40 74 32 65 32 C60 24 40 24 35 32 Z' fill='%23FFFFFF'/%3E%3Ccircle cx='50' cy='50' r='6' fill='%230284C7'/%3E%3Cpath d='M50 36 L50 42 M50 58 L50 64 M36 50 L42 50 M58 50 L64 50' stroke='%230284C7' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E"
    },
    {
      id: "golden-star",
      name: "Prestige Star of Excellence",
      desc: "Gold faceted star on deep carbon tile",
      svgData: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%2318181B'/%3E%3Cpolygon points='50,15 61,38 86,40 66,58 72,83 50,70 28,83 34,58 14,40 39,38' fill='%23F59E0B' stroke='%23FCD34D' stroke-width='2'/%3E%3C/svg%3E"
    },
    {
      id: "open-book",
      name: "Academy Knowledge Book",
      desc: "Open study manual and guidance roadmap on teal tile",
      svgData: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='24' fill='%230D9488'/%3E%3Cpath d='M50 35 C42 26 26 28 20 30 L20 74 C26 72 42 70 50 78 C58 70 74 72 80 74 L80 30 C74 28 58 26 50 35 Z' fill='%23FFFFFF'/%3E%3Cline x1='50' y1='35' x2='50' y2='78' stroke='%230D9488' stroke-width='3'/%3E%3C/svg%3E"
    }
  ];

  const applyLiveFavicon = (iconSrc: string) => {
    if (!iconSrc) return;
    const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    if (links.length > 0) {
      links.forEach((l) => {
        l.href = iconSrc;
      });
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = iconSrc;
      document.head.appendChild(newLink);
    }
  };

  const handleFaviconFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Favicon file must be less than 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const result = loadEvt.target?.result as string;
      if (result) {
        setAdminStats((prev) => ({
          ...prev,
          faviconData: result,
          faviconUrl: ""
        }));
        applyLiveFavicon(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetFavicon = (presetSvgData: string) => {
    setAdminStats((prev) => ({
      ...prev,
      faviconData: presetSvgData,
      faviconUrl: ""
    }));
    applyLiveFavicon(presetSvgData);
  };

  const handleResetFavicon = () => {
    setAdminStats((prev) => ({
      ...prev,
      faviconData: DEFAULT_FAVICON_EMBLEM,
      faviconUrl: ""
    }));
    applyLiveFavicon(DEFAULT_FAVICON_EMBLEM);
  };
  
  // 🔒 ADMIN AUTHENTICATION STATES
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // ⚙️ LOADING, REFRESHING, & FILTER STATES
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // 📝 NEW RESOURCE SUBMISSION STATE
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceCategory, setResourceCategory] = useState("");
  const [resourceDesc, setResourceDesc] = useState("");
  const [resourceType, setResourceType] = useState<"pdf" | "video">("pdf");
  const [resourceIsPaid, setResourceIsPaid] = useState(false); // TOGGLE PAID MODE STATE
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // 🔒 PREMIUM ACCESS LIST COMPOSER STATE
  const [newAuthNumber, setNewAuthNumber] = useState("");
  const [authStudentName, setAuthStudentName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authTier, setAuthTier] = useState<"pro" | "advance" | "basic">("pro");
  const [authSelectedPrograms, setAuthSelectedPrograms] = useState<string[]>([]);
  const [authSelectedCourses, setAuthSelectedCourses] = useState<string[]>([]);
  const [savingAuthNumber, setSavingAuthNumber] = useState(false);
  const [authSearchQuery, setAuthSearchQuery] = useState("");

  // ✏️ EDIT STUDENT ENROLLED ACCESS MODAL STATE
  const [editingAuthUser, setEditingAuthUser] = useState<AuthorizedStudent | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editStudentName, setEditStudentName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTier, setEditTier] = useState<"pro" | "advance" | "basic">("pro");
  const [editSelectedPrograms, setEditSelectedPrograms] = useState<string[]>([]);
  const [editSelectedCourses, setEditSelectedCourses] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // 📢 NEW LIVE BROADCAST BROADCASTER STATE
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastReceipt, setBroadcastReceipt] = useState<SessionUpdate | null>(null);

  const handleAdminLogout = () => {
    localStorage.removeItem("pehlakadam_admin_token");
    localStorage.removeItem("pehlakadam_admin_unlocked");
    setIsLoggedIn(false);
    setSubmissions([]);
    setResources([]);
    setBroadcasts([]);
  };

  const handleAdminLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPhone.trim()) return;
    setLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, phone: adminPhone })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("pehlakadam_admin_token", data.token);
        localStorage.setItem("pehlakadam_admin_unlocked", "true");
        setIsLoggedIn(true);
        // We will call fetchAllData via an effect or directly
        setTimeout(() => {
          fetchAllData();
        }, 100);
      } else {
        const err = await response.json();
        setLoginError(err.error || "Verification failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login connection error:", err);
      setLoginError("Could not connect to authentication server. Please check your internet connection.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAddAuthNumber = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAuthNumber.trim()) {
      alert("Please provide the student's mobile number.");
      return;
    }
    setSavingAuthNumber(true);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/authorized-numbers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          number: newAuthNumber,
          studentName: authStudentName.trim() || "Enrolled Student",
          email: authEmail.trim(),
          tier: authTier,
          enrolledPrograms: authSelectedPrograms,
          enrolledCourses: authSelectedCourses
        })
      });
      if (res.ok) {
        setNewAuthNumber("");
        setAuthStudentName("");
        setAuthEmail("");
        setAuthTier("pro");
        setAuthSelectedPrograms([]);
        setAuthSelectedCourses([]);
        const resAuth = await fetch("/api/authorized-numbers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAuth.ok) {
          const authData = await resAuth.json();
          setAuthorizedNumbers(authData);
        }
        alert("Student successfully enrolled and whitelisted for instant access!");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to whitelist phone number.");
      }
    } catch (err) {
      console.error("Error adding whitelist number:", err);
      alert("Error saving whitelist number.");
    } finally {
      setSavingAuthNumber(false);
    }
  };

  const handleOpenEditModal = (student: AuthorizedStudent) => {
    setEditingAuthUser(student);
    setEditNumber(student.number || "");
    setEditStudentName(student.studentName || "");
    setEditEmail(student.email || "");
    setEditTier((student.tier as any) || "pro");
    setEditSelectedPrograms(Array.isArray(student.enrolledPrograms) ? [...student.enrolledPrograms] : []);
    setEditSelectedCourses(Array.isArray(student.enrolledCourses) ? [...student.enrolledCourses] : []);
  };

  const handleUpdateAuthUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingAuthUser) return;
    setSavingEdit(true);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/authorized-numbers/${editingAuthUser.id || editingAuthUser.number}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          number: editNumber,
          studentName: editStudentName.trim() || "Enrolled Student",
          email: editEmail.trim(),
          tier: editTier,
          enrolledPrograms: editSelectedPrograms,
          enrolledCourses: editSelectedCourses
        })
      });
      if (res.ok) {
        setEditingAuthUser(null);
        const resAuth = await fetch("/api/authorized-numbers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAuth.ok) {
          const authData = await resAuth.json();
          setAuthorizedNumbers(authData);
        }
        alert("Enrolled student permissions and courses successfully updated!");
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to update student access.");
      }
    } catch (err) {
      console.error("Error updating student access:", err);
      alert("Network error while updating student access.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRevokeAuthNumber = async (num: string, name?: string) => {
    if (!confirm(`Are you sure you want to revoke enrollment and whitelisted access for: ${name ? `"${name}" ` : ""}(+91 ${num})?`)) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/authorized-numbers/${num}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const resAuth = await fetch("/api/authorized-numbers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAuth.ok) {
          const authData = await resAuth.json();
          setAuthorizedNumbers(authData);
        }
      } else {
        alert("Failed to revoke whitelist entry.");
      }
    } catch (err) {
      console.error("Error deleting whitelist number:", err);
      alert("Error revoking whitelist entry.");
    }
  };

  // 📚 Consolidate active catalog courses with default courses for complete coverage
  const allCatalogCourses = useMemo(() => {
    if (coursesList && coursesList.length > 0) {
      return coursesList.map((c: any) => ({
        id: String(c.id || c._id || c.slug),
        _id: c._id ? String(c._id) : undefined,
        title: c.title,
        category: c.category || "",
        tier: c.tier || "pro"
      }));
    }
    return SYSTEM_DEFAULT_COURSES;
  }, [coursesList]);

  // 🔄 Trigger student reconciliation across MongoDB and local storage
  const handleReconcileEnrollments = async () => {
    try {
      setIsReconciling(true);
      setReconcileMessage("");
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/admin/reconcile-enrollments", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReconcileMessage(data.message || "All student enrollments and courses successfully reconciled.");
        await fetchAllData();
        setTimeout(() => setReconcileMessage(""), 6000);
      } else {
        alert(data.error || "Failed to reconcile student enrollments.");
      }
    } catch (err: any) {
      console.error("Error reconciling enrollments:", err);
      alert("Failed to connect with enrollment reconciliation service.");
    } finally {
      setIsReconciling(false);
    }
  };

  /**
   * 🔄 DB SYNCHRONIZATION ROUTINE
   * Fetches data in parallel/sequence from the backend endpoints with high fault tolerance.
   * Isolates failures so that a problem in one endpoint does not prevent loading the rest of the console.
   */
  const fetchAllData = async () => {
    setError("");
    setLoading(true);
    const token = localStorage.getItem("pehlakadam_admin_token");
    const authHeaders = { "Authorization": `Bearer ${token}` };

    const checkUnauthorized = (res: Response) => {
      if (res.status === 401) {
        handleAdminLogout();
        return true;
      }
      return false;
    };

    // 0. Fetch Courses Catalog
    try {
      const resCourses = await fetch("/api/courses");
      if (resCourses.ok) {
        const cData = await resCourses.json();
        if (Array.isArray(cData) && cData.length > 0) {
          setCoursesList(cData);
        }
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    }

    // 1. Fetch Submissions
    try {
      const resSub = await fetch("/api/submissions", { headers: authHeaders });
      if (checkUnauthorized(resSub)) return;
      if (resSub.ok) {
        const subsData = await resSub.json();
        if (Array.isArray(subsData)) {
          const sorted = subsData.sort((a, b) => {
            const idA = a && a.id ? String(a.id) : "";
            const idB = b && b.id ? String(b.id) : "";
            return idB.localeCompare(idA);
          });
          setSubmissions(sorted);
        }
      } else {
        console.warn("Submissions API returned non-ok status:", resSub.status);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    }

    // 2. Fetch Resources
    try {
      const resRes = await fetch("/api/resources");
      if (resRes.ok) {
        const resData = await resRes.json();
        if (Array.isArray(resData)) {
          setResources(resData);
        }
      } else {
        console.warn("Resources API returned non-ok status:", resRes.status);
      }
    } catch (err) {
      console.error("Error loading resources:", err);
    }

    // 3. Fetch Broadcasts
    try {
      const resBroad = await fetch("/api/updates", { headers: authHeaders });
      if (checkUnauthorized(resBroad)) return;
      if (resBroad.ok) {
        const broadData = await resBroad.json();
        if (Array.isArray(broadData)) {
          const sortedBroad = broadData.sort((a: any, b: any) => {
            const idA = a && a.id ? String(a.id) : "";
            const idB = b && b.id ? String(b.id) : "";
            return idB.localeCompare(idA);
          });
          setBroadcasts(sortedBroad);
        }
      } else {
        console.warn("Updates API returned non-ok status:", resBroad.status);
      }
    } catch (err) {
      console.error("Error loading updates:", err);
    }

    // 4. Fetch Whitelisted Numbers
    try {
      const resAuth = await fetch("/api/authorized-numbers", { headers: authHeaders });
      if (checkUnauthorized(resAuth)) return;
      if (resAuth.ok) {
        const authData = await resAuth.json();
        if (Array.isArray(authData)) {
          setAuthorizedNumbers(authData);
        }
      } else {
        console.warn("Authorized numbers API returned non-ok status:", resAuth.status);
      }
    } catch (err) {
      console.error("Error loading whitelisted numbers:", err);
    }

    // 5. Fetch Payment Submissions
    try {
      const resPay = await fetch("/api/payments", { headers: authHeaders });
      if (checkUnauthorized(resPay)) return;
      if (resPay.ok) {
        const payData = await resPay.json();
        if (Array.isArray(payData)) {
          const sortedPay = payData.sort((a: any, b: any) => {
            const idA = a && a.id ? String(a.id) : "";
            const idB = b && b.id ? String(b.id) : "";
            return idB.localeCompare(idA);
          });
          setPayments(sortedPay);
        }
      } else {
        console.warn("Payments API returned non-ok status:", resPay.status);
      }
    } catch (err) {
      console.error("Error loading payments:", err);
    }

    // 6. Fetch Programs Configuration
    try {
      const resProg = await fetch("/api/programs-config");
      if (resProg.ok) {
        const progData = await resProg.json();
        if (Array.isArray(progData)) {
          setProgramsConfigs(progData);
        }
      } else {
        console.warn("Programs config API returned non-ok status:", resProg.status);
      }
    } catch (err) {
      console.error("Error loading programs config:", err);
    }

    // 7. Fetch System Stats
    try {
      const resStats = await fetch("/api/system-stats");
      if (resStats.ok) {
        const statsData = await resStats.json();
        if (statsData) {
          setAdminStats(statsData);
        }
      } else {
        console.warn("System stats API returned non-ok status:", resStats.status);
      }
    } catch (err) {
      console.error("Error loading system stats:", err);
    }

    // 8. Fetch Weekly Tips Subscribers
    try {
      const resSubs = await fetch("/api/career-tips-subscribers", { headers: authHeaders });
      if (checkUnauthorized(resSubs)) return;
      if (resSubs.ok) {
        const subsData = await resSubs.json();
        if (Array.isArray(subsData)) {
          setSubscribers(subsData);
        }
      } else {
        console.warn("Subscribers API returned non-ok status:", resSubs.status);
      }
    } catch (err) {
      console.error("Error loading subscribers:", err);
    }

    // 9. Fetch Success Testimonials
    try {
      const resTesti = await fetch("/api/testimonials");
      if (resTesti.ok) {
        const testiData = await resTesti.json();
        if (Array.isArray(testiData)) {
          setTestimonials(testiData);
        }
      } else {
        console.warn("Testimonials API returned non-ok status:", resTesti.status);
      }
    } catch (err) {
      console.error("Error loading testimonials:", err);
    }

    // 10. Fetch Auto-Approval Status
    try {
      const resAuto = await fetch("/api/admin/auto-approval-status", { headers: authHeaders });
      if (resAuto.ok) {
        const autoData = await resAuto.json();
        if (typeof autoData.autoApprovalEnabled === "boolean") {
          setAutoApprovalEnabled(autoData.autoApprovalEnabled);
        }
      }
    } catch (err) {
      console.error("Error loading auto-approval status:", err);
    }

    // 11. Fetch Database & Persistence Status
    try {
      const resDb = await fetch("/api/admin/database/status", { headers: authHeaders });
      if (resDb.ok) {
        const dbData = await resDb.json();
        setDbStatus(dbData);
      }
    } catch (err) {
      console.error("Error loading database status:", err);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const handleSyncDatabase = async () => {
    setSyncingDb(true);
    setSyncDbMessage(null);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/admin/database/sync-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setSyncDbMessage(`✅ Sync Complete: Migrated ${data.synced?.courses || 0} courses, ${data.synced?.students || 0} students to MongoDB Atlas!`);
        // Refresh status
        const resDb = await fetch("/api/admin/database/status", { headers: { "Authorization": `Bearer ${token}` } });
        if (resDb.ok) {
          const dbData = await resDb.json();
          setDbStatus(dbData);
        }
      } else {
        setSyncDbMessage(`⚠️ ${data.error || "Sync failed"}`);
      }
    } catch (err: any) {
      setSyncDbMessage(`❌ Network error: ${err.message}`);
    } finally {
      setSyncingDb(false);
    }
  };

  const handleUpdateStats = async (e: FormEvent) => {
    e.preventDefault();
    setUpdatingStats(true);
    setUpdateStatsSuccess(false);
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/system-stats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(adminStats)
      });
      if (res.ok) {
        setUpdateStatsSuccess(true);
        setTimeout(() => setUpdateStatsSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update stats.");
      }
    } catch (err) {
      console.error("Error updating system stats:", err);
      alert("Failed to update system stats.");
    } finally {
      setUpdatingStats(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm("Are you sure you want to remove this subscriber from the Weekly Career Tips list?")) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/career-tips-subscribers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
      } else {
        alert("Failed to remove subscriber.");
      }
    } catch (err) {
      console.error("Error deleting subscriber:", err);
      alert("Failed to remove subscriber.");
    }
  };

  const handleOpenCounsellingModal = (sub: Submission) => {
    setSelectedLeadForCounselling(sub);
    setCounsellingForm({
      counsellingDate: sub.counsellingDate || "",
      counsellingTime: sub.counsellingTime || "",
      counsellingTopic: sub.counsellingTopic || "1-on-1 Stream Selection & Career Strategy Session",
      joiningLink: sub.joiningLink || "",
      counsellingNotes: sub.counsellingNotes || ""
    });
    setNotifyResultMsg(null);
  };

  const handleSaveCounsellingSchedule = async () => {
    if (!selectedLeadForCounselling) return;
    setSavingSchedule(true);
    setNotifyResultMsg(null);

    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/submissions/${selectedLeadForCounselling.id}/counselling`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(counsellingForm)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmissions(prev =>
          prev.map(item => item.id === selectedLeadForCounselling.id ? { ...item, ...counsellingForm } : item)
        );
        setSelectedLeadForCounselling(prev => prev ? { ...prev, ...counsellingForm } : null);
        setNotifyResultMsg({ type: "success", text: "Counseling session schedule saved successfully!" });
      } else {
        setNotifyResultMsg({ type: "error", text: data.error || "Failed to save schedule." });
      }
    } catch (err) {
      console.error(err);
      setNotifyResultMsg({ type: "error", text: "Network error while saving schedule." });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSendNotification = async (channel: "email" | "whatsapp" | "sms") => {
    if (!selectedLeadForCounselling) return;
    setSendingNotifyChannel(channel);
    setNotifyResultMsg(null);

    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/submissions/${selectedLeadForCounselling.id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          channel,
          customMessage: counsellingForm.counsellingNotes
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setNotifyResultMsg({
          type: "success",
          text: `Notification dispatched via ${channel.toUpperCase()} to ${selectedLeadForCounselling.firstName}!`
        });

        if (channel === "whatsapp" && data.details?.whatsappUrl) {
          window.open(data.details.whatsappUrl, "_blank");
        }

        // Save notification record to local submission state
        if (data.notification) {
          setSubmissions(prev =>
            prev.map(item => {
              if (item.id === selectedLeadForCounselling.id) {
                const updatedNotes = item.notifications || [];
                return { ...item, notifications: [...updatedNotes, data.notification] };
              }
              return item;
            })
          );
        }
      } else {
        setNotifyResultMsg({ type: "error", text: data.error || "Failed to send notification." });
      }
    } catch (err) {
      console.error(err);
      setNotifyResultMsg({ type: "error", text: "Network error sending notification." });
    } finally {
      setSendingNotifyChannel(null);
    }
  };

  const handleGrantPaidAccessForLead = async (phone: string, name?: string) => {
    if (!phone) {
      alert("This candidate does not have a valid phone number recorded.");
      return;
    }
    const cleanNum = phone.replace(/[^0-9]/g, "");
    if (!cleanNum) {
      alert("Invalid phone number formatting.");
      return;
    }
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/authorized-numbers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ number: cleanNum })
      });
      if (res.ok) {
        const resAuth = await fetch("/api/authorized-numbers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAuth.ok) {
          const authData = await resAuth.json();
          setAuthorizedNumbers(authData);
        }
        alert(`🎉 Paid Section Access successfully granted for ${name || phone}!`);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to grant paid section access.");
      }
    } catch (err) {
      console.error("Error granting paid section access:", err);
      alert("Network error granting paid section access.");
    }
  };

  const handleRevokePaidAccessForLead = async (phone: string, name?: string) => {
    const cleanNum = phone.replace(/[^0-9]/g, "");
    if (!confirm(`Are you sure you want to remove ${name || phone} from Paid Section Access?`)) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/authorized-numbers/${cleanNum}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const resAuth = await fetch("/api/authorized-numbers", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (resAuth.ok) {
          const authData = await resAuth.json();
          setAuthorizedNumbers(authData);
        }
      } else {
        alert("Failed to revoke paid access.");
      }
    } catch (err) {
      console.error("Error revoking paid access:", err);
      alert("Error revoking paid access.");
    }
  };

  const handleTestiFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image file is too large! Max limit is 5MB.");
      return;
    }

    setTestiFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setTestiFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTestimonial = async (e: FormEvent) => {
    e.preventDefault();
    if (!testiStudentName || !testiStream || !testiAchievement || !testiStory) {
      alert("Please fill in all testimonial fields.");
      return;
    }

    setTestiCreating(true);
    try {
      const payload = {
        studentName: testiStudentName,
        stream: testiStream,
        achievement: testiAchievement,
        story: testiStory,
        fileName: testiFile ? testiFile.name : undefined,
        fileData: testiFileData || undefined
      };

      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pehlakadam_admin_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Success testimony uploaded successfully!");
        setTestiStudentName("");
        setTestiStream("");
        setTestiAchievement("");
        setTestiStory("");
        setTestiFile(null);
        setTestiFileData("");
        await fetchAllData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to upload success testimony.");
      }
    } catch (err) {
      console.error("Error adding testimonial:", err);
      alert("Failed to upload success testimony.");
    } finally {
      setTestiCreating(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this success testimony?")) {
      return;
    }

    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("pehlakadam_admin_token")}`
        }
      });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Failed to delete testimony.");
      }
    } catch (err) {
      console.error("Error deleting testimonial:", err);
      alert("Failed to delete testimony.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("pehlakadam_admin_token");
    if (token) {
      setIsLoggedIn(true);
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  /**
   * 📂 FILE SERIALIZATION UTILITY (BASE64)
   * This handles the user's selected PDF handbook file.
   * 1. Check that the file size is within limits (12MB max for standard REST JSON payloads).
   * 2. Initialize the standard JavaScript browser `FileReader` API.
   * 3. Convert the binary file asynchronously into an safe Base64 Data URL string (`reader.readAsDataURL`).
   * 4. Save the Base64 string in component state, which is sent to `/api/resources` as a JSON attribute.
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert("File is too large! Maximum limit is 12MB.");
      return;
    }

    setPdfFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPdfBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * 📤 PUBLISH RESOURCE HANDLER
   * Sends the newly created educational handbook (PDF Base64 string) or video stream details
   * to the backend.
   * 1. Validates input state variables.
   * 2. Packs the attributes in a JSON object.
   * 3. Initiates a `POST` request to `/api/resources`.
   * 4. On success, resets form fields, displays a success prompt, and calls `fetchAllData` to refresh list.
   */
  const handleAddResource = async (e: FormEvent) => {
    e.preventDefault();
    if (!resourceTitle || !resourceCategory || !resourceDesc) {
      alert("Please fill in all general resource fields.");
      return;
    }

    if (resourceType === "pdf" && !pdfBase64) {
      alert("Please select and load a PDF file to upload.");
      return;
    }

    if (resourceType === "video" && !videoUrl) {
      alert("Please provide a valid Video stream/embed URL.");
      return;
    }

    setUploading(true);
    try {
      const payload = {
        title: resourceTitle,
        category: resourceCategory,
        description: resourceDesc,
        type: resourceType,
        videoUrl: resourceType === "video" ? videoUrl : undefined,
        fileData: resourceType === "pdf" ? pdfBase64 : undefined,
        fileName: resourceType === "pdf" && pdfFile ? pdfFile.name : undefined,
        isPaid: resourceIsPaid
      };

      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pehlakadam_admin_token")}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setUploadSuccess(true);
        setResourceTitle("");
        setResourceCategory("");
        setResourceDesc("");
        setVideoUrl("");
        setPdfFile(null);
        setPdfBase64("");
        setResourceIsPaid(false);
        
        // Refresh local resource list to immediately display the published file
        await fetchAllData();

        setTimeout(() => {
          setUploadSuccess(false);
        }, 3000);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to upload resource material.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Connection failure while uploading.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * 🗑️ DELETE RESOURCE HANDLER
   * Requests physical file removal and entry deletion by firing a `DELETE` call to `/api/resources/:id`.
   */
  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this resource file?")) return;

    try {
      const res = await fetch(`/api/resources/${id}`, { 
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${localStorage.getItem("pehlakadam_admin_token")}`
        }
      });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("Failed to delete resource from server.");
      }
    } catch (err) {
      console.error("Delete resource error:", err);
      alert("Network failure while deleting resource.");
    }
  };

  /**
   * 💰 DOWNLOAD FILE UTILITY FOR RECEIPTS
   */
  const downloadFile = (base64Data: string, fileName: string) => {
    if (!base64Data) {
      alert("No proof file attached to this payment submission.");
      return;
    }
    try {
      const link = document.createElement("a");
      link.href = base64Data;
      link.download = fileName || "payment_screenshot";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Could not download attachment. Opening file preview instead.");
      const win = window.open();
      if (win) {
        win.document.write(`<iframe src="${base64Data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
      }
    }
  };

  /**
   * 🌟 APPROVE & DIRECTLY WHITELIST STUDENT FROM PAYMENT RECORD
   */
  const handleDirectWhitelist = async (paymentId: string | undefined, number: string, name?: string, tier: string = "pro") => {
    if (!number) return;
    const cleanNum = number.replace(/[^0-9]/g, "");
    if (!confirm(`Are you sure you want to approve ${name ? `"${name}"` : `contact +${cleanNum}`} and grant instant access for paid resources and courses?`)) return;

    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId, number: cleanNum, name, tier })
      });
      if (res.ok) {
        alert(`Successfully approved and granted access for student: ${name || `+${cleanNum}`}`);
        fetchAllData();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to approve payment.");
      }
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Error approving payment.");
    }
  };

  /**
   * 🔒 REVOKE PAID ACCESS FOR A STUDENT / PAYMENT PROOF RECORD
   */
  const handleRevokePaymentAccess = async (paymentId: string | undefined, number: string, name?: string) => {
    if (!number) return;
    const cleanNum = number.replace(/[^0-9]/g, "");
    if (!confirm(`Are you sure you want to REVOKE paid resources and course access for ${name || `+${cleanNum}`}?`)) {
      return;
    }
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/admin/payments/revoke", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentId, number: cleanNum })
      });
      if (res.ok) {
        alert(`Paid access revoked successfully for ${name || `+${cleanNum}`}.`);
        fetchAllData();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to revoke access.");
      }
    } catch (err) {
      console.error("Error revoking access:", err);
      alert("Network error while revoking access.");
    }
  };

  /**
   * ⚡ TOGGLE AUTO-APPROVAL ENGINE (UTR / INSTANT ENROLLMENT)
   */
  const handleToggleAutoApproval = async () => {
    try {
      setTogglingAutoApproval(true);
      const token = localStorage.getItem("pehlakadam_admin_token");
      const nextState = !autoApprovalEnabled;
      const res = await fetch("/api/admin/toggle-auto-approval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ enabled: nextState })
      });
      if (res.ok) {
        setAutoApprovalEnabled(nextState);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to toggle auto approval.");
      }
    } catch (err) {
      console.error("Error toggling auto-approval:", err);
    } finally {
      setTogglingAutoApproval(false);
    }
  };

  /**
   * 🗑️ DELETE A CONSULTATION LEAD (PERMANENT REMOVAL)
   */
  const handleDeleteLead = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to permanently delete lead record "${name || id}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/submissions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== id));
        alert(`Consultation lead "${name || id}" has been deleted.`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete lead.");
      }
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("Network error while deleting lead.");
    }
  };

  /**
   * 🗑️ DELETE A PAYMENT PROOF SUBMISSION (PERMANENT REMOVAL)
   */
  const handleDeletePayment = async (id: string, name?: string) => {
    if (!confirm(`Are you sure you want to permanently delete the payment proof submission for "${name || id}"? This action cannot be undone.`)) {
      return;
    }
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPayments(prev => prev.filter(p => p.id !== id));
        alert(`Payment submission for "${name || id}" has been deleted.`);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to delete payment proof.");
      }
    } catch (err) {
      console.error("Error deleting payment proof:", err);
      alert("Network error while deleting payment proof.");
    }
  };

  /**
   * 📢 BROADCAST DISPATCH HANDLER (ADMIN TO REGISTERED LEADS)
   * Broadcasts a career notification, live orientation schedule, or diagnostic test alert
   * to all registered student leads.
   * 1. Calls the `/api/updates` post handler with the announcement message body.
   * 2. The backend intercepts the call, loads all lead accounts, and logs delivery output logs.
   * 3. Renders the transmission receipt receipt showing the lists of notified student leads.
   */
  const handlePublishBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) {
      alert("Announcement message cannot be blank.");
      return;
    }

    setBroadcasting(true);
    try {
      const res = await fetch("/api/updates", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("pehlakadam_admin_token")}`
        },
        body: JSON.stringify({ message: broadcastMsg })
      });

      if (res.ok) {
        const result = await res.json();
        setBroadcastReceipt(result.update);
        setBroadcastMsg("");
        
        // Sync active notifications state list
        await fetchAllData();
      } else {
        alert("Could not process notification broadcast.");
      }
    } catch (err) {
      console.error("Broadcast error:", err);
      alert("Connection error occurred while broadcasting.");
    } finally {
      setBroadcasting(false);
    }
  };

  // 🔍 ADVISOR LEAD SEARCH FILTER
  // Performs clean case-insensitive real-time filtering on lead registrations.
  const filteredLeads = submissions.filter(
    (sub) =>
      `${sub.firstName} ${sub.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-between text-white relative overflow-hidden">
        <NavigationBar />
        
        {/* Background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-8 sm:p-10 rounded-3xl shadow-2xl"
          >
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Advisor Console
              </span>
              <h2 className="text-2xl font-black mt-3 tracking-tight font-sans text-white">
                Secure Portal Access
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1.5">
                Enter your whitelisted Gmail and authorized phone number to gain access.
              </p>
            </div>

            {loginError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-200 leading-relaxed font-medium">
                  {loginError}
                </p>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
                  Granted Admin Gmail
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    placeholder="example@gmail.com"
                    className="w-full bg-zinc-950/80 text-white pl-11 pr-4 py-3 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-sm transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 font-mono">
                  Granted Admin Phone
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    required
                    placeholder="919876501234"
                    className="w-full bg-zinc-950/80 text-white pl-11 pr-4 py-3 rounded-2xl border border-zinc-800 focus:border-emerald-500 text-sm transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">
                  Use international format without '+' or spaces.
                </p>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loggingIn ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying Access...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Authorize & Enter
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <motion.div
      id="admin-submissions-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50 flex flex-col justify-between"
    >
      <div>
        <NavigationBar />

        {/* Admin Header */}
        <section className="bg-zinc-950 text-white py-12 relative overflow-hidden border-b border-zinc-900">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[80px] rounded-full translate-x-1/2"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Pehlakadam Advisor Console
              </span>
              <h1 className="text-3xl font-black tracking-tight font-sans text-white mt-2">
                Operational Management Dashboard
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                Manage consultation leads, publish psychometric PDFs & videos, and broadcast session alerts to registered leads.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="refresh-all-data-btn"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 py-2.5 px-4 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer w-fit"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
                {refreshing ? "Synchronizing DB..." : "Sync Dashboard"}
              </button>

              <button
                id="admin-logout-btn"
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-200 border border-red-900/30 py-2.5 px-4 text-xs font-semibold transition-all cursor-pointer w-fit"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Admin Sub-Navigation (Tabs) */}
        <div className="bg-white border-b border-zinc-200">
          <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto">
            <button
              onClick={() => setActiveTab("leads")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "leads"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <User className="h-4 w-4" /> Consultation Leads ({submissions.length})
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "payments"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <CreditCard className="h-4 w-4" /> Payment Proofs ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("resources")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "resources"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <FileText className="h-4 w-4" /> Resource Manager ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab("lms-courses")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "lms-courses"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <BookOpen className="h-4 w-4" /> LMS Courses
            </button>
            <button
              onClick={() => setActiveTab("coupons")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "coupons"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Tag className="h-4 w-4" /> Coupon Manager
            </button>
            <button
              onClick={() => setActiveTab("broadcast")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "broadcast"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Bell className="h-4 w-4" /> Broadcast Updates ({broadcasts.length})
            </button>
            <button
              onClick={() => setActiveTab("paid-access")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "paid-access"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Lock className="h-4 w-4" /> Whitelist Access ({authorizedNumbers.length})
            </button>
            <button
              onClick={() => setActiveTab("programs-config")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "programs-config"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Settings className="h-4 w-4" /> Programs Config ({programsConfigs.length})
            </button>
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "diagnostics"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <BrainCircuit className="h-4 w-4" /> Scientific Diagnostics
            </button>
            <button
              onClick={() => setActiveTab("system-stats")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "system-stats"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Settings className="h-4 w-4" /> Home Page Stats
            </button>
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "subscribers"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Mail className="h-4 w-4" /> Tips Subscribers ({subscribers.length})
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`py-4 px-6 text-xs uppercase tracking-wider font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "testimonials"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/20"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Sparkles className="h-4 w-4" /> Success Testimonials ({testimonials.length})
            </button>
          </div>
        </div>

        {/* Main Content Workspace */}
        <main className="py-12 max-w-7xl mx-auto px-6">
          
          {loading && !refreshing ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
              <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 text-sm font-medium">Fetching secure console registers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-950">Connection Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchAllData}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Retry Database Fetch
              </button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: CONSULTATION LEADS */}
              {activeTab === "lms-courses" && (
                <motion.div
                  key="lms-courses-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AdminCourses />
                </motion.div>
              )}

              {activeTab === "coupons" && (
                <motion.div
                  key="coupons-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AdminCoupons />
                </motion.div>
              )}

              {activeTab === "leads" && (
                <motion.div
                  key="leads-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search leads by name, email, role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                      />
                    </div>
                    <p className="text-xs font-mono text-zinc-500 font-semibold uppercase">
                      Matching Leads: <span className="text-zinc-800 font-bold">{filteredLeads.length}</span>
                    </p>
                  </div>

                  {filteredLeads.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredLeads.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow relative"
                        >
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3.5">
                              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-sans">
                                {sub.firstName[0]}
                                {sub.lastName[0]}
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-zinc-950 font-sans">
                                  {sub.firstName} {sub.lastName}
                                </h3>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                                    {sub.role}
                                  </span>
                                  {sub.plan && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit border ${
                                      sub.plan === "Premium Pro"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : sub.plan === "Standard"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}>
                                      {sub.plan}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              id={`delete-lead-btn-${sub.id}`}
                              onClick={() => handleDeleteLead(sub.id, `${sub.firstName} ${sub.lastName}`)}
                              title="Delete Lead Record"
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200 cursor-pointer shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="space-y-2 pt-4 border-t border-zinc-100 text-xs text-zinc-500">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-zinc-400" />
                              <a href={`mailto:${sub.email}`} className="hover:text-emerald-600 transition-colors font-medium">
                                {sub.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-zinc-400" />
                              <a href={`tel:${sub.number}`} className="hover:text-emerald-600 transition-colors font-medium">
                                {sub.number}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                              <span>{new Date(sub.createdAt || Date.now()).toLocaleString()}</span>
                            </div>
                          </div>

                          <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-xs">
                            <p className="font-semibold text-zinc-700 flex items-center gap-1 mb-1.5">
                              <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                              Goals & Message:
                            </p>
                            <p className="text-zinc-600 leading-normal italic whitespace-pre-line">
                              "{sub.message}"
                            </p>
                          </div>

                          {/* 📅 SCHEDULED COUNSELING STATUS BADGE */}
                          {sub.counsellingDate ? (
                            <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                                  Counseling Scheduled
                                </span>
                                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                                  Confirmed
                                </span>
                              </div>
                              <p className="text-emerald-800 font-medium text-[11px]">
                                🎯 {sub.counsellingTopic || "1-on-1 Counseling Session"}
                              </p>
                              <div className="flex items-center gap-3 text-emerald-700 font-medium text-[11px]">
                                <span>📅 {sub.counsellingDate}</span>
                                {sub.counsellingTime && <span>⏰ {sub.counsellingTime}</span>}
                              </div>
                              {sub.joiningLink && (
                                <a
                                  href={sub.joiningLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                                >
                                  <ExternalLink className="h-3 w-3" /> Join Link: {sub.joiningLink}
                                </a>
                              )}
                            </div>
                          ) : (
                            <div className="mt-3 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs flex items-center justify-between text-amber-900">
                              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                                <Clock className="h-3.5 w-3.5 text-amber-600" />
                                Counseling Pending Schedule
                              </span>
                            </div>
                          )}

                          {/* 🔔 SENT NOTIFICATIONS HISTORY LOG */}
                          {sub.notifications && sub.notifications.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-zinc-100 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Sent Updates:</span>
                              {sub.notifications.map((n, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    n.channel === "email"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : n.channel === "whatsapp"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200"
                                  }`}
                                >
                                  {n.channel.toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 🔑 PAID SECTION ACCESS CONTROL */}
                          {(() => {
                            const cleanLeadPhone = (sub.number || "").replace(/[^0-9]/g, "");
                            const isPaidUser = authorizedNumbers.some(item => (item.number || "").replace(/[^0-9]/g, "") === cleanLeadPhone);

                            return (
                              <div className={`mt-3 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-all ${
                                isPaidUser 
                                  ? "bg-emerald-50/80 border-emerald-200/90 text-emerald-900" 
                                  : "bg-zinc-50 border-zinc-200 text-zinc-700"
                              }`}>
                                <div className="flex items-center gap-2">
                                  <ShieldCheck className={`h-4 w-4 shrink-0 ${isPaidUser ? "text-emerald-600" : "text-zinc-400"}`} />
                                  <div>
                                    <span className="font-bold flex items-center gap-1.5 text-[11px]">
                                      {isPaidUser ? "Paid Section Access: Active" : "Paid Section Access: Not Granted"}
                                    </span>
                                    <p className="text-[10px] text-zinc-500 font-medium">
                                      {isPaidUser 
                                        ? "Candidate can access all paid resources & study guides on /resources" 
                                        : "Grant paid access so this candidate can view exclusive materials"}
                                    </p>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {isPaidUser ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRevokePaidAccessForLead(sub.number, `${sub.firstName} ${sub.lastName}`)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 py-1.5 px-3 text-[11px] font-bold transition-all cursor-pointer border border-red-200"
                                    >
                                      <Lock className="h-3 w-3" />
                                      Revoke Access
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleGrantPaidAccessForLead(sub.number, `${sub.firstName} ${sub.lastName}`)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-3 text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                                    >
                                      <Sparkles className="h-3 w-3" />
                                      Add to Paid Section
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 🎯 ACTION BUTTONS FOR COUNSELING SCHEDULING & NOTIFICATION */}
                          <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                            <button
                              id={`schedule-counselling-btn-${sub.id}`}
                              onClick={() => handleOpenCounsellingModal(sub)}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs font-bold transition-all shadow-sm cursor-pointer"
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              Schedule & Notify Counseling
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm p-8">
                      <User className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-zinc-800">No consultation requests found</h3>
                      <p className="text-zinc-500 text-sm mt-1">Once students register, their profiles will appear here.</p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: RESOURCE MATERIAL MANAGER */}
              {activeTab === "resources" && (
                <motion.div
                  key="resources-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Upload Form */}
                  <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm h-fit">
                    <h2 className="text-xl font-bold font-sans text-zinc-950 mb-1 flex items-center gap-2">
                      <PlusCircle className="h-5 w-5 text-emerald-600" />
                      Upload New Resource
                    </h2>
                    <p className="text-zinc-500 text-xs mb-6">
                      Add a downloadable PDF Handbook or register a video masterclass link to display on the public library.
                    </p>

                    <form onSubmit={handleAddResource} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Resource Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setResourceType("pdf")}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              resourceType === "pdf"
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            <FileText className="h-4 w-4" /> PDF Handbook
                          </button>
                          <button
                            type="button"
                            onClick={() => setResourceType("video")}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              resourceType === "video"
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            <Film className="h-4 w-4" /> Video Masterclass
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Resource Title
                        </label>
                        <input
                          type="text"
                          required
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                          placeholder="e.g. Advanced MBTI Career Strategy Grid"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Category Index
                        </label>
                        <input
                          type="text"
                          required
                          value={resourceCategory}
                          onChange={(e) => setResourceCategory(e.target.value)}
                          placeholder="e.g. Psychometrics, Stream Choice"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Description
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={resourceDesc}
                          onChange={(e) => setResourceDesc(e.target.value)}
                          placeholder="Give a summary of what cognitive benchmarks are covered..."
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        ></textarea>
                      </div>

                      {resourceType === "video" ? (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                            YouTube Stream or Embed URL
                          </label>
                          <input
                            type="url"
                            required
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                            Select PDF File
                          </label>
                          <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center hover:bg-zinc-50 transition-colors relative cursor-pointer">
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-zinc-700">
                              {pdfFile ? pdfFile.name : "Choose PDF or drag & drop"}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-1">
                              {pdfFile ? `${(pdfFile.size / 1024).toFixed(1)} KB Loaded` : "Only PDF files supported. Max 12MB."}
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Access Mode (Unpaid vs Paid)
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setResourceIsPaid(false)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              !resourceIsPaid
                                ? "bg-zinc-100 border-zinc-300 text-zinc-900 shadow-sm"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            <Unlock className="h-4 w-4 text-zinc-500" /> Unpaid (Free)
                          </button>
                          <button
                            type="button"
                            onClick={() => setResourceIsPaid(true)}
                            className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              resourceIsPaid
                                ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-black shadow-inner"
                                : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                            }`}
                          >
                            <Lock className="h-4 w-4" /> Paid (Premium)
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Uploading Material...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" /> Publish to Library
                          </>
                        )}
                      </button>

                      {uploadSuccess && (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs text-center font-semibold animate-pulse">
                          🎉 Resource Material published successfully!
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Resource List / Grid */}
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-xl font-bold font-sans text-zinc-950">
                      Active Library Resources ({resources.length})
                    </h2>

                    <div className="space-y-4">
                      {resources.map((res) => (
                        <div
                          key={res.id}
                          className="bg-white rounded-2xl border border-zinc-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm"
                        >
                          <div className="space-y-2 flex-grow max-w-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                {res.category}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase bg-zinc-50 px-2 py-0.5 rounded-lg border border-zinc-100 flex items-center gap-1">
                                {res.type === "pdf" ? <FileText className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                                {res.format || res.type}
                              </span>
                              {res.isPaid && (
                                <span className="text-[10px] font-extrabold font-mono uppercase bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                                  <Lock className="h-3 w-3 text-amber-600" /> Premium
                                </span>
                              )}
                            </div>
                            <h3 className="text-md font-bold text-zinc-900 font-sans">{res.title}</h3>
                            <p className="text-zinc-500 text-xs leading-normal">{res.description}</p>
                          </div>

                          <div className="flex items-center gap-2 sm:self-center">
                            {res.type === "pdf" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewPdf({
                                      isOpen: true,
                                      title: res.title,
                                      category: res.category,
                                      pdfUrl: `/api/resources/view/${res.id}`,
                                      fileData: res.fileData
                                    });
                                  }}
                                  className="p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 text-zinc-700 hover:text-emerald-700 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                                  title="Read in Document Viewer"
                                >
                                  <Eye className="h-4 w-4 text-emerald-600" />
                                  <span className="hidden sm:inline">Preview</span>
                                </button>
                                <a
                                  href={`/api/resources/download/${res.id}`}
                                  className="p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-zinc-600 hover:text-emerald-700 transition-all"
                                  title="Download"
                                >
                                  <Upload className="h-4 w-4 rotate-180" />
                                </a>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteResource(res.id)}
                              className="p-2.5 rounded-xl border border-zinc-200 hover:border-red-400 hover:bg-red-50 text-zinc-600 hover:text-red-700 transition-all cursor-pointer"
                              title="Delete Material"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: SESSION BROADCASTER */}
              {activeTab === "broadcast" && (
                <motion.div
                  key="broadcast-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                  {/* Broadcast Composer */}
                  <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm h-fit">
                    <h2 className="text-xl font-bold font-sans text-zinc-950 mb-1 flex items-center gap-2">
                      <Bell className="h-5 w-5 text-emerald-600" />
                      Session Updates Composer
                    </h2>
                    <p className="text-zinc-500 text-xs mb-6">
                      Broadcasting triggers automated emails and phone SMS warnings to all leads registered on Pehlakadam.
                    </p>

                    <form onSubmit={handlePublishBroadcast} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Session Notification Alert Message
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={broadcastMsg}
                          onChange={(e) => setBroadcastMsg(e.target.value)}
                          placeholder="e.g. Next diagnostic orientation begins tomorrow Monday at 6 PM. Access link sent to your registered emails."
                          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={broadcasting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {broadcasting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Distributing Alerts...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" /> Broadcast Updates
                          </>
                        )}
                      </button>
                    </form>

                    {/* Receipt visualizer */}
                    {broadcastReceipt && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wide">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Delivery Receipt Created
                        </div>
                        <p className="text-zinc-600 text-[11px] leading-relaxed">
                          Alert successfully processed and distributed to <span className="font-bold text-zinc-800">{broadcastReceipt.notifiedCount} student leads</span>.
                        </p>
                        <div className="max-h-32 overflow-y-auto text-[10px] space-y-1.5 border-t border-emerald-100 pt-3">
                          {broadcastReceipt.recipients.map((rec, i) => (
                            <div key={i} className="text-zinc-500 flex justify-between">
                              <span className="font-semibold text-zinc-700">{rec.name}</span>
                              <span>{rec.email}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Broadcast History List */}
                  <div className="lg:col-span-7 space-y-4">
                    <h2 className="text-xl font-bold font-sans text-zinc-950">
                      Broadcast Dispatch Log ({broadcasts.length})
                    </h2>

                    <div className="space-y-4">
                      {broadcasts.length > 0 ? (
                        broadcasts.map((b) => (
                          <div
                            key={b.id}
                            className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-4"
                          >
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Delivered to {b.notifiedCount} leads
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400 font-semibold">
                                {new Date(b.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <p className="text-zinc-700 text-xs leading-normal font-medium bg-zinc-50 p-4 rounded-xl border border-zinc-100 whitespace-pre-line">
                              "{b.message}"
                            </p>

                            <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                              <span>Simulated System Delivery Status: 🟢 Delivered</span>
                              <span>Receipt ID: #{b.id}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                          <Bell className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                          <h3 className="text-md font-bold text-zinc-800">No broadcast history yet</h3>
                          <p className="text-zinc-500 text-xs mt-1">Updates published here will alert students on email & mobile numbers.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: PAYMENT PROOFS VERIFICATION MANAGER */}
              {activeTab === "payments" && (
                <motion.div
                  key="payments-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Top Bar: Title & Auto-Approval Engine Controller */}
                  <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold font-sans text-zinc-950 flex items-center gap-2">
                            Payment & Transaction Verification
                            <span className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-full font-bold">
                              {payments.length} Submissions
                            </span>
                          </h2>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            Automated UTR verification & manual admin review workflow for course & resource access.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Approval Mode Switcher */}
                    <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-200/80 p-3.5 rounded-2xl">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${autoApprovalEnabled ? "bg-emerald-500 text-white" : "bg-zinc-300 text-zinc-700"}`}>
                          <Zap className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-zinc-900">Auto-Approval Mode:</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              autoApprovalEnabled
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {autoApprovalEnabled ? "⚡ AUTOMATED (Instant Access)" : "⏳ MANUAL REVIEW ONLY"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500">
                            {autoApprovalEnabled
                              ? "Valid UTRs automatically grant instant access with duplicate check."
                              : "Submissions will require manual approval by admin before access is granted."}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleAutoApproval}
                        disabled={togglingAutoApproval}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                          autoApprovalEnabled
                            ? "bg-zinc-800 hover:bg-zinc-900 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {togglingAutoApproval ? "Updating..." : autoApprovalEnabled ? "Switch to Manual Mode" : "Enable Auto-Approval"}
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  {(() => {
                    const autoApprovedCount = payments.filter((p) => p.status === "auto_approved" || p.autoVerified).length;
                    const manualApprovedCount = payments.filter((p) => p.status === "approved").length;
                    const pendingCount = payments.filter((p) => {
                      const isWhitelisted = authorizedNumbers.some(
                        (auth) => auth.number.replace(/[^0-9]/g, "") === p.number?.replace(/[^0-9]/g, "")
                      );
                      return !isWhitelisted && p.status !== "revoked";
                    }).length;
                    const totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

                    return (
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Submissions</p>
                          <h3 className="text-2xl font-black text-zinc-900 mt-1 font-sans">{payments.length}</h3>
                          <span className="text-[11px] text-zinc-500 font-medium">All course & resource transactions</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Auto-Verified
                          </p>
                          <h3 className="text-2xl font-black text-emerald-800 mt-1 font-sans">{autoApprovedCount}</h3>
                          <span className="text-[11px] text-emerald-700 font-medium">Instant UTR OCR validated</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending Review
                          </p>
                          <h3 className="text-2xl font-black text-amber-800 mt-1 font-sans">{pendingCount}</h3>
                          <span className="text-[11px] text-amber-700 font-medium">Awaiting manual approval</span>
                        </div>
                        <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/20 p-4 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Revenue</p>
                          <h3 className="text-2xl font-black text-blue-800 mt-1 font-sans">₹{totalRevenue.toLocaleString("en-IN")}</h3>
                          <span className="text-[11px] text-blue-700 font-medium">Gross collection recorded</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2 w-full sm:w-80 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
                      <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search student, phone, UTR, email..."
                        value={paymentSearch}
                        onChange={(e) => setPaymentSearch(e.target.value)}
                        className="bg-transparent text-xs text-zinc-900 w-full focus:outline-none placeholder-zinc-400 font-sans"
                      />
                      {paymentSearch && (
                        <button onClick={() => setPaymentSearch("")} className="text-zinc-400 hover:text-zinc-600">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                      {(["all", "auto_approved", "pending", "approved", "revoked"] as const).map((filterKey) => (
                        <button
                          key={filterKey}
                          onClick={() => setPaymentFilter(filterKey)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                            paymentFilter === filterKey
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {filterKey === "all"
                            ? `All (${payments.length})`
                            : filterKey === "auto_approved"
                            ? "⚡ Auto-Approved"
                            : filterKey === "pending"
                            ? "⏳ Pending Review"
                            : filterKey === "approved"
                            ? "👑 Approved"
                            : "🚫 Revoked"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Grid */}
                  {(() => {
                    const filteredPayments = payments.filter((pay) => {
                      const isWhitelisted = authorizedNumbers.some(
                        (auth) => auth.number.replace(/[^0-9]/g, "") === pay.number?.replace(/[^0-9]/g, "")
                      );

                      // Status filter
                      if (paymentFilter === "auto_approved" && pay.status !== "auto_approved" && !pay.autoVerified) {
                        return false;
                      }
                      if (paymentFilter === "approved" && (pay.status !== "approved" && !isWhitelisted)) {
                        return false;
                      }
                      if (paymentFilter === "pending" && (isWhitelisted || pay.status === "revoked")) {
                        return false;
                      }
                      if (paymentFilter === "revoked" && pay.status !== "revoked") {
                        return false;
                      }

                      // Search query
                      if (paymentSearch.trim()) {
                        const q = paymentSearch.toLowerCase();
                        const fullName = `${pay.firstName || ""} ${pay.lastName || ""}`.toLowerCase();
                        const phone = String(pay.number || "").toLowerCase();
                        const email = String(pay.email || "").toLowerCase();
                        const utr = String(pay.transactionId || "").toLowerCase();
                        const role = String(pay.role || "").toLowerCase();
                        return (
                          fullName.includes(q) ||
                          phone.includes(q) ||
                          email.includes(q) ||
                          utr.includes(q) ||
                          role.includes(q)
                        );
                      }

                      return true;
                    });

                    if (filteredPayments.length === 0) {
                      return (
                        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm p-8">
                          <CreditCard className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-zinc-800">No payment submissions found</h3>
                          <p className="text-zinc-500 text-sm mt-1">
                            {paymentSearch || paymentFilter !== "all"
                              ? "Try adjusting your search query or filter."
                              : "Once students submit payment proofs, they will display here for authorization."}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPayments.map((pay) => {
                          const isWhitelisted = authorizedNumbers.some(
                            (auth) => auth.number.replace(/[^0-9]/g, "") === pay.number?.replace(/[^0-9]/g, "")
                          );
                          const isAutoVerified = pay.autoVerified || pay.status === "auto_approved";

                          return (
                            <div
                              key={pay.id}
                              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between ${
                                isWhitelisted
                                  ? "border-emerald-200 bg-emerald-50/5"
                                  : pay.status === "revoked"
                                  ? "border-red-200 bg-red-50/5"
                                  : "border-zinc-200"
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold font-sans text-sm ${
                                      isAutoVerified
                                        ? "bg-emerald-100 text-emerald-800"
                                        : isWhitelisted
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-zinc-100 text-zinc-700"
                                    }`}>
                                      {pay.firstName ? pay.firstName[0] : "S"}
                                      {pay.lastName ? pay.lastName[0] : "T"}
                                    </div>
                                    <div>
                                      <h3 className="text-sm font-bold text-zinc-950 font-sans">
                                        {pay.firstName} {pay.lastName}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                        <span className="text-[9px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                                          {pay.role}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit border ${
                                          pay.plan === "Premium Pro"
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : pay.plan === "Standard"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}>
                                          {pay.plan || "Basic"}
                                        </span>
                                        {pay.amount ? (
                                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            ₹{Number(pay.amount).toLocaleString("en-IN")}
                                          </span>
                                        ) : null}
                                        {pay.couponCode && (
                                          <span className="text-[9px] font-bold text-purple-700 bg-purple-100/60 border border-purple-200 px-2 py-0.5 rounded-full">
                                            🎟️ {pay.couponCode}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      id={`delete-payment-btn-${pay.id}`}
                                      onClick={() => handleDeletePayment(pay.id, `${pay.firstName} ${pay.lastName}`)}
                                      title="Delete Payment Record"
                                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200 cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Verification Status Pill */}
                                <div className="mb-4">
                                  {isAutoVerified ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-3 py-1.5 rounded-xl">
                                      <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                      <span>⚡ Auto-Verified & Granted Instant Access</span>
                                    </div>
                                  ) : isWhitelisted ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-800 bg-blue-100/80 border border-blue-300 px-3 py-1.5 rounded-xl">
                                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                                      <span>👑 Approved & Whitelisted by Admin</span>
                                    </div>
                                  ) : pay.status === "revoked" ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-800 bg-red-100/80 border border-red-300 px-3 py-1.5 rounded-xl">
                                      <Lock className="h-3.5 w-3.5 text-red-600 shrink-0" />
                                      <span>🚫 Access Revoked</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-300 px-3 py-1.5 rounded-xl">
                                      <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                                      <span>⏳ Pending Manual Admin Review</span>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                                  <div className="flex items-center justify-between bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 font-sans">
                                    <span className="font-semibold text-zinc-600">Transaction ID / UTR:</span>
                                    <span className="font-bold text-zinc-900 font-mono select-all bg-white px-2 py-0.5 rounded border border-zinc-200 text-[11px]">
                                      {pay.transactionId}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                    <a href={`mailto:${pay.email}`} className="hover:text-emerald-600 transition-colors font-medium">
                                      {pay.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                      <a href={`tel:${pay.number}`} className="hover:text-emerald-600 transition-colors font-medium">
                                        {pay.number}
                                      </a>
                                    </div>
                                    <a
                                      href={`https://api.whatsapp.com/send?phone=91${pay.number?.replace(/[^0-9]/g, "").slice(-10)}&text=${encodeURIComponent(
                                        `Hello ${pay.firstName}! Your Pehlakadam course enrollment & payment receipt (UTR: ${pay.transactionId}) has been verified successfully.`
                                      )}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                                    >
                                      <MessageSquare className="h-3 w-3" /> WhatsApp
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                    <span>{new Date(pay.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-5 pt-4 border-t border-zinc-100 space-y-2">
                                {pay.fileName && (pay.fileData || pay.fileUrl) ? (
                                  <button
                                    onClick={() => downloadFile(pay.fileData || pay.fileUrl, pay.fileName)}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold py-2.5 px-4 text-xs transition-colors cursor-pointer border border-zinc-200"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download Proof Screenshot
                                  </button>
                                ) : (
                                  <div className="text-center p-2 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 text-[11px] text-zinc-400 font-medium">
                                    No screenshot file attached
                                  </div>
                                )}

                                {!isWhitelisted ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleDirectWhitelist(pay.id, pay.number, `${pay.firstName} ${pay.lastName}`, pay.plan)}
                                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 text-xs transition-colors shadow-sm cursor-pointer"
                                    >
                                      <CheckCircle className="h-3.5 w-3.5" />
                                      Approve & Grant Access
                                    </button>
                                    <button
                                      onClick={() => handleDeletePayment(pay.id, `${pay.firstName} ${pay.lastName}`)}
                                      title="Reject & Delete Payment Proof"
                                      className="inline-flex items-center justify-center p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors border border-red-200 cursor-pointer"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    <div className="w-full flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-bold">
                                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                      Access Active & Whitelisted
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleRevokePaymentAccess(pay.id, pay.number, `${pay.firstName} ${pay.lastName}`)}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold py-2 px-3 text-[11px] transition-colors border border-amber-200 cursor-pointer"
                                      >
                                        <Lock className="h-3 w-3" />
                                        Revoke Access
                                      </button>
                                      <button
                                        onClick={() => handleDeletePayment(pay.id, `${pay.firstName} ${pay.lastName}`)}
                                        title="Delete Payment Record"
                                        className="inline-flex items-center justify-center p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold transition-colors border border-red-200 cursor-pointer"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </motion.div>
              )}

              {/* TAB 4: ENROLLED STUDENTS & PAID COURSE ACCESS MANAGER */}
              {activeTab === "paid-access" && (
                <motion.div
                  key="paid-access-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Top Stats Banner */}
                  <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-zinc-900 rounded-3xl border border-emerald-800/40 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
                        <ShieldCheck className="h-4 w-4" /> Paid Access & Enrollment Control
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight">
                        Enrolled Students & Course Manager
                      </h2>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1 max-w-2xl">
                        Enrolled students are automatically recognized across scientific diagnostics, evaluation tests, and premium LMS modules without needing to refill registration forms.
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 min-w-[140px] text-center">
                        <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                          {authorizedNumbers.length}
                        </div>
                        <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mt-0.5">
                          Active Enrolled
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Enrollment Composer Form */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm h-fit space-y-6">
                      <div>
                        <h3 className="text-lg font-black font-sans text-zinc-950 flex items-center gap-2">
                          <UserCheck className="h-5 w-5 text-emerald-600" />
                          Enroll New Student
                        </h3>
                        <p className="text-zinc-500 text-xs mt-1">
                          Assign specific career programs, test access, and LMS courses to the student.
                        </p>
                      </div>

                      <form onSubmit={handleAddAuthNumber} className="space-y-4">
                        {/* Student Name */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                            Student Full Name
                          </label>
                          <input
                            type="text"
                            value={authStudentName}
                            onChange={(e) => setAuthStudentName(e.target.value)}
                            placeholder="e.g. Aarav Sharma"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                          />
                        </div>

                        {/* Mobile Number */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                            Student Mobile Number <span className="text-emerald-600">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAuthNumber}
                            onChange={(e) => setNewAuthNumber(e.target.value)}
                            placeholder="e.g. 9876543210 (10 digits)"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                          />
                          <p className="text-[10px] text-zinc-400 mt-1">
                            Phone number is used for seamless auto-detection on tests and paid resource tabs.
                          </p>
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                            Student Email Address
                          </label>
                          <input
                            type="email"
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="e.g. student@gmail.com"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                          />
                        </div>

                        {/* Membership Tier */}
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                            Access Tier
                          </label>
                          <select
                            value={authTier}
                            onChange={(e) => setAuthTier(e.target.value as any)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          >
                            <option value="pro">Pro Full Access (All Tests & Premium Library)</option>
                            <option value="advance">Advance Tier (Selected Programs & Diagnostics)</option>
                            <option value="basic">Basic Membership (Foundation Portal)</option>
                          </select>
                        </div>

                        {/* Enrolled Programs Selection */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                              Enrolled Programs (Bypass Diagnostic Form)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (authSelectedPrograms.length === SYSTEM_PROGRAM_OPTIONS.length) {
                                  setAuthSelectedPrograms([]);
                                } else {
                                  setAuthSelectedPrograms(SYSTEM_PROGRAM_OPTIONS.map(p => p.key));
                                }
                              }}
                              className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                            >
                              {authSelectedPrograms.length === SYSTEM_PROGRAM_OPTIONS.length ? "Clear All" : "Select All"}
                            </button>
                          </label>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
                            {SYSTEM_PROGRAM_OPTIONS.map((prog) => {
                              const isChecked = authSelectedPrograms.includes(prog.key);
                              return (
                                <label
                                  key={prog.key}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                    isChecked ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200" : "hover:bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAuthSelectedPrograms(prev => [...prev, prog.key]);
                                      } else {
                                        setAuthSelectedPrograms(prev => prev.filter(k => k !== prog.key));
                                      }
                                    }}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                  />
                                  <span className="flex-1">{prog.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        {/* Enrolled Courses Selection */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                              Enrolled Courses (LMS & Masterclasses)
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (authSelectedCourses.length === allCatalogCourses.length) {
                                  setAuthSelectedCourses([]);
                                } else {
                                  setAuthSelectedCourses(allCatalogCourses.map(c => c.id));
                                }
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
                            >
                              {authSelectedCourses.length === allCatalogCourses.length ? "Clear All" : "Select All"}
                            </button>
                          </label>
                          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
                            {allCatalogCourses.map((course: any) => {
                              const isChecked = authSelectedCourses.includes(course.id);
                              return (
                                <label
                                  key={course.id}
                                  className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                                    isChecked ? "bg-blue-50 text-blue-900 font-bold border border-blue-200" : "hover:bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setAuthSelectedCourses(prev => [...prev, course.id]);
                                      } else {
                                        setAuthSelectedCourses(prev => prev.filter(k => k !== course.id));
                                      }
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                                  />
                                  <span className="flex-1 line-clamp-1">{course.title}</span>
                                  {course.category && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700 font-medium shrink-0">
                                      {course.category}
                                    </span>
                                  )}
                                  {course.tier && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-bold shrink-0">
                                      {course.tier}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={savingAuthNumber}
                          className="w-full mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
                        >
                          {savingAuthNumber ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" /> Enrolling Student...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4" /> Grant & Enroll Access
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Whitelisted & Enrolled Students Roster */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Search Bar */}
                      <div className="bg-white rounded-2xl border border-zinc-200 p-3 shadow-sm flex items-center gap-3">
                        <Search className="h-4 w-4 text-zinc-400 ml-2" />
                        <input
                          type="text"
                          value={authSearchQuery}
                          onChange={(e) => setAuthSearchQuery(e.target.value)}
                          placeholder="Search enrolled students by name, mobile number, email, or program..."
                          className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none"
                        />
                        {authSearchQuery && (
                          <button
                            onClick={() => setAuthSearchQuery("")}
                            className="text-zinc-400 hover:text-zinc-600 text-xs font-bold px-2 py-1"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 className="text-base font-bold font-sans text-zinc-950">
                            Active Enrolled Students ({authorizedNumbers.length})
                          </h3>
                          <span className="text-[11px] text-zinc-400 font-medium">
                            Auto-detected on tests, LMS & resources
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleReconcileEnrollments}
                          disabled={isReconciling}
                          className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-60"
                          title="Reconcile and sync previous student records and courses across MongoDB and JSON"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isReconciling ? "animate-spin" : ""}`} />
                          <span>{isReconciling ? "Syncing Roster..." : "Reconcile & Sync Roster"}</span>
                        </button>
                      </div>

                      {reconcileMessage && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>{reconcileMessage}</span>
                        </div>
                      )}

                      {/* Roster Cards */}
                      {(() => {
                        const filtered = authorizedNumbers.filter((s) => {
                          if (!authSearchQuery) return true;
                          const q = authSearchQuery.toLowerCase();
                          return (
                            (s.studentName && s.studentName.toLowerCase().includes(q)) ||
                            (s.number && s.number.includes(q)) ||
                            (s.email && s.email.toLowerCase().includes(q)) ||
                            (s.tier && s.tier.toLowerCase().includes(q)) ||
                            (s.enrolledPrograms && s.enrolledPrograms.some(p => p.toLowerCase().includes(q))) ||
                            (s.enrolledCourses && s.enrolledCourses.some(c => c.toLowerCase().includes(q)))
                          );
                        });

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                              <Lock className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                              <h4 className="text-sm font-bold text-zinc-800">
                                {authSearchQuery ? "No matching enrolled students found" : "No enrolled students yet"}
                              </h4>
                              <p className="text-zinc-500 text-xs mt-1 max-w-md mx-auto">
                                {authSearchQuery
                                  ? "Try searching with a different mobile number or student name."
                                  : "Use the enrollment form on the left to add students with designated programs and courses."}
                              </p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-3">
                            {filtered.map((item) => {
                              const programLabels = (item.enrolledPrograms || []).map(k => {
                                const opt = SYSTEM_PROGRAM_OPTIONS.find(o => o.key === k);
                                return opt ? opt.label : k;
                              });

                              const courseLabels = (item.enrolledCourses || []).map(cid => {
                                const opt = allCatalogCourses.find((c: any) => c.id === cid || c._id === cid || c.slug === cid);
                                return opt ? opt.title : cid;
                              });

                              return (
                                <div
                                  key={item.id || item.number}
                                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:border-emerald-300 transition-all space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center uppercase shrink-0">
                                        {(item.studentName || "S")[0]}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-bold text-zinc-950">
                                            {item.studentName || "Enrolled Student"}
                                          </span>
                                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                            item.tier === "pro"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : item.tier === "advance"
                                              ? "bg-blue-50 text-blue-700 border-blue-200"
                                              : "bg-amber-50 text-amber-700 border-amber-200"
                                          }`}>
                                            {item.tier || "pro"} Tier
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5 flex-wrap">
                                          <span className="font-mono font-bold text-zinc-700 flex items-center gap-1">
                                            <Phone className="h-3 w-3 text-emerald-600" /> +91 {item.number}
                                          </span>
                                          {item.email && (
                                            <span className="flex items-center gap-1 text-zinc-500">
                                              <Mail className="h-3 w-3 text-zinc-400" /> {item.email}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditModal(item)}
                                        className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-200 transition-colors cursor-pointer"
                                        title="Edit Enrolled Programs & Courses"
                                      >
                                        <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => handleRevokeAuthNumber(item.number, item.studentName)}
                                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                                        title="Revoke Student Enrollment"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Badges for Programs & Courses */}
                                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                                    {/* Enrolled Programs */}
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                                        <GraduationCap className="h-3 w-3 text-emerald-600" /> Programs:
                                      </span>
                                      {programLabels.length > 0 ? (
                                        programLabels.map((lbl, idx) => (
                                          <span
                                            key={idx}
                                            className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                          >
                                            {lbl}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[10px] text-zinc-400 italic">All Standard Programs</span>
                                      )}
                                    </div>

                                    {/* Enrolled Courses */}
                                    {courseLabels.length > 0 && (
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1 flex items-center gap-1">
                                          <BookOpen className="h-3 w-3 text-blue-600" /> Courses:
                                        </span>
                                        {courseLabels.map((lbl, idx) => (
                                          <span
                                            key={idx}
                                            className="bg-blue-50 text-blue-800 border border-blue-200/80 text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                          >
                                            {lbl}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: LANDING PAGES ASSETS & MEDIA MANAGER */}
              {activeTab === "programs-config" && (
                <motion.div
                  key="programs-config-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AdminProgramsConfig
                    configs={programsConfigs}
                    onRefresh={handleRefresh}
                  />
                </motion.div>
              )}

              {/* TAB 6: SCIENTIFIC DIAGNOSTICS & EVALUATIONS MANAGER */}
              {activeTab === "diagnostics" && (
                <motion.div
                  key="diagnostics-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <AdminDiagnostics />
                </motion.div>
              )}

              {/* TAB 7: HOME PAGE STATS & SYSTEM CONFIG EDITOR */}
              {activeTab === "system-stats" && (
                <motion.div
                  key="system-stats-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* 🗄️ DATABASE & MONGO DB ATLAS PERSISTENCE MANAGEMENT CARD */}
                  <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                          <Database className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-zinc-900">Database & Cloud Storage Engine</h2>
                            {dbStatus?.connected ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                MongoDB Atlas (Live & Permanent)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                                Local Fallback Mode
                              </span>
                            )}
                          </div>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            Ensures courses, enrolled students, testimonials, and site configs persist permanently across server reboots and deployments.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSyncDatabase}
                          disabled={syncingDb || !dbStatus?.connected}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            syncingDb || !dbStatus?.connected
                              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${syncingDb ? "animate-spin" : ""}`} />
                          {syncingDb ? "Syncing Database..." : "Sync All Data to MongoDB"}
                        </button>
                      </div>
                    </div>

                    {syncDbMessage && (
                      <div className="mb-6 p-4 rounded-xl text-xs font-medium bg-emerald-50 border border-emerald-200 text-emerald-800">
                        {syncDbMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/80">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Target Database</span>
                        <p className="text-xs font-semibold text-zinc-800 mt-0.5 truncate" title={dbStatus?.targetUri || ""}>
                          {dbStatus?.targetUri || "MongoDB Atlas Cluster0"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Synced Courses</span>
                        <p className="text-sm font-bold text-zinc-900 mt-0.5">
                          {dbStatus?.counts?.courses ?? "..."} Courses
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Enrolled Students</span>
                        <p className="text-sm font-bold text-zinc-900 mt-0.5">
                          {dbStatus?.counts?.students ?? "..."} Students
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Storage Durability</span>
                        <p className="text-xs font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                          <Cloud className="h-3.5 w-3.5" />
                          {dbStatus?.connected ? "100% Cloud-Backed" : "Local Disk"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-zinc-100/70 rounded-xl text-[11px] text-zinc-600 flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-zinc-800">Permanent Persistence Active:</span> Any updates you make from this Admin Console (adding/modifying courses, publishing blogs, changing stats, or enrolling students) are automatically synchronized to your live MongoDB Atlas cluster so your data never disappears.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                    <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 mb-6">
                      <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900">Home Page Trust Highlights</h2>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          Change the numbers and success rates shown in the Hero section of the home page.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateStats} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Students Count
                          </label>
                          <input
                            type="text"
                            value={adminStats.studentsCount}
                            onChange={(e) => setAdminStats({ ...adminStats, studentsCount: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. 10K+"
                            required
                          />
                          <p className="text-[10px] text-zinc-400 mt-1.5">
                            Displayed under the first icon on the left (e.g., 10K+, 12,000+).
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Experts Count
                          </label>
                          <input
                            type="text"
                            value={adminStats.expertsCount}
                            onChange={(e) => setAdminStats({ ...adminStats, expertsCount: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. 15+"
                            required
                          />
                          <p className="text-[10px] text-zinc-400 mt-1.5">
                            Displayed under the center group icon (e.g., 15+, 20+, 50+).
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Success Rate
                          </label>
                          <input
                            type="text"
                            value={adminStats.successRate}
                            onChange={(e) => setAdminStats({ ...adminStats, successRate: e.target.value })}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. 99%"
                            required
                          />
                          <p className="text-[10px] text-zinc-400 mt-1.5">
                            Displayed under the right trophy icon (e.g., 99%, 99.4%, 100%).
                          </p>
                        </div>
                      </div>

                      {/* 💳 RAZORPAY AUTOMATED PAYMENT GATEWAY CONFIGURATION */}
                      <div className="border-t border-zinc-100 pt-6 mt-6 bg-gradient-to-br from-emerald-50/40 via-white to-zinc-50/30 p-6 rounded-2xl border border-emerald-100/70">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-lg bg-emerald-600 text-white">
                                <CreditCard className="h-4 w-4" />
                              </span>
                              <h3 className="text-base font-bold text-zinc-900">
                                Razorpay Payment Gateway (Instant Automated Access)
                              </h3>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Recommended
                              </span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                              Automatically receives payments via Google Pay, PhonePe, Paytm, Cards, and Netbanking. Validates signatures and activates student courses immediately without manual UTR submission.
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={adminStats.razorpayEnabled}
                              onChange={(e) => setAdminStats({ ...adminStats, razorpayEnabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            <span className="ml-2.5 text-xs font-bold text-zinc-800">
                              {adminStats.razorpayEnabled ? "Gateway Active" : "Disabled"}
                            </span>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2">
                              Razorpay Key ID (Public API Key)
                            </label>
                            <input
                              type="text"
                              value={adminStats.razorpayKeyId || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, razorpayKeyId: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                              placeholder="e.g. rzp_live_xxxxxxxxxxxx or rzp_test_xxxxxxxxxxxx"
                            />
                            <p className="text-[10px] text-zinc-500 mt-1.5">
                              Found on your Razorpay Dashboard &rarr; Settings &rarr; API Keys.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center justify-between">
                              <span>Razorpay Key Secret (Server Only)</span>
                              {adminStats.hasRazorpaySecret && (
                                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Secret Configured
                                </span>
                              )}
                            </label>
                            <input
                              type="password"
                              value={adminStats.razorpayKeySecret || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, razorpayKeySecret: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                              placeholder={adminStats.hasRazorpaySecret ? "•••••••••••••••••••• (Leave blank to keep existing)" : "Paste your Razorpay Secret Key"}
                            />
                            <p className="text-[10px] text-zinc-500 mt-1.5">
                              Kept strictly confidential on server for HMAC-SHA256 signature verification.
                            </p>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center justify-between">
                              <span>Razorpay Webhook Secret (Optional / For Instant Webhook Notifications)</span>
                              {adminStats.hasRazorpayWebhookSecret && (
                                <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Webhook Secret Configured
                                </span>
                              )}
                            </label>
                            <input
                              type="password"
                              value={adminStats.razorpayWebhookSecret || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, razorpayWebhookSecret: e.target.value })}
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                              placeholder={adminStats.hasRazorpayWebhookSecret ? "•••••••••••••••••••• (Leave blank to keep existing)" : "Paste secret entered in Razorpay Dashboard Webhooks"}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 text-[11px] text-zinc-600 bg-white/80 border border-zinc-200/80 p-2.5 rounded-lg">
                              <span className="font-semibold text-zinc-700">Webhook URL:</span>
                              <code className="bg-zinc-100 px-2 py-0.5 rounded text-emerald-700 font-mono select-all">
                                {typeof window !== "undefined" ? `${window.location.origin}/api/razorpay/webhook` : "https://YOUR-DOMAIN/api/razorpay/webhook"}
                              </code>
                              <span className="text-zinc-500 text-[10px]">(Active Events: payment.captured, order.paid)</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 p-3.5 bg-zinc-900 text-zinc-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>
                              <strong>Zero Manual Work:</strong> When students pay via Razorpay, transaction IDs and approvals are logged automatically.
                            </span>
                          </div>
                          <a
                            href="https://dashboard.razorpay.com/#/access/api_keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 font-bold underline text-[11px] whitespace-nowrap"
                          >
                            Open Razorpay API Keys &rarr;
                          </a>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-emerald-600" />
                          Fallback / Manual UPI Payment Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              UPI Address / UPI ID
                            </label>
                            <input
                              type="text"
                              value={adminStats.upiId || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, upiId: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                              placeholder="e.g. yourname@okicici"
                              required
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              The secure address students send funds to (e.g. paytm, gpay address).
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              Merchant Name / Registered Payee Name
                            </label>
                            <input
                              type="text"
                              value={adminStats.merchantName || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, merchantName: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. Niranjan Singh"
                              required
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              The official name registered with the UPI bank account.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                          <Settings className="h-4 w-4 text-emerald-600" />
                          Social Handles & Footer Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              Instagram Link
                            </label>
                            <input
                              type="text"
                              value={adminStats.instagramUrl || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, instagramUrl: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. https://instagram.com/yourprofile"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              URL linked to the Instagram icon in the footer.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              YouTube Channel Link
                            </label>
                            <input
                              type="text"
                              value={adminStats.youtubeUrl || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, youtubeUrl: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. https://youtube.com/c/yourchannel"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              URL linked to the YouTube icon in the footer.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              WhatsApp Support Link
                            </label>
                            <input
                              type="text"
                              value={adminStats.whatsappSupportUrl || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, whatsappSupportUrl: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. https://wa.me/91XXXXXXXXXX"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Direct WhatsApp link or mobile chat helper link.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 text-emerald-600" />
                          Weekly Career Tips Redirect Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              Official WhatsApp Group Link
                            </label>
                            <input
                              type="text"
                              value={adminStats.whatsappGroupUrl || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, whatsappGroupUrl: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. https://chat.whatsapp.com/invite_code"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Presented as a redirect option once a visitor enters their details and joins.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              Alternative Weekly Forum Link
                            </label>
                            <input
                              type="text"
                              value={adminStats.forumJoinUrl || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, forumJoinUrl: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. https://yourforum.com/join"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Secondary community group link (e.g. Telegram, Discord, custom forum, etc.).
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-600" />
                          World-Class SEO Metadata Configuration (Global Search Engine Optimization)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              Global SEO Meta Title
                            </label>
                            <input
                              type="text"
                              value={adminStats.seoTitle || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, seoTitle: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. Pehlakadam - Best Career Counselling & Personality Development"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Main search engine title displayed on Google results and browser tabs. Ideal length: 50-60 chars.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              SEO Meta Author / Publisher
                            </label>
                            <input
                              type="text"
                              value={adminStats.seoAuthor || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, seoAuthor: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="e.g. Pehlakadam"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Defines the publisher or owner metadata tag for spiders and author attribution schemas.
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              SEO Meta Description
                            </label>
                            <textarea
                              rows={3}
                              value={adminStats.seoDescription || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, seoDescription: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                              placeholder="Provide a compelling 150-160 character summary of the portal to maximize organic click-through rates..."
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Detailed description read by search engine web crawlers and displayed as the snippet under your title.
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              SEO Focus Keywords (Comma Separated)
                            </label>
                            <input
                              type="text"
                              value={adminStats.seoKeywords || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, seoKeywords: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                              placeholder="career counselling, personality development, psychometric test, MBTI"
                            />
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Comma-separated tags representing core page topics to assist indexing crawlers.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 🌟 WEBSITE FAVICON & BROWSER TAB BRANDING */}
                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-emerald-600" />
                              Website Favicon & Browser Tab Branding
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Customize the icon that appears in browser tabs, bookmark bars, and mobile shortcuts for Pehlakadam.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const current = adminStats.faviconData || adminStats.faviconUrl || DEFAULT_FAVICON_EMBLEM;
                                applyLiveFavicon(current);
                                alert("Favicon applied live to your current browser tab!");
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                              title="Test current favicon immediately in your browser tab without saving"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              Test Live in Tab
                            </button>

                            <button
                              type="button"
                              onClick={handleResetFavicon}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Reset Default
                            </button>
                          </div>
                        </div>

                        {/* 🖥️ LIVE BROWSER TAB SIMULATION */}
                        <div className="bg-zinc-900 rounded-xl p-4 mb-6 border border-zinc-800 shadow-inner">
                          <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                            <span>Live Browser Tab Simulation</span>
                            <span className="text-emerald-400 font-mono text-[10px]">Real-Time Preview</span>
                          </div>
                          
                          {/* Realistic Chrome Tab Bar */}
                          <div className="bg-zinc-800/80 rounded-t-lg p-2 flex items-center gap-2 border-b border-zinc-700">
                            {/* Active Tab */}
                            <div className="bg-zinc-900 border-t-2 border-emerald-500 rounded-t-md px-3 py-1.5 flex items-center gap-2.5 max-w-xs sm:max-w-md shadow-md">
                              <img
                                src={adminStats.faviconData || adminStats.faviconUrl || DEFAULT_FAVICON_EMBLEM}
                                alt="Favicon Preview"
                                className="w-4 h-4 rounded-sm object-contain shrink-0 bg-white/10 p-0.5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = DEFAULT_FAVICON_EMBLEM;
                                }}
                              />
                              <span className="text-xs font-medium text-zinc-200 truncate max-w-[200px] sm:max-w-[280px]">
                                {adminStats.seoTitle || "Pehlakadam - Best Career Counselling"}
                              </span>
                              <X className="w-3 h-3 text-zinc-400 hover:text-white shrink-0 ml-auto" />
                            </div>
                            
                            <div className="text-zinc-500 text-xs px-2 select-none">+</div>
                          </div>

                          {/* Multi-Size Context Badges */}
                          <div className="bg-zinc-950/60 rounded-b-lg p-3 flex flex-wrap items-center justify-around gap-4 border-t border-zinc-800 text-zinc-300">
                            <div className="flex items-center gap-2.5">
                              <div className="w-4 h-4 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center p-0.5">
                                <img
                                  src={adminStats.faviconData || adminStats.faviconUrl || DEFAULT_FAVICON_EMBLEM}
                                  alt="16x16"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[11px] text-zinc-400">16×16 px (Browser Tab)</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center p-0.5">
                                <img
                                  src={adminStats.faviconData || adminStats.faviconUrl || DEFAULT_FAVICON_EMBLEM}
                                  alt="32x32"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[11px] text-zinc-400">32×32 px (Bookmark Bar)</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center p-1">
                                <img
                                  src={adminStats.faviconData || adminStats.faviconUrl || DEFAULT_FAVICON_EMBLEM}
                                  alt="48x48"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[11px] text-zinc-400">48×48 px (Mobile Shortcut)</span>
                            </div>
                          </div>
                        </div>

                        {/* MODE SELECTOR */}
                        <div className="flex items-center gap-2 mb-4 bg-zinc-100 p-1 rounded-xl w-fit">
                          <button
                            type="button"
                            onClick={() => setFaviconMode("presets")}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              faviconMode === "presets"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                          >
                            ⭐ Preset Icons ({FAVICON_PRESETS.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setFaviconMode("upload")}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              faviconMode === "upload"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                          >
                            📤 Upload File (PNG / SVG / ICO)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFaviconMode("url")}
                            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              faviconMode === "url"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-600 hover:text-zinc-900"
                            }`}
                          >
                            🔗 Direct Image URL
                          </button>
                        </div>

                        {/* MODE 1: PRESET ICONS */}
                        {faviconMode === "presets" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                            {FAVICON_PRESETS.map((preset) => {
                              const isSelected =
                                adminStats.faviconData === preset.svgData ||
                                (!adminStats.faviconData && !adminStats.faviconUrl && preset.id === "pk-emblem");
                              return (
                                <div
                                  key={preset.id}
                                  onClick={() => handleSelectPresetFavicon(preset.svgData)}
                                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-sm"
                                      : "border-zinc-200 bg-zinc-50/60 hover:bg-zinc-100/80 hover:border-zinc-300"
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200/80 flex items-center justify-center p-1 shrink-0 shadow-sm">
                                    <img
                                      src={preset.svgData}
                                      alt={preset.name}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold text-zinc-900 truncate">
                                        {preset.name}
                                      </p>
                                      {isSelected && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                                      {preset.desc}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* MODE 2: FILE UPLOAD */}
                        {faviconMode === "upload" && (
                          <div className="bg-zinc-50 border border-dashed border-zinc-300 rounded-xl p-6 mb-4 text-center hover:border-emerald-500 transition-colors">
                            <input
                              type="file"
                              id="admin-favicon-upload-input"
                              accept=".ico,.png,.svg,.jpg,.jpeg,.webp,image/*"
                              onChange={handleFaviconFileUpload}
                              className="hidden"
                            />
                            <div className="flex flex-col items-center justify-center">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3">
                                <Upload className="w-6 h-6" />
                              </div>
                              <h4 className="text-sm font-bold text-zinc-800 mb-1">
                                Click or drag a favicon image to upload
                              </h4>
                              <p className="text-xs text-zinc-500 mb-4 max-w-md">
                                Supported formats: .ico, .png, .svg, .webp. Recommended dimensions: square aspect ratio (e.g., 64×64, 128×128, 256×256 px). Maximum file size: 2MB.
                              </p>
                              <label
                                htmlFor="admin-favicon-upload-input"
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm cursor-pointer transition-colors"
                              >
                                <Upload className="w-4 h-4" />
                                Choose Image File
                              </label>

                              {adminStats.faviconData && !FAVICON_PRESETS.some((p) => p.svgData === adminStats.faviconData) && (
                                <div className="mt-4 pt-4 border-t border-zinc-200 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 p-1 flex items-center justify-center">
                                    <img
                                      src={adminStats.faviconData}
                                      alt="Uploaded preview"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-emerald-700">
                                    Custom file uploaded and loaded in preview!
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleResetFavicon}
                                    className="text-xs text-red-600 hover:underline ml-2"
                                  >
                                    Remove
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* MODE 3: DIRECT URL */}
                        {faviconMode === "url" && (
                          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-4">
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                              External Favicon / Icon URL
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={adminStats.faviconUrl || ""}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setAdminStats({
                                    ...adminStats,
                                    faviconUrl: url,
                                    faviconData: ""
                                  });
                                  if (url) applyLiveFavicon(url);
                                }}
                                className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                                placeholder="https://example.com/assets/favicon.png"
                              />
                              {adminStats.faviconUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAdminStats({
                                      ...adminStats,
                                      faviconUrl: "",
                                      faviconData: ""
                                    });
                                    handleResetFavicon();
                                  }}
                                  className="px-3 py-2 text-xs font-semibold text-zinc-600 bg-zinc-200 hover:bg-zinc-300 rounded-xl transition-colors"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-1.5">
                              Enter a direct HTTPS image URL. Ensure CORS or public access is allowed by the host.
                            </p>
                          </div>
                        )}

                        {/* 🎨 BRAND LOGO ASSETS & VECTOR DOWNLOADS */}
                        <div className="mt-6 bg-gradient-to-br from-emerald-50/70 via-white to-zinc-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                Official Pehlakadam Brand Logos & Assets
                              </h4>
                              <p className="text-xs text-zinc-500 mt-0.5">
                                High-definition vector SVG and standalone branding assets identical to the website header.
                              </p>
                            </div>

                            <a
                              href="/api/download/brand-logos-zip"
                              download="pehlakadam-brand-logos.zip"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm rounded-xl transition-all cursor-pointer shrink-0"
                            >
                              <Download className="w-4 h-4" />
                              Download Both (.ZIP)
                            </a>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* LOGO 1: SEPARATE PK EMBLEM */}
                            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                                    Logo 1: Separate PK Emblem
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400">Vector SVG • 1:1 Icon</span>
                                </div>

                                <div className="bg-zinc-900/5 rounded-lg p-6 flex items-center justify-center min-h-[120px] mb-3 border border-zinc-100">
                                  <div className="w-20 h-20">
                                    <img
                                      src="/pk-logo-icon.svg"
                                      alt="PK Separate Emblem Logo"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                </div>

                                <p className="text-xs text-zinc-600 mb-4">
                                  Standalone circular emerald badge with glowing outer ring and bold &quot;PK&quot; monogram. Perfect for avatars, app icons, and favicons.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                                <a
                                  href="/pk-logo-icon.svg"
                                  download="pehlakadam-pk-icon.svg"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download SVG
                                </a>
                                <a
                                  href="/pk-logo-icon.svg"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center p-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>

                            {/* LOGO 2: FULL BRAND LOCKUP */}
                            <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-xs">
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200">
                                    Logo 2: Full Brand Lockup
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400">PK + PEHLAKADAM + Tagline</span>
                                </div>

                                <div className="bg-zinc-900/5 rounded-lg p-6 flex items-center justify-center min-h-[120px] mb-3 border border-zinc-100">
                                  <div className="w-full max-w-[280px]">
                                    <img
                                      src="/pk-logo-full.svg"
                                      alt="Pehlakadam Full Brand Logo"
                                      className="w-full h-auto object-contain"
                                    />
                                  </div>
                                </div>

                                <p className="text-xs text-zinc-600 mb-4">
                                  Complete horizontal brand identity: PK circular badge, bold <strong>PEHLAKADAM</strong> wordmark, and the italic tagline <em>&quot;Choose best Get best&quot;</em> with gradient guide arrows.
                                </p>
                              </div>

                              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                                <a
                                  href="/pk-logo-full.svg"
                                  download="pehlakadam-full-brand-logo.svg"
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Download SVG
                                </a>
                                <a
                                  href="/pk-logo-full.svg"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center p-2 text-xs font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-zinc-100 pt-6 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                          <div>
                            <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-emerald-600" />
                              Legal Policies & Terms & Conditions Editor
                            </h3>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              Upload or edit custom legal text for Terms & Conditions, Privacy Policy, Refund Policy, and Advisory Disclaimer. (Supports text and Markdown; leave empty to use built-in comprehensive default policies).
                            </p>
                          </div>
                          <a
                            href="/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline underline-offset-2 shrink-0"
                          >
                            Open Live Policies Page <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                                1. Terms & Conditions Custom Content
                              </label>
                              <span className="text-[11px] text-zinc-400 font-mono">Applies to /terms</span>
                            </div>
                            <textarea
                              rows={4}
                              value={adminStats.termsContent || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, termsContent: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y"
                              placeholder="Paste or write custom Terms & Conditions text/markdown here... (Leave blank to use default policy content)"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                                2. Privacy Policy Custom Content
                              </label>
                              <span className="text-[11px] text-zinc-400 font-mono">Applies to /privacy</span>
                            </div>
                            <textarea
                              rows={4}
                              value={adminStats.privacyContent || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, privacyContent: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y"
                              placeholder="Paste or write custom Privacy Policy text/markdown here... (Leave blank to use default)"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                                3. Cancellation & Refund Policy Custom Content
                              </label>
                              <span className="text-[11px] text-zinc-400 font-mono">Applies to /refund-policy</span>
                            </div>
                            <textarea
                              rows={4}
                              value={adminStats.refundContent || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, refundContent: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y"
                              placeholder="Paste or write custom Refund & Cancellation rules here... (Leave blank to use default)"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700">
                                4. Advisory Disclaimer Custom Content
                              </label>
                              <span className="text-[11px] text-zinc-400 font-mono">Applies to /legal</span>
                            </div>
                            <textarea
                              rows={4}
                              value={adminStats.disclaimerContent || ""}
                              onChange={(e) => setAdminStats({ ...adminStats, disclaimerContent: e.target.value })}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-y"
                              placeholder="Paste or write custom Career Counseling & Psychometric Disclaimers here... (Leave blank to use default)"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                        <button
                          type="submit"
                          disabled={updatingStats}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-6 py-3 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                        >
                          {updatingStats ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Save Changes
                            </>
                          )}
                        </button>

                        {updateStatsSuccess && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                            <CheckCircle className="h-4 w-4" />
                            Statistics updated and published successfully!
                          </span>
                        )}
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "subscribers" && (
                <motion.div
                  key="subscribers-workspace"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="bg-emerald-50 text-emerald-600 rounded-2xl p-3">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-zinc-900">Weekly Career Tips Subscribers</h2>
                        <p className="text-zinc-500 text-xs mt-0.5">
                          View and manage users who subscribed to weekly career guidance updates.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      {subscribers.length === 0 ? (
                        <div className="text-center py-16 text-zinc-400 text-sm">
                          No subscribers have joined yet. They will appear here when they submit via the Footer tips form.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                              <th className="pb-4 font-semibold">Subscriber Contact Details</th>
                              <th className="pb-4 font-semibold">Registered Date</th>
                              <th className="pb-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50 text-sm text-zinc-700">
                            {subscribers.map((sub, index) => (
                              <tr key={sub.id || index} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-4">
                                  <div className="font-semibold text-zinc-900">
                                    {sub.email && !sub.email.endsWith("@pehlakadam-sms.com") ? (
                                      <span className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-zinc-400" /> {sub.email}
                                      </span>
                                    ) : (
                                      <span className="text-zinc-400 font-mono text-xs">(Mobile Subscription)</span>
                                    )}
                                  </div>
                                  {sub.phone && (
                                    <div className="text-zinc-500 font-mono text-xs mt-1 flex items-center gap-1.5">
                                      <Phone className="h-3.5 w-3.5 text-zinc-400" /> {sub.phone}
                                    </div>
                                  )}
                                </td>
                                <td className="py-4 text-xs font-mono text-zinc-500">
                                  {new Date(sub.createdAt).toLocaleString()}
                                </td>
                                <td className="py-4 text-right">
                                  <button
                                    onClick={() => handleDeleteSubscriber(sub.id)}
                                    className="p-2 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer inline-flex items-center gap-1 animate-none select-none outline-none border-none bg-transparent"
                                    title="Delete Subscriber"
                                  >
                                    <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                                    <span className="text-xs font-semibold">Remove</span>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "testimonials" && (
                <motion.div
                  key="testimonials-workspace"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add Testimonial Form (5 cols) */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm h-fit">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-50 text-emerald-600 rounded-2xl p-3">
                          <PlusCircle className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-zinc-900">Upload Success Testimony</h2>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            Publish a new student victory story on the home page.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAddTestimonial} className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Student Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={testiStudentName}
                            onChange={(e) => setTestiStudentName(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. Aryan Sharma"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Stream / Grade Track *
                          </label>
                          <input
                            type="text"
                            required
                            value={testiStream}
                            onChange={(e) => setTestiStream(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. Grade 10 to Science (PCM)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Milestone Achievement *
                          </label>
                          <input
                            type="text"
                            required
                            value={testiAchievement}
                            onChange={(e) => setTestiAchievement(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                            placeholder="e.g. BITS Pilani (Computer Science)"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Testimony Quote / Story *
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={testiStory}
                            onChange={(e) => setTestiStory(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-950 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none"
                            placeholder="Share their journey and how Pehlakadam's counseling or diagnostics helped..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Student Photo / Avatar (Optional)
                          </label>
                          <div className="flex items-center gap-4">
                            <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-xl p-4 cursor-pointer bg-zinc-50 hover:bg-emerald-50/10 transition-all">
                              <Upload className="h-5 w-5 text-zinc-400 mb-1" />
                              <span className="text-xs font-bold text-zinc-600">
                                {testiFile ? testiFile.name : "Select Image File"}
                              </span>
                              <span className="text-[9px] text-zinc-400 mt-0.5">JPEG, PNG up to 5MB</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleTestiFileChange}
                                className="hidden"
                              />
                            </label>

                            {testiFileData && (
                              <div className="shrink-0">
                                <img
                                  src={testiFileData}
                                  alt="Preview"
                                  className="w-16 h-16 rounded-xl object-cover border border-zinc-200 shadow-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={testiCreating}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold rounded-xl py-3.5 text-sm transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                          {testiCreating ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              Uploading Testimony...
                            </>
                          ) : (
                            <>
                              <PlusCircle className="h-4 w-4" />
                              Publish Success Testimony
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Testimonials List (7 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="bg-emerald-50 text-emerald-600 rounded-2xl p-3">
                          <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-zinc-900">Current Success Stories</h2>
                          <p className="text-zinc-500 text-xs mt-0.5">
                            Manage published success testimonies appearing on the home page carousel.
                          </p>
                        </div>
                      </div>

                      {testimonials.length === 0 ? (
                        <div className="text-center py-20 text-zinc-400 text-sm border-2 border-dashed border-zinc-100 rounded-2xl">
                          No testimonies have been uploaded yet. Publish one on the left to get started!
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[680px] overflow-y-auto pr-2">
                          {testimonials.map((testi, index) => {
                            // Default beautiful initial avatar
                            const initial = testi.studentName ? testi.studentName.charAt(0).toUpperCase() : "S";
                            const colors = [
                              "bg-emerald-500",
                              "bg-teal-500",
                              "bg-sky-500",
                              "bg-indigo-500"
                            ];
                            const colIdx = (testi.studentName?.length || 0) % colors.length;

                            return (
                              <div
                                key={testi.id || index}
                                className="border border-zinc-100 rounded-2xl p-5 hover:border-emerald-100 transition-all flex items-start gap-4 hover:bg-zinc-50/30"
                              >
                                {testi.fileData ? (
                                  <img
                                    src={testi.fileData}
                                    alt={testi.studentName}
                                    className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div className={`w-12 h-12 rounded-xl ${colors[colIdx]} text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-sm`}>
                                    {initial}
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h3 className="text-sm font-bold text-zinc-900 truncate">
                                        {testi.studentName}
                                      </h3>
                                      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                                        {testi.stream}
                                      </p>
                                    </div>

                                    <button
                                      onClick={() => handleDeleteTestimonial(testi.id)}
                                      className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all shrink-0 cursor-pointer border-none bg-transparent"
                                      title="Delete testimony"
                                    >
                                      <Trash2 className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                                    </button>
                                  </div>

                                  <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-1 rounded-lg w-fit">
                                    {testi.achievement}
                                  </div>

                                  <p className="mt-3 text-xs text-zinc-600 leading-relaxed italic line-clamp-3">
                                    "{testi.story}"
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>

      {/* 🎯 INDIVIDUAL COUNSELING SCHEDULING & NOTIFICATION MODAL */}
      <AnimatePresence>
        {selectedLeadForCounselling && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 pt-16 pb-6 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative my-auto"
            >
              <button
                onClick={() => setSelectedLeadForCounselling(null)}
                className="absolute top-6 right-6 h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  {selectedLeadForCounselling.firstName[0]}
                  {selectedLeadForCounselling.lastName[0]}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-950 font-sans">
                    Schedule Counseling: {selectedLeadForCounselling.firstName} {selectedLeadForCounselling.lastName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-0.5">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedLeadForCounselling.email}</span>
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedLeadForCounselling.number}</span>
                    <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200 uppercase">{selectedLeadForCounselling.role}</span>
                  </div>
                  
                  {/* Paid Section Quick Toggle Badge */}
                  {(() => {
                    const cleanPhone = (selectedLeadForCounselling.number || "").replace(/[^0-9]/g, "");
                    const isPaid = authorizedNumbers.some(item => (item.number || "").replace(/[^0-9]/g, "") === cleanPhone);
                    return (
                      <div className="mt-2.5 flex items-center gap-2">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            Paid Section Access Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleGrantPaidAccessForLead(selectedLeadForCounselling.number, `${selectedLeadForCounselling.firstName} ${selectedLeadForCounselling.lastName}`)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3" />
                            Add to Paid Section
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Counseling Topic / Session Title
                  </label>
                  <input
                    type="text"
                    value={counsellingForm.counsellingTopic}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, counsellingTopic: e.target.value })}
                    placeholder="e.g. 1-on-1 Stream Selection Strategy & Roadmap"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={counsellingForm.counsellingDate}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, counsellingDate: e.target.value })}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="text"
                      value={counsellingForm.counsellingTime}
                      onChange={(e) => setCounsellingForm({ ...counsellingForm, counsellingTime: e.target.value })}
                      placeholder="e.g. 4:30 PM IST"
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Online Joining Link (Google Meet / Zoom / Video URL)
                  </label>
                  <input
                    type="url"
                    value={counsellingForm.joiningLink}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, joiningLink: e.target.value })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">
                    Advisor Note / Personalized Message to Candidate
                  </label>
                  <textarea
                    rows={3}
                    value={counsellingForm.counsellingNotes}
                    onChange={(e) => setCounsellingForm({ ...counsellingForm, counsellingNotes: e.target.value })}
                    placeholder="e.g. Please bring your 10th marksheets and stream preferences list to the session."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  />
                </div>
              </div>

              {/* Status Banner */}
              {notifyResultMsg && (
                <div
                  className={`mt-4 p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    notifyResultMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  {notifyResultMsg.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  {notifyResultMsg.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleSaveCounsellingSchedule}
                  disabled={savingSchedule}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 hover:bg-black text-white py-2.5 px-5 text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {savingSchedule ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
                  Save Session Schedule
                </button>

                {/* Dispatch Individual Updates Panel */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-[11px] font-bold text-zinc-400 mr-1">Notify Candidate:</span>
                  
                  {/* Email Dispatch */}
                  <button
                    onClick={() => handleSendNotification("email")}
                    disabled={sendingNotifyChannel === "email"}
                    title="Send Email Invitation"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {sendingNotifyChannel === "email" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />}
                    Email
                  </button>

                  {/* WhatsApp Dispatch */}
                  <button
                    onClick={() => handleSendNotification("whatsapp")}
                    disabled={sendingNotifyChannel === "whatsapp"}
                    title="Send WhatsApp Update"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {sendingNotifyChannel === "whatsapp" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                    WhatsApp
                  </button>

                  {/* SMS Dispatch */}
                  <button
                    onClick={() => handleSendNotification("sms")}
                    disabled={sendingNotifyChannel === "sms"}
                    title="Send SMS Alert"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {sendingNotifyChannel === "sms" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Phone className="h-3.5 w-3.5" />}
                    SMS
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ✏️ EDIT ENROLLED STUDENT MODAL */}
      <AnimatePresence>
        {editingAuthUser && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 pt-16 pb-6 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 sm:p-8 relative my-auto"
            >
              <button
                onClick={() => setEditingAuthUser(null)}
                className="absolute top-6 right-6 h-9 w-9 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                  <Edit3 className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-950 font-sans">
                    Edit Student Enrollment & Access
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Update program permissions and course access for this student.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateAuthUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-mono text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                      Access Tier
                    </label>
                    <select
                      value={editTier}
                      onChange={(e) => setEditTier(e.target.value as any)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    >
                      <option value="pro">Pro Full Access</option>
                      <option value="advance">Advance Tier</option>
                      <option value="basic">Basic Membership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Programs Checkbox list */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Enrolled Programs (Diagnostic Form Bypass)</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (editSelectedPrograms.length === SYSTEM_PROGRAM_OPTIONS.length) {
                          setEditSelectedPrograms([]);
                        } else {
                          setEditSelectedPrograms(SYSTEM_PROGRAM_OPTIONS.map(p => p.key));
                        }
                      }}
                      className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
                    >
                      {editSelectedPrograms.length === SYSTEM_PROGRAM_OPTIONS.length ? "Clear All" : "Select All"}
                    </button>
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
                    {SYSTEM_PROGRAM_OPTIONS.map((prog) => {
                      const isChecked = editSelectedPrograms.includes(prog.key);
                      return (
                        <label
                          key={prog.key}
                          className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-emerald-50 text-emerald-900 font-bold border border-emerald-200" : "hover:bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedPrograms(prev => [...prev, prog.key]);
                              } else {
                                setEditSelectedPrograms(prev => prev.filter(k => k !== prog.key));
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                          />
                          <span className="flex-1">{prog.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Courses Checkbox list */}
                <div>
                  <label className="block text-zinc-700 font-bold mb-1 uppercase tracking-wider text-[10px] flex items-center justify-between">
                    <span>Enrolled Courses</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (editSelectedCourses.length === allCatalogCourses.length) {
                          setEditSelectedCourses([]);
                        } else {
                          setEditSelectedCourses(allCatalogCourses.map(c => c.id));
                        }
                      }}
                      className="text-[10px] text-blue-600 hover:text-blue-700 font-bold underline cursor-pointer"
                    >
                      {editSelectedCourses.length === allCatalogCourses.length ? "Clear All" : "Select All"}
                    </button>
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 border border-zinc-100 rounded-xl p-2 bg-zinc-50/50">
                    {allCatalogCourses.map((course: any) => {
                      const isChecked = editSelectedCourses.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-blue-50 text-blue-900 font-bold border border-blue-200" : "hover:bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditSelectedCourses(prev => [...prev, course.id]);
                              } else {
                                setEditSelectedCourses(prev => prev.filter(k => k !== course.id));
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 shrink-0"
                          />
                          <span className="flex-1 line-clamp-1">{course.title}</span>
                          {course.category && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-700 font-medium shrink-0">
                              {course.category}
                            </span>
                          )}
                          {course.tier && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-bold shrink-0">
                              {course.tier}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingAuthUser(null)}
                    className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {savingEdit ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Instant PDF Preview Modal */}
      <PdfViewerModal
        isOpen={previewPdf.isOpen}
        onClose={() => setPreviewPdf(prev => ({ ...prev, isOpen: false }))}
        title={previewPdf.title}
        category={previewPdf.category}
        pdfUrl={previewPdf.pdfUrl}
        fileData={previewPdf.fileData}
      />

      <Footer />
    </motion.div>
  );
}
