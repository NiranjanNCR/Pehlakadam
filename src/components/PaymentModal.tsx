import { useState, ChangeEvent, FormEvent, DragEvent, useRef } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, CheckCircle, MessageSquare, Upload, FileText, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PaymentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: "",
    transactionId: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.number || !formData.role || !formData.transactionId) {
      setSubmitError("Please fill out all required text fields.");
      return;
    }

    if (!fileData) {
      setSubmitError("Please upload a payment screenshot or document.");
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
          role: "",
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

  return (
    <>
      <button
        id="open-payment-modal-btn"
        onClick={() => setIsOpen(true)}
        className="payment-btn group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-8 py-3.5 font-sans font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          Pay & Enroll Program
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
              className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 p-4 py-10 overflow-y-auto backdrop-blur-md"
            >
              <motion.div
                id="payment-modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="relative my-4 md:my-8 w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 text-white p-6 sm:p-8 shadow-2xl"
              >
                <button
                  id="close-payment-modal-btn"
                  onClick={() => {
                    setIsOpen(false);
                    setSubmitSuccess(false);
                    setWhatsappUrl("");
                    setSubmitError("");
                  }}
                  className="absolute right-5 top-5 text-zinc-400 hover:text-white transition-colors duration-200"
                  aria-label="Close payment modal"
                >
                  <X className="h-6 w-6" />
                </button>

                {submitSuccess ? (
                  <div id="payment-submit-success" className="flex flex-col items-center justify-center py-12 text-center font-sans">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    >
                      <CheckCircle className="h-20 w-20 text-emerald-500 mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold tracking-tight mb-2">Payment Verification Sent!</h3>
                    <p className="text-zinc-400 max-w-xs mb-6 text-sm">
                      Your payment proof has been saved securely. Please tap below to immediately notify our advisor on WhatsApp.
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
                        Send Payment Details to Advisor
                      </motion.a>
                    )}
                  </div>
                ) : (
                  <div id="payment-submit-fields" className="font-sans">
                    <h2 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
                      <CreditCard className="h-6 w-6 text-emerald-500" />
                      Verify Your Payment
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6">
                      Upload your payment screenshot or receipt to claim course access.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Contact Number
                          </label>
                          <input
                            type="text"
                            name="number"
                            value={formData.number}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            I want to enroll in
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
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
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                            Transaction ID / Ref No
                          </label>
                          <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="TXN9876543210"
                            required
                            className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* 📁 Drag-and-Drop & Click File Upload Area */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                          Payment Screenshot / Image Proof
                        </label>
                        <div
                          id="payment-drag-drop-zone"
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={triggerFileInput}
                          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                            isDragOver
                              ? "border-emerald-500 bg-emerald-500/10 text-white"
                              : fileName
                              ? "border-emerald-500/50 bg-zinc-800/50 text-emerald-400"
                              : "border-zinc-700 bg-zinc-800 hover:border-zinc-500 text-zinc-400"
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
                                <FileText className="h-10 w-10 text-emerald-500 mb-2" />
                              ) : (
                                <ImageIcon className="h-10 w-10 text-emerald-500 mb-2" />
                              )}
                              <p className="text-sm font-semibold text-white truncate max-w-xs">{fileName}</p>
                              <p className="text-xs text-zinc-400 mt-1">Click or drag another screenshot to replace</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="h-10 w-10 text-zinc-500 mb-2 group-hover:scale-110 transition-transform" />
                              <p className="text-sm font-medium">Click to upload image of screenshot</p>
                              <p className="text-xs text-zinc-500 mt-1">Supports PDF, JPEG, PNG formats (Max 10MB)</p>
                            </div>
                          )}
                        </div>
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
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 transition-all duration-200 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? "Uploading Proof..." : "Submit Payment & Verify"}
                      </button>
                    </form>
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
