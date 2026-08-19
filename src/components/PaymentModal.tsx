import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  X, CreditCard, CheckCircle, MessageSquare, 
  Copy, Check, Shield, Phone, QrCode, Sparkles, 
  Smartphone, Zap, ClipboardPaste, ArrowRight, ExternalLink 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const PLAN_OPTIONS = ["Basic", "Standard", "Premium Pro"] as const;
export type PlanOption = (typeof PLAN_OPTIONS)[number];

export const PROGRAM_OPTIONS = [
  "Primary Kudos",
  "6-8 Grade Student",
  "8-10 Grade Student",
  "11-12 Grade Student",
  "UG/Graduate/PG",
  "Generalist to Specialist"
] as const;

export const normalizeProgram = (prog?: string): string => {
  if (!prog) return "";
  const p = prog.trim().toLowerCase();
  if (p.includes("primary") || p.includes("kudos")) return "Primary Kudos";
  if (p.includes("6-8") || p.includes("6- 8") || p.includes("6th-8th") || p.includes("6 to 8")) return "6-8 Grade Student";
  if (p.includes("8-10") || p.includes("9-10") || p.includes("8th-10th") || p.includes("9th-10th")) return "8-10 Grade Student";
  if (p.includes("11-12") || p.includes("11th-12th")) return "11-12 Grade Student";
  if (p.includes("ug") || p.includes("graduate") || p.includes("pg") || p.includes("placement")) return "UG/Graduate/PG";
  if (p.includes("generalist") || p.includes("specialist")) return "Generalist to Specialist";
  return prog;
};

export const normalizePlan = (plan?: string): PlanOption => {
  if (!plan) return "Basic";
  const p = plan.trim().toLowerCase();
  if (p.includes("premium") || p.includes("pro") || p.includes("specialist")) return "Premium Pro";
  if (p.includes("standard") || p.includes("advance") || p.includes("popular")) return "Standard";
  return "Basic";
};

// Helper: Parse currency string (e.g. "₹8,500", "8500", "₹18,500/student") to numeric and display format
export const parsePriceValue = (val?: string | number, fallback: number = 8500): { price: number; displayPrice: string } => {
  if (val === undefined || val === null || val === "") {
    return { price: fallback, displayPrice: "₹" + fallback.toLocaleString("en-IN") };
  }
  if (typeof val === "number") {
    const num = isNaN(val) || val < 0 ? fallback : val;
    return { price: num, displayPrice: "₹" + num.toLocaleString("en-IN") };
  }
  const cleanDigits = String(val).replace(/[^0-9]/g, "");
  const num = cleanDigits ? parseInt(cleanDigits, 10) : fallback;
  const validNum = isNaN(num) || num < 0 ? fallback : num;
  return { price: validNum, displayPrice: "₹" + validNum.toLocaleString("en-IN") };
};

// 💰 Fallback Base Dynamic Pricing Matrix by Plan Tier
export const PLAN_PRICES: Record<PlanOption, { price: number; displayPrice: string }> = {
  "Basic": { price: 8500, displayPrice: "₹8,500" },
  "Standard": { price: 18500, displayPrice: "₹18,500" },
  "Premium Pro": { price: 35000, displayPrice: "₹35,000" },
};

// Export PROGRAM_PLAN_PRICES for backward compatibility
export const PROGRAM_PLAN_PRICES: Record<string, Record<PlanOption, { price: number; displayPrice: string }>> = new Proxy(
  {},
  {
    get: () => PLAN_PRICES,
  }
);

interface PaymentModalProps {
  planName?: string;
  planPrice?: string;
  defaultProgram?: string;
  defaultPlan?: "Basic" | "Standard" | "Premium Pro" | string;
  buttonText?: string;
  buttonClassName?: string;
}

export default function PaymentModal({
  planName,
  planPrice,
  defaultProgram = "",
  defaultPlan = "Basic",
  buttonText = "Pay & Enroll Program",
  buttonClassName = "",
}: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: normalizeProgram(defaultProgram) || "6-8 Grade Student",
    plan: normalizePlan(defaultPlan || planName) || "Basic",
    transactionId: "",
  });

  // Dynamic synchronized prices for all 3 tiers (Basic, Standard, Premium Pro)
  const [syncedPlanPrices, setSyncedPlanPrices] = useState<Record<PlanOption, { price: number; displayPrice: string }>>(() => {
    const initial = { ...PLAN_PRICES };
    if (planPrice) {
      const parsed = parsePriceValue(planPrice);
      const targetPlan = normalizePlan(defaultPlan || planName);
      initial[targetPlan] = parsed;
    }
    return initial;
  });

  // Fetch updated live pricing configurations from server and admin settings
  const fetchLivePrices = () => {
    fetch("/api/programs-config")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load configs");
      })
      .then((configs: any[]) => {
        if (Array.isArray(configs) && configs.length > 0) {
          const basicCfg = configs.find((c) => c.programKey === "card_basic");
          const standardCfg = configs.find((c) => c.programKey === "card_standard");
          const premiumCfg = configs.find((c) => c.programKey === "card_premium");

          setSyncedPlanPrices((prev) => {
            const updated = { ...prev };
            if (basicCfg?.currentPrice) {
              updated["Basic"] = parsePriceValue(basicCfg.currentPrice, 8500);
            }
            if (standardCfg?.currentPrice) {
              updated["Standard"] = parsePriceValue(standardCfg.currentPrice, 18500);
            }
            if (premiumCfg?.currentPrice) {
              updated["Premium Pro"] = parsePriceValue(premiumCfg.currentPrice, 35000);
            }
            // If explicit planPrice passed as prop for this instance, prioritize it
            if (planPrice) {
              const target = normalizePlan(defaultPlan || planName);
              updated[target] = parsePriceValue(planPrice, updated[target].price);
            }
            return updated;
          });
        }
      })
      .catch((err) => {
        console.warn("[PaymentModal] Note: Using default or passed prices:", err);
      });
  };

  useEffect(() => {
    fetchLivePrices();
  }, [planPrice, defaultPlan, planName]);

  // Keep state in sync if defaultProgram or defaultPlan props change, and prefill student profile
  useEffect(() => {
    const targetPlan = normalizePlan(defaultPlan || planName);
    const targetProg = defaultProgram ? normalizeProgram(defaultProgram) : "6-8 Grade Student";
    
    // Auto-fill from localStorage if available
    let autoPhone = "";
    let autoEmail = "";
    let autoFirst = "";
    let autoLast = "";

    try {
      autoPhone = localStorage.getItem("pehlakadam_student_phone") || "";
      autoEmail = localStorage.getItem("pehlakadam_student_email") || "";
      const rawUser = localStorage.getItem("pehlakadam_user");
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u.email && !autoEmail) autoEmail = u.email;
        if (u.name) {
          const parts = u.name.trim().split(" ");
          autoFirst = parts[0] || "";
          autoLast = parts.slice(1).join(" ") || "";
        }
      }
    } catch (e) {}

    setFormData((prev) => ({
      ...prev,
      firstName: prev.firstName || autoFirst,
      lastName: prev.lastName || autoLast,
      email: prev.email || autoEmail,
      number: prev.number || autoPhone,
      role: targetProg || prev.role || "6-8 Grade Student",
      plan: targetPlan || prev.plan || "Basic"
    }));

    if (planPrice) {
      const parsed = parsePriceValue(planPrice);
      setSyncedPlanPrices((prev) => ({
        ...prev,
        [targetPlan]: parsed
      }));
    }
  }, [defaultProgram, defaultPlan, planName, planPrice, isOpen]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrPastedNotice, setUtrPastedNotice] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});

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

  const [upiId, setUpiId] = useState("nrjstudywrk@okicici");
  const [merchantName, setMerchantName] = useState("Niranjan Singh (Pehlakadam)");

  // Coupon Code State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
    message: string;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  useEffect(() => {
    fetch("/api/system-stats")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch system stats");
      })
      .then((data) => {
        if (data) {
          if (data.upiId) setUpiId(data.upiId);
          if (data.merchantName) setMerchantName(data.merchantName);
        }
      })
      .catch((err) => console.error("[PaymentModal] Error fetching payment config:", err));
  }, []);

  // 🎯 Compute dynamically synchronized pricing details based on selected Plan Tier
  const selectedProgram = normalizeProgram(formData.role) || "6-8 Grade Student";
  const selectedPlan = normalizePlan(formData.plan);

  const currentPlanPricing = syncedPlanPrices[selectedPlan] || PLAN_PRICES[selectedPlan] || { price: 8500, displayPrice: "₹8,500" };
  const basePriceStr = currentPlanPricing.displayPrice;
  const numericAmount = currentPlanPricing.price;

  // Calculate discounted price if coupon applied
  const effectiveAmount = appliedCoupon ? appliedCoupon.finalPrice : numericAmount;
  const effectivePriceStr = "₹" + effectiveAmount.toLocaleString("en-IN");

  const handleApplyCoupon = async (e: FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), originalPrice: numericAmount })
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

  // 🚀 Generate standard dynamic UPI payload string and real-time QR code
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(`Pehlakadam Enrollment - ${selectedProgram} [${selectedPlan}]`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  // Specific UPI App Intent URLs for 100% Free Mobile Automation
  const gpayUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(`Pehlakadam - ${selectedPlan}`)}`;
  const phonepeUri = `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(`Pehlakadam - ${selectedPlan}`)}`;
  const paytmUri = `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(`Pehlakadam - ${selectedPlan}`)}`;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-extract 12-digit UTR if user pastes an entire bank SMS into the transaction ID field
    if (name === "transactionId") {
      const match = value.match(/\b\d{12}\b/);
      const cleanVal = match ? match[0] : value;
      setFormData((prev) => ({ ...prev, transactionId: cleanVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Smart Clipboard Paste & Auto-Extract UTR from SMS or Transaction receipt
  const handleSmartPasteUtr = async () => {
    try {
      if (!navigator.clipboard?.readText) {
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text) return;
      
      // Look for 12-digit UPI reference number, or transaction alphanumeric string
      const match12 = text.match(/\b\d{12}\b/);
      const matchAlphaNum = text.match(/(?:UTR|Ref|Txn|Reference|UPI Ref|ID)[:\s#-]*([A-Za-z0-9]{8,24})/i);
      
      const extracted = match12 ? match12[0] : (matchAlphaNum ? matchAlphaNum[1] : text.trim().slice(0, 30));
      
      if (extracted) {
        setFormData((prev) => ({ ...prev, transactionId: extracted }));
        setUtrPastedNotice(true);
        if (errors.transactionId) {
          setErrors((prev) => ({ ...prev, transactionId: undefined }));
        }
        setTimeout(() => setUtrPastedNotice(false), 2500);
      }
    } catch (e) {
      console.warn("Could not read clipboard:", e);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(effectiveAmount));
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.firstName.trim()) { newErrors.firstName = "First name is required."; triggerShake("firstName"); }
    if (!formData.lastName.trim()) { newErrors.lastName = "Last name is required."; triggerShake("lastName"); }
    if (!formData.email.trim()) { newErrors.email = "Email is required."; triggerShake("email"); }
    else if (!formData.email.includes("@")) { newErrors.email = "Please enter a valid email."; triggerShake("email"); }
    if (!formData.number.trim()) { newErrors.number = "Contact number is required."; triggerShake("number"); }
    if (!formData.role) { newErrors.role = "Please select a program."; triggerShake("role"); }
    if (!formData.plan) { newErrors.plan = "Please select a plan."; triggerShake("plan"); }
    if (!formData.transactionId.trim()) { newErrors.transactionId = "Transaction ID / UTR is required."; triggerShake("transactionId"); }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("Please correct the highlighted fields above.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        number: formData.number.trim(),
        role: selectedProgram,
        plan: selectedPlan,
        amount: effectiveAmount,
        transactionId: formData.transactionId.trim(),
        couponCode: appliedCoupon?.code || "",
        fileData: "",
        fileName: "",
      };

      // Save student credentials to local storage for automatic re-entry
      try {
        localStorage.setItem("pehlakadam_student_phone", formData.number.trim());
        localStorage.setItem("pehlakadam_student_email", formData.email.trim().toLowerCase());
        localStorage.setItem("pehlakadam_user", JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim().toLowerCase(),
          number: formData.number.trim(),
          role: selectedProgram
        }));
      } catch (e) {}

      const response = await fetch("/api/payment-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.whatsappUrl) {
          setWhatsappUrl(data.whatsappUrl);
        }

        setSubmitSuccess(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          number: "",
          role: defaultProgram ? normalizeProgram(defaultProgram) : "6-8 Grade Student",
          plan: defaultPlan ? normalizePlan(defaultPlan) : "Basic",
          transactionId: "",
        });

        // Keep modal open to allow student to click WhatsApp trigger
        setTimeout(() => {
          setIsOpen(false);
          setSubmitSuccess(false);
          setWhatsappUrl("");
        }, 45000);
      } else {
        const errData = await response.json();
        setSubmitError(errData.error || "Failed to upload payment proof. Please verify the details.");
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      setSubmitError("Failed to connect to server. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine button trigger styles
  const defaultButtonClass = planName 
    ? "w-full inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-5 py-3 font-sans font-semibold text-white shadow-md transition-all duration-300 hover:bg-emerald-700 active:scale-98 cursor-pointer text-sm shrink-0"
    : "payment-btn group relative inline-flex items-center justify-center whitespace-nowrap overflow-hidden rounded-xl bg-emerald-600 px-5 py-2.5 font-sans font-semibold text-white shadow-md transition-all duration-300 hover:bg-emerald-700 active:scale-98 cursor-pointer text-sm shrink-0";

  return (
    <>
      <button
        id={`open-payment-modal-${planName ? planName.replace(/\s+/g, "-").toLowerCase() : "general"}`}
        onClick={() => {
          fetchLivePrices();
          setIsOpen(true);
        }}
        className={buttonClassName || defaultButtonClass}
      >
        <span className="flex items-center gap-2 whitespace-nowrap">
          <CreditCard className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12 shrink-0" />
          <span>{buttonText}</span>
        </span>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="payment-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/85 p-3 sm:p-4 py-6 sm:py-8 overflow-y-auto backdrop-blur-md"
            >
              <motion.div
                id="payment-modal-content"
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: "spring", duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="relative my-2 w-full max-w-4xl rounded-3xl bg-zinc-900 border border-zinc-800 text-white p-5 sm:p-7 shadow-2xl overflow-hidden font-sans"
              >
                <button
                  id="close-payment-modal-btn"
                  onClick={() => {
                    setIsOpen(false);
                    setSubmitSuccess(false);
                    setWhatsappUrl("");
                    setSubmitError("");
                  }}
                  className="absolute right-5 top-5 z-20 text-zinc-400 hover:text-white bg-zinc-800/80 p-1.5 rounded-full hover:bg-zinc-800 transition-colors duration-200 cursor-pointer"
                  aria-label="Close payment modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {submitSuccess ? (
                  <div id="payment-submit-success" className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    >
                      <CheckCircle className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-500 mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2 font-sans text-white">Payment Verification Submitted!</h3>
                    <p className="text-zinc-300 max-w-sm mb-2 text-sm leading-relaxed">
                      Your enrollment for <span className="text-emerald-400 font-bold">{selectedProgram} ({selectedPlan} Plan)</span> for <span className="text-white font-bold">{effectivePriceStr}</span> has been logged and whitelisted.
                    </p>
                    <p className="text-zinc-400 max-w-sm mb-6 text-xs leading-relaxed">
                      Instant student access is activated! Click below to send direct WhatsApp confirmation to your advisor.
                    </p>

                    {whatsappUrl && (
                      <motion.a
                        id="payment-whatsapp-cta"
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 px-6 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm mb-4"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Payment Confirmation on WhatsApp
                      </motion.a>
                    )}

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        window.location.href = "/student/dashboard";
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
                    >
                      Go to Student Dashboard →
                    </button>
                  </div>
                ) : (
                  <div id="payment-submit-fields">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                          <CreditCard className="h-6 w-6 text-emerald-500" />
                          Enrollment & Instant Payment
                        </h2>
                        <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                          <Zap className="h-3 w-3" /> Live Updated Fee: {effectivePriceStr}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1">
                        Select your Academic Program and Plan Tier below. The payable amount and UPI QR dynamically update in real time with the latest updated prices.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Form Details & Screenshot Upload */}
                      <form onSubmit={handleSubmit} className="md:col-span-7 space-y-3.5">
                        
                        {/* 1. First & Last Name */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div animate={shakeFields.firstName ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              First Name
                            </label>
                            <input
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="First Name"
                              required
                              className={`w-full rounded-xl bg-zinc-800 border px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.firstName
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            />
                            {errors.firstName && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.firstName}</p>
                            )}
                          </motion.div>
                          <motion.div animate={shakeFields.lastName ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              Last Name
                            </label>
                            <input
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Last Name"
                              required
                              className={`w-full rounded-xl bg-zinc-800 border px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.lastName
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            />
                            {errors.lastName && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.lastName}</p>
                            )}
                          </motion.div>
                        </div>

                        {/* 2. Email & Contact Number */}
                        <div className="grid grid-cols-2 gap-3">
                          <motion.div animate={shakeFields.email ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              Email Address
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="student@example.com"
                              required
                              className={`w-full rounded-xl bg-zinc-800 border px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.email
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            />
                            {errors.email && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.email}</p>
                            )}
                          </motion.div>
                          <motion.div animate={shakeFields.number ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              WhatsApp / Mobile No.
                            </label>
                            <input
                              type="tel"
                              name="number"
                              value={formData.number}
                              onChange={handleChange}
                              placeholder="10-digit number"
                              required
                              className={`w-full rounded-xl bg-zinc-800 border px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.number
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            />
                            {errors.number && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.number}</p>
                            )}
                          </motion.div>
                        </div>

                        {/* 3. Program & Plan Tier Selection Dropdowns (Live Synchronized) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Program Selection */}
                          <motion.div animate={shakeFields.role ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              Academic Program
                            </label>
                            <select
                              id="payment-program-dropdown"
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-xl bg-zinc-800 border px-3 py-2 text-xs sm:text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 ${
                                errors.role
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            >
                              <option value="Primary Kudos">Primary Kudos</option>
                              <option value="6-8 Grade Student">6-8 Grade Student</option>
                              <option value="8-10 Grade Student">8-10 Grade Student</option>
                              <option value="11-12 Grade Student">11-12 Grade Student</option>
                              <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                              <option value="Generalist to Specialist">Generalist to Specialist</option>
                            </select>
                            {errors.role && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.role}</p>
                            )}
                          </motion.div>

                          {/* Plan Dropdown with Live Synchronized Price labels */}
                          <motion.div animate={shakeFields.plan ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 text-left flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-emerald-400" />
                                Plan Tier
                              </span>
                              <span className="text-[9px] text-emerald-400 font-medium">Live Synced</span>
                            </label>
                            <select
                              id="payment-plan-dropdown"
                              name="plan"
                              value={formData.plan}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-xl bg-zinc-800 border border-emerald-500/50 px-3 py-2 text-xs sm:text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-bold ${
                                errors.plan
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : ""
                              }`}
                            >
                              <option value="Basic">
                                Basic Plan ({syncedPlanPrices["Basic"]?.displayPrice || "₹8,500"})
                              </option>
                              <option value="Standard">
                                Standard Plan ({syncedPlanPrices["Standard"]?.displayPrice || "₹18,500"})
                              </option>
                              <option value="Premium Pro">
                                Premium Pro ({syncedPlanPrices["Premium Pro"]?.displayPrice || "₹35,000"})
                              </option>
                            </select>
                            {errors.plan && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.plan}</p>
                            )}
                          </motion.div>
                        </div>

                        {/* 4. UPI Transaction ID with Smart Paste & Auto-Detection */}
                        <motion.div animate={shakeFields.transactionId ? "shake" : "default"} variants={shakeVariants}>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 text-left">
                              UPI Transaction ID / 12-Digit UTR
                            </label>
                            <button
                              type="button"
                              onClick={handleSmartPasteUtr}
                              className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-colors"
                              title="Paste from clipboard and auto-detect 12-digit UTR"
                            >
                              <ClipboardPaste className="h-3 w-3" />
                              {utrPastedNotice ? "Pasted!" : "Paste & Detect UTR"}
                            </button>
                          </div>
                          <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="e.g. 412389128392 or TXN123456789"
                            required
                            className={`w-full rounded-xl bg-zinc-800 border px-3.5 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 font-mono ${
                              errors.transactionId
                                ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                            }`}
                          />
                          {errors.transactionId && (
                            <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.transactionId}</p>
                          )}
                        </motion.div>

                        {/* 5. 🎟️ Coupon Code Discount Section */}
                        <div className="bg-zinc-850/80 p-3 rounded-2xl border border-zinc-700/80 space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 text-left">
                            Have a Promo / Coupon Code?
                          </label>

                          {appliedCoupon ? (
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
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
                                placeholder="ENTER CODE (e.g. PEHLA50)"
                                className="flex-1 rounded-xl bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs uppercase font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
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

                          {couponError && (
                            <p className="text-red-400 text-[10px] font-medium">{couponError}</p>
                          )}
                        </div>

                        {submitError && (
                          <p id="payment-error-msg" className="text-red-400 text-xs font-medium">
                            {submitError}
                          </p>
                        )}

                        <button
                          id="submit-payment-modal-btn"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 transition-all duration-200 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                          {isSubmitting ? "Activating Enrollment..." : `Confirm & Submit Enrollment (${effectivePriceStr})`}
                        </button>
                      </form>

                      {/* Right Column: Secure UPI Details Container with 1-Click App Launchers */}
                      <div className="md:col-span-5 bg-zinc-950/60 rounded-2xl border border-zinc-800/80 p-4 sm:p-5 flex flex-col items-center text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full mb-2 uppercase tracking-widest">
                          <Shield className="h-3.5 w-3.5 text-emerald-400" /> Free UPI Direct Gateway
                        </span>

                        <p className="text-[11px] text-zinc-400 font-medium">Synchronized Payable Amount</p>
                        {appliedCoupon ? (
                          <div className="mt-0.5 mb-0.5">
                            <span className="text-xs font-semibold text-zinc-500 line-through mr-2">{basePriceStr}</span>
                            <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-sans tracking-tight">{effectivePriceStr}</span>
                          </div>
                        ) : (
                          <h3 className="text-2xl sm:text-3xl font-black text-white font-sans mt-0.5 mb-0.5 tracking-tight">{effectivePriceStr}</h3>
                        )}
                        
                        <div className="flex items-center gap-1.5 flex-wrap justify-center mb-2.5">
                          <span className="text-[10px] font-bold text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-md">
                            {selectedProgram}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                            {selectedPlan} Plan
                          </span>
                        </div>

                        {/* Interactive QR Code scan area */}
                        <div className="relative bg-white p-2.5 rounded-2xl shadow-lg border border-zinc-800 mb-2.5 inline-block group overflow-hidden">
                          <img
                            key={`${qrCodeUrl}-${effectiveAmount}`}
                            src={qrCodeUrl}
                            alt="Dynamic UPI QR Code"
                            className="h-[135px] w-[135px] block transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                            <QrCode className="h-8 w-8 text-emerald-600 animate-pulse bg-white/90 p-1.5 rounded-full shadow" />
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed mb-3">
                          Scan using GPay, PhonePe, Paytm, BHIM, CRED or any mobile banking app.
                        </p>

                        {/* ⚡ 1-Click Automated UPI App Launchers (100% Free Mobile Protocol) */}
                        <div className="w-full space-y-2 mb-3">
                          <a
                            id="upi-deeplink-action-main"
                            href={upiUri}
                            className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl shadow-md transition-all duration-200 active:scale-95 text-center cursor-pointer"
                          >
                            <Smartphone className="h-4 w-4" />
                            Pay {effectivePriceStr} in 1-Click (Any UPI)
                          </a>

                          <div className="grid grid-cols-3 gap-1.5">
                            <a
                              href={gpayUri}
                              className="inline-flex items-center justify-center py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-bold text-zinc-200 hover:text-white transition-colors"
                              title="Open Google Pay with pre-filled amount"
                            >
                              GPay
                            </a>
                            <a
                              href={phonepeUri}
                              className="inline-flex items-center justify-center py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-bold text-purple-300 hover:text-white transition-colors"
                              title="Open PhonePe with pre-filled amount"
                            >
                              PhonePe
                            </a>
                            <a
                              href={paytmUri}
                              className="inline-flex items-center justify-center py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-[10px] font-bold text-sky-300 hover:text-white transition-colors"
                              title="Open Paytm with pre-filled amount"
                            >
                              Paytm
                            </a>
                          </div>
                        </div>

                        {/* Text copyable details */}
                        <div className="w-full space-y-1.5 border-t border-zinc-800/80 pt-2.5 text-left text-xs">
                          <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800/50">
                            <div>
                              <span className="block text-[9px] font-semibold text-zinc-500 uppercase">UPI ID</span>
                              <code className="text-xs font-mono text-emerald-400 select-all">{upiId}</code>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                              title="Copy UPI ID"
                            >
                              {copiedUpi ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-zinc-900/80 px-2.5 py-1 rounded-lg border border-zinc-800/50">
                            <div>
                              <span className="block text-[9px] font-semibold text-zinc-500 uppercase">Exact Amount</span>
                              <span className="text-xs font-mono text-white font-bold">{effectivePriceStr}</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleCopyAmount}
                              className="text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                              title="Copy Exact Amount"
                            >
                              {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-baseline justify-between text-[10px] pt-1 text-zinc-400">
                            <span>Verified Payee:</span>
                            <span className="text-zinc-200 font-medium truncate max-w-[160px]">{merchantName}</span>
                          </div>
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
      )}
    </>
  );
}

