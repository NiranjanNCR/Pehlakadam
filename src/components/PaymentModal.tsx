import { useState, ChangeEvent, FormEvent, DragEvent, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, CheckCircle, MessageSquare, Upload, FileText, ImageIcon, Copy, Check, Shield, Phone, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PaymentModalProps {
  planName?: string;
  planPrice?: string;
  defaultProgram?: string;
  buttonText?: string;
  buttonClassName?: string;
}

const PROGRAM_PRICES: Record<string, { plan: string; price: number; displayPrice: string }> = {
  "Primary Kudos": { plan: "Primary Kudos Program", price: 6500, displayPrice: "₹6,500" },
  "6-8 Grade Student": { plan: "Basic Career Success", price: 8500, displayPrice: "₹8,500" },
  "8-10 Grade Student": { plan: "Basic Career Success", price: 8500, displayPrice: "₹8,500" },
  "11-12 Grade Student": { plan: "Advanced Career Success", price: 18500, displayPrice: "₹18,500" },
  "UG/Graduate/PG": { plan: "Advanced Career Success", price: 18500, displayPrice: "₹18,500" },
  "Generalist to Specialist": { plan: "Full Career Coaching", price: 35000, displayPrice: "₹35,000" },
};

export default function PaymentModal({
  planName,
  planPrice,
  defaultProgram = "",
  buttonText = "Pay & Enroll Program",
  buttonClassName = "",
}: PaymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: defaultProgram || "",
    transactionId: "",
  });

  // Keep state in sync if defaultProgram prop changes
  useEffect(() => {
    if (defaultProgram) {
      setFormData((prev) => ({ ...prev, role: defaultProgram }));
    }
  }, [defaultProgram]);

  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [copied, setCopied] = useState(false);
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

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Compute dynamic pricing details
  const currentPlanName = planName || (formData.role ? (PROGRAM_PRICES[formData.role]?.plan || "Career Plan") : "Career Plan");
  const currentPriceStr = planPrice || (formData.role ? (PROGRAM_PRICES[formData.role]?.displayPrice || "₹18,500") : "₹18,500");
  const numericAmount = parseInt(currentPriceStr.replace(/[^0-9]/g, "")) || 18500;

  // Calculate discounted price
  const effectiveAmount = appliedCoupon ? appliedCoupon.finalPrice : numericAmount;
  const effectivePriceStr = "₹" + effectiveAmount.toLocaleString("en-IN");

  const handleApplyCoupon = async (e: React.FormEvent) => {
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

  // Generate standard UPI payload string
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${effectiveAmount}&cu=INR&tn=${encodeURIComponent(`Pehlakadam Enrollment ${currentPlanName}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(selectedFile.type)) {
      setSubmitError("Invalid file format. Please upload a PDF, JPEG, or PNG screenshot.");
      return;
    }
    
    // File size limit: 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setSubmitError("File is too large. Max allowed size is 10MB.");
      return;
    }

    setSubmitError("");
    setFile(selectedFile);
    setFileName(selectedFile.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setFileData(reader.result);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    const newErrors: Partial<Record<string, string>> = {};
    if (!formData.firstName) { newErrors.firstName = "First name is required."; triggerShake("firstName"); }
    if (!formData.lastName) { newErrors.lastName = "Last name is required."; triggerShake("lastName"); }
    if (!formData.email) { newErrors.email = "Email is required."; triggerShake("email"); }
    else if (!formData.email.includes("@")) { newErrors.email = "Please enter a valid email."; triggerShake("email"); }
    if (!formData.number) { newErrors.number = "Contact number is required."; triggerShake("number"); }
    if (!formData.role) { newErrors.role = "Please select a program."; triggerShake("role"); }
    if (!formData.transactionId) { newErrors.transactionId = "Transaction ID / UTR is required."; triggerShake("transactionId"); }
    if (!fileData) { newErrors.screenshot = "Please upload a payment verification screenshot."; triggerShake("screenshot"); }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitError("Please correct the highlighted fields above.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        ...formData,
        fileData,
        fileName,
      };

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
          role: defaultProgram || "",
          transactionId: "",
        });
        setFile(null);
        setFileData("");
        setFileName("");

        // Keep modal open for 30s to allow them to click WhatsApp trigger
        setTimeout(() => {
          setIsOpen(false);
          setSubmitSuccess(false);
          setWhatsappUrl("");
        }, 30000);
      } else {
        const errData = await response.json();
        setSubmitError(errData.error || "Failed to upload payment proof.");
      }
    } catch (error) {
      console.error("Error submitting payment proof:", error);
      setSubmitError("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine button trigger styles
  const defaultButtonClass = planName 
    ? "w-full inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3.5 font-sans font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer text-sm"
    : "payment-btn group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-8 py-3.5 font-sans font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer";

  return (
    <>
      <button
        id={`open-payment-modal-${planName ? planName.replace(/\s+/g, "-").toLowerCase() : "general"}`}
        onClick={() => setIsOpen(true)}
        className={buttonClassName || defaultButtonClass}
      >
        <span className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          {buttonText}
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
              className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/85 p-4 py-8 overflow-y-auto backdrop-blur-md"
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
                  className="absolute right-5 top-5 z-20 text-zinc-400 hover:text-white bg-zinc-800/80 p-1.5 rounded-full hover:bg-zinc-800 transition-colors duration-200"
                  aria-label="Close payment modal"
                >
                  <X className="h-5 w-5" />
                </button>

                {submitSuccess ? (
                  <div id="payment-submit-success" className="flex flex-col items-center justify-center py-16 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    >
                      <CheckCircle className="h-20 w-20 text-emerald-500 mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2 font-sans">Payment Verification Submitted!</h3>
                    <p className="text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
                      Your transaction details and receipt have been securely logged. Click the button below to notify your career advisor on WhatsApp and fast-track your enrollment approval.
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
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3.5 px-6 transition-all duration-300 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer text-sm animate-pulse"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Send Payment Confirmation to WhatsApp
                      </motion.a>
                    )}
                  </div>
                ) : (
                  <div id="payment-submit-fields">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-sans">
                        <CreditCard className="h-6 w-6 text-emerald-500" />
                        Verify Your UPI Payment & Enroll
                      </h2>
                      <p className="text-zinc-400 text-sm mt-1">
                        Fill your details, pay the amount via scanning the secure QR code or tapping pay, and upload your receipt screenshot.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Column: Form Details & Screenshot Upload */}
                      <form onSubmit={handleSubmit} className="md:col-span-7 space-y-4">
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
                              placeholder="John"
                                                     className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
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
                              placeholder="Doe"
                              required
                              className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
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
                              placeholder="john@example.com"
                              required
                              className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
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
                              Contact Number
                            </label>
                            <input
                              type="text"
                              name="number"
                              value={formData.number}
                              onChange={handleChange}
                              placeholder="+91 98765 43210"
                              required
                              className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
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

                        <div className="grid grid-cols-2 gap-3">
                          <motion.div animate={shakeFields.role ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              Program Selection
                            </label>
                            <select
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              required
                              className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
                                errors.role
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            >
                              <option value="" disabled className="bg-zinc-800 text-zinc-400">
                                Select a program
                              </option>
                              <option value="Primary Kudos" className="bg-zinc-800 text-white">Primary Kudos</option>
                              <option value="6-8 Grade Student" className="bg-zinc-800 text-white">6-8 Grade Student</option>
                              <option value="8-10 Grade Student" className="bg-zinc-800 text-white">8-10 Grade Student</option>
                              <option value="11-12 Grade Student" className="bg-zinc-800 text-white">11-12 Grade Student</option>
                              <option value="UG/Graduate/PG" className="bg-zinc-800 text-white">UG/Graduate/PG</option>
                              <option value="Generalist to Specialist" className="bg-zinc-800 text-white">Generalist to Specialist</option>
                            </select>
                            {errors.role && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.role}</p>
                            )}
                          </motion.div>
                          <motion.div animate={shakeFields.transactionId ? "shake" : "default"} variants={shakeVariants}>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1 text-left">
                              UPI Transaction ID / Ref No
                            </label>
                            <input
                              type="text"
                              name="transactionId"
                              value={formData.transactionId}
                              onChange={handleChange}
                              placeholder="TXN1234567890"
                              required
                              className={`w-full rounded-xl bg-zinc-850 border px-4 py-2 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 bg-zinc-800 ${
                                errors.transactionId
                                  ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                                  : "border-zinc-700/60 focus:ring-emerald-500/30 focus:border-emerald-500"
                              }`}
                            />
                            {errors.transactionId && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.transactionId}</p>
                            )}
                          </motion.div>
                        </div>

                        {/* 🎟️ COUPON CODE DISCOUNT SECTION */}
                        <div className="bg-zinc-850/80 p-3.5 rounded-2xl border border-zinc-700/80 space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 text-left">
                            Have a Coupon Code?
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
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 px-2 py-1 rounded-lg border border-red-500/30"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="Enter Code e.g. PEHLA50"
                                className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider uppercase"
                              />
                              <button
                                type="button"
                                onClick={handleApplyCoupon}
                                disabled={isValidatingCoupon || !couponInput.trim()}
                                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                              >
                                {isValidatingCoupon ? "Checking..." : "Apply"}
                              </button>
                            </div>
                          )}
                          {couponError && (
                            <p className="text-[10px] text-red-400 font-semibold text-left">{couponError}</p>
                          )}
                        </div>

                        {/* Screenshot drag and drop upload zone */}
                        <motion.div animate={shakeFields.screenshot ? "shake" : "default"} variants={shakeVariants}>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5 text-left">
                            Upload Payment Receipt Screenshot
                          </label>
                          <div
                            id="payment-drag-drop-zone"
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-5 px-4 text-center cursor-pointer transition-all duration-200 ${
                              isDragOver
                                ? "border-emerald-500 bg-emerald-500/10 text-white"
                                : errors.screenshot
                                ? "border-red-500/80 bg-red-50/5 text-red-500 font-semibold"
                                : fileName
                                ? "border-emerald-500/50 bg-zinc-800/40 text-emerald-400"
                                : "border-zinc-700/80 bg-zinc-800/60 hover:border-zinc-600 text-zinc-400 hover:bg-zinc-800"
                            }`}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept=".pdf, .jpeg, .jpg, .png"
                              className="hidden"
                            />
                            
                            {fileName ? (
                              <div className="flex flex-col items-center">
                                {file?.type === "application/pdf" ? (
                                  <FileText className="h-8 w-8 text-emerald-500 mb-1" />
                                ) : (
                                  <ImageIcon className="h-8 w-8 text-emerald-500 mb-1" />
                                )}
                                <p className="text-xs font-semibold text-white truncate max-w-xs">{fileName}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Click or drag another file to replace</p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <Upload className="h-7 w-7 text-zinc-500 mb-1" />
                                <p className="text-xs font-semibold text-zinc-300">Click or Drag & Drop screenshot</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Supports PDF, JPEG, PNG formats (Max 10MB)</p>
                              </div>
                            )}
                          </div>
                          {errors.screenshot && (
                            <p className="mt-1 text-[10px] text-red-500 font-semibold text-left">{errors.screenshot}</p>
                          )}
                        </motion.div>

                        {submitError && (
                          <p id="payment-error-msg" className="text-red-400 text-xs font-medium">
                            {submitError}
                          </p>
                        )}

                        <button
                          id="submit-payment-modal-btn"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 transition-all duration-200 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 flex items-center justify-center gap-2 text-sm cursor-pointer"
                        >
                          {isSubmitting ? "Uploading details..." : `Submit & Request Enrollment`}
                        </button>
                      </form>

                      {/* Right Column: Secure UPI details container */}
                      <div className="md:col-span-5 bg-zinc-950/50 rounded-2xl border border-zinc-800/80 p-5 flex flex-col items-center text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded-full mb-3 uppercase tracking-widest">
                          <Shield className="h-3.5 w-3.5 text-emerald-400" /> Secure UPI Gateway
                        </span>

                        <p className="text-xs text-zinc-400">Total Enrollment Fee</p>
                        {appliedCoupon ? (
                          <div className="mt-0.5 mb-1">
                            <span className="text-sm font-semibold text-zinc-500 line-through mr-2">{currentPriceStr}</span>
                            <span className="text-3xl font-black text-emerald-400 font-sans tracking-tight">{effectivePriceStr}</span>
                          </div>
                        ) : (
                          <h3 className="text-3xl font-black text-white font-sans mt-0.5 mb-1 tracking-tight">{currentPriceStr}</h3>
                        )}
                        <p className="text-[10px] text-emerald-500 font-medium mb-4">Payee: {currentPlanName}</p>

                        {/* Interactive QR Code scan area */}
                        <div className="relative bg-white p-3 rounded-2xl shadow-lg border border-zinc-800 mb-4 inline-block group overflow-hidden">
                          <img
                            src={qrCodeUrl}
                            alt="Secure UPI QR Code"
                            className="h-[140px] w-[140px] block transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-emerald-950/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                            <QrCode className="h-8 w-8 text-emerald-600 animate-pulse bg-white/90 p-1.5 rounded-full shadow" />
                          </div>
                        </div>

                        <p className="text-[10px] text-zinc-400 max-w-xs leading-relaxed mb-4">
                          Scan using any UPI App (GPay, PhonePe, Paytm, BHIM, Cred) on your phone to transfer.
                        </p>

                        {/* UPI Deep-link for mobile visitors */}
                        <a
                          id="upi-deeplink-action"
                          href={upiUri}
                          className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 py-2.5 px-4 rounded-xl shadow-sm transition-all duration-200 active:scale-95 mb-4 text-center"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-400" />
                          Pay with Mobile UPI App
                        </a>

                        {/* Text copyable details */}
                        <div className="w-full space-y-2 border-t border-zinc-800/80 pt-4 text-left">
                          <div>
                            <span className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">UPI ID Address</span>
                            <div className="flex items-center justify-between bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800/50 mt-1">
                              <code className="text-xs font-mono text-emerald-400 select-all">{upiId}</code>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="text-zinc-400 hover:text-white transition-colors p-1"
                                title="Copy UPI ID"
                              >
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-baseline justify-between text-xs pt-1">
                            <span className="text-zinc-500">Merchant Name:</span>
                            <span className="text-zinc-300 font-medium truncate max-w-[150px]">{merchantName}</span>
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
