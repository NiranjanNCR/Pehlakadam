import React, { useState, useEffect, FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { 
  X, Sparkles, CheckCircle2, ShieldCheck, Copy, Check, 
  Phone, BookOpen, MessageSquare, Zap, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Course } from "../types";
import { launchRazorpayCheckout, fetchRazorpayConfig } from "../lib/razorpay";

interface CourseCheckoutModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEnrollSuccess?: (phone: string, tier: string) => void;
}

export default function CourseCheckoutModal({
  course,
  isOpen,
  onClose,
  onEnrollSuccess
}: CourseCheckoutModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    transactionId: "",
  });

  const [upiId, setUpiId] = useState("nrjstudywrk@okicici");
  const [merchantName, setMerchantName] = useState("Niranjan Singh (Pehlakadam)");
  const [copied, setCopied] = useState(false);
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState("");
  const [showManualUpi, setShowManualUpi] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [enrollSuccessData, setEnrollSuccessData] = useState<{
    success: boolean;
    studentName: string;
    courseTitle: string;
    phone: string;
    tier: string;
    whatsappUrl?: string;
  } | null>(null);

  // Fetch UPI configs and Razorpay gateway availability
  useEffect(() => {
    fetch("/api/system-stats")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.upiId) setUpiId(data.upiId);
          if (data.merchantName) setMerchantName(data.merchantName);
          if (data.razorpayEnabled !== undefined) setRazorpayEnabled(data.razorpayEnabled);
        }
      })
      .catch(() => {});

    fetchRazorpayConfig().then(cfg => {
      setRazorpayEnabled(cfg.enabled && !!cfg.keyId);
    });
  }, []);

  // Pre-fill phone if student already authorized or in localStorage
  useEffect(() => {
    if (isOpen) {
      const savedPhone = localStorage.getItem("pehlakadam_student_phone") || "";
      let savedEmail = "";
      try {
        const u = JSON.parse(localStorage.getItem("pehlakadam_user") || "{}");
        if (u.email) savedEmail = u.email;
        if (u.name && !formData.firstName) {
          const parts = u.name.split(" ");
          setFormData(prev => ({
            ...prev,
            firstName: parts[0] || "",
            lastName: parts.slice(1).join(" ") || "",
          }));
        }
      } catch (e) {}

      setFormData(prev => ({
        ...prev,
        number: prev.number || savedPhone,
        email: prev.email || savedEmail
      }));
      setAppliedCoupon(null);
      setCouponInput("");
      setCouponError("");
      setSubmitError("");
      setPaymentStatusText("");
      setEnrollSuccessData(null);
    }
  }, [isOpen, course]);

  if (!course) return null;

  const basePrice = course.discountPrice || course.originalPrice || 1999;
  const effectivePrice = appliedCoupon ? appliedCoupon.finalPrice : basePrice;
  const effectivePriceStr = "₹" + effectivePrice.toLocaleString("en-IN");
  const originalPriceStr = "₹" + (course.originalPrice || basePrice).toLocaleString("en-IN");

  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectivePrice}&cu=INR&tn=${encodeURIComponent(`Course - ${course.title.slice(0, 25)}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), originalPrice: basePrice })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          finalPrice: data.finalPrice,
          message: data.message
        });
      } else {
        setAppliedCoupon(null);
        setCouponError(data.message || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon code.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError("");
  };

  const validateStudentInputs = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setSubmitError("Please enter your First and Last name.");
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return false;
    }
    const cleanNum = formData.number.replace(/[^0-9]/g, "");
    if (!cleanNum || cleanNum.length < 10) {
      setSubmitError("Please enter a valid 10-digit mobile number.");
      return false;
    }
    return true;
  };

  // 💳 1-Click Automated Razorpay Flow (No manual UTR entry needed)
  const handleRazorpayPayment = async () => {
    setSubmitError("");
    if (!validateStudentInputs()) return;

    const cleanNum = formData.number.replace(/[^0-9]/g, "");
    setRazorpayLoading(true);
    setPaymentStatusText("Connecting to secure payment gateway...");

    try {
      const result = await launchRazorpayCheckout(
        {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          number: cleanNum,
          courseId: course.id,
          courseTitle: course.title,
          plan: course.tier || "advance",
          amount: effectivePrice,
          couponCode: appliedCoupon?.code || ""
        },
        (stage, msg) => {
          if (msg) setPaymentStatusText(msg);
        }
      );

      if (result.success && result.data) {
        const authedNumber = result.data.studentNumber || cleanNum.slice(-10);
        const authedEmail = formData.email.trim().toLowerCase();
        localStorage.setItem("pehlakadam_student_phone", authedNumber);
        localStorage.setItem("pehlakadam_student_email", authedEmail);
        localStorage.setItem("pehlakadam_user", JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: authedNumber,
          email: authedEmail,
          role: "Student"
        }));

        setEnrollSuccessData({
          success: true,
          studentName: `${formData.firstName} ${formData.lastName}`,
          courseTitle: course.title,
          phone: authedNumber,
          tier: result.data.tier || course.tier || "pro",
          whatsappUrl: result.data.whatsappUrl
        });

        if (onEnrollSuccess) {
          onEnrollSuccess(authedNumber, result.data.tier || course.tier || "pro");
        }
      } else if (result.error && !result.dismissed) {
        setSubmitError(result.error);
      }
    } catch (err: any) {
      console.error("[CourseCheckoutModal] Razorpay exception:", err);
      setSubmitError(err.message || "Failed to initiate online payment gateway.");
    } finally {
      setRazorpayLoading(false);
      setPaymentStatusText("");
    }
  };

  // Fallback Manual UTR Submission
  const handleSubmitManualUtr = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateStudentInputs()) return;

    if (!formData.transactionId.trim()) {
      setSubmitError("Please enter the UPI Reference / UTR / Transaction ID.");
      return;
    }

    const cleanNum = formData.number.replace(/[^0-9]/g, "");
    setIsSubmitting(true);

    try {
      const payload = {
        courseId: course.id,
        courseTitle: course.title,
        batch: course.batch || "Regular Self-Paced Batch",
        tier: course.tier || "advance",
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        number: cleanNum,
        amount: effectivePrice,
        transactionId: formData.transactionId.trim(),
        couponCode: appliedCoupon?.code || "",
        fileName: "",
        fileData: ""
      };

      const res = await fetch("/api/courses/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const authedNumber = data.studentNumber || cleanNum.slice(-10);
        const authedEmail = formData.email.trim().toLowerCase();
        localStorage.setItem("pehlakadam_student_phone", authedNumber);
        localStorage.setItem("pehlakadam_student_email", authedEmail);
        localStorage.setItem("pehlakadam_user", JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: authedNumber,
          email: authedEmail,
          role: "Student"
        }));

        setEnrollSuccessData({
          success: true,
          studentName: `${formData.firstName} ${formData.lastName}`,
          courseTitle: course.title,
          phone: authedNumber,
          tier: data.tier || course.tier || "advance",
          whatsappUrl: data.whatsappUrl
        });

        if (onEnrollSuccess) {
          onEnrollSuccess(authedNumber, data.tier || course.tier || "advance");
        }
      } else {
        setSubmitError(data.error || "Failed to complete course enrollment. Please try again.");
      }
    } catch (err) {
      console.error("[CourseCheckoutModal] Error enrolling in course:", err);
      setSubmitError("Network error while validating payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    typeof document !== "undefined" ? createPortal(
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="course-checkout-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-start justify-center bg-black/85 p-3 py-6 sm:p-6 overflow-y-auto backdrop-blur-md font-sans"
          >
            <motion.div
              id="course-checkout-modal-content"
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative my-auto w-full max-w-4xl rounded-3xl bg-zinc-950 border border-zinc-800 text-white p-5 sm:p-7 shadow-2xl overflow-hidden"
            >
              {/* Close Button */}
              <button
                id="close-course-checkout-btn"
                onClick={onClose}
                className="absolute right-4 top-4 z-20 text-zinc-400 hover:text-white bg-zinc-900/90 p-2 rounded-full hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              {enrollSuccessData ? (
                <div id="course-enrollment-success" className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120 }}
                    className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-16 w-16 text-emerald-400" />
                  </motion.div>

                  <div className="space-y-1 max-w-md">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3.5 w-3.5" /> Instant Access Activated
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">Welcome, {enrollSuccessData.studentName}!</h3>
                    <p className="text-xs text-zinc-300">
                      You are now officially enrolled in <span className="text-emerald-400 font-bold">{enrollSuccessData.courseTitle}</span>.
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Mobile number <span className="font-mono text-white font-bold">{enrollSuccessData.phone}</span> is authorized for <span className="text-emerald-400 uppercase font-bold">{enrollSuccessData.tier}</span> Tier access.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full max-w-md">
                    <button
                      onClick={() => {
                        onClose();
                        const targetUrl = course?.id 
                          ? `/dashboard?courseId=${encodeURIComponent(course.id)}&phone=${encodeURIComponent(enrollSuccessData.phone)}`
                          : `/dashboard?phone=${encodeURIComponent(enrollSuccessData.phone)}`;
                        navigate(targetUrl);
                      }}
                      className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all cursor-pointer"
                    >
                      <BookOpen className="h-4 w-4" /> Start Learning in Dashboard
                    </button>

                    {enrollSuccessData.whatsappUrl && (
                      <a
                        href={enrollSuccessData.whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="h-4 w-4" /> Notify Admin (WhatsApp)
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                        course.tier === "basic" ? "bg-blue-950/80 text-blue-300 border-blue-500/40" :
                        course.tier === "advance" ? "bg-purple-950/80 text-purple-300 border-purple-500/40" :
                        "bg-amber-950/80 text-amber-300 border-amber-500/40"
                      }`}>
                        {course.tier} Tier Course
                      </span>
                      {course.batch && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          Batch: {course.batch}
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">{course.title}</h2>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                      {course.description || "Interactive masterclass with chapter worksheets and direct video streaming."}
                    </p>
                  </div>

                  {/* 2-Column Checkout Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Form Details & Actions */}
                    <div className="md:col-span-7 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">First Name</label>
                          <input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            placeholder="First Name"
                            required
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            placeholder="Last Name"
                            required
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="student@example.com"
                            required
                            className="w-full rounded-xl bg-zinc-900 border border-zinc-700/80 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-emerald-400 mb-1">Mobile Number (Access Key)</label>
                          <input
                            type="tel"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="e.g. 9876543210"
                            required
                            className="w-full rounded-xl bg-zinc-900 border border-emerald-500/50 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Coupon Discount Box */}
                      <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                        <label className="block text-[10px] font-bold uppercase text-emerald-400">Have a Promo Coupon?</label>
                        {appliedCoupon ? (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                            <div>
                              <span className="font-extrabold uppercase text-white font-mono">{appliedCoupon.code}</span>
                              <p className="text-[10px] text-emerald-200">{appliedCoupon.message}</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-red-400 hover:text-red-300 text-[11px] font-bold underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponInput}
                              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                              placeholder="ENTER COUPON CODE"
                              className="flex-1 rounded-xl bg-zinc-850 border border-zinc-700 px-3 py-1.5 text-xs uppercase font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={handleApplyCoupon}
                              disabled={isValidatingCoupon || !couponInput.trim()}
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3.5 py-1.5 text-xs transition-colors cursor-pointer"
                            >
                              {isValidatingCoupon ? "Checking..." : "Apply"}
                            </button>
                          </div>
                        )}
                        {couponError && <p className="text-red-400 text-[10px]">{couponError}</p>}
                      </div>

                      {/* Primary 1-Click Razorpay Payment Option */}
                      <div className="space-y-3 pt-1">
                        {submitError && (
                          <p className="text-red-400 text-xs font-semibold p-2.5 rounded-xl bg-red-950/40 border border-red-500/30">
                            {submitError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleRazorpayPayment}
                          disabled={razorpayLoading}
                          className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                        >
                          {razorpayLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{paymentStatusText || "Processing Checkout..."}</span>
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 text-yellow-300" />
                              <span>Pay {effectivePriceStr} Online (Instant 1-Click Access)</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Supports Google Pay, PhonePe, Paytm, UPI, Cards & Netbanking</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Order Summary & Features */}
                    <div className="md:col-span-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-5 flex flex-col items-center text-center space-y-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" /> 100% Secure Checkout
                      </span>

                      <div className="w-full border-b border-zinc-800 pb-3">
                        <span className="text-[11px] text-zinc-400">Payable Course Fee</span>
                        <div className="flex items-baseline justify-center gap-2 mt-1">
                          {appliedCoupon && (
                            <span className="text-sm font-semibold text-zinc-500 line-through">
                              ₹{basePrice.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span className="text-3xl font-black text-emerald-400 tracking-tight">
                            {effectivePriceStr}
                          </span>
                        </div>
                      </div>

                      {/* Course Included Benefits */}
                      <div className="w-full space-y-2 text-left text-xs bg-zinc-850 p-3.5 rounded-xl border border-zinc-800">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                          Enrollment Includes:
                        </span>
                        <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Immediate Student Dashboard Whitelisting</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Full HD Video Modules & Chapter Worksheets</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Verified Certificate of Completion</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-300 text-[11px]">
                          <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                          <span>Direct WhatsApp Mentor Group Support</span>
                        </div>
                      </div>

                      <div className="w-full text-[10px] text-zinc-500 text-center space-y-1">
                        <p>🔒 256-Bit SSL Encrypted Payment Gateway</p>
                        <p className="text-emerald-400/90 font-medium">Automatic instant activation upon payment completion.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    ) : null
  );
}
