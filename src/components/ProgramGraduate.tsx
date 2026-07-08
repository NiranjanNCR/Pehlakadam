import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { Award, Briefcase, GraduationCap, Sparkles, Milestone } from "lucide-react";
import { motion } from "motion/react";

export default function ProgramGraduate() {
  const steps = [
    {
      title: "Corporate Placements",
      desc: "Comprehensive mock interview rounds, corporate alignment reviews, and direct networking blueprints for leading tech and financial boards.",
      icon: Briefcase,
    },
    {
      title: "Higher Ed Selection",
      desc: "Evaluate prospects of MBA, M.Tech, MS or Ph.D programs globally. Decipher GMAT, GRE, CAT timelines and profile criteria.",
      icon: GraduationCap,
    },
    {
      title: "Resume & LinkedIn Audit",
      desc: "ATS-compliant resume restructuring, cover-letter phrasing, and professional social positioning to elevate industry headhunting.",
      icon: Award,
    },
    {
      title: "Skill Gap Overhaul",
      desc: "Map existing competencies against tech or managerial criteria, identifying certified, high-yield upskilling pathways.",
      icon: Sparkles,
    },
  ];

  return (
    <motion.div
      id="programgraduate-page"
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
              Corporate & Graduate Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Career Counselling & Guidance for Graduates & Professionals
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Are you a recent college graduate struggling to secure high-yield placements? Or a corporate professional ready to transition industries, or re-enter the active workforce after a break?
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              PEHLAKADAM provides customized mentorship designed to identify high-potential skill gaps, compile powerful resumes, and matching you with expert industry veterans for actionable corporate placements.
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80"
                alt="Happy university graduates"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="graduate" />
          </div>

        </div>
      </section>

      {/* Steps list */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Career Blueprint
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              GRADUATE ALIGNMENT BENCHMARKS
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              From fresh placements to senior executive career restarts, we provide structural handholding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
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
                  <h3 className="text-md font-bold font-sans text-zinc-900">{step.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Plans list */}
      <CartCourse />

      <Footer />
    </motion.div>
  );
}
