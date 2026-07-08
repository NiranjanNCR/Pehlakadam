import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { Sparkles, Brain, Target, Compass, Milestone } from "lucide-react";
import { motion } from "motion/react";

export default function Program910() {
  const benchmarks = [
    {
      title: "Board Stream Selection",
      desc: "Grade 10 is the ultimate crossroads where choosing Science, Commerce, or Humanities sets the course for high school and national board exams.",
      icon: Target,
    },
    {
      title: "Cognitive Skill Mapping",
      desc: "Our scientific evaluations map logical, creative, analytical, and interpersonal indices to match native brain wiring with potential professions.",
      icon: Brain,
    },
    {
      title: "Exam Resilience Coaching",
      desc: "Stress counselling and custom study-planning trackers to navigate board-prep fatigue while keeping cognitive focus sharp.",
      icon: Sparkles,
    },
    {
      title: "Future Market Exposure",
      desc: "Interactive reviews of modern careers (AI, Product Design, Bio-Tech, Corporate Law, Data Sciences) to widen perspectives before specialization.",
      icon: Compass,
    },
  ];

  return (
    <motion.div
      id="program910-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50"
    >
      <NavigationBar />

      {/* Hero Header */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block">
              Intermediate Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Career Counselling & Guidance for 8-10 Grade Student
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">
              Are you in Grade 8, 9, or 10 trying to decide between Science, Commerce, and Humanities? This choice isn't just about board scores—it's about aligning your core academic aptitude and personal interests with future career success.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              PEHLAKADAM helps students navigate this transition period. We use standard personality indicators and logical reasoning metrics to clear confusion. Our comprehensive advisory blueprint ensures that your stream choice perfectly lines up with your long-term higher-education goals, exam readiness, and emerging job sectors.
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80"
                alt="High school group study"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="9-10" />
          </div>

        </div>
      </section>

      {/* Focus Pillars */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Core Framework
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              GUIDANCE BENCHMARKS FOR GRADES 8 - 10
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              We focus on stream selection, behavioral profiling, and board preparedness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benchmarks.map((bench, idx) => {
              const Icon = bench.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-zinc-50 rounded-2xl border border-zinc-200 p-6 flex flex-col items-start gap-4 hover:bg-white hover:shadow-lg transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-md font-bold font-sans text-zinc-900">{bench.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{bench.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Pricing courses */}
      <CartCourse />

      <Footer />
    </motion.div>
  );
}
