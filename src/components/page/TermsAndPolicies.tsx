import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  FileText, 
  ShieldCheck, 
  RefreshCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  ChevronRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";

type PolicyTab = "terms" | "privacy" | "refund" | "disclaimer";

export default function TermsAndPolicies() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<PolicyTab>("terms");
  const [policies, setPolicies] = useState<{
    termsContent?: string;
    privacyContent?: string;
    refundContent?: string;
    disclaimerContent?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  // Sync tab with pathname
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes("privacy")) {
      setActiveTab("privacy");
    } else if (path.includes("refund")) {
      setActiveTab("refund");
    } else if (path.includes("disclaimer") || path.includes("legal")) {
      setActiveTab("disclaimer");
    } else {
      setActiveTab("terms");
    }
  }, [location.pathname]);

  // Load custom content from system stats / policies API
  useEffect(() => {
    fetch("/api/policies")
      .then((res) => {
        if (res.ok) return res.json();
        return fetch("/api/system-stats").then((r) => r.json());
      })
      .then((data) => {
        if (data) {
          setPolicies({
            termsContent: data.termsContent || "",
            privacyContent: data.privacyContent || "",
            refundContent: data.refundContent || "",
            disclaimerContent: data.disclaimerContent || ""
          });
        }
      })
      .catch((err) => console.error("Error fetching policies:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      <NavigationBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-zinc-400 mb-3">
            <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>
            <ChevronRight className="h-3 w-3 text-zinc-600" />
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Compliance & Legal Center</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3">
            Policies & Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
            Transparency, ethical standards, and psychometric confidentiality are at the core of Pehlakadam's mission.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap gap-2.5 sm:gap-3 border-b border-zinc-800 pb-4 mb-10">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "terms"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "privacy"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Privacy Policy
          </button>

          <button
            onClick={() => setActiveTab("refund")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "refund"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <RefreshCcw className="h-4 w-4" />
            Refund & Cancellation
          </button>

          <button
            onClick={() => setActiveTab("disclaimer")}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "disclaimer"
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Advisory Disclaimer
          </button>
        </div>

        {/* Tab Content Box */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-6 bg-emerald-500/10 border border-emerald-500/20 w-fit px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5" />
            <span>Effective Date: 15 August 2026 | Pehlakadam Career Ecosystem</span>
          </div>

          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === "terms" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <FileText className="h-7 w-7 text-emerald-400" />
                Terms & Conditions of Service
              </h2>

              {policies.termsContent ? (
                <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800 font-sans">
                  {policies.termsContent}
                </div>
              ) : (
                <div className="space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Acceptance of Terms</h3>
                    <p className="text-zinc-400">
                      By accessing or using the services, psychometric diagnostic suites, counseling sessions, or materials provided by <strong>Pehlakadam</strong> ("we", "our", or "us"), you agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our platform.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. Counseling & Diagnostic Scope</h3>
                    <p className="text-zinc-400">
                      Pehlakadam provides educational guidance, scientific psychometric assessments (including MBTI, DISC, 16PF, and Enneagram models), stream selection advisory, and personality development roadmaps. Our assessments are designed for self-discovery and career planning purposes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">3. User Registration & Profile Data</h3>
                    <p className="text-zinc-400">
                      Users must provide authentic and accurate details (such as student name, current grade/class, contact phone number, and career interests) during registration to receive personalized evaluation reports and scheduled counselor calls.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">4. Intellectual Property</h3>
                    <p className="text-zinc-400">
                      All proprietary evaluation algorithms, curriculum frameworks, test questionnaires, PDF resources, and branding are the exclusive intellectual property of Pehlakadam. Reproduction or unauthorized redistribution is strictly prohibited.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">5. Code of Conduct</h3>
                    <p className="text-zinc-400">
                      Students and parents participating in live 1-on-1 mentorship sessions are expected to maintain professional etiquette. Pehlakadam reserves the right to terminate session access in the event of abusive language or disruptive behavior.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-emerald-400" />
                Privacy & Data Protection Policy
              </h2>

              {policies.privacyContent ? (
                <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800 font-sans">
                  {policies.privacyContent}
                </div>
              ) : (
                <div className="space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Confidentiality of Psychological Records</h3>
                    <p className="text-zinc-400">
                      We treat student psychometric responses, cognitive traits, and assessment scores with strict confidentiality. Assessment records are accessible only to certified Pehlakadam counselors and the student/parent.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. Information We Collect</h3>
                    <ul className="list-disc list-inside text-zinc-400 space-y-1">
                      <li>Personal identifiers: Full Name, WhatsApp Number, Email Address, City/State.</li>
                      <li>Academic background: Current Grade (Class 6-8, 9-10, 11-12, Graduate), Subjects studied.</li>
                      <li>Psychometric data: Questionnaire choices, personality trait vectors, stream preferences.</li>
                      <li>Transaction logs: UPI reference IDs, transaction timestamps (we do NOT store bank PINs or credit card CVVs).</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">3. Zero Third-Party Advertising Policy</h3>
                    <p className="text-zinc-400">
                      Pehlakadam does <strong>not sell, lease, or rent</strong> student personal phone numbers or psychological data to telemarketers or third-party coaching institutes.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">4. Data Security</h3>
                    <p className="text-zinc-400">
                      All communications and database records are transmitted over SSL/TLS 256-bit encryption. Access is restricted through role-based token authentication.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION */}
          {activeTab === "refund" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <RefreshCcw className="h-7 w-7 text-emerald-400" />
                Cancellation & Refund Guidelines
              </h2>

              {policies.refundContent ? (
                <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800 font-sans">
                  {policies.refundContent}
                </div>
              ) : (
                <div className="space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Counseling Session Rescheduling</h3>
                    <p className="text-zinc-400">
                      Students can reschedule their booked 1-on-1 counseling slot free of charge by notifying us at least <strong>4 hours prior</strong> to the scheduled time via WhatsApp or email.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. Digital Evaluation & Report Generation</h3>
                    <p className="text-zinc-400">
                      Once a comprehensive psychometric report has been generated and delivered to the user, the diagnostic service is considered rendered. If a technical glitch prevents access, our technical team will regenerate and re-deliver your report within 24 hours.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">3. Refund Processing</h3>
                    <p className="text-zinc-400">
                      In the rare event of double payment or unfulfilled session slots due to counselor unavailability, full refunds are processed back to the originating UPI or bank account within <strong>3-5 business days</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADVISORY DISCLAIMER */}
          {activeTab === "disclaimer" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-emerald-400" />
                Professional Advisory Disclaimer
              </h2>

              {policies.disclaimerContent ? (
                <div className="text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4 bg-zinc-950/60 p-6 rounded-2xl border border-zinc-800 font-sans">
                  {policies.disclaimerContent}
                </div>
              ) : (
                <div className="space-y-6 text-zinc-300 text-sm sm:text-base leading-relaxed">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">1. Educational & Career Advisory Scope</h3>
                    <p className="text-zinc-400">
                      The insights, reports, and career guidance provided by Pehlakadam are based on structured psychometric models, aptitude indicators, and industry trend analytics. While our counselors strive to provide optimal strategic pathways, final educational admissions and exam success depend on individual student dedication and college admission criteria.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">2. No Clinical Psychological Treatment</h3>
                    <p className="text-zinc-400">
                      Pehlakadam provides career counseling, aptitude evaluation, and personality development guidance. Our services do not constitute psychiatric diagnosis or clinical psychotherapy. If you require medical mental health support, please consult a licensed medical professional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Helpdesk Footer within Legal Box */}
          <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Questions regarding policies? Reach our grievance officer:</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="mailto:nrjstudywrk@gmail.com" className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> nrjstudywrk@gmail.com
              </a>
              <Link to="/contact" className="text-zinc-300 hover:text-white font-semibold underline underline-offset-2">
                Contact Desk
              </Link>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
