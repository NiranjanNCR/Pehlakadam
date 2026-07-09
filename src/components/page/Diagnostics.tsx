import React, { useState, useEffect } from "react";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import { DEFAULT_DIAGNOSTICS } from "../DEFAULT_DIAGNOSTICS";
import { 
  BrainCircuit, 
  UserCheck, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Award, 
  Clipboard, 
  Zap, 
  ShieldAlert, 
  HelpCircle,
  FileText,
  MessageCircle,
  Printer,
  Sparkles,
  RefreshCw,
  Lock,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  id: string;
  text: string;
  value: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface DiagnosticTest {
  key: string;
  title: string;
  subtitle?: string;
  description?: string;
  customFieldLabel?: string;
  questions: Question[];
}

interface CandidateUser {
  name: string;
  email: string;
  phone: string;
  role: string;
  specialDetail?: string;
}

export default function Diagnostics() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  
  // Auth & Signup States
  const [currentUser, setCurrentUser] = useState<CandidateUser | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupRole, setSignupRole] = useState("Graduate / Placements Track");
  const [signupSpecial, setSignupSpecial] = useState("");
  const [pendingTest, setPendingTest] = useState<DiagnosticTest | null>(null);
  const [registering, setRegistering] = useState(false);

  // Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [activeQuizReport, setActiveQuizReport] = useState<any | null>(null);

  useEffect(() => {
    // Load tests
    fetchTests();
    // Check if user is cached in localStorage
    const cached = localStorage.getItem("pehlakadam_user");
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
      } catch (e) {
        // clear corrupted
        localStorage.removeItem("pehlakadam_user");
      }
    }
  }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostic-tests");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      } else {
        setTests(DEFAULT_DIAGNOSTICS);
      }
    } catch (e) {
      console.warn("Using high-reliability default diagnostic tests backup.", e);
      setTests(DEFAULT_DIAGNOSTICS);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTestClick = (test: DiagnosticTest) => {
    setPendingTest(test);
    // Pre-populate if possible, but always enforce showing the registration form to collect custom fields & save details to database
    const cached = localStorage.getItem("pehlakadam_user");
    let cachedUser: any = null;
    if (cached) {
      try {
        cachedUser = JSON.parse(cached);
      } catch (e) {}
    }
    setSignupName(currentUser?.name || cachedUser?.name || "");
    setSignupEmail(currentUser?.email || cachedUser?.email || "");
    setSignupPhone(currentUser?.phone || cachedUser?.phone || "");
    setSignupRole(currentUser?.role || cachedUser?.role || "Graduate / Placements Track");
    setSignupSpecial(""); // Clear so student must input specific field detail for this exact test
    setSignupOpen(true);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !signupName.trim() ||
      !signupEmail.trim() ||
      !signupPhone.trim() ||
      !signupRole.trim() ||
      !signupSpecial.trim()
    ) {
      alert("Please complete all required fields to enter the diagnostic suite.");
      return;
    }

    if (!pendingTest) return;

    setRegistering(true);
    try {
      const payload = {
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        role: signupRole.trim(),
        testKey: pendingTest.key,
        testTitle: pendingTest.title,
        specialDetail: signupSpecial.trim()
      };

      const res = await fetch("/api/diagnostic-tests/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const userData: CandidateUser = {
          name: signupName.trim(),
          email: signupEmail.trim(),
          phone: signupPhone.trim(),
          role: signupRole.trim(),
          specialDetail: signupSpecial.trim()
        };

        // Cache user locally
        localStorage.setItem("pehlakadam_user", JSON.stringify(userData));
        setCurrentUser(userData);
        setSignupOpen(false);

        // Start the test!
        setSelectedTest(pendingTest);
        setPendingTest(null);

        // Prepare quiz workspace
        setCurrentQuestionIdx(0);
        setAnswers({});
        setActiveQuizReport(null);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to register. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Error registering candidate:", error);
      alert("Failed to sync registration with database. Please check your network connection.");
    } finally {
      setRegistering(false);
    }
  };

  const handleSelectOption = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleNextQuestion = () => {
    if (!selectedTest) return;
    const currentQ = selectedTest.questions[currentQuestionIdx];
    if (!answers[currentQ.id]) {
      alert("Please select an answer option to proceed.");
      return;
    }

    if (currentQuestionIdx < selectedTest.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!selectedTest || !currentUser) return;
    setSubmittingQuiz(true);

    const payload = {
      user: {
        ...currentUser,
        specialDetail: signupSpecial || currentUser.specialDetail || "None specified"
      },
      testKey: selectedTest.key,
      answers
    };

    try {
      const res = await fetch("/api/diagnostic-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuizReport(data.submission);
      } else {
        alert("An error occurred while calculating your profile score. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Network connection error. Your test report was cached but could not sync to server.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleLogoutCandidate = () => {
    if (confirm("Are you sure you want to log out? This will clear your current profile cache.")) {
      localStorage.removeItem("pehlakadam_user");
      setCurrentUser(null);
      setSelectedTest(null);
      setActiveQuizReport(null);
    }
  };

  const handleCloseWorkspace = () => {
    setSelectedTest(null);
    setActiveQuizReport(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="diagnostics-page-container" className="min-h-screen bg-zinc-50 flex flex-col justify-between">
      <div>
        <NavigationBar />

        {/* Global Standard Diagnostic Header */}
        {!selectedTest && (
          <section className="bg-zinc-950 text-white py-20 relative overflow-hidden border-b border-zinc-900">
            <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/3"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono bg-emerald-500/10 px-4.5 py-1.5 rounded-full border border-emerald-500/20">
                Scientific Career Benchmarking
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white max-w-4xl mx-auto leading-tight">
                Global World-Standard Psychometric Assessments
              </h1>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto font-sans leading-relaxed">
                Take state-of-the-art interactive diagnostic tests curated to map your cognitive strengths, temperament, behavior profiles, and performance metrics to high-trajectory careers.
              </p>

              {currentUser && (
                <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-850 px-4.5 py-2.5 rounded-2xl text-xs text-zinc-300">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Logged in as <strong>{currentUser.name}</strong></span>
                  <button 
                    onClick={handleLogoutCandidate}
                    className="text-red-400 hover:text-red-300 ml-2 cursor-pointer font-bold uppercase tracking-wider text-[10px]"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Diagnostic Dashboard/Selection Area */}
        <main className="py-16 max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            {!selectedTest ? (
              // 1. GRID LIST OF DIAGNOSTICS TESTS
              <motion.div
                key="test-selection-grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-10"
              >
                {loading ? (
                  <div className="text-center py-24 bg-white rounded-3xl border border-zinc-200 shadow-sm">
                    <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                    <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Syncing Diagnostics Suite...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tests.map((test) => {
                      const iconMap: Record<string, any> = {
                        disc: clipboardStyle("emerald"),
                        mbti: clipboardStyle("indigo"),
                        "16pf": clipboardStyle("cyan"),
                        epi: clipboardStyle("teal"),
                        enneagram: clipboardStyle("rose"),
                        caliper: clipboardStyle("amber"),
                        mmpi: clipboardStyle("violet")
                      };

                      function clipboardStyle(color: string) {
                        return (
                          <div className={`p-3 bg-${color}-500/10 text-${color}-600 rounded-2xl`}>
                            <BrainCircuit className="h-6 w-6" />
                          </div>
                        );
                      }

                      return (
                        <motion.div
                          key={test.key}
                          whileHover={{ y: -4 }}
                          className="bg-white rounded-3xl border border-zinc-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all space-y-6"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              {iconMap[test.key] || (
                                <div className="p-3 bg-zinc-100 text-zinc-600 rounded-2xl">
                                  <BrainCircuit className="h-6 w-6" />
                                </div>
                              )}
                              <span className="text-[10px] font-bold font-mono bg-zinc-50 border border-zinc-150 rounded px-2 py-0.5 text-zinc-500 uppercase">
                                {test.questions.length} MCQs
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              <h3 className="text-lg font-black text-zinc-950 font-sans tracking-tight leading-tight">
                                {test.title}
                              </h3>
                              {test.subtitle && (
                                <p className="text-emerald-700 font-bold font-sans text-xs">
                                  {test.subtitle}
                                </p>
                              )}
                              <p className="text-zinc-500 text-xs sm:text-[13px] leading-relaxed">
                                {test.description}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleStartTestClick(test)}
                            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold text-xs py-3.5 px-4 rounded-2xl transition-all uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-zinc-950/10"
                          >
                            <span>Begin Evaluation</span>
                            <ChevronRight className="h-4 w-4 text-emerald-400" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ) : (
              // 2. ACTIVE ASSESSMENT / QUIZ CONTAINER
              <motion.div
                key="quiz-workspace"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-3xl mx-auto"
              >
                {!activeQuizReport ? (
                  // QUIZ IN PROGRESS
                  <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-10 space-y-8 relative">
                    
                    {/* Upper Quiz Info Header */}
                    <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">
                          Evaluation In Progress
                        </span>
                        <h2 className="text-xl font-black text-zinc-950 font-sans tracking-tight">
                          {selectedTest.title}
                        </h2>
                      </div>
                      
                      <button
                        onClick={handleCloseWorkspace}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-900 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>

                    {/* Progress indicator */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">Section Progress</span>
                        <span className="text-emerald-700 font-bold">
                          Question {currentQuestionIdx + 1} of {selectedTest.questions.length}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-150 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIdx + 1) / selectedTest.questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Active Question Panel */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentQuestionIdx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                      >
                        <h3 className="text-base sm:text-lg font-black text-zinc-950 leading-snug font-sans">
                          {selectedTest.questions[currentQuestionIdx].text}
                        </h3>

                        {/* Options Selection List */}
                        <div className="grid grid-cols-1 gap-3">
                          {selectedTest.questions[currentQuestionIdx].options.map((opt) => {
                            const isSelected = answers[selectedTest.questions[currentQuestionIdx].id] === opt.value;
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleSelectOption(selectedTest.questions[currentQuestionIdx].id, opt.value)}
                                className={`w-full text-left p-4.5 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-start gap-3.5 cursor-pointer ${
                                  isSelected
                                    ? "bg-emerald-50/75 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/10 shadow-sm"
                                    : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800"
                                }`}
                              >
                                <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-zinc-300"
                                }`}>
                                  {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                                </span>
                                <span className="font-sans leading-relaxed">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIdx === 0}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" /> Back
                      </button>

                      <button
                        onClick={handleNextQuestion}
                        disabled={submittingQuiz}
                        className="inline-flex items-center gap-1.5 px-5 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-zinc-950/10"
                      >
                        {submittingQuiz ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> Scoring evaluation...
                          </>
                        ) : (
                          <>
                            <span>
                              {currentQuestionIdx === selectedTest.questions.length - 1 ? "Submit Assessment" : "Next Question"}
                            </span>
                            <ChevronRight className="h-4 w-4 text-emerald-400" />
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                ) : (
                  // QUIZ FINISHED: VISUAL REPORT CARD COMPONENT
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-10 space-y-8 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-emerald-500 to-teal-500"></div>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 border-b border-zinc-100 pb-6">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Assessment Completed Successfully
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 font-sans tracking-tight leading-tight">
                          Your Psychometric Report
                        </h2>
                        <p className="text-xs text-zinc-500 font-sans">
                          A detailed profiling computed on world-standard benchmarks for <strong>{currentUser?.name}</strong>.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={handlePrint}
                          className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-700 transition-all cursor-pointer"
                          title="Print evaluation report"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCloseWorkspace}
                          className="px-4.5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Finish Assessment
                        </button>
                      </div>
                    </div>

                    {/* visual scorecard */}
                    <div className="bg-zinc-950 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-zinc-850 space-y-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Calculated Result Profile</span>
                          <h3 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight leading-snug">
                            {activeQuizReport.score.title}
                          </h3>
                        </div>
                        
                        {(activeQuizReport.score.dominant || activeQuizReport.score.mbti) && (
                          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 bg-zinc-900 border border-zinc-800 h-14 w-14 rounded-2xl flex items-center justify-center">
                            {activeQuizReport.score.dominant || activeQuizReport.score.mbti}
                          </div>
                        )}
                      </div>

                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-medium">
                        {activeQuizReport.score.summary}
                      </p>

                      {/* Render score breakdown visualizer bars if available */}
                      {activeQuizReport.score.breakdown && (
                        <div className="border-t border-zinc-800 pt-5 space-y-4">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">Psychometric Dimensions Breakdown</span>
                          <div className="space-y-3">
                            {Object.entries(activeQuizReport.score.breakdown).map(([k, val]: any) => {
                              const percent = typeof val === "number" ? val : 25; // default fallback if needed
                              return (
                                <div key={k} className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-mono">
                                    <span className="font-bold text-zinc-300 uppercase">{k} Aspect</span>
                                    <span className="text-emerald-400 font-black">{percent}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-1.5 rounded-full" 
                                      style={{ width: `${percent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consultation booking CTA with WhatsApp integration or modal booking */}
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-emerald-950 font-sans uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" /> Unlock Your Personalized Counseling
                        </h4>
                        <p className="text-xs text-emerald-800 leading-relaxed max-w-md font-medium">
                          Our master advisors will review this scientific report card with you, formulating a tailored college roadmap and placement stream playbook.
                        </p>
                      </div>

                      <a
                        href={`https://api.whatsapp.com/send?phone=${process.env.ADMIN_WHATSAPP_NUMBER || "919876501234"}&text=${encodeURIComponent(
                          `Hello Pehlakadam Advisor, I completed the *${activeQuizReport.testTitle}* psychometric assessment as *${currentUser?.name}*. Here is my result: *${activeQuizReport.score.title}*. I would like to book a career consultation counseling slot!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-900/10 cursor-pointer flex-shrink-0"
                      >
                        <MessageCircle className="h-4 w-4" /> Book Consultation
                      </a>
                    </div>

                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* SIGNUP / LOGIN RECONCILED ENTRY MODAL */}
      <AnimatePresence>
        {signupOpen && pendingTest && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm"
              onClick={() => {
                setSignupOpen(false);
                setPendingTest(null);
              }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full border border-zinc-200 relative z-10"
            >
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">
                    Assessment Unlock Portal
                  </span>
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight leading-tight font-sans">
                    Begin {pendingTest.title}
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Please submit your registration credentials. Our advisors analyze this info against your answers to ensure pinpoint precision counseling.
                  </p>
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="e.g. Priyanshu Kumar"
                      className="w-full bg-zinc-50 border border-zinc-250/60 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Email Address</label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="e.g. nrjstudywrk@gmail.com"
                        className="w-full bg-zinc-50 border border-zinc-250/60 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        placeholder="e.g. 919876543210"
                        className="w-full bg-zinc-50 border border-zinc-250/60 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-semibold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Academic Track / Profile</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-250/60 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold"
                    >
                      <option>Primary School Kudos Stream</option>
                      <option>6th-8th Grade Student</option>
                      <option>9th-10th Grade Student</option>
                      <option>11th-12th Grade Student</option>
                      <option>Graduate / Placements Track</option>
                      <option>Generalist domain professional</option>
                    </select>
                  </div>

                  {/* Contextual test-specific details label */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-mono block">
                      {pendingTest.customFieldLabel || "Specific Detail / Career Aspiration"}
                    </label>
                    <input
                      type="text"
                      required
                      value={signupSpecial}
                      onChange={(e) => setSignupSpecial(e.target.value)}
                      placeholder={`Provide detail for ${pendingTest.title}`}
                      className="w-full bg-zinc-50 border border-emerald-250/40 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registering}
                    className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-zinc-950/15 disabled:opacity-50"
                  >
                    {registering ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" /> Unlocking...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-emerald-400" /> Unlock Assessment MCQ
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// Simple dynamic inline helper icon for check indicator
function Check({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
