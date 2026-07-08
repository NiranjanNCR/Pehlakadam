import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { Award, GraduationCap, Compass, BookOpen, Layers } from "lucide-react";
import { motion } from "motion/react";

export default function Program1112() {
  const strategies = [
    {
      title: "College & Course Matching",
      desc: "Detailed shortlists of colleges, course curriculums, fee-structures, and prospective placement ratios based on interest indices.",
      icon: GraduationCap,
    },
    {
      title: "Entrance Exam Strategy",
      desc: "Actionable roadmap guidance for national & global examinations like JEE, NEET, CLAT, CUET, SAT, and design entries.",
      icon: BookOpen,
    },
    {
      title: "Psychometric Deep Dive",
      desc: "Utilizing 16-Personality Factors and Enneagram testing to cross-reference academic stamina against professional profiles.",
      icon: Compass,
    },
    {
      title: "Scholarship & Form Help",
      desc: "Complete documentation timelines, admission procedures, scholarship opportunities, and alternative study backup routes.",
      icon: Award,
    },
  ];

  return (
    <motion.div
      id="program1112-page"
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
              Advanced High School Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Career Counselling & Guidance for 11-12 Grade Student
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">
              Are you in Grade 11 or 12 preparing for your next academic jump? The decisions you make right now define your professional direction, university placement, and cognitive growth for years to come.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-sans">
              PEHLAKADAM maps your core personality indices and stream performance to prospective college tracks. Guided by experienced advisors from premier national and global universities (such as BITS Pilani, IITs, and top global business schools), we formulate concrete university shortlists, design backup study options, optimize board exam stamina, and chart clear-cut strategies for entrance exams (JEE, NEET, CLAT, CUET, SAT, and more).
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80"
                alt="Teenager working on computer"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="11-12" />
          </div>

        </div>
      </section>

      {/* Strategies Grid */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Action Plan
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              STRATEGIC COACHING FOR GRADES 11 - 12
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              We align entrance preparation timelines with international admission standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {strategies.map((strat, idx) => {
              const Icon = strat.icon;
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
                  <h3 className="text-md font-bold font-sans text-zinc-900">{strat.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{strat.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Pricing tracks */}
      <CartCourse />

      <Footer />
    </motion.div>
  );
}
