import { Compass, Sparkles, Milestone } from "lucide-react";
import { motion } from "motion/react";

export default function HomeSecOne() {
  return (
    <section id="welcome-section" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left: Professional Counselor Image with smooth viewport animation */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 -z-10 opacity-10"></div>
            <img
              src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80"
              alt="Pehlakadam Career Counseling"
              className="rounded-3xl w-full object-cover aspect-[4/5] shadow-lg border border-zinc-200"
            />
            
            {/* Overlay badge */}
            <div className="absolute -bottom-6 -right-6 bg-emerald-900 text-white p-5 rounded-2xl shadow-xl border border-emerald-800 hidden sm:flex items-center gap-3.5 max-w-xs">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Milestone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Our Mission</p>
                <p className="text-[11px] font-medium text-emerald-100/90 mt-0.5 leading-snug">
                  Unlocking true potential with expert mentoring.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: Narrative Texts */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-sans">
                Welcome to Pehlakadam
              </h2>
            </div>

            <p className="text-zinc-600 text-base leading-relaxed">
              Welcome to <strong>“PEHLAKADAM”</strong>, your trusted companion in unlocking your true potential. Our mission is to empower individuals to transform their lives through comprehensive personality development, expert career guidance, and actionable self-improvement strategies.
            </p>

            <p className="text-zinc-600 text-base leading-relaxed">
              At <strong>“PEHLAKADAM”</strong>, we believe that growth begins with the right tools and support. Whether you’re striving for personal confidence, professional excellence, or a more fulfilling life, we are here to walk with you at every crucial crossroads.
            </p>

            <p className="text-zinc-600 text-base leading-relaxed">
              We’re here to guide you every step of the way. Join us to explore tailored programs, interactive workshops, and insightful resources designed to help you build skills, achieve clarity, and make confident decisions for a brighter future. Let’s grow together!
            </p>

            {/* Feature Checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-sm text-zinc-700 font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                </span>
                Holistic Personality Growth
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                </span>
                Scientific Counseling Tests
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                </span>
                Ivy League & BITS Mentors
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 font-semibold">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Sparkles className="h-3 w-3" />
                </span>
                Actionable Success Roadmap
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
