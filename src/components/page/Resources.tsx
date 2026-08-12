import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import YouTubeModal from "../YouTubeModal";
import PdfViewerModal from "../PdfViewerModal";
import { BookOpen, Search, FileText, Check, Play, Film, Loader2, AlertCircle, Lock, Unlock, MessageSquare, Key, ShieldCheck, LogOut, BrainCircuit, Eye } from "lucide-react";
import { ResourceMaterial } from "../../types";
import { motion, AnimatePresence } from "motion/react";

export default function Resources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"all" | "pdf" | "video">("all");
  const [resources, setResources] = useState<ResourceMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PDF Viewer Modal State
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<{ title: string; category?: string; pdfUrl?: string; fileData?: string } | null>(null);
  
  // 🔒 PREMIUM ACCESS STATES
  const [accessFilter, setAccessFilter] = useState<"unpaid" | "paid">("unpaid");
  const [phoneInput, setPhoneInput] = useState("");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unlockedPhone, setUnlockedPhone] = useState("");
  const [premiumSessionId, setPremiumSessionId] = useState<string>("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState("");

  // Video Modal State
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/resources");
      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        setError("Could not load resources from the server.");
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPremiumAccess = async (phoneNumber: string, isAutoCheck = false, existingSessionId?: string) => {
    if (!phoneNumber) return;
    setVerifyingPhone(true);
    setVerificationFeedback("");
    try {
      const sessId = existingSessionId || premiumSessionId || localStorage.getItem("pehlakadam_premium_session_id") || undefined;
      const response = await fetch("/api/check-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number: phoneNumber,
          sessionId: sessId,
          action: isAutoCheck ? "verify" : "login"
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.authorized) {
          const newSessId = data.sessionId || sessId || "";
          setIsPremiumUnlocked(true);
          setUnlockedPhone(phoneNumber);
          setPremiumSessionId(newSessId);
          localStorage.setItem("pehlakadam_premium_phone", phoneNumber);
          if (newSessId) {
            localStorage.setItem("pehlakadam_premium_session_id", newSessId);
          }
          if (!isAutoCheck) {
            setVerificationFeedback("✅ Premium Access Granted! Resources unlocked.");
          }
        } else if (data.sessionConflict) {
          setIsPremiumUnlocked(false);
          setUnlockedPhone("");
          setPremiumSessionId("");
          localStorage.removeItem("pehlakadam_premium_phone");
          localStorage.removeItem("pehlakadam_premium_session_id");
          setVerificationFeedback(data.message || "⚠️ Session Conflict: Account accessed on another device. Simultaneous access on multiple devices is restricted to 1 active user at a time.");
        } else {
          setIsPremiumUnlocked(false);
          if (!isAutoCheck) {
            setVerificationFeedback("❌ Your phone number is not registered for premium resources. Click the button below to request immediate access on WhatsApp.");
          }
        }
      } else {
        if (!isAutoCheck) {
          setVerificationFeedback("⚠️ Network error while verifying access.");
        }
      }
    } catch (err) {
      console.error("Error verifying access:", err);
      if (!isAutoCheck) {
        setVerificationFeedback("⚠️ Connection error.");
      }
    } finally {
      setVerifyingPhone(false);
    }
  };

  const handleLockPremium = () => {
    if (unlockedPhone) {
      fetch("/api/logout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: unlockedPhone, sessionId: premiumSessionId })
      }).catch(() => {});
    }
    setIsPremiumUnlocked(false);
    setUnlockedPhone("");
    setPremiumSessionId("");
    setPhoneInput("");
    setVerificationFeedback("");
    localStorage.removeItem("pehlakadam_premium_phone");
    localStorage.removeItem("pehlakadam_premium_session_id");
  };

  useEffect(() => {
    fetchResources();
    
    // Check if admin is unlocked via visiting dashboard
    const adminCheck = localStorage.getItem("pehlakadam_admin_unlocked") === "true";
    setIsAdmin(adminCheck);
    
    // Auto restore active premium phone lock if stored
    const savedPhone = localStorage.getItem("pehlakadam_premium_phone");
    const savedSession = localStorage.getItem("pehlakadam_premium_session_id");
    if (savedSession) setPremiumSessionId(savedSession);
    if (savedPhone) {
      setUnlockedPhone(savedPhone);
      setPhoneInput(savedPhone);
      verifyPremiumAccess(savedPhone, true, savedSession || undefined);
    }
  }, []);

  // Real-time session heartbeat listener to enforce single-device active restriction
  useEffect(() => {
    if (!isPremiumUnlocked || !unlockedPhone || !premiumSessionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/verify-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: unlockedPhone, sessionId: premiumSessionId })
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.valid && data.sessionConflict) {
            console.warn("[Resources] Session conflict detected! Locking resources.");
            setIsPremiumUnlocked(false);
            setUnlockedPhone("");
            setPremiumSessionId("");
            setVerificationFeedback("⚠️ Session Conflict: Your phone number was accessed on another device or browser tab. Simultaneous access on multiple devices is restricted to 1 active user at a time.");
            localStorage.removeItem("pehlakadam_premium_phone");
            localStorage.removeItem("pehlakadam_premium_session_id");
          }
        }
      } catch (err) {
        console.error("[Resources] Heartbeat verification failed:", err);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [isPremiumUnlocked, unlockedPhone, premiumSessionId]);

  const handleViewPdf = (res: ResourceMaterial) => {
    setSelectedPdf({
      title: res.title,
      category: res.category,
      pdfUrl: `/api/resources/view/${res.id}`,
      fileData: res.fileData
    });
    setIsPdfModalOpen(true);
  };

  const handleWatchVideo = (url: string) => {
    // Standardize URL to embed if it is watch link
    let embedUrl = url;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1]?.split("&")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    setSelectedVideo(embedUrl);
    setIsVideoModalOpen(true);
  };

  // Filter based on active tab, search query, and free vs paid access mode
  const filteredResources = resources.filter((res) => {
    const matchesAccess = accessFilter === "paid" ? !!res.isPaid : !res.isPaid;
    const matchesTab = activeTab === "all" || res.type === activeTab;
    
    const titleVal = res.title || "";
    const catVal = res.category || "";
    const descVal = res.description || "";
    const queryVal = searchQuery.toLowerCase().trim();

    const matchesSearch = !queryVal ||
      titleVal.toLowerCase().includes(queryVal) ||
      catVal.toLowerCase().includes(queryVal) ||
      descVal.toLowerCase().includes(queryVal);
    
    let matchesTest = true;
    if (selectedTest !== "all") {
      const testVal = selectedTest.toLowerCase();
      matchesTest = 
        titleVal.toLowerCase().includes(testVal) || 
        catVal.toLowerCase().includes(testVal) || 
        descVal.toLowerCase().includes(testVal);
    }
    
    return matchesAccess && matchesTab && matchesSearch && matchesTest;
  });

  return (
    <motion.div
      id="resources-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50 flex flex-col justify-between"
    >
      <div>
        <NavigationBar />

        {/* Resources Header */}
        <section className="relative py-20 bg-zinc-950 text-white overflow-hidden border-b border-zinc-900">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-4 py-1.5 rounded-full inline-block">
              Knowledge Repository
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white">
              Resources & Study Materials
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Explore scientific guidebooks, psychometric profiles, and professional video masterclasses curated by senior advisors to guide your academic steps.
            </p>

            {/* Interactive Search Bar & Filters */}
            <div className="max-w-xl mx-auto space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search materials, psychometrics, video masterclasses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Personality Test Quick Filter Bar */}
              <div className="py-1 text-left">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-2 px-1">
                  Quick Filter by Personality Assessment:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-start">
                  {[
                    { label: "All Tests", value: "all" },
                    { label: "DISC", value: "DISC" },
                    { label: "MBTI", value: "MBTI" },
                    { label: "16PF", value: "16PF" },
                    { label: "EPI", value: "EPI" },
                    { label: "Enneagram", value: "Enneagram" },
                    { label: "Caliper", value: "Caliper" },
                    { label: "MMPI", value: "Minnesota" }
                  ].map((test) => (
                    <button
                      key={test.value}
                      onClick={() => setSelectedTest(test.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        selectedTest === test.value
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold shadow-sm shadow-emerald-500/10"
                          : "bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border-zinc-800/80"
                      }`}
                    >
                      {test.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Segmented Tab Filter */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <div className="flex gap-2">
                  {(["all", "pdf", "video"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        activeTab === tab
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                          : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                      }`}
                    >
                      {tab === "all" ? "All" : tab === "pdf" ? "PDFs" : "Videos"}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-[1px] bg-zinc-800 hidden sm:block"></div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAccessFilter("unpaid")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      accessFilter === "unpaid"
                        ? "bg-white text-zinc-900 shadow-md border border-zinc-200"
                        : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                    }`}
                  >
                    <Unlock className="h-3.5 w-3.5" /> Free Library
                  </button>
                  <button
                    onClick={() => setAccessFilter("paid")}
                    className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      accessFilter === "paid"
                        ? "bg-emerald-500 text-zinc-950 font-extrabold shadow-md shadow-emerald-500/20 border border-emerald-400"
                        : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                    }`}
                  >
                    <Lock className="h-3.5 w-3.5" /> Premium Paid
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Lock Welcome Bar */}
        {(isPremiumUnlocked || isAdmin) && accessFilter === "paid" && (
          <div className="mt-8 max-w-7xl mx-auto px-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-emerald-950 font-sans uppercase tracking-wide">
                    {isAdmin ? "👑 Administrator Access Active" : "Premium Access Portal Active"}
                  </h4>
                  <p className="text-emerald-700 text-xs mt-0.5">
                    {isAdmin ? (
                      "Bypassed lock as Admin. You have complete unrestricted access to all premium assets."
                    ) : (
                      <>Authorized for: <span className="font-mono font-bold bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 text-emerald-900">{unlockedPhone}</span>. Enjoy exclusive downloads and classes.</>
                    )}
                  </p>
                </div>
              </div>
              {isAdmin ? (
                <div className="text-xs font-semibold text-emerald-800 bg-emerald-100/50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  Full Access Enabled
                </div>
              ) : (
                <button
                  onClick={handleLockPremium}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded-xl px-4 py-2.5 font-bold transition-all border border-zinc-200 hover:border-red-200 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Log out / Lock Portal
                </button>
              )}
            </div>
          </div>
        )}

        {/* Library Lists Grid */}
        <section className="py-12 max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
              <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 text-sm font-medium">Fetching resource repositories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-200 p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-red-950">Connection Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={fetchResources}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-4 py-2 text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Retry Loading
              </button>
            </div>
          ) : accessFilter === "paid" && !isPremiumUnlocked && !isAdmin ? (
            /* 🔒 PREMIUM PORTAL LOCKED ENTRY GATEWAY */
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl border border-zinc-200 p-8 sm:p-10 shadow-xl space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto animate-bounce">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 font-sans tracking-tight">Premium Educational Library</h3>
                  <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    Exclusive psychometric handbooks, diagnostic evaluation guides, and webinar archives are restricted to enrolled Pehlakadam students.
                  </p>
                </div>

                {/* Verification form */}
                <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-emerald-600" /> Enter Registered Student Number
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      disabled={verifyingPhone}
                      className="flex-grow rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
                    />
                    <button
                      onClick={() => verifyPremiumAccess(phoneInput)}
                      disabled={verifyingPhone || !phoneInput.trim()}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      {verifyingPhone ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying...
                        </>
                      ) : (
                        <>
                          Unlock Resources
                        </>
                      )}
                    </button>
                  </div>

                  {verificationFeedback && (
                    <p className={`text-xs font-semibold leading-normal ${verificationFeedback.startsWith("❌") ? "text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl" : "text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl"}`}>
                      {verificationFeedback}
                    </p>
                  )}
                </div>

                {/* Request access section */}
                <div className="border-t border-zinc-100 pt-6 text-center space-y-4 flex flex-col items-center">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-zinc-950 uppercase tracking-widest">Don't have access yet?</h5>
                    <p className="text-zinc-500 text-xs">
                      Enrolled students can request active permission on WhatsApp from our Senior Advisor.
                    </p>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?phone=919876501234&text=${encodeURIComponent(
                      `Hello Pehlakadam Advisor! I request access authorization to Pehlakadam Premium Paid Resources (PDFs and Video Classes). Please whitelist my phone number: ${phoneInput || "_______"}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold px-6 py-3.5 text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer hover:scale-[1.02] w-fit"
                  >
                    <MessageSquare className="h-4 w-4 fill-white text-[#25D366]" /> Request Premium Whitelisting
                  </a>
                </div>

                {/* Advisor Override Access */}
                <div className="border-t border-zinc-100 pt-6 text-center">
                  <button
                    onClick={() => {
                      navigate("/resources/admin");
                    }}
                    className="text-xs text-zinc-400 hover:text-emerald-600 transition-colors cursor-pointer font-semibold underline inline-flex items-center gap-1"
                  >
                    👑 Administrator: Click here to access Advisor Console
                  </button>
                </div>
              </motion.div>
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredResources.map((res, index) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-white rounded-3xl border border-zinc-200 p-8 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-100">
                        {res.category}
                      </span>
                      <span className="text-xs font-mono text-zinc-400 font-semibold flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                        {res.type === "pdf" ? (
                          <FileText className="h-3.5 w-3.5 text-zinc-400" />
                        ) : (
                          <Film className="h-3.5 w-3.5 text-zinc-400" />
                        )}
                        {res.format || (res.type === "pdf" ? "PDF Material" : "Video Link")}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold font-sans text-zinc-900 group-hover:text-emerald-600 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">{res.description}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                      {res.isPaid ? (
                        <>
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 inline" /> Premium Whitelisted Class
                        </>
                      ) : (
                        res.type === "pdf" ? "In-App Reading Material" : "Free Strategic Masterclass"
                      )}
                    </p>
                    
                    {res.type === "pdf" ? (
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <button
                          id={`start-test-btn-${res.id}`}
                          onClick={() => navigate("/diagnostics")}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer hover:shadow-md shadow-sm shadow-emerald-900/10"
                        >
                          <BrainCircuit className="h-3.5 w-3.5 text-emerald-300" /> Start Test
                        </button>
                        <button
                          id={`view-pdf-btn-${res.id}`}
                          onClick={() => handleViewPdf(res)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 hover:bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer hover:shadow-md"
                        >
                          <Eye className="h-3.5 w-3.5" /> View PDF
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`watch-btn-${res.id}`}
                        onClick={() => handleWatchVideo(res.videoUrl || "")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/10 text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Watch Video
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
              <BookOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-zinc-800">No resources matched your filters</h3>
              <p className="text-zinc-500 text-sm mt-1">Try changing your search keywords or active tab.</p>
            </div>
          )}
        </section>
      </div>

      {/* Video Modal integration */}
      <YouTubeModal
        videoUrl={selectedVideo || ""}
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      {/* PDF Reader Modal integration */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title={selectedPdf?.title || "Educational Guide"}
        category={selectedPdf?.category || "Resource PDF"}
        pdfUrl={selectedPdf?.pdfUrl}
        fileData={selectedPdf?.fileData}
      />

      <Footer />
    </motion.div>
  );
}
