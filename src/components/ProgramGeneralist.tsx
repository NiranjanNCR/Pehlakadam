import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { Milestone, Compass, Layers, Zap, Target, Award } from "lucide-react";
import { motion } from "motion/react";

export default function ProgramGeneralist() {
  const steps = [
    {
      title: "Identify Native Core",
      desc: "Perform in-depth cognitive assessments to determine whether your multi-disciplinary background maps better to high-tech or strategic leadership.",
      icon: Target,
    },
    {
      title: "Specialization Selection",
      desc: "Surgical course shortlisting and domain mapping (e.g., from generic Management to Niche AI Product, or General Law to Maritime Tech Advisor).",
      icon: Compass,
    },
    {
      title: "Vertical Authority Building",
      desc: "Build a bespoke academic or certification roadmap (like CFA, Scrum Master, or advanced Ivy League Specializations) that commands high market value.",
      icon: Award,
    },
    {
      title: "High-Yield Positioning",
      desc: "Re-engineering resume portfolios and professional brand assets to stand out as a deep specialist rather than a jack of all trades.",
      icon: Layers,
    },
  ];

  return (
    <motion.div
      id="program-generalist-page"
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
              Niche Positioning Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Generalist to Specialist: Advanced Domain Dominance
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">
              Are you a corporate professional or multi-disciplinary student feeling overlooked in a highly specialized, skill-first employment market? 'Generalist to Specialist' is a surgical, elite coaching track designed to convert your broad intelligence into authoritative vertical dominance.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              PEHLAKADAM maps your transferable skill sets directly to niche vertical demands. Managed by enterprise leaders, strategic advisors, and tech founders, we outline high-value certification pathways (e.g., Scrum Master, advanced AI specialization, niche fintech, or supply chain consulting) and reconstruct your personal brand. This ensures you position yourself not as a generic generalist, but as an indispensable industry specialist commanding premier market value.
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                alt="Corporate workshop brainstorming"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="generalist" />
          </div>

        </div>
      </section>

      {/* Strategies Grid */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Advanced Framework
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              FOUR PILLARS OF NICHE MIGRATION
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              How we systematically elevate you from multi-skilled generalist to high-demand authority.
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

      {/* Pricing tracks */}
      <CartCourse />

      <Footer />
    </motion.div>
  );
}
