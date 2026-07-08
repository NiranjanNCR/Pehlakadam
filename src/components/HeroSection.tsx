import { useState, useEffect } from "react";
import FormModal from "./FormModal";
import { Compass, GraduationCap, Trophy, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80",
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    studentsCount: "10K+",
    expertsCount: "15+",
    successRate: "99%"
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/system-stats")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load system stats.");
      })
      .then((data) => {
        if (data && data.studentsCount) {
          setStats({
            studentsCount: data.studentsCount,
            expertsCount: data.expertsCount,
            successRate: data.successRate
          });
        }
      })
      .catch((err) => console.error("Error fetching system stats:", err));
  }, []);

  return (
    <main className="relative bg-zinc-50 py-16 lg:py-24 overflow-hidden border-b border-zinc-200/50">
      {/* Decorative Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left: Text & Action */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider"
          >
            <Compass className="h-4 w-4 text-emerald-600 animate-spin-slow" />
            Your trusted career companion
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-950 font-sans leading-[1.1]"
          >
            Take your <span className="text-emerald-600">First</span> Step <span className="relative inline-block"><span className="relative z-10 text-emerald-600">wisely</span><span className="absolute left-0 bottom-1 w-full h-3 bg-emerald-200/50 -z-10 rounded-full"></span></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0"
          >
            Empower your journey to success, build essential life skills for holistic growth, and gain unshakable confidence with India's best diagnostic career counseling.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <FormModal />
          </motion.div>

          {/* Quick Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 pt-8 border-t border-zinc-200 max-w-md mx-auto lg:mx-0"
          >
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-zinc-800 font-bold font-mono">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
                <span>{stats.studentsCount}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Students</p>
            </div>
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-zinc-800 font-bold font-mono">
                <Users className="h-4 w-4 text-emerald-600" />
                <span>{stats.expertsCount}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Experts</p>
            </div>
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-1.5 text-zinc-800 font-bold font-mono">
                <Trophy className="h-4 w-4 text-emerald-600" />
                <span>{stats.successRate}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Success</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Premium Dynamic Slider */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative h-[300px] sm:h-[400px] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-zinc-200"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlide}
                src={HERO_IMAGES[currentSlide]}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0 h-full w-full object-cover"
                alt="Pehlakadam Career Counselling Mentorship"
              />
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/30 backdrop-blur-sm px-3.5 py-2 rounded-full">
              {HERO_IMAGES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? "w-6 bg-white" : "w-2.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                ></button>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </main>
  );
}
