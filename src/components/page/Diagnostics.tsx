import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import ScorecardPrintReport from "../ScorecardPrintReport";
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
  X,
  Mail,
  Send,
  CheckCircle2,
  GraduationCap
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

interface Option {
  id: string;
  text: string;
  value: string;
  correctnessPercentage?: number;
}

interface Question {
  id: string;
  text: string;
  correctValue?: string;
  options: Option[];
}

interface ResultProfile {
  value: string;
  title: string;
  summary: string;
}

interface DiagnosticTest {
  key: string;
  title: string;
  subtitle?: string;
  description?: string;
  customFieldLabel?: string;
  scoringMethod?: "personality" | "aptitude" | string;
  resultProfiles?: ResultProfile[];
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
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Real-time validation flags
  const isNameValid = signupName.trim().length >= 3;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim());
  const isPhoneValid = /^\+?[0-9]{10,15}$/.test(signupPhone.trim().replace(/[\s-()]/g, ""));
  const isSpecialValid = signupSpecial.trim().length >= 3;

  const markFieldTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  // Reset touched fields on opening registration
  useEffect(() => {
    if (signupOpen) {
      setTouchedFields({});
    }
  }, [signupOpen]);

  // Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [activeQuizReport, setActiveQuizReport] = useState<any | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);

  const handleSendEmailReport = async () => {
    if (!activeQuizReport || !currentUser) return;
    setSendingEmail(true);
    setEmailSuccessMsg(null);
    try {
      const res = await fetch("/api/diagnostic-tests/send-email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          name: currentUser.name,
          phone: currentUser.phone,
          testTitle: activeQuizReport.testTitle,
          score: activeQuizReport.score
        })
      });
      if (res.ok) {
        setEmailSuccessMsg(`Summary report email successfully dispatched to ${currentUser.email}!`);
        setTimeout(() => setEmailSuccessMsg(null), 6000);
      } else {
        alert("Failed to send email report. Please verify server SMTP configuration.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while attempting to dispatch email report.");
    } finally {
      setSendingEmail(false);
    }
  };

  // Past Reports & Validation Animations
  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});

  const fetchMyReports = async (email: string) => {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/diagnostic-tests/my-submissions?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setMyReports(data);
      }
    } catch (e) {
      console.error("Error fetching user reports:", e);
    } finally {
      setLoadingReports(false);
    }
  };

  const triggerShake = (field: string) => {
    setShakeFields((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setShakeFields((prev) => ({ ...prev, [field]: false }));
    }, 500);
  };

  const shakeVariants = {
    shake: {
      x: [0, -6, 6, -6, 6, -4, 4, 0],
      transition: { duration: 0.4 }
    },
    default: { x: 0 }
  };

  useEffect(() => {
    // Load tests
    fetchTests();
    // Check if user is cached in localStorage
    const cached = localStorage.getItem("pehlakadam_user");
    if (cached) {
      try {
        const u = JSON.parse(cached);
        setCurrentUser(u);
        fetchMyReports(u.email);
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
    
    // Mark all fields as touched to trigger full real-time validation error styling
    setTouchedFields({
      name: true,
      email: true,
      phone: true,
      special: true
    });

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isSpecialValid) {
      if (!isNameValid) triggerShake("name");
      if (!isEmailValid) triggerShake("email");
      if (!isPhoneValid) triggerShake("phone");
      if (!isSpecialValid) triggerShake("special");
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
        fetchMyReports(userData.email);
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
    const updatedAnswers = {
      ...answers,
      [questionId]: optionValue
    };
    setAnswers(updatedAnswers);

    // If on the final question, automatically trigger evaluation & report generation smoothly
    if (selectedTest && currentQuestionIdx === selectedTest.questions.length - 1) {
      setTimeout(() => {
        submitQuiz(updatedAnswers);
      }, 350);
    }
  };

  const handleNextQuestion = () => {
    if (!selectedTest) return;
    const currentQ = selectedTest.questions[currentQuestionIdx];
    const currentAnswer = answers[currentQ.id];
    if (!currentAnswer) {
      alert("Please select an answer option to proceed.");
      return;
    }

    if (currentQuestionIdx < selectedTest.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      submitQuiz(answers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const submitQuiz = async (answersOverride?: Record<string, string>) => {
    if (!selectedTest || submittingQuiz) return;
    setSubmittingQuiz(true);

    const effectiveAnswers = answersOverride || answers;

    // Ensure candidate details are loaded or recovered
    let activeUser = currentUser;
    if (!activeUser) {
      const stored = localStorage.getItem("pehlakadam_user");
      if (stored) {
        try {
          activeUser = JSON.parse(stored);
          setCurrentUser(activeUser);
        } catch (e) {
          console.warn("Could not parse stored candidate user:", e);
        }
      }
    }
    if (!activeUser) {
      activeUser = {
        name: signupName || "Student Candidate",
        email: signupEmail || "candidate@pehlakadam.com",
        phone: signupPhone || "9876543210",
        role: signupRole || "Student",
        specialDetail: signupSpecial || "Diagnostic Assessment"
      };
      setCurrentUser(activeUser);
    }

    const payload = {
      user: {
        ...activeUser,
        specialDetail: signupSpecial || activeUser.specialDetail || "None specified"
      },
      testKey: selectedTest.key,
      answers: effectiveAnswers
    };

    try {
      const res = await fetch("/api/diagnostic-tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.submission) {
          setActiveQuizReport(data.submission);
          if (activeUser?.email) {
            fetchMyReports(activeUser.email);
          }
          return;
        }
      }
      
      // Fallback local report generation if server returned unexpected payload
      console.warn("Server submission fallback engaged.");
      const fallbackReport = generateLocalDiagnosticReport(selectedTest, effectiveAnswers, activeUser);
      setActiveQuizReport(fallbackReport);
    } catch (e) {
      console.error("[Diagnostics submit error]", e);
      // Generate instant client report so student is never stuck
      const fallbackReport = generateLocalDiagnosticReport(selectedTest, effectiveAnswers, activeUser);
      setActiveQuizReport(fallbackReport);
    } finally {
      setSubmittingQuiz(false);
    }
  };

  // 🛡️ Comprehensive Helper to guarantee student receives a rich scorecard immediately under all test types
  const generateLocalDiagnosticReport = (test: DiagnosticTest, userAnswers: Record<string, string>, user: any) => {
    const vals = Object.values(userAnswers);
    let scoreObj: any = {};
    const testKey = test.key;

    if (testKey === "disc") {
      const counts: any = { D: 0, I: 0, S: 0, C: 0 };
      vals.forEach(v => {
        if (counts[v] !== undefined) counts[v]++;
      });
      const total: number = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number || 1;
      const pct = {
        D: Math.round((counts.D / total) * 100),
        I: Math.round((counts.I / total) * 100),
        S: Math.round((counts.S / total) * 100),
        C: Math.round((counts.C / total) * 100),
      };

      let dominant = "D";
      if (pct.I > pct[dominant]) dominant = "I";
      if (pct.S > pct[dominant]) dominant = "S";
      if (pct.C > pct[dominant]) dominant = "C";

      const descriptions: any = {
        D: "Dominant: Decisive, direct, highly assertive, and results-focused. Ideal for high-stakes leadership, entrepreneurial management, and strategic direction roles.",
        I: "Influential: Persuasive, outgoing, energetic, and highly relationship-driven. Ideal for media, marketing, high-impact consulting, public relations, and sales leadership.",
        S: "Steady: Calm, cooperative, patient, loyal, and highly methodology-oriented. Excellent for research planning, operations optimization, HR, and structural engineering.",
        C: "Conscientious: Detail-oriented, analytical, diplomatic, and highly precise. Perfect for scientific analysis, database administration, software architecture, and financial risk planning."
      };

      scoreObj = {
        breakdown: {
          "Dominance (D)": pct.D,
          "Influence (I)": pct.I,
          "Steadiness (S)": pct.S,
          "Conscientiousness (C)": pct.C
        },
        dominant,
        summary: descriptions[dominant] || "Well-balanced behavioral profile.",
        title: `${dominant}-Style Behavioral Profile`
      };
    } else if (testKey === "mbti") {
      let E = 0, I_val = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
      vals.forEach(v => {
        if (v === "E") E++;
        if (v === "I") I_val++;
        if (v === "S") S++;
        if (v === "N") N++;
        if (v === "T") T++;
        if (v === "F") F++;
        if (v === "J") J++;
        if (v === "P") P++;
      });
      
      const mbti = (E >= I_val ? "E" : "I") + (S >= N ? "S" : "N") + (T >= F ? "T" : "F") + (J >= P ? "J" : "P");
      const totalEI = E + I_val || 1;
      const totalSN = S + N || 1;
      const totalTF = T + F || 1;
      const totalJP = J + P || 1;

      const pct = {
        E: Math.round((E / totalEI) * 100),
        I: Math.round((I_val / totalEI) * 100),
        S: Math.round((S / totalSN) * 100),
        N: Math.round((N / totalSN) * 100),
        T: Math.round((T / totalTF) * 100),
        F: Math.round((F / totalTF) * 100),
        J: Math.round((J / totalJP) * 100),
        P: Math.round((P / totalJP) * 100),
      };

      const careers: any = {
        INTJ: "Strategic Planner, System Architect, Scientist. You excel in logical blueprints and system design.",
        ENTJ: "Executive Director, Management Consultant, Venture Capitalist. You are a natural-born decisive leader.",
        INFP: "Creative Writer, Career Psychologist, Advisor. Guided by internal values, you seek deep, authentic connections.",
        ENFP: "Innovation Director, Marketing Strategist, Founder. Enthusiastic and creative, you see endless possibilities.",
        INFJ: "Advocate, Educational Counselor, Policy Planner. Insightful and structured, you drive ethical progress.",
        ENFJ: "Corporate Coach, HR Director, Public Relations Lead. You inspire others and foster warm environments.",
        INTP: "Theoretical Physicist, Software Developer, Researcher. Analytical and abstract, you seek logical precision.",
        ENTP: "Product Strategist, Venture Builder, Creative Director. You love intellectual brainstorming and solving complex puzzles.",
        ISTJ: "Financial Analyst, Operations Manager, Auditor. Exceptionally reliable, you preserve order and accuracy.",
        ESTJ: "General Manager, Civil Engineer, Security Director. Highly organized, you execute rules and systems with precision.",
        ISFJ: "Healthcare Advisor, Database Administrator, Registrar. Quiet, warm, and highly dependable, you support teams silently.",
        ESFJ: "Academic Dean, Client Success Lead, Hospital Administrator. Warm-hearted and structured, you coordinate social harmony.",
        ISTP: "Forensic Analyst, Systems Engineer, Pilot. Practical, quiet, and resourceful, you solve issues hands-on.",
        ESTP: "Sales Negotiator, Operations Lead, Stock Trader. Energetic and tactical, you thrive in fast-paced real-time action.",
        ISFP: "UX/UI Designer, Visual Artist, Environmentalist. Sensitive and creative, you enrich the world through aesthetics.",
        ESFP: "Event Director, Public Relations Specialist, Actor. Outgoing and cheerful, you bring high energy to teams."
      };

      scoreObj = {
        breakdown: {
          "Extraversion (E)": pct.E,
          "Introversion (I)": pct.I,
          "Sensing (S)": pct.S,
          "Intuition (N)": pct.N,
          "Thinking (T)": pct.T,
          "Feeling (F)": pct.F,
          "Judging (J)": pct.J,
          "Perceiving (P)": pct.P,
        },
        mbti,
        summary: careers[mbti] || "Versatile Profile: Highly adaptable psychometric thinker.",
        title: `MBTI Personality Profile: ${mbti}`
      };
    } else if (testKey === "16pf") {
      const reasoningScore = Math.min(100, Math.max(15, 30 + (vals.includes("Analytical") ? 60 : 0) + (vals.includes("Practical") ? 20 : 40)));
      const independenceScore = Math.min(100, Math.max(15, 35 + (vals.includes("Dominance") ? 55 : 0) + (vals.includes("Open-To-Change") ? 40 : 10)));
      const stabilityScore = Math.min(100, Math.max(15, 45 + (vals.includes("Stable") ? 50 : 0) - (vals.includes("Sensitive") ? 25 : 0)));
      const ruleConsciousnessScore = Math.min(100, Math.max(15, 30 + (vals.includes("Rule-Conscious") ? 50 : 0) + (vals.includes("Structured") ? 45 : 15)));
      const warmthScore = Math.min(100, Math.max(15, 40 + (vals.includes("Warmth") ? 50 : 0) + (vals.includes("Collaborative") ? 45 : 10)));

      const traits: string[] = [];
      if (reasoningScore > 65) traits.push("High Analytical Reasoning");
      if (independenceScore > 65) traits.push("High Independence & Drive");
      if (stabilityScore > 65) traits.push("Emotional Resilience");
      if (ruleConsciousnessScore > 65) traits.push("Rule-Consciousness");
      if (warmthScore > 65) traits.push("Social Warmth");

      scoreObj = {
        breakdown: {
          "Analytical Reasoning": reasoningScore,
          "Independence & Drive": independenceScore,
          "Emotional Stability": stabilityScore,
          "Rule-Consciousness": ruleConsciousnessScore,
          "Social Warmth & Teamwork": warmthScore
        },
        summary: `Strongest Career Factors: ${traits.join(", ") || "Balanced General Profile"}. Matches ideally with analytical research, structured process engineering, and proactive communications.`,
        title: "16PF Factor Mapping Profile"
      };
    } else if (testKey === "epi") {
      let E = 0, I_val = 0, N = 0, S = 0;
      vals.forEach(v => {
        if (v === "E") E++;
        if (v === "I") I_val++;
        if (v === "N") N++;
        if (v === "S") S++;
      });
      const totalEI = E + I_val || 1;
      const totalNS = N + S || 1;

      const pct = {
        E: Math.round((E / totalEI) * 100),
        I: Math.round((I_val / totalEI) * 100),
        N: Math.round((N / totalNS) * 100),
        S: Math.round((S / totalNS) * 100),
      };

      let temperament = "Balanced";
      let summary = "Steady, adaptable personality traits.";
      if (E >= I_val && N >= S) {
        temperament = "Choleric";
        summary = "Active, highly energetic, optimistic, and results-focused. Thrives under pressure.";
      } else if (E >= I_val && S > N) {
        temperament = "Sanguine";
        summary = "Highly sociable, outgoing, cheerful, and talkative. Excellent at teamwork.";
      } else if (I_val > E && N >= S) {
        temperament = "Melancholic";
        summary = "Thoughtful, analytical, sensitive, and quiet. Excels in creative or deeply analytical tasks.";
      } else if (I_val > E && S > N) {
        temperament = "Phlegmatic";
        summary = "Peaceful, reliable, structured, and extremely steady. Excellent for methodical operations.";
      }

      scoreObj = {
        breakdown: {
          "Extraversion (E)": pct.E,
          "Introversion (I)": pct.I,
          "Neuroticism / Reactivity (N)": pct.N,
          "Emotional Stability (S)": pct.S
        },
        temperament,
        summary,
        title: `Eysenck Temperament: ${temperament}`
      };
    } else if (testKey === "enneagram") {
      const counts: any = {
        "Type 1 - Reformer": 0,
        "Type 2 - Helper": 0,
        "Type 3 - Achiever": 0,
        "Type 4 - Individualist": 0,
        "Type 5 - Investigator": 0,
        "Type 6 - Loyalist": 0,
        "Type 7 - Enthusiast": 0,
        "Type 8 - Challenger": 0,
        "Type 9 - Peacemaker": 0
      };
      vals.forEach(v => {
        if (counts[v] !== undefined) counts[v]++;
      });
      
      let dominantType = "Type 9 - Peacemaker";
      let maxCount = -1;
      Object.keys(counts).forEach(k => {
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          dominantType = k;
        }
      });

      const totalVal = vals.length || 1;
      const pctBreakdown: any = {};
      Object.keys(counts).forEach(k => {
        pctBreakdown[k] = Math.round((counts[k] / totalVal) * 100);
      });

      scoreObj = {
        breakdown: pctBreakdown,
        dominantType,
        summary: `Your core driving motivator is represented by ${dominantType}. This defines your path of personal integration, helping you align with authentic career callings.`,
        title: `Enneagram Profile: ${dominantType}`
      };
    } else if (testKey === "caliper") {
      const leadership = Math.min(100, Math.max(15, 30 + (vals.includes("High Leadership") ? 45 : 0) + (vals.includes("High Social Boldness") ? 25 : 0)));
      const empathy = Math.min(100, Math.max(15, 30 + (vals.includes("High Empathy") ? 45 : 0) + (vals.includes("High Sociability") ? 25 : 0)));
      const drive = Math.min(100, Math.max(15, 30 + (vals.includes("High Ego-Drive") ? 45 : 0) + (vals.includes("High Assertiveness") ? 25 : 0)));
      const structure = Math.min(100, Math.max(15, 25 + (vals.includes("High Structure") ? 35 : 0) + (vals.includes("High Organization") ? 25 : 0) + (vals.includes("High Thoroughness") ? 15 : 0)));
      const cognitive = Math.min(100, Math.max(15, 40 + (vals.includes("High Cognitive") ? 45 : 0) + (vals.includes("High Flexibility") ? 15 : 0)));

      const traits: string[] = [];
      if (leadership > 65) traits.push("Leadership potential");
      if (empathy > 65) traits.push("Strong Empathy");
      if (drive > 65) traits.push("High Persuasion Drive");
      if (structure > 65) traits.push("Thorough Organization");
      if (cognitive > 65) traits.push("Abstract Problem-Solving");

      scoreObj = {
        breakdown: {
          "Leadership & Boldness": leadership,
          "Relational Empathy": empathy,
          "Ego-Drive & Persuasion": drive,
          "Structure & Organization": structure,
          "Cognitive Adaptability": cognitive
        },
        summary: `Identified Performance Drivers: ${traits.join(", ") || "Balanced Professional Profile"}. Perfect match for fields requiring empathy, structural organization, assertiveness, and cognitive leadership.`,
        title: "Caliper Job-Performance Driver Profile"
      };
    } else if (testKey === "mmpi") {
      const somatic = Math.min(100, Math.max(15, 40 + (vals.includes("Somatic Stability") ? 50 : 0) - (vals.includes("Somatic Tendency") ? 25 : 0)));
      const confidence = Math.min(100, Math.max(15, 35 + (vals.includes("Social Confidence") ? 50 : 0) - (vals.includes("Paranoia Tendency") ? 25 : 0)));
      const energy = Math.min(100, Math.max(15, 40 + (vals.includes("Balanced Energy") ? 50 : 0) - (vals.includes("Depression Tendency") ? 25 : 0)));
      const emotional = Math.min(100, Math.max(15, 35 + (vals.includes("High Self-Trust") ? 50 : 0) - (vals.includes("Anxiety Tendency") ? 25 : 0)));

      const traits: string[] = [];
      if (somatic > 65) traits.push("Somatic Stress Resilience");
      if (confidence > 65) traits.push("High Social Confidence");
      if (energy > 65) traits.push("Excellent Motivation Balance");
      if (emotional > 65) traits.push("Emotional Equilibrium");

      scoreObj = {
        breakdown: {
          "Somatic Stress Resilience": somatic,
          "Social Confidence & Trust": confidence,
          "Mental Energy & Drive": energy,
          "Emotional Stability & Control": emotional
        },
        summary: `Clinical psychometric indicators: ${traits.join(", ") || "Steady Emotional Adaptability"}. Displays steady emotional resilience, structured coping strategies, and optimal cognitive adaptability under high work/study stress.`,
        title: "MMPI Psychometric Insight"
      };
    } else if (test.scoringMethod === "aptitude") {
      let correctCount = 0;
      const questionsList = test.questions || [];
      const totalCount = questionsList.length || 1;
      
      questionsList.forEach((q: any) => {
        const userAns = userAnswers[q.id];
        if (userAns !== undefined && q.correctValue !== undefined && userAns.toString().trim().toUpperCase() === q.correctValue.toString().trim().toUpperCase()) {
          correctCount++;
        }
      });
      
      const percentage = Math.round((correctCount / totalCount) * 100);
      let summary = "";
      let bracketTitle = "Foundational";
      if (percentage >= 90) {
        bracketTitle = "Exceptional Mastery";
        summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Exceptional analytical and cognitive ability. You demonstrate excellent command of quantitative, logical reasoning, and verbal concepts.`;
      } else if (percentage >= 70) {
        bracketTitle = "Strong Proficiency";
        summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Strong analytical capacity. You have a solid grasp of logical and quantitative concepts with very minor areas to reinforce.`;
      } else if (percentage >= 50) {
        bracketTitle = "Developing Competency";
        summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Satisfactory performance. You are developing your analytical and cognitive skills but would benefit from targeted study.`;
      } else {
        bracketTitle = "Foundational Stage";
        summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Foundational competency. Focus on strengthening fundamental logic, verbal analogies, and basic quantitative problems.`;
      }
      
      scoreObj = {
        breakdown: {
          "Correct Answers": percentage,
          "Incorrect / Skipped": 100 - percentage
        },
        percentage,
        correctCount,
        totalCount,
        summary,
        title: `Cognitive Score: ${percentage}% (${bracketTitle})`
      };
    } else {
      const counts: Record<string, number> = {};
      vals.forEach(v => {
        if (v) counts[v] = (counts[v] || 0) + 1;
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
      const breakdown: Record<string, number> = {};
      Object.keys(counts).forEach(k => {
        breakdown[k] = Math.round((counts[k] / total) * 100);
      });

      let dominant = "";
      let maxPct = -1;
      Object.keys(breakdown).forEach(k => {
        if (breakdown[k] > maxPct) {
          maxPct = breakdown[k];
          dominant = k;
        }
      });

      const matchedProfile = (test.resultProfiles || []).find(p => p.value === dominant || p.value.toLowerCase() === dominant.toLowerCase());
      const scoreTitle = matchedProfile?.title || (dominant ? `${dominant} Dimension Assessment` : `${test.title} Report`);
      const scoreSummary = matchedProfile?.summary || (dominant
        ? `Your evaluation indicates a primary affinity for the ${dominant} dimension. This represents your core behavioral orientation and decision style.`
        : `Your diagnostic assessment for ${test.title} has been evaluated successfully.`
      );

      scoreObj = {
        breakdown: Object.keys(breakdown).length > 0 ? breakdown : { "Assessment Completed": 100 },
        dominant: dominant || "Analyzed",
        summary: scoreSummary,
        title: scoreTitle
      };
    }

    // Calculate correctness weightings if options have percentages
    let sumPercentages = 0;
    let evaluatedCount = 0;
    const questionAnalysis: any[] = [];

    (test.questions || []).forEach(q => {
      const userVal = userAnswers[q.id];
      if (userVal !== undefined && userVal !== null) {
        evaluatedCount++;
        const selectedOpt = (q.options || []).find(o => o.value === userVal || o.text === userVal || o.id === userVal);
        let earnedPct = 0;
        if (selectedOpt && selectedOpt.correctnessPercentage !== undefined) {
          earnedPct = Number(selectedOpt.correctnessPercentage) || 0;
        } else if (q.correctValue && userVal.toString().trim().toUpperCase() === q.correctValue.toString().trim().toUpperCase()) {
          earnedPct = 100;
        }
        sumPercentages += earnedPct;
        questionAnalysis.push({
          questionId: q.id,
          questionText: q.text,
          selectedOptionText: selectedOpt ? selectedOpt.text : userVal,
          selectedOptionValue: selectedOpt ? selectedOpt.value : userVal,
          earnedCorrectnessPercentage: earnedPct
        });
      }
    });

    if (evaluatedCount > 0) {
      scoreObj.overallCorrectnessPercentage = Math.round(sumPercentages / evaluatedCount);
      scoreObj.questionCorrectnessBreakdown = questionAnalysis;
    }

    return {
      _id: `local-${Date.now()}`,
      id: `local-${Date.now()}`,
      user,
      testKey: test.key,
      testTitle: test.title,
      answers: userAnswers,
      score: scoreObj,
      createdAt: new Date().toISOString()
    };
  };

  const handleLogoutCandidate = () => {
    if (confirm("Are you sure you want to log out? This will clear your current profile cache.")) {
      localStorage.removeItem("pehlakadam_user");
      setCurrentUser(null);
      setMyReports([]);
      setSelectedTest(null);
      setActiveQuizReport(null);
    }
  };

  const handleCloseWorkspace = () => {
    setSelectedTest(null);
    setActiveQuizReport(null);
  };

  const handleViewReport = (report: any) => {
    const matchingTest = tests.find(t => t.key === report.testKey) || DEFAULT_DIAGNOSTICS.find(t => t.key === report.testKey);
    setSelectedTest(matchingTest || {
      key: report.testKey,
      title: report.testTitle,
      questions: []
    } as any);
    setActiveQuizReport(report);
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

                {currentUser && (
                  <div className="mt-16 border-t border-zinc-200 pt-12 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-zinc-950 font-sans tracking-tight">
                          Your Completed Assessments
                        </h2>
                        <p className="text-xs text-zinc-500 font-sans">
                          Click any report to view your detailed psychometric profiles and download or print them.
                        </p>
                      </div>
                    </div>

                    {loadingReports ? (
                      <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase">
                        <RefreshCw className="h-4 w-4 animate-spin text-emerald-600 animate" /> Fetching reports...
                      </div>
                    ) : myReports.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-zinc-150 p-8 text-center text-zinc-500 text-xs font-semibold">
                        You haven't completed any assessments yet. Take your first test above!
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {myReports.map((report) => (
                          <div 
                            key={report.id || report._id}
                            className="bg-white rounded-2xl border border-zinc-200 p-5 flex items-center justify-between hover:shadow-md hover:border-emerald-500/50 transition-all group"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider font-mono">
                                {report.score?.title || "Psychometric Report"}
                              </span>
                              <h4 className="text-sm font-black text-zinc-950 font-sans group-hover:text-emerald-700 transition-colors">
                                {report.testTitle}
                              </h4>
                              <p className="text-[11px] text-zinc-400 font-mono">
                                Completed on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>

                            <button
                              onClick={() => handleViewReport(report)}
                              className="px-3.5 py-2 bg-zinc-950 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <span>View Report</span>
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                  <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-10 space-y-8 relative overflow-hidden">
                    
                    {/* Scoring & Submission In-Flight Overlay */}
                    {submittingQuiz && (
                      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-200">
                        <div className="relative">
                          <div className="h-16 w-16 rounded-full border-4 border-emerald-100 border-t-emerald-600 animate-spin"></div>
                          <Sparkles className="h-6 w-6 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-black text-zinc-950 font-sans">Evaluating Assessment</h4>
                          <p className="text-xs text-zinc-500 font-sans max-w-xs">
                            Scoring psychometric dimensions and compiling your diagnostic report...
                          </p>
                        </div>
                      </div>
                    )}
                    
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
                  // QUIZ FINISHED: OFFICIAL SCORECARD & RESPONSE SHEET REPORT
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Action Bar (Screen only, hidden in print) */}
                    <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Assessment Completed & Evaluated Successfully
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-zinc-950 font-sans tracking-tight">
                          Official Diagnostic Scorecard
                        </h2>
                        <p className="text-xs text-zinc-500 font-sans">
                          A comprehensive scorecard with your question-by-question response sheet and evaluation breakdown for <strong>{currentUser?.name}</strong>.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={handlePrint}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-900/10"
                          title="Print official scorecard"
                        >
                          <Printer className="h-4 w-4" /> Print Scorecard
                        </button>
                        <button
                          onClick={handleCloseWorkspace}
                          className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Finish & Exit
                        </button>
                      </div>
                    </div>

                    {/* 📧 Email Notification Service Summary Banner */}
                    <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs print:hidden">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-xs">Email Summary Report</span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Auto Dispatched
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-0.5 truncate">
                            {emailSuccessMsg || `A formal copy of this summary report has been emailed to ${currentUser?.email || "your registered email address"}.`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleSendEmailReport}
                        disabled={sendingEmail}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5 shadow-sm hover:scale-[1.02]"
                      >
                        {sendingEmail ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending Email...
                          </>
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" /> Resend Report Email
                          </>
                        )}
                      </button>
                    </div>

                    {/* OFFICIAL SCORECARD PRINT & SCREEN REPORT */}
                    <ScorecardPrintReport
                      report={activeQuizReport}
                      testDefinition={selectedTest}
                    />

                    {/* Consultation booking CTA with WhatsApp integration or modal booking (Screen only) */}
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 print:hidden">
                      <div className="space-y-1 text-center sm:text-left">
                        <h4 className="text-sm font-black text-emerald-950 font-sans uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
                          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" /> Unlock Your Personalized Counseling
                        </h4>
                        <p className="text-xs text-emerald-800 leading-relaxed max-w-md font-medium">
                          Our master advisors will review this scientific report card with you, formulating a tailored college roadmap and placement stream playbook.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap justify-center">
                        <Link
                          to={`/dashboard?phone=${currentUser?.phone || ""}&email=${currentUser?.email || ""}`}
                          className="inline-flex items-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer flex-shrink-0"
                        >
                          <GraduationCap className="h-4 w-4 text-emerald-400" /> My Learning Dashboard
                        </Link>

                        <a
                          href={`https://api.whatsapp.com/send?phone=917428613102&text=${encodeURIComponent(
                            `Hello Pehlakadam Advisor, I completed the *${activeQuizReport.testTitle}* psychometric assessment as *${currentUser?.name || "Candidate"}*. Here is my result: *${activeQuizReport.score?.title || "Assessment Complete"}*. I would like to book a career consultation counseling slot!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-900/10 cursor-pointer flex-shrink-0"
                        >
                          <MessageCircle className="h-4 w-4" /> Book Consultation
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* SIGNUP / LOGIN RECONCILED ENTRY MODAL */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {signupOpen && pendingTest && (
            <div className="fixed inset-0 z-[99999] overflow-y-auto flex items-center justify-center p-3 pt-16 pb-6 sm:p-6">
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
                className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-md w-full border border-zinc-200 relative z-10 my-auto"
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
                  {/* Full Name Field */}
                  <motion.div 
                    animate={shakeFields.name ? "shake" : "default"} 
                    variants={shakeVariants}
                    className="space-y-1"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Your Full Name</label>
                    </div>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onBlur={() => markFieldTouched("name")}
                      onChange={(e) => {
                        setSignupName(e.target.value);
                        markFieldTouched("name");
                      }}
                      placeholder="e.g. Priyanshu Kumar"
                      className={`w-full rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-zinc-900 font-semibold border ${
                        touchedFields.name
                          ? isNameValid
                            ? "border-emerald-500/50 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : "border-red-500/80 bg-red-50/5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          : "bg-zinc-50 border-zinc-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    {touchedFields.name && !isNameValid && (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold text-left">Full name must be at least 3 characters long</p>
                    )}
                  </motion.div>

                  {/* Email & Phone Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div 
                      animate={shakeFields.email ? "shake" : "default"} 
                      variants={shakeVariants}
                      className="space-y-1"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Email Address</label>
                      </div>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onBlur={() => markFieldTouched("email")}
                        onChange={(e) => {
                           setSignupEmail(e.target.value);
                           markFieldTouched("email");
                        }}
                        placeholder="e.g. nrjstudywrk@gmail.com"
                        className={`w-full rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-zinc-900 font-semibold border ${
                          touchedFields.email
                            ? isEmailValid
                              ? "border-emerald-500/50 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              : "border-red-500/80 bg-red-50/5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            : "bg-zinc-50 border-zinc-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                      />
                      {touchedFields.email && !isEmailValid && (
                        <p className="mt-1 text-[11px] text-red-500 font-semibold text-left">Please enter a valid email address</p>
                      )}
                    </motion.div>

                    <motion.div 
                      animate={shakeFields.phone ? "shake" : "default"} 
                      variants={shakeVariants}
                      className="space-y-1"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Mobile Number</label>
                      </div>
                      <input
                        type="tel"
                        required
                        value={signupPhone}
                        onBlur={() => markFieldTouched("phone")}
                        onChange={(e) => {
                          setSignupPhone(e.target.value);
                          markFieldTouched("phone");
                        }}
                        placeholder="e.g. 919876543210"
                        className={`w-full rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-zinc-900 font-semibold border ${
                          touchedFields.phone
                            ? isPhoneValid
                              ? "border-emerald-500/50 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              : "border-red-500/80 bg-red-50/5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                            : "bg-zinc-50 border-zinc-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        }`}
                      />
                      {touchedFields.phone && !isPhoneValid && (
                        <p className="mt-1 text-[11px] text-red-500 font-semibold text-left">Contact number must be between 10 to 15 digits</p>
                      )}
                    </motion.div>
                  </div>

                  {/* Academic Track Field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">Academic Track / Profile</label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold cursor-pointer"
                    >
                      <option value="Primary Kudos">Primary Kudos</option>
                      <option value="6-8 Grade Student">6-8 Grade Student</option>
                      <option value="8-10 Grade Student">8-10 Grade Student</option>
                      <option value="11-12 Grade Student">11-12 Grade Student</option>
                      <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                      <option value="Generalist to Specialist">Generalist to Specialist</option>
                    </select>
                  </div>

                  {/* Contextual test-specific details field */}
                  <motion.div 
                    animate={shakeFields.special ? "shake" : "default"} 
                    variants={shakeVariants}
                    className="space-y-1"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-mono block">
                        {pendingTest.customFieldLabel || "Specific Detail / Career Aspiration"}
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={signupSpecial}
                      onBlur={() => markFieldTouched("special")}
                      onChange={(e) => {
                        setSignupSpecial(e.target.value);
                        markFieldTouched("special");
                      }}
                      placeholder={`Provide detail for ${pendingTest.title}`}
                      className={`w-full rounded-xl px-4 py-2.5 text-xs outline-none transition-all text-zinc-900 font-bold border ${
                        touchedFields.special
                          ? isSpecialValid
                            ? "border-emerald-500/50 bg-emerald-50/10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : "border-red-500/80 bg-red-50/5 focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                          : "bg-zinc-50 border-zinc-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      }`}
                    />
                    {touchedFields.special && !isSpecialValid && (
                      <p className="mt-1 text-[11px] text-red-500 font-semibold text-left">{pendingTest.customFieldLabel || "Detail"} must be at least 3 characters long</p>
                    )}
                  </motion.div>

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
      </AnimatePresence>,
      document.body
    )}

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
