import { useState, useEffect, ChangeEvent, FormEvent } from "react";
// Added MessageSquare to lucide-react icons list for WhatsApp CTA buttons
import { X, Sparkles, CheckCircle, Calendar, GraduationCap, ArrowRight, Timer, MessageSquare } from "lucide-react";
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
          message: `[30-Sec Conversion Pop-up Alert] Goal: ${result.data.message}`
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
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Limited Time Offer
                    </span>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-black font-sans tracking-tight text-white">
                      Unlock Your Diagnostic Assessment
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                      You qualify for a free 1-on-1 counseling session & preliminary psychometric strength review (Worth ₹4,999) if you register right now.
                    </p>
                  </div>

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

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                        I want to enroll in
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full rounded-xl bg-zinc-800 border px-4 py-2 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 ${
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
                        placeholder="e.g. Want to specialize in Artificial Intelligence, select engineering vs tech management"
                        className={`w-full rounded-xl bg-zinc-800 border px-4 py-2.5 text-xs text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.message
                            ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                            : "border-zinc-700 focus:ring-emerald-500/50 focus:border-emerald-500"
                        }`}
                      />
                      {errors.message && (
                        <p className="mt-1 text-[10px] text-red-400 font-medium text-left">{errors.message}</p>
                      )}
                    </div>

                    {submitError && (
                      <p className="text-red-400 text-xs font-semibold">{submitError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? "Processing Reservation..." : "Claim Free Consultation"}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
