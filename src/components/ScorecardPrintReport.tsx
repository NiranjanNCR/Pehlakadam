import React from "react";
import { CheckCircle, XCircle, MinusCircle, Printer, Award, ShieldCheck, User, Calendar, BookOpen, Clock } from "lucide-react";

export interface ScorecardPrintProps {
  report: {
    id?: string;
    _id?: string;
    testKey: string;
    testTitle: string;
    createdAt?: string;
    user: {
      name: string;
      email: string;
      phone: string;
      role: string;
      specialDetail?: string;
    };
    answers?: Record<string, string>;
    score: {
      title?: string;
      summary?: string;
      percentage?: number;
      correctCount?: number;
      totalCount?: number;
      overallCorrectnessPercentage?: number;
      dominant?: string;
      dominantType?: string;
      temperament?: string;
      mbti?: string;
      breakdown?: Record<string, number>;
      questionCorrectnessBreakdown?: Array<{
        questionId: string;
        questionText: string;
        selectedOptionText: string;
        selectedOptionValue: string;
        earnedCorrectnessPercentage: number;
        correctOptionText?: string;
        correctOptionValue?: string;
      }>;
    };
  };
  testDefinition?: {
    questions?: Array<{
      id: string;
      text: string;
      correctValue?: string;
      options: Array<{
        id: string;
        text: string;
        value: string;
        correctnessPercentage?: number;
      }>;
    }>;
  };
}

export default function ScorecardPrintReport({ report, testDefinition }: ScorecardPrintProps) {
  if (!report) return null;

  const candidate = report.user || {
    name: "Candidate",
    email: "candidate@pehlakadam.com",
    phone: "9876543210",
    role: "Student",
    specialDetail: "Standard Diagnostic Assessment"
  };

  const reportDate = report.createdAt
    ? new Date(report.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

  const reportId = `PK-TEST-${(report.id || report._id || Date.now().toString()).slice(-8).toUpperCase()}`;

  // Build comprehensive question by question response sheet
  const questionsList = testDefinition?.questions || [];
  const rawAnswers = report.answers || {};

  interface ResponseRow {
    index: number;
    questionText: string;
    userChoice: string;
    userChoiceValue: string;
    correctAnswerText: string;
    correctAnswerValue: string;
    status: "correct" | "incorrect" | "skipped" | "evaluated";
    earnedPct: number;
    optionsSummary?: string[];
  }

  const responseRows: ResponseRow[] = [];

  if (questionsList.length > 0) {
    questionsList.forEach((q, idx) => {
      const userVal = rawAnswers[q.id];
      const selectedOpt = (q.options || []).find(
        (o) =>
          o.value === userVal ||
          o.id === userVal ||
          o.text === userVal ||
          (userVal && o.value && o.value.toString().trim().toUpperCase() === userVal.toString().trim().toUpperCase())
      );

      // Identify correct option (if aptitude / admin configured with 100% or correctValue)
      let correctOpt = (q.options || []).find((o) => o.correctnessPercentage === 100);
      if (!correctOpt && q.correctValue) {
        correctOpt = (q.options || []).find(
          (o) =>
            o.value === q.correctValue ||
            o.id === q.correctValue ||
            o.value.toString().trim().toUpperCase() === q.correctValue.toString().trim().toUpperCase()
        );
      }

      let earnedPct = 0;
      let status: "correct" | "incorrect" | "skipped" | "evaluated" = "evaluated";

      if (userVal === undefined || userVal === null || userVal === "") {
        status = "skipped";
        earnedPct = 0;
      } else if (selectedOpt && selectedOpt.correctnessPercentage !== undefined) {
        earnedPct = selectedOpt.correctnessPercentage;
        status = earnedPct === 100 ? "correct" : earnedPct > 0 ? "evaluated" : "incorrect";
      } else if (correctOpt) {
        if (
          userVal.toString().trim().toUpperCase() ===
          (correctOpt.value || q.correctValue || "").toString().trim().toUpperCase()
        ) {
          earnedPct = 100;
          status = "correct";
        } else {
          earnedPct = 0;
          status = "incorrect";
        }
      } else {
        earnedPct = 100;
        status = "evaluated";
      }

      responseRows.push({
        index: idx + 1,
        questionText: q.text,
        userChoice: selectedOpt ? selectedOpt.text : userVal ? String(userVal) : "[Unattempted / Skipped]",
        userChoiceValue: selectedOpt ? selectedOpt.value : userVal ? String(userVal) : "-",
        correctAnswerText: correctOpt ? correctOpt.text : q.correctValue ? `Key: ${q.correctValue}` : "N/A (Personality Vector)",
        correctAnswerValue: correctOpt ? correctOpt.value : q.correctValue || "-",
        status,
        earnedPct,
        optionsSummary: q.options?.map((o) => `${o.text} (${o.value})`)
      });
    });
  } else if (report.score?.questionCorrectnessBreakdown && report.score.questionCorrectnessBreakdown.length > 0) {
    report.score.questionCorrectnessBreakdown.forEach((item, idx) => {
      responseRows.push({
        index: idx + 1,
        questionText: item.questionText,
        userChoice: item.selectedOptionText || item.selectedOptionValue || "Attempted",
        userChoiceValue: item.selectedOptionValue || "-",
        correctAnswerText: item.correctOptionText || "Evaluated Key",
        correctAnswerValue: item.correctOptionValue || "-",
        status: item.earnedCorrectnessPercentage === 100 ? "correct" : item.earnedCorrectnessPercentage > 0 ? "evaluated" : "incorrect",
        earnedPct: item.earnedCorrectnessPercentage
      });
    });
  } else if (Object.keys(rawAnswers).length > 0) {
    Object.entries(rawAnswers).forEach(([qKey, aVal], idx) => {
      responseRows.push({
        index: idx + 1,
        questionText: `Diagnostic Evaluation Question Item #${idx + 1}`,
        userChoice: String(aVal),
        userChoiceValue: String(aVal),
        correctAnswerText: "Recorded Vector",
        correctAnswerValue: String(aVal),
        status: "evaluated",
        earnedPct: 100
      });
    });
  }

  // Calculate high-level summary metrics
  const totalQuestions = responseRows.length;
  const attemptedCount = responseRows.filter((r) => r.status !== "skipped").length;
  const correctCount = responseRows.filter((r) => r.status === "correct" || r.earnedPct === 100).length;
  const incorrectCount = responseRows.filter((r) => r.status === "incorrect").length;
  const skippedCount = totalQuestions - attemptedCount;

  const scorePercentage =
    report.score?.percentage !== undefined
      ? report.score.percentage
      : report.score?.overallCorrectnessPercentage !== undefined
      ? report.score.overallCorrectnessPercentage
      : totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 100;

  return (
    <div
      id="official-pehlakadam-scorecard-report"
      className="bg-white text-zinc-900 w-full max-w-[850px] mx-auto p-8 sm:p-10 border border-zinc-300 shadow-sm print:p-0 print:border-none print:shadow-none print:max-w-none text-left font-sans"
    >
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER: PEHLAKADAM LOGO & OFFICIAL ASSESSMENT TITLE                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-5 mb-6 gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 rounded-full border-2 border-emerald-600 p-0.5 flex items-center justify-center shrink-0">
            <div className="h-full w-full rounded-full bg-emerald-600 flex items-center justify-center text-white">
              <span className="text-xl font-black font-sans tracking-wider">PK</span>
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-zinc-950 tracking-tight leading-none uppercase">
              PEHLAKADAM
            </div>
            <div className="text-[10px] font-bold tracking-widest text-emerald-700 italic mt-1 uppercase font-mono">
              "Choose best Get best"
            </div>
            <div className="text-[9px] text-zinc-500 font-medium">
              Govt. Registered Academic & Career Counseling Initiative
            </div>
          </div>
        </div>

        {/* Scorecard Title & Report ID */}
        <div className="text-right space-y-1">
          <span className="inline-block bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded font-mono">
            OFFICIAL DIAGNOSTIC SCORECARD
          </span>
          <div className="text-[11px] font-bold text-zinc-600 font-mono">
            Report ID: <span className="text-zinc-900 select-all font-black">{reportId}</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Generated: {reportDate}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. CANDIDATE DETAILS & TEST META DETAILS                                  */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="mb-6 bg-zinc-50 border border-zinc-300 rounded-xl p-4 sm:p-5">
        <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider font-mono mb-3 border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" /> 1. Candidate & Assessment Verification Details
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Candidate Name</span>
            <span className="font-extrabold text-zinc-900 text-sm block mt-0.5">{candidate.name}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Mobile Number</span>
            <span className="font-bold text-zinc-800 font-mono block mt-0.5">+91 {candidate.phone}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Email Address</span>
            <span className="font-semibold text-zinc-800 truncate block mt-0.5">{candidate.email}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Academic Track</span>
            <span className="font-bold text-emerald-800 block mt-0.5">{candidate.role}</span>
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-zinc-200/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Test Title / Category</span>
            <span className="font-extrabold text-zinc-900 block mt-0.5">{report.testTitle}</span>
          </div>
          <div className="pt-2 border-t border-zinc-200/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Total Questions</span>
            <span className="font-bold text-zinc-800 font-mono block mt-0.5">{totalQuestions} MCQs</span>
          </div>
          <div className="pt-2 border-t border-zinc-200/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block font-mono">Evaluation Mode</span>
            <span className="font-bold text-zinc-800 font-mono block mt-0.5">Automated Admin Key</span>
          </div>
        </div>

        {candidate.specialDetail && (
          <div className="mt-3 pt-2.5 border-t border-zinc-200 text-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono block">Candidate Aspiration / Goal:</span>
            <span className="font-medium text-zinc-800 italic">"{candidate.specialDetail}"</span>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 3. CANDIDATE RESPONSE SHEET (Detailed Question by Question)               */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
          <div className="text-[11px] font-black text-emerald-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> 2. Candidate Response Sheet & Answer Key Audit
          </div>
          <div className="text-[10px] text-zinc-500 font-mono font-bold">
            Attempted: {attemptedCount}/{totalQuestions} ({Math.round((attemptedCount / (totalQuestions || 1)) * 100)}%)
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-300 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white font-mono text-[10px] uppercase tracking-wider">
                <th className="p-2.5 text-center w-10 border-r border-zinc-800">Q#</th>
                <th className="p-2.5 border-r border-zinc-800">Question Description</th>
                <th className="p-2.5 border-r border-zinc-800 w-44">Candidate's Choice</th>
                <th className="p-2.5 border-r border-zinc-800 w-40">Correct Answer Key</th>
                <th className="p-2.5 text-center w-24">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {responseRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-zinc-500 italic">
                    No questions recorded for this evaluation.
                  </td>
                </tr>
              ) : (
                responseRows.map((row) => {
                  return (
                    <tr
                      key={row.index}
                      className={`hover:bg-zinc-50/70 transition-colors ${
                        row.status === "correct"
                          ? "bg-emerald-50/30"
                          : row.status === "incorrect"
                          ? "bg-red-50/20"
                          : row.status === "skipped"
                          ? "bg-zinc-50/80"
                          : "bg-white"
                      }`}
                    >
                      <td className="p-2.5 text-center font-bold font-mono text-zinc-700 border-r border-zinc-200">
                        {String(row.index).padStart(2, "0")}
                      </td>
                      <td className="p-2.5 border-r border-zinc-200">
                        <div className="font-semibold text-zinc-900 leading-snug">{row.questionText}</div>
                      </td>
                      <td className="p-2.5 font-medium text-zinc-800 border-r border-zinc-200">
                        <span
                          className={`font-semibold ${
                            row.status === "correct"
                              ? "text-emerald-800"
                              : row.status === "incorrect"
                              ? "text-red-700 line-through"
                              : "text-zinc-600 italic"
                          }`}
                        >
                          {row.userChoice}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium text-zinc-800 border-r border-zinc-200">
                        <span className="font-bold text-emerald-900 bg-emerald-100/60 px-1.5 py-0.5 rounded text-[11px]">
                          {row.correctAnswerText}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {row.status === "correct" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                            <CheckCircle className="h-3 w-3 text-emerald-600" /> Correct
                          </span>
                        ) : row.status === "incorrect" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-mono">
                            <XCircle className="h-3 w-3 text-red-600" /> Incorrect
                          </span>
                        ) : row.status === "skipped" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-zinc-600 bg-zinc-200 px-2 py-0.5 rounded-full font-mono">
                            <MinusCircle className="h-3 w-3 text-zinc-500" /> Skipped
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full font-mono">
                            {row.earnedPct}% Match
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 4. TOTAL SCORE & FINAL PERFORMANCE SUMMARY (AT THE END)                   */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="border-2 border-zinc-900 rounded-2xl overflow-hidden mb-6 bg-zinc-950 text-white">
        <div className="bg-zinc-900 p-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[11px] font-black text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-400" /> 3. Final Evaluation Metrics & Total Score Card
          </div>
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">
            Validated by Pehlakadam AI Engine
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Summary Score Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Total Score / Accuracy</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                {scorePercentage}%
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                {correctCount} of {totalQuestions} Correct
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Attempted Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-300 font-mono mt-1">
                {Math.round((attemptedCount / (totalQuestions || 1)) * 100)}%
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                {attemptedCount} Attempted ({skippedCount} Skipped)
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Correct MCQs</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
                {correctCount}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                +{correctCount} Points Earned
              </span>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block font-mono">Incorrect MCQs</span>
              <div className="text-2xl sm:text-3xl font-black text-red-400 font-mono mt-1">
                {incorrectCount}
              </div>
              <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                {incorrectCount} Concept Gaps
              </span>
            </div>
          </div>

          {/* Qualitative Profile & Analysis Title */}
          <div className="border-t border-zinc-800 pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono">
                Performance Profile & Diagnostic Conclusion
              </span>
              {(report.score?.dominant || report.score?.mbti || report.score?.temperament) && (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
                  {report.score.dominant || report.score.mbti || report.score.temperament}
                </span>
              )}
            </div>

            <h4 className="text-lg font-black text-white leading-tight font-sans">
              {report.score?.title || `${report.testTitle} Comprehensive Evaluation`}
            </h4>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans font-medium">
              {report.score?.summary ||
                "Candidate has completed the diagnostic evaluation. Performance metrics indicate strong foundational command across key subject and psychometric dimensions."}
            </p>
          </div>

          {/* Breakdown bars if present */}
          {report.score?.breakdown && Object.keys(report.score.breakdown).length > 0 && (
            <div className="border-t border-zinc-800 pt-4 space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block">
                Dimension-Wise Performance Breakdown
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(report.score.breakdown).map(([dimName, val]: any) => {
                  const numVal = typeof val === "number" ? val : 25;
                  return (
                    <div key={dimName} className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-xl space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-zinc-300 font-semibold">{dimName}</span>
                        <span className="text-emerald-400 font-bold">{numVal}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${numVal}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 5. FOOTER: VERIFICATION SEAL, SIGNATURE & COUNSELING HELPLINE             */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      <div className="pt-4 border-t-2 border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-extrabold text-zinc-900 flex items-center gap-1.5 justify-center sm:justify-start">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Pehlakadam Academic Advisory Council
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Support: +91 74286 13102 | nrjstudywrk@gmail.com
          </div>
          <div className="text-[9px] text-zinc-400">
            This document is a certified computer-generated evaluation report based on candidate response analysis.
          </div>
        </div>

        <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-zinc-200 pt-3 sm:pt-0 sm:pl-6">
          <div className="h-10 flex items-center justify-center sm:justify-end text-emerald-800 font-serif italic text-sm font-bold">
            [Authorized Pehlakadam Seal]
          </div>
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-900 font-mono border-t border-zinc-400 pt-1">
            Director of Student Assessment
          </div>
        </div>
      </div>
    </div>
  );
}
