import React, { useState, useEffect } from "react";
import { 
  Search, 
  Settings, 
  Award, 
  Trash2, 
  Plus, 
  X, 
  Save, 
  FileSpreadsheet, 
  Users, 
  BrainCircuit, 
  HelpCircle,
  TrendingUp,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Option {
  id: string;
  text: string;
  value: string;
  correctnessPercentage?: number; // 0 to 100 percentage score weight
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctValue?: string;
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
  scoringMethod?: "personality" | "aptitude";
  resultProfiles?: ResultProfile[];
  questions: Question[];
}

interface DiagnosticSubmission {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
    role: string;
    specialDetail?: string;
  };
  testKey: string;
  testTitle: string;
  answers: Record<string, string>;
  score: {
    title: string;
    summary: string;
    dominant?: string;
    dominantType?: string;
    temperament?: string;
    mbti?: string;
    breakdown?: any;
  };
  createdAt: string;
}

export default function AdminDiagnostics() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [submissions, setSubmissions] = useState<DiagnosticSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<DiagnosticSubmission | null>(null);
  
  // Tab within diagnostics: "reports" or "tests"
  const [diagTab, setDiagTab] = useState<"reports" | "tests">("reports");
  
  // Editor States
  const [editingTest, setEditingTest] = useState<DiagnosticTest | null>(null);
  const [savingTest, setSavingTest] = useState(false);

  useEffect(() => {
    fetchDiagnosticsData();
  }, []);

  const fetchDiagnosticsData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("pehlakadam_admin_token");
    try {
      // 1. Fetch Tests
      const resTests = await fetch("/api/diagnostic-tests");
      let testsData: DiagnosticTest[] = [];
      if (resTests.ok) {
        testsData = await resTests.json();
        setTests(testsData);
      } else {
        throw new Error("Failed to load diagnostic tests.");
      }

      // 2. Fetch Submissions
      const resSubs = await fetch("/api/diagnostic-tests/submissions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resSubs.ok) {
        const subsData = await resSubs.json();
        setSubmissions(subsData);
      } else {
        throw new Error("Failed to load diagnostic submission reports.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this candidate's test report? This action is permanent.")) return;
    const token = localStorage.getItem("pehlakadam_admin_token");
    try {
      const res = await fetch(`/api/diagnostic-tests/submissions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        if (selectedSub?.id === id) {
          setSelectedSub(null);
        }
      } else {
        const errData = await res.json();
        alert(errData.error || "Could not delete the report.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting server to delete submission.");
    }
  };

  // Editor Actions
  const handleStartEditing = (test: DiagnosticTest) => {
    // Deep clone the test to avoid mutating parent state directly
    setEditingTest(JSON.parse(JSON.stringify(test)));
  };

  const handleCreateNewCustomTest = () => {
    const customKey = `custom-${Date.now()}`;
    const newTest: DiagnosticTest = {
      key: customKey,
      title: "New Custom Evaluation",
      subtitle: "Custom Personality or Cognitive Assessment",
      description: "A customized multi-choice evaluation with dynamic metrics reporting.",
      customFieldLabel: "Target Professional Goal",
      scoringMethod: "personality",
      resultProfiles: [
        { value: "Dimension-A", title: "Type A Explorer Profile", summary: "Detailed custom description of the Type A Explorer behavior, strengths, and career paths." }
      ],
      questions: [
        {
          id: `${customKey}_q1`,
          text: "What is your primary approach to learning a complex new concept?",
          correctValue: "A",
          options: [
            { id: "o1", text: "Read research papers and academic literature thoroughly.", value: "Dimension-A" },
            { id: "o2", text: "Tinker hands-on with real projects or simulations.", value: "Dimension-B" }
          ]
        }
      ]
    };
    setEditingTest(newTest);
  };

  const handleUpdateTestQuestions = async () => {
    if (!editingTest) return;
    setSavingTest(true);
    const token = localStorage.getItem("pehlakadam_admin_token");
    try {
      const res = await fetch("/api/diagnostic-tests/update-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingTest)
      });
      if (res.ok) {
        const data = await res.json();
        alert("Diagnostic test configuration updated successfully!");
        setTests(prev => {
          const exists = prev.some(t => t.key === editingTest.key);
          if (exists) {
            return prev.map(t => t.key === editingTest.key ? data.test : t);
          } else {
            return [...prev, data.test];
          }
        });
        setEditingTest(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save question edits.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Could not sync edits.");
    } finally {
      setSavingTest(false);
    }
  };

  const handleAddQuestion = () => {
    if (!editingTest) return;
    const newQId = `${editingTest.key}_q${editingTest.questions.length + 1}`;
    const newQuestion: Question = {
      id: newQId,
      text: "New Diagnostic Multiple-Choice Question?",
      options: [
        { id: "o1", text: "Option A", value: "A" },
        { id: "o2", text: "Option B", value: "B" }
      ]
    };
    setEditingTest({
      ...editingTest,
      questions: [...editingTest.questions, newQuestion]
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    if (!editingTest) return;
    const filtered = editingTest.questions.filter((_, i) => i !== idx);
    setEditingTest({
      ...editingTest,
      questions: filtered
    });
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    qs[idx].text = text;
    setEditingTest({ ...editingTest, questions: qs });
  };

  const handleOptionTextChange = (qIdx: number, oIdx: number, text: string) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    qs[qIdx].options[oIdx].text = text;
    setEditingTest({ ...editingTest, questions: qs });
  };

  const handleOptionValueChange = (qIdx: number, oIdx: number, val: string) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    qs[qIdx].options[oIdx].value = val;
    setEditingTest({ ...editingTest, questions: qs });
  };

  const handleOptionPercentageChange = (qIdx: number, oIdx: number, pct: number) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    qs[qIdx].options[oIdx].correctnessPercentage = Math.min(100, Math.max(0, isNaN(pct) ? 0 : pct));
    setEditingTest({ ...editingTest, questions: qs });
  };

  const handleAddOption = (qIdx: number) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    const newOId = `o${qs[qIdx].options.length + 1}`;
    qs[qIdx].options.push({ id: newOId, text: "New Choice Option", value: "Value", correctnessPercentage: 100 });
    setEditingTest({ ...editingTest, questions: qs });
  };

  const handleRemoveOption = (qIdx: number, oIdx: number) => {
    if (!editingTest) return;
    const qs = [...editingTest.questions];
    qs[qIdx].options = qs[qIdx].options.filter((_, i) => i !== oIdx);
    setEditingTest({ ...editingTest, questions: qs });
  };

  // Searching filter for reports
  const filteredSubs = submissions.filter(sub => {
    const q = searchQuery.toLowerCase();
    return (
      sub.user.name.toLowerCase().includes(q) ||
      sub.user.email.toLowerCase().includes(q) ||
      sub.user.phone.includes(q) ||
      sub.testTitle.toLowerCase().includes(q) ||
      sub.testKey.toLowerCase().includes(q)
    );
  });

  return (
    <div id="diagnostics-admin-workspace" className="space-y-8">
      {/* Upper Navigation & Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Scientific Diagnostics Management</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Edit interactive tests, view individual user reports, and audit psychometric profiles.</p>
          </div>
        </div>

        <div className="flex items-center bg-zinc-100 p-1 rounded-xl self-start md:self-center">
          <button
            onClick={() => setDiagTab("reports")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              diagTab === "reports"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Candidate Reports ({submissions.length})
          </button>
          <button
            onClick={() => setDiagTab("tests")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
              diagTab === "tests"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            Diagnostics Library ({tests.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Retrieving Assessment Records...</p>
        </div>
      ) : diagTab === "reports" ? (
        // REPORTS TAB CONTENT
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Candidates List Panel (Left) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by name, email, phone or test..."
                className="w-full bg-white border border-zinc-200 rounded-2xl pl-11 pr-4 py-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm text-zinc-900"
              />
            </div>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-100 max-h-[700px] overflow-y-auto">
              {filteredSubs.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <Users className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-xs font-bold uppercase tracking-wider">No Candidates Found</p>
                  <p className="text-[11px] text-zinc-400 mt-1">Try adapting your keywords or query filter.</p>
                </div>
              ) : (
                filteredSubs.map((sub) => {
                  const isActive = selectedSub?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-5 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive ? "bg-emerald-50/50 border-l-4 border-emerald-600" : "hover:bg-zinc-50 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900 font-sans">{sub.user.name}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                            {sub.user.role}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500">{sub.testTitle}</p>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {new Date(sub.createdAt).toLocaleString("en-IN")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {sub.score?.dominant && (
                          <span className="text-[11px] font-black font-mono bg-zinc-950 text-white rounded px-2 py-1">
                            {sub.score.dominant}
                          </span>
                        )}
                        {sub.score?.mbti && (
                          <span className="text-[11px] font-black font-mono bg-indigo-950 text-indigo-200 rounded px-2 py-1">
                            {sub.score.mbti}
                          </span>
                        )}
                        {sub.score?.temperament && (
                          <span className="text-[11px] font-black font-mono bg-teal-950 text-teal-200 rounded px-2 py-1">
                            {sub.score.temperament}
                          </span>
                        )}
                        
                        <button
                          onClick={(e) => handleDeleteSubmission(sub.id, e)}
                          className="p-1.5 hover:bg-red-50 hover:text-red-600 text-zinc-400 rounded-lg transition-all"
                          title="Delete submission record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Report Review & Detailed Analysis (Right) */}
          <div className="lg:col-span-7">
            {selectedSub ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-8 space-y-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-100 pb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase font-mono">
                      Psychometric Evaluation Report
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 font-sans tracking-tight leading-tight">
                      {selectedSub.user.name}
                    </h3>
                    <p className="text-sm text-zinc-500 font-sans">{selectedSub.testTitle}</p>
                  </div>
                  
                  <div className="text-left sm:text-right font-mono text-[11px] text-zinc-400">
                    <div className="font-bold text-zinc-500">Candidate Ref ID:</div>
                    <div>{selectedSub.id}</div>
                    <div className="mt-1">{new Date(selectedSub.createdAt).toLocaleString("en-IN")} IST</div>
                  </div>
                </div>

                {/* Candidate Contact Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl">
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Email Address</div>
                    <a href={`mailto:${selectedSub.user.email}`} className="text-xs font-semibold text-zinc-900 hover:underline break-all">
                      {selectedSub.user.email}
                    </a>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Contact Number</div>
                    <a href={`tel:${selectedSub.user.phone}`} className="text-xs font-semibold text-zinc-900 hover:underline">
                      {selectedSub.user.phone}
                    </a>
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">Current Track</div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                      {selectedSub.user.role}
                    </span>
                  </div>
                </div>

                {/* Custom input details based on requirement */}
                {selectedSub.user.specialDetail && (
                  <div className="bg-emerald-50/20 border border-emerald-100/40 p-4 rounded-2xl space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider font-mono">
                      Special Candidate Input:
                    </span>
                    <p className="text-xs text-zinc-800 leading-relaxed font-sans font-medium">
                      "{selectedSub.user.specialDetail}"
                    </p>
                  </div>
                )}

                {/* Styled Score Dashboard Segment */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-zinc-800" />
                    <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 font-sans">Evaluation & Career Analysis</h4>
                  </div>

                  <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-950 text-white space-y-4 shadow-xl">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">Calculated Profile</span>
                        <div className="text-lg font-black tracking-tight">{selectedSub.score.title}</div>
                      </div>
                      
                      {selectedSub.score.dominant && (
                        <div className="text-3xl font-black font-mono text-emerald-400 bg-zinc-900 h-14 w-14 rounded-xl flex items-center justify-center border border-zinc-800 shadow-inner">
                          {selectedSub.score.dominant}
                        </div>
                      )}
                      {selectedSub.score.mbti && (
                        <div className="text-xl font-black font-mono text-cyan-400 bg-zinc-900 h-14 w-14 rounded-xl flex items-center justify-center border border-zinc-800 shadow-inner">
                          {selectedSub.score.mbti}
                        </div>
                      )}
                    </div>

                    <p className="text-zinc-300 text-xs leading-relaxed font-sans font-medium">
                      {selectedSub.score.summary}
                    </p>

                    {/* Render score breakdown visualizer bars if available */}
                    {selectedSub.score.breakdown && (
                      <div className="border-t border-zinc-800 pt-4 space-y-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">Quantitative Score Breakdown</span>
                        <div className="space-y-2">
                          {Object.entries(selectedSub.score.breakdown).map(([k, val]: any) => {
                            const percent = typeof val === "number" ? val : 25; // default fallback if needed
                            return (
                              <div key={k} className="space-y-1">
                                <div className="flex justify-between text-[11px] font-mono">
                                  <span className="font-bold text-zinc-300 uppercase">{k} Dimension</span>
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
                </div>

                {/* Answers Audit logs */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-zinc-800 font-bold text-xs uppercase tracking-wider">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Raw Response Log ({Object.keys(selectedSub.answers).length} items)</span>
                  </div>
                  
                  <div className="bg-zinc-50 rounded-2xl border border-zinc-200/60 max-h-48 overflow-y-auto p-4 space-y-2.5">
                    {Object.entries(selectedSub.answers).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-start gap-4 text-xs font-mono border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-zinc-500 font-medium">Question ID {key}:</span>
                        <span className="text-zinc-900 font-bold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[400px]">
                <BrainCircuit className="h-16 w-16 text-zinc-300 animate-pulse mb-4" />
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 font-sans">Audit Panel Active</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Select a candidate from the roster on the left to examine their calculated scores, motivation, and custom psychometric analysis.
                </p>
              </div>
            )}
          </div>

        </div>
      ) : (
        // TESTS CONFIGURATION TAB CONTENT
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Tests List Left Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">Select Diagnostic Assessment</span>
            </div>

            <button
              id="admin-create-custom-test-btn"
              onClick={handleCreateNewCustomTest}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-800 hover:border-zinc-700 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:scale-[1.01] active:scale-95 duration-200"
            >
              <Plus className="h-4 w-4 text-emerald-500" /> Create New Custom Test
            </button>

            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden divide-y divide-zinc-100">
              {tests.map((test) => (
                <div
                  key={test.key}
                  onClick={() => handleStartEditing(test)}
                  className={`p-5 transition-all cursor-pointer ${
                    editingTest?.key === test.key ? "bg-emerald-50/50 border-l-4 border-emerald-600" : "hover:bg-zinc-50 bg-white"
                  }`}
                >
                  <h4 className="text-xs font-black text-zinc-900 font-sans uppercase tracking-wide">{test.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">{test.description}</p>
                  <div className="flex items-center gap-1.5 mt-2.5">
                    <span className="text-[10px] font-mono bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-600 font-bold uppercase">
                      {test.questions.length} MCQs
                    </span>
                    <span className="text-[10px] font-mono bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-zinc-600 font-bold uppercase">
                      Key: {test.key}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor Right Panel */}
          <div className="lg:col-span-8">
            {editingTest ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Diagnostics Designer</span>
                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">{editingTest.title} Editor</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTest(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-zinc-500 hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                    <button
                      onClick={handleUpdateTestQuestions}
                      disabled={savingTest}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-900/10"
                    >
                      <Save className="h-3.5 w-3.5" /> {savingTest ? "Saving Questions..." : "Save Questions"}
                    </button>
                  </div>
                </div>

                {/* Core Test Description Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Test Title</label>
                    <input
                      type="text"
                      value={editingTest.title || ""}
                      onChange={(e) => setEditingTest({ ...editingTest, title: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Unique Key ID</label>
                    <input
                      type="text"
                      value={editingTest.key || ""}
                      disabled={!editingTest.key?.startsWith("custom-")}
                      onChange={(e) => setEditingTest({ ...editingTest, key: e.target.value.replace(/[^a-zA-Z0-9-]/g, "") })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-mono disabled:opacity-60 font-bold"
                      title="For security and route integrity, default test keys cannot be altered. Custom test keys are editable."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Test Subtitle</label>
                    <input
                      type="text"
                      value={editingTest.subtitle || ""}
                      onChange={(e) => setEditingTest({ ...editingTest, subtitle: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Custom Field Label (Before Entry Form)</label>
                    <input
                      type="text"
                      value={editingTest.customFieldLabel || ""}
                      onChange={(e) => setEditingTest({ ...editingTest, customFieldLabel: e.target.value })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Evaluation & Scoring Method</label>
                    <select
                      value={editingTest.scoringMethod || "personality"}
                      onChange={(e) => setEditingTest({ ...editingTest, scoringMethod: e.target.value as any })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold cursor-pointer"
                    >
                      <option value="personality">Personality & Psychometric Profiling (Tally of dominant answers)</option>
                      <option value="aptitude">Aptitude, Cognitive & Academic Test (Correct options percentage score)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Description / Instruction Prompt</label>
                    <textarea
                      value={editingTest.description || ""}
                      onChange={(e) => setEditingTest({ ...editingTest, description: e.target.value })}
                      rows={2}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-medium"
                    />
                  </div>
                </div>

                {/* Question List Editor */}
                <div className="space-y-4 pt-4 border-t border-zinc-100">
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm font-black text-zinc-950 uppercase tracking-wider font-sans">Interactive MCQs ({editingTest.questions.length})</h4>
                    <button
                      onClick={handleAddQuestion}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add MCQ Question
                    </button>
                  </div>

                  <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                    {editingTest.questions.map((q, qIdx) => (
                      <div key={q.id || qIdx} className="p-5 border border-zinc-200 bg-zinc-50/50 rounded-2xl space-y-4 relative group">
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                            title="Remove Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black text-zinc-400 font-mono block uppercase">Question {qIdx + 1}</span>
                          <input
                            type="text"
                            value={q.text}
                            onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-900 font-bold"
                          />
                        </div>

                        {editingTest.scoringMethod === "aptitude" && (
                          <div className="space-y-1 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                            <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest font-mono block">Correct Value Key (For Scoring)</label>
                            <input
                              type="text"
                              value={q.correctValue || ""}
                              placeholder="e.g., A, B (Must match the exact score value of the correct option)"
                              onChange={(e) => {
                                const qs = [...editingTest.questions];
                                qs[qIdx].correctValue = e.target.value;
                                setEditingTest({ ...editingTest, questions: qs });
                              }}
                              className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-mono font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        )}

                        {/* Options editor */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Multiple Choice Options & Correctness Percentages</span>
                              <p className="text-[10px] text-zinc-400">Set option text, score code value, and assign exact correctness percentage weight (0% to 100%).</p>
                            </div>
                            <button
                              onClick={() => handleAddOption(qIdx)}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-500 uppercase tracking-wider cursor-pointer bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200"
                            >
                              + Add Option
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-2.5">
                            {q.options.map((o, oIdx) => {
                              const pct = o.correctnessPercentage ?? 0;
                              return (
                                <div key={o.id || oIdx} className="p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold font-mono text-zinc-400 w-5 text-center">#{oIdx + 1}</span>
                                    <input
                                      type="text"
                                      value={o.text}
                                      placeholder="Option text..."
                                      onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                                      className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-800 font-medium"
                                    />
                                    <input
                                      type="text"
                                      value={o.value}
                                      placeholder="Score Value..."
                                      title="Calculated code value (e.g., D, I, S, C or A, B)"
                                      onChange={(e) => handleOptionValueChange(qIdx, oIdx, e.target.value)}
                                      className="w-20 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-xs text-center font-mono font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                    />
                                    <button
                                      onClick={() => handleRemoveOption(qIdx, oIdx)}
                                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                      title="Remove Option"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>

                                  {/* Correctness Percentage controls */}
                                  <div className="flex items-center justify-between gap-2 pl-7 pt-1 border-t border-zinc-200/60">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Correctness Weight:</span>
                                      <div className="flex items-center bg-white border border-zinc-200 rounded-lg px-2 py-0.5">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          value={pct}
                                          onChange={(e) => handleOptionPercentageChange(qIdx, oIdx, parseInt(e.target.value))}
                                          className="w-12 text-xs font-bold text-emerald-700 text-center font-mono outline-none"
                                        />
                                        <span className="text-xs font-bold text-emerald-700">%</span>
                                      </div>
                                    </div>

                                    {/* Preset Percentage buttons */}
                                    <div className="flex items-center gap-1">
                                      <span className="text-[9px] font-bold text-zinc-400 uppercase mr-1">Presets:</span>
                                      {[
                                        { label: "100%", val: 100, cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
                                        { label: "75%", val: 75, cls: "bg-teal-100 text-teal-800 border-teal-300" },
                                        { label: "50%", val: 50, cls: "bg-amber-100 text-amber-800 border-amber-300" },
                                        { label: "25%", val: 25, cls: "bg-orange-100 text-orange-800 border-orange-300" },
                                        { label: "0%", val: 0, cls: "bg-zinc-100 text-zinc-700 border-zinc-300" },
                                      ].map((preset) => (
                                        <button
                                          key={preset.val}
                                          type="button"
                                          onClick={() => handleOptionPercentageChange(qIdx, oIdx, preset.val)}
                                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                            pct === preset.val
                                              ? `${preset.cls} ring-2 ring-emerald-500/30 scale-105 font-black`
                                              : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                                          }`}
                                        >
                                          {preset.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Result Profiles Editor */}
                <div className="space-y-4 pt-6 border-t border-zinc-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-black text-zinc-950 uppercase tracking-wider font-sans">Custom Result Profiles</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed">
                        Define mapped result profiles. If the candidate's dominant selection matches the Dimension, this profile will form their report.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const profiles = editingTest.resultProfiles || [];
                        setEditingTest({
                          ...editingTest,
                          resultProfiles: [
                            ...profiles,
                            { value: "Dimension-Code", title: "New Result Profile", summary: "Describe strengths, recommended tracks, and detailed advice here..." }
                          ]
                        });
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-wider transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> Add Result Profile
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {(editingTest.resultProfiles || []).map((prof, pIdx) => (
                      <div key={pIdx} className="p-4 border border-zinc-200 bg-zinc-50/50 rounded-xl space-y-3 relative">
                        <button
                          onClick={() => {
                            const profiles = (editingTest.resultProfiles || []).filter((_, i) => i !== pIdx);
                            setEditingTest({ ...editingTest, resultProfiles: profiles });
                          }}
                          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Profile"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Dimension Code / Mapped Value</label>
                            <input
                              type="text"
                              value={prof.value}
                              placeholder="e.g., D, I, or custom value"
                              onChange={(e) => {
                                const profiles = [...(editingTest.resultProfiles || [])];
                                profiles[pIdx].value = e.target.value;
                                setEditingTest({ ...editingTest, resultProfiles: profiles });
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Profile Title</label>
                            <input
                              type="text"
                              value={prof.title}
                              placeholder="e.g., Analytical Architect"
                              onChange={(e) => {
                                const profiles = [...(editingTest.resultProfiles || [])];
                                profiles[pIdx].title = e.target.value;
                                setEditingTest({ ...editingTest, resultProfiles: profiles });
                              }}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Detailed Advice & Career Alignment Summary</label>
                          <textarea
                            value={prof.summary}
                            rows={3}
                            placeholder="Write comprehensive, personalized feedback instructions..."
                            onChange={(e) => {
                              const profiles = [...(editingTest.resultProfiles || [])];
                              profiles[pIdx].summary = e.target.value;
                              setEditingTest({ ...editingTest, resultProfiles: profiles });
                            }}
                            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>
                    ))}
                    {(editingTest.resultProfiles || []).length === 0 && (
                      <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl">
                        No custom result profiles defined yet. The default scoring summary fallback will be used.
                      </div>
                    )}
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center text-zinc-500 flex flex-col items-center justify-center min-h-[400px]">
                <Settings className="h-16 w-16 text-zinc-300 animate-spin-slow mb-4" />
                <h4 className="text-sm font-black uppercase tracking-wider text-zinc-900 font-sans">Diagnostics Designer</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  Select a test from the library list on the left to configure or customize its multiple-choice questions, diagnostic scale options, and custom descriptors.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
