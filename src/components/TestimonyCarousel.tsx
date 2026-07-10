import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Quote, Sparkles, Award, GraduationCap } from "lucide-react";
import { Testimonial } from "../types";

export default function TestimonyCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (e) {
      console.error("Error fetching testimonials:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testimonials.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 6000); // Auto rotate every 6 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonials, isHovered, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  if (loading) {
    return (
      <div className="py-20 bg-zinc-50 border-y border-zinc-100 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        <p className="text-sm text-zinc-500 mt-4 font-mono">Synchronizing success stories...</p>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  // Helper to render student avatar
  const renderAvatar = (item: Testimonial) => {
    if (item.fileData) {
      return (
        <img
          src={item.fileData}
          alt={item.studentName}
          referrerPolicy="no-referrer"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl shadow-zinc-200/50"
        />
      );
    }

    // Default beautiful initial-based avatar
    const initial = item.studentName ? item.studentName.charAt(0).toUpperCase() : "S";
    const colors = [
      "from-emerald-500 to-teal-600",
      "from-teal-500 to-cyan-600",
      "from-sky-500 to-indigo-600",
      "from-emerald-600 to-sky-600"
    ];
    // Hash based on name length to choose a stable color gradient
    const colorIndex = (item.studentName?.length || 0) % colors.length;
    const selectedColor = colors[colorIndex];

    return (
      <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr ${selectedColor} flex items-center justify-center border-4 border-white shadow-xl shadow-emerald-100/50 text-white font-bold text-3xl sm:text-4xl select-none`}>
        {initial}
      </div>
    );
  };

  return (
    <section 
      id="success-testimonials-section"
      className="py-24 bg-zinc-50 border-t border-b border-zinc-100 overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Ambience decoration */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 w-72 h-72 bg-emerald-50/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 -translate-y-1/2 w-80 h-80 bg-teal-50/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
            Proven Impact & Success Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-sans">
            Our Students, <span className="text-emerald-600">Their Milestone Achievements</span>
          </h2>
          <p className="text-zinc-500 mt-4 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Real stories of transformation. Discover how scientifically matched streams and early career guidance unlocked global pathways for our aspirants.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative min-h-[380px] sm:min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full"
            >
              <div className="bg-white border border-zinc-100 rounded-3xl p-8 sm:p-12 shadow-xl shadow-zinc-200/40 relative">
                {/* Large Quote watermark */}
                <Quote className="absolute right-8 top-8 h-20 w-20 text-emerald-50/60 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Left Column: Student info and avatar */}
                  <div className="flex flex-col items-center text-center md:items-start md:text-left shrink-0 md:w-56">
                    {renderAvatar(current)}

                    <h4 className="text-lg font-bold text-zinc-900 mt-4 tracking-tight">
                      {current.studentName}
                    </h4>

                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1.5">
                      {current.stream}
                    </span>

                    {/* Achievement Tag */}
                    <div className="mt-4 flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm">
                      <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{current.achievement}</span>
                    </div>
                  </div>

                  {/* Right Column: Testimony Details */}
                  <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                    <Quote className="h-8 w-8 text-emerald-600 mb-4 mx-auto md:mx-0 opacity-80" />
                    <p className="text-zinc-600 text-base sm:text-lg leading-relaxed italic font-medium tracking-wide">
                      "{current.story}"
                    </p>
                    <div className="mt-6 flex items-center gap-2 justify-center md:justify-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-xs font-mono uppercase text-zinc-400 tracking-widest">Verified Alumnus Testimony</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-10">
          {/* Indicators / Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                id={`carousel-dot-${idx}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-emerald-600" : "w-2.5 bg-zinc-200 hover:bg-zinc-300"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Previous/Next Buttons */}
          <div className="flex gap-3">
            <button
              id="carousel-prev-btn"
              onClick={handlePrev}
              className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Previous testimony"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              id="carousel-next-btn"
              onClick={handleNext}
              className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              aria-label="Next testimony"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
