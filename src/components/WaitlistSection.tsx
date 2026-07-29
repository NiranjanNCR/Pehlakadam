import React, { useState } from "react";
import { Sparkles, CheckCircle2, UserCheck, Mail, Phone, User, Award, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gradeOrInterest, setGradeOrInterest] = useState("Grade 11-12 College Preparation & Competitive Entrance");
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, phone, gradeOrInterest })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Thank you! You have joined the Mentorship Cohort Waitlist.");
        setEmail("");
        setName("");
        setPhone("");
      } else {
        setErrorMsg(data.error || "Failed to join waitlist. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist-section" className="py-20 bg-zinc-900 text-white relative overflow-hidden border-y border-zinc-800">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Value Proposition & Cohort Perks */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Upcoming Mentorship Cohorts</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans leading-tight">
              Reserve Your Priority Slot for <span className="text-emerald-400">Next Mentorship Cohort</span>
            </h2>

            <p className="text-zinc-300 text-base leading-relaxed">
              Pehlakadam mentorship cohorts feature limited seat capacity to ensure direct, unhurried 1-on-1 access with faculty from IITs, BITS Pilani, and IIMs. Join our priority waitlist to get early seat reservation links before public opening.
            </p>

            {/* Perks List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Direct 1-on-1 Faculty Hours</h4>
                  <p className="text-xs text-zinc-400 mt-1">Personalized guidance sessions tailored to your goals.</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Stream & Career Blueprint</h4>
                  <p className="text-xs text-zinc-400 mt-1">Data-driven psychometric roadmap for academic success.</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Early-Bird Privilege</h4>
                  <p className="text-xs text-zinc-400 mt-1">Priority seat lock and special cohort discounts.</p>
                </div>
              </div>

              <div className="p-4 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">WhatsApp Updates</h4>
                  <p className="text-xs text-zinc-400 mt-1">Direct alert when batch admissions go live.</p>
                </div>
              </div>
            </div>

            {/* Live Social Proof Badge */}
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-400">
              <div className="flex -space-x-2 overflow-hidden">
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-8 w-8 rounded-full ring-2 ring-zinc-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Student" />
              </div>
              <span>Joined by <strong className="text-white font-bold">140+ students & parents</strong> across India for upcoming cohorts.</span>
            </div>
          </div>

          {/* Right Column: Waitlist Form */}
          <div className="lg:col-span-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-white">Join Mentorship Waitlist</h3>
                <p className="text-xs text-zinc-400 mt-1">Enter your details to receive early invitation codes when registrations open.</p>
              </div>

              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-400 text-xs leading-relaxed"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white block">Priority Registration Confirmed!</strong>
                    <span>{successMsg}</span>
                  </div>
                </motion.div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email (Required) */}
                <div>
                  <label htmlFor="waitlist-email" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      id="waitlist-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Full Name (Optional) */}
                <div>
                  <label htmlFor="waitlist-name" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      id="waitlist-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Mobile / WhatsApp (Optional) */}
                <div>
                  <label htmlFor="waitlist-phone" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Number <span className="text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      id="waitlist-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Target Cohort Dropdown */}
                <div>
                  <label htmlFor="waitlist-cohort" className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Preferred Cohort Track
                  </label>
                  <select
                    id="waitlist-cohort"
                    value={gradeOrInterest}
                    onChange={(e) => setGradeOrInterest(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                  >
                    <option value="Grade 9-10 Foundational Stream Track">Grade 9-10 Foundational Stream Track</option>
                    <option value="Grade 11-12 College Preparation & Competitive Entrance">Grade 11-12 College Prep & Competitive Entrance</option>
                    <option value="Undergraduate & Career Pivot Track">Undergraduate & Career Pivot Track</option>
                    <option value="Parent Career Counseling & Stream Strategy">Parent Career Counseling & Stream Strategy</option>
                    <option value="General Mentorship Cohort">General Mentorship Cohort</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving to Waitlist...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Priority Waitlist</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  🔒 We respect your privacy. No spam — only cohort invitation notifications.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
