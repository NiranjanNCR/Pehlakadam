import { useState, ChangeEvent, FormEvent } from "react";
import { Mail, Phone, MapPin, User, MessageSquare, Send, CheckCircle } from "lucide-react";
import { ContactFormData } from "../types";
import { motion } from "motion/react";
import { contactFormSchema } from "../lib/validation";

export default function ContactForm() {
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
  // 💬 NEW WHATSAPP STATE: Holds the pre-formatted click-to-open WhatsApp URL returned from the server
  const [whatsappUrl, setWhatsappUrl] = useState("");

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setErrors({});

    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const path = err.path[0] as keyof ContactFormData;
        if (path) {
          fieldErrors[path] = err.message;
          triggerShake(path);
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚀 TRANSACTION: Submitting form data to our full-stack API endpoint
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (response.ok) {
        const data = await response.json();
        // 💬 CAPTURE WHATSAPP PAYLOAD: Read the generated WhatsApp redirect link from the response
        if (data.whatsappUrl) {
          setWhatsappUrl(data.whatsappUrl);
        }
        
        setSubmitSuccess(true);
        // Reset form inputs
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          number: "",
          role: "",
          message: "",
        });
        
        // Let the success state remain visible for 20 seconds so students can comfortably click the WhatsApp button
        setTimeout(() => {
          setSubmitSuccess(false);
          setWhatsappUrl("");
        }, 20000);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Failed to submit. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="py-24 bg-zinc-950 text-white relative overflow-hidden">
      {/* Background Decoratives */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-stretch">
          
          {/* Column 1: Info and Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block mb-4">
                Reach Out
              </span>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-sans text-white mb-6">
                Let's Start a Conversation
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8">
                Ready to take your first wise step? Whether you have questions about programs, want to partner with us, or just want to explore career options, we're here to guide you.
              </p>
            </div>

            {/* Contact Details Cards */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Us</p>
                  <p className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                    info@pehlakadam.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Call Our Advisor</p>
                  <p className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                    +91 98765 01234
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Our Headquarters</p>
                  <p className="text-sm font-medium text-white">
                    N & M Mento, Patiala & Pilani, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Form */}
          <div className="lg:col-span-7">
            <div className="p-8 md:p-12 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl relative">
              {submitSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <CheckCircle className="h-16 w-16 text-emerald-400 mb-6" />
                  <h3 className="text-2xl font-bold font-sans tracking-tight mb-2 text-white">
                    Form Submitted Successfully!
                  </h3>
                  <p className="text-zinc-400 max-w-sm text-sm mb-6">
                    Thank you for contacting Pehlakadam. Our counselor will review your submission and contact you via email or phone within 24 hours.
                  </p>

                  {/* 💬 WHATSAPP CTA LINK
                      Provides an ultra-convenient, immediate link to forward a clean copy of the
                      compiled inquiry directly to your advisor on WhatsApp. */}
                  {whatsappUrl && (
                    <motion.a
                      id="contact-whatsapp-cta"
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-3.5 px-6 transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer animate-pulse"
                    >
                      <MessageSquare className="h-5 w-5" />
                      Send Copy to Advisor via WhatsApp
                    </motion.a>
                  )}
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div animate={shakeFields.firstName ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="Your first name"
                          className={`w-full rounded-xl bg-zinc-950 border pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            errors.firstName
                              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                              : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
                          }`}
                        />
                      </div>
                      {errors.firstName && (
                        <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.firstName}</p>
                      )}
                    </motion.div>

                    <motion.div animate={shakeFields.lastName ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Your last name"
                          className={`w-full rounded-xl bg-zinc-950 border pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            errors.lastName
                              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                              : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
                          }`}
                        />
                      </div>
                      {errors.lastName && (
                        <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.lastName}</p>
                      )}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div animate={shakeFields.email ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          className={`w-full rounded-xl bg-zinc-950 border pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            errors.email
                              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                              : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
                          }`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.email}</p>
                      )}
                    </motion.div>

                    <motion.div animate={shakeFields.number ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                        <input
                          type="tel"
                          name="number"
                          value={formData.number}
                          onChange={handleChange}
                          placeholder="Mobile with code"
                          className={`w-full rounded-xl bg-zinc-950 border pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 ${
                            errors.number
                              ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                              : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
                          }`}
                        />
                      </div>
                      {errors.number && (
                        <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.number}</p>
                      )}
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <motion.div animate={shakeFields.role ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                        Academic Program
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`w-full rounded-xl bg-zinc-950 border px-4 py-3 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.role
                            ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                            : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
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
                        <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.role}</p>
                      )}
                    </motion.div>

                    <motion.div animate={shakeFields.plan ? "shake" : "default"} variants={shakeVariants}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 text-left">
                        Plan Tier
                      </label>
                      <select
                        name="plan"
                        value={formData.plan || "Basic"}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-zinc-950 border border-emerald-500/50 px-4 py-3 text-sm text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 font-medium"
                      >
                        <option value="Basic">Basic</option>
                        <option value="Standard">Standard</option>
                        <option value="Premium Pro">Premium Pro</option>
                      </select>
                    </motion.div>
                  </div>

                  <motion.div animate={shakeFields.message ? "shake" : "default"} variants={shakeVariants}>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 text-left">
                      Your Message / Inquiry
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500" />
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Write your message here..."
                        rows={4}
                        className={`w-full rounded-xl bg-zinc-950 border pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 transition-all duration-200 focus:outline-none focus:ring-2 resize-none ${
                          errors.message
                            ? "border-red-500/80 focus:ring-red-500/20 focus:border-red-500"
                            : "border-zinc-800 focus:ring-emerald-500/50 focus:border-emerald-500"
                        }`}
                      ></textarea>
                    </div>
                    {errors.message && (
                      <p className="mt-1.5 text-xs text-red-400 font-medium text-left px-1">{errors.message}</p>
                    )}
                  </motion.div>

                  {submitError && (
                    <p className="text-red-400 text-xs font-medium">{submitError}</p>
                  )}

                  <button
                    id="submit-contact-form-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 px-4 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      "Sending Message..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
