import { useState, ChangeEvent, FormEvent } from "react";
import { createPortal } from "react-dom";
// Added MessageSquare to lucide-react icons for the direct WhatsApp action buttons
import { X, Calendar, CheckCircle, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ContactFormData } from "../types";

export default function FormModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    number: "",
    role: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // 💬 NEW WHATSAPP STATE: Holds the pre-compiled WhatsApp message URL returned from the server API
  const [whatsappUrl, setWhatsappUrl] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      // 🚀 TRANSACTION: Post data to our full-stack endpoint
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // 💬 CAPTURE WHATSAPP URL: Save the pre-formatted WhatsApp link for user redirection
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
          message: "",
        });
        
        // Extend the pop-up success window visibility duration to 20 seconds so the student has sufficient time to tap the WhatsApp button
        setTimeout(() => {
          setIsOpen(false);
          setSubmitSuccess(false);
          setWhatsappUrl("");
        }, 20000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Failed to connect to server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        id="open-form-modal-btn"
        onClick={() => setIsOpen(true)}
        className="booking-btn group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-emerald-600 px-8 py-3.5 font-sans font-semibold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
          Book Consultation
        </span>
      </button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              id="form-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 p-4 py-10 overflow-y-auto backdrop-blur-md"
            >
              <motion.div
                id="form-modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", duration: 0.4 }}
                onClick={(e) => e.stopPropagation()}
                className="relative my-4 md:my-8 w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-800 text-white p-6 sm:p-8 shadow-2xl"
              >
                <button
                  id="close-form-modal-btn"
                  onClick={() => setIsOpen(false)}
                  className="absolute right-5 top-5 text-zinc-400 hover:text-white transition-colors duration-200"
                  aria-label="Close form modal"
                >
                  <X className="h-6 w-6" />
                </button>

                {submitSuccess ? (
                  <div id="form-submit-success" className="flex flex-col items-center justify-center py-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                    >
                      <CheckCircle className="h-20 w-20 text-emerald-500 mb-6" />
                    </motion.div>
                    <h3 className="text-2xl font-bold font-sans tracking-tight mb-2">Thank you!</h3>
                    <p className="text-zinc-400 max-w-xs mb-6">
                      Your request has been received. Our expert advisor will reach out to you shortly.
                    </p>

                    {/* 💬 WHATSAPP DIRECT HAND-OFF:
                        Launches the formatted WhatsApp chat pre-populated with your advisory answers
                        addressed to the configured admin WhatsApp number. */}
                    {whatsappUrl && (
                      <motion.a
                        id="modal-whatsapp-cta"
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3 px-5 transition-all duration-300 shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 animate-pulse cursor-pointer text-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Notify Advisor on WhatsApp
                      </motion.a>
                    )}
                  </div>
                ) : (
                  <div id="form-submit-fields">
                    <h2 className="text-2xl font-bold font-sans tracking-tight text-white mb-1">
                      Book an Expert Consultation
                    </h2>
                    <p className="text-zinc-400 text-sm mb-6">
                      Take your first step today. Fill out your details below.
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
                          Your Message / Career Goals
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us about your dreams, challenges, or current questions..."
                          required
                          rows={3}
                          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-none"
                        ></textarea>
                      </div>

                      {submitError && (
                        <p id="form-error-msg" className="text-red-400 text-xs font-medium">
                          {submitError}
                        </p>
                      )}

                      <button
                        id="submit-form-modal-btn"
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 transition-all duration-200 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-55"
                      >
                        {isSubmitting ? "Submitting..." : "Send Request"}
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
