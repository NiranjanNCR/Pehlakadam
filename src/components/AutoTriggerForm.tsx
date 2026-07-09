import { useState, useEffect, ChangeEvent, FormEvent } from "react";
// Added MessageSquare and promo/login icons to lucide-react icons list
import { X, Sparkles, CheckCircle, Calendar, GraduationCap, ArrowRight, Timer, MessageSquare, Tag, Percent, AlertCircle, RefreshCw, LogIn, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContactFormData } from "../types";
import { contactFormSchema } from "../lib/validation";

export default function AutoTriggerForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // 💬 NEW WHATSAPP STATE: Holds the pre-compiled WhatsApp message URL returned from the server API
  const [whatsappUrl, setWhatsappUrl] = useState("");

  // 🎟️ NEW GAMIFICATION & COUPON SYSTEM STATES
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountType: "percentage" | "fixed"; discountValue: number } | null>(null);
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState("");
  const [couponErrorMsg, setCouponErrorMsg] = useState("");

  // 🔒 STUDENT LOGIN STATE
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    // Check if user has already submitted or dismissed
    const submitted = localStorage.getItem("pehlakadam_form_submitted");
    const dismissed = localStorage.getItem("pehlakadam_modal_dismissed");

    if (submitted === "true" || dismissed === "true") {
      return;
    }

    // Tick down the 30-second timer
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🎟️ APPLY PROMO COUPON ENDPOINT
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponValidating(true);
    setCouponErrorMsg("");
    setCouponSuccessMsg("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput }),
      });

      if (response.ok) {
        const data = await response.json();
        setAppliedCoupon({
          code: data.coupon.code,
          discountType: data.coupon.discountType,
          discountValue: data.coupon.discountValue,
        });
        setCouponSuccessMsg(`Coupon "${data.coupon.code}" applied successfully!`);
      } else {
        const errorData = await response.json();
        setCouponErrorMsg(errorData.error || "Invalid coupon code.");
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponErrorMsg("Failed to validate coupon code.");
    } finally {
      setCouponValidating(false);
    }
  };

  // 🔒 STUDENT LOGIN ENDPOINT
  const handleStudentLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPhone.trim()) {
      setLoginError("Please enter both email and contact number.");
      return;
    }
    setLoggingIn(true);
    setLoginError("");
    setLoginSuccess(false);

    try {
      const response = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, number: loginPhone }),
      });

      if (response.ok) {
        const data = await response.json();
        setLoginSuccess(true);
        // Autofill fields
        setFormData({
          firstName: data.student.firstName || "",
          lastName: data.student.lastName || "",
          email: data.student.email || "",
          number: data.student.number || "",
          role: data.student.role || "",
          message: data.student.message || "",
        });
        
        // Auto-apply the free access pass / 100% discount coupon
        setAppliedCoupon({
          code: "WELCOME100",
          discountType: "percentage",
          discountValue: 100
        });

        // Switch view back to registration view to submit or view prefilled
        setTimeout(() => {
          setShowLogin(false);
        }, 1200);
      } else {
        const errorData = await response.json();
        setLoginError(errorData.error || "Profile not found or not whitelisted.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError("Failed to connect with authentication server.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pehlakadam_modal_dismissed", "true");
    setIsOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    // Smart default for empty or missing message so Zod validation passes and provides a great default message context!
    const targetMessage = formData.message.trim()
      ? formData.message.trim()
      : "I want to request a free diagnostic career consultation.";

    const submissionPayload = {
      ...formData,
      message: targetMessage
    };

    const result = contactFormSchema.safeParse(submissionPayload);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof ContactFormData;
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 TRANSACTION: Post data to our full-stack endpoint
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...result.data,
          // Explicitly tag that this came from the 30-second conversion pop-up
          message: `[30-Sec Conversion Pop-up Alert] Goal: ${result.data.message}`,
          couponApplied: appliedCoupon ? appliedCoupon.code : undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // 💬 CAPTURE WHATSAPP URL: Save the pre-formatted WhatsApp link for user redirection
        if (data.whatsappUrl) {
          setWhatsappUrl(data.whatsappUrl);
        }

        setSubmitSuccess(true);
        localStorage.setItem("pehlakadam_form_submitted", "true");
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          number: "",
          role: "",
          message: "",
        });
        
        // Reset coupon / login state after successful reservation
        setAppliedCoupon(null);
        setCouponInput("");
        setCouponSuccessMsg("");
        setCouponErrorMsg("");

        // Extend the pop-up success window visibility duration to 20 seconds so the student has sufficient time to tap the WhatsApp button
        setTimeout(() => {
          setIsOpen(false);
          setWhatsappUrl("");
        }, 20000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Failed to submit request.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Failed to connect with registration server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mini indicator showing that a special offer is unlocking */}
      {!isOpen && secondsRemaining > 0 && (
        <div 
          id="timed-offer-indicator"
          className="fixed bottom-6 right-6 z-50 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 text-white max-w-xs font-sans text-xs"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
          <p className="text-zinc-400 font-medium">
            Special Psychometric Session unlocks in <span className="text-emerald-400 font-bold font-mono">{secondsRemaining}s</span>
          </p>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="conversion-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          >
            <motion.div
              id="conversion-modal-content"
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 text-white p-8 shadow-2xl"
            >
              {/* Close Button */}
              <button
                id="close-conversion-modal-btn"
                onClick={handleDismiss}
                className="absolute right-5 top-5 text-zinc-400 hover:text-white transition-colors duration-200 p-1.5 rounded-full hover:bg-zinc-800 cursor-pointer"
                aria-label="Close form modal"
              >
                <X className="h-5 w-5" />
              </button>

              {submitSuccess ? (
                <div id="conversion-success" className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
                  >
                    <CheckCircle className="h-20 w-20 text-emerald-500" />
                  </motion.div>
                  <h3 className="text-2xl font-bold font-sans tracking-tight">Your Session is Reserved!</h3>
                  <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-4">
                    We've registered your priority consult profile. An expert advisor from BITS Pilani will contact you within 24 hours.
                  </p>

                  {/* 💬 WHATSAPP CTA LINK:
                      Invokes direct WhatsApp hand-off utilizing the pre-built, encrypted message
                      template containing all the registered career aspirations of the user. */}
                  {whatsappUrl && (
                    <motion.a
                      id="conversion-whatsapp-cta"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 px-5 transition-all duration-300 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 animate-pulse cursor-pointer text-sm"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Notify Advisor on WhatsApp
                    </motion.a>
                  )}
                </div>
              ) : (
                <div id="conversion-fields" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-widest font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Limited Time Offer
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[10px]">
                      <Timer className="h-3.5 w-3.5" />
                      <span>OFFER CLOSING SOON</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black font-sans tracking-tight text-white flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" /> Unlock Seasonal Offer
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                      You qualify for a dynamic counseling session & preliminary psychometric strength review (worth ₹4,999).
                    </p>
                  </div>

                  {/* Dynamic Pricing Interactive Ticket Card */}
                  <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                        Psychometric Diagnostic Package
                      </p>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-zinc-500 line-through text-sm font-semibold">₹4,999</span>
                        <motion.span
                          key={appliedCoupon ? "discounted" : "original"}
                          initial={{ scale: 0.9, opacity: 0.7 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-white text-2xl font-black tracking-tight"
                        >
                          {appliedCoupon ? (
                            appliedCoupon.discountValue === 100 && appliedCoupon.discountType === "percentage" ? (
                              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                                FREE <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">100% OFF</span>
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-extrabold">
                                ₹
                                {appliedCoupon.discountType === "percentage"
                                  ? Math.max(0, 4999 - Math.round((4999 * appliedCoupon.discountValue) / 100))
                                  : Math.max(0, 4999 - appliedCoupon.discountValue)}
                              </span>
                            )
                          ) : (
                            <span className="text-zinc-200">₹4,999</span>
                          )}
                        </motion.span>
                      </div>
                    </div>

                    <div className="text-right">
                      {appliedCoupon ? (
                        <div className="flex flex-col items-end">
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-extrabold px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                            <Tag className="h-3.5 w-3.5" />
                            {appliedCoupon.code}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-medium mt-1">
                            {appliedCoupon.discountType === "percentage" ? `${appliedCoupon.discountValue}%` : `₹${appliedCoupon.discountValue}`} reduction applied
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-zinc-500 font-medium flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                          <Percent className="h-3.5 w-3.5 text-zinc-400 animate-spin" />
                          Apply coupon below
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Elegant Interactive Mode Selector */}
                  <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                        !showLogin
                          ? "bg-zinc-800 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      New Student (Claim Offer)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogin(true)}
                      className={`py-2 rounded-lg font-bold transition-all cursor-pointer ${
                        showLogin
                          ? "bg-zinc-800 text-white shadow"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Returning Student (Login)
                    </button>
                  </div>

                  {/* RENDER FORM BASED ON SELECTED TAB */}
                  {showLogin ? (
                    /* RETURNING STUDENT AUTHENTICATION FORM */
                    <form onSubmit={handleStudentLogin} className="space-y-4 pt-2">
                      <div className="bg-zinc-950/40 border border-zinc-800/80 p-4 rounded-2xl">
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          Already registered a profile with Pehlakadam? Sign in to verify your account status and instantly unlock your <span className="text-emerald-400 font-semibold">Seasonal Free Access Pass</span>.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Registered Email Address
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="student@example.com"
                          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                          Registered Phone Number
                        </label>
                        <input
                          type="tel"
                          value={loginPhone}
                          onChange={(e) => setLoginPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          required
                        />
                      </div>

                      {loginError && (
                        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      {loginSuccess && (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" />
                          <span>Login Success! Access Pass unlocked. Prefilling form...</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loggingIn}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                      >
                        {loggingIn ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Verifying Profile Credentials...
                          </>
                        ) : (
                          <>
                            <LogIn className="h-4 w-4" />
                            Verify and Unlock Free Access
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* MAIN REGISTRATION FORM */
                    <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="Arjun"
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.firstName
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Sharma"
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.lastName
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="arjun@gmail.com"
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.email
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Contact Number
                          </label>
                          <input
                            type="tel"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.number
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          />
                          {errors.number && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.number}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            I want to enroll in
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.role
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          >
                            <option value="" disabled>
                              Select a program
                            </option>
                            <option value="Primary Kudos">Primary Kudos</option>
                            <option value="6-8 Grade Student">6-8 Grade Student</option>
                            <option value="8-10 Grade Student">8-10 Grade Student</option>
                            <option value="11-12 Grade Student">11-12 Grade Student</option>
                            <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                            <option value="Generalist to Specialist">Generalist to Specialist</option>
                          </select>
                          {errors.role && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.role}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            Main Career Aspiration / Doubt
                          </label>
                          <input
                            type="text"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="e.g. AI engineering vs tech"
                            className={`w-full rounded-xl bg-zinc-800 border px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                              errors.message
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                            }`}
                          />
                          {errors.message && (
                            <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Interactive Promo Coupon Application Panel */}
                      <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Apply Promo Coupon (Check Admin Panel for Valid Codes)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                            placeholder="e.g. FESTIVE100, PEHLA50"
                            className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                          />
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={couponValidating}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-[11px] px-4 py-2 rounded-xl transition-all cursor-pointer shadow flex items-center gap-1.5"
                          >
                            {couponValidating ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Tag className="h-3 w-3" />}
                            Apply
                          </button>
                        </div>

                        {couponErrorMsg && (
                          <div className="text-red-400 text-[10px] font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{couponErrorMsg}</span>
                          </div>
                        )}

                        {couponSuccessMsg && (
                          <div className="text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 mt-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>{couponSuccessMsg}</span>
                          </div>
                        )}
                      </div>

                      {submitError && (
                        <div className="p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>{submitError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Securing Consultation Slot...
                          </>
                        ) : appliedCoupon && appliedCoupon.discountValue === 100 && appliedCoupon.discountType === "percentage" ? (
                          <>
                            Claim Free 1-on-1 Consultation
                            <ArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Claim consultation offer
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
