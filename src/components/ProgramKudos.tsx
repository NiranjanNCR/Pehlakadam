import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { Award, Heart, Sparkles, Compass, Lightbulb, Smile } from "lucide-react";
import { motion } from "motion/react";

export default function ProgramKudos() {
  const milestones = [
    {
      title: "Nurturing Curiosity",
      desc: "Instilling a lifelong love of learning by celebrating children's natural curiosity and identifying early cognitive inclination benchmarks.",
      icon: Smile,
    },
    {
      title: "Multiple Intelligences",
      desc: "Evaluating creative, artistic, verbal, spatial, and mathematical talents early rather than relying strictly on standard school grades.",
      icon: Lightbulb,
    },
    {
      title: "Building Core Confidence",
      desc: "Fostering resilience, healthy communication skills, and positive self-image to prevent academic stress and social anxiety.",
      icon: Heart,
    },
    {
      title: "Talent Recognition Cards",
      desc: "Creating specialized praise-based 'Kudos Profiles' mapping cognitive strengths to guide early stage parent-child interactions.",
      icon: Award,
    },
  ];

  return (
    <motion.div
      id="program-kudos-page"
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
              Primary School Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Primary Kudos: Early Talent & Mindset Guidance
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Every child has unique brilliance. Our 'Primary Kudos' program is custom-built for younger students to detect natural cognitive strengths, emotional styles, and multiple intelligences before traditional academic pressures set in.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Through gentle interaction, parent counselling, and positive psychometric screening, we empower children with confidence, helping parents create an ideal environment for natural talent development.
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
                alt="Happy primary schoolchildren"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="kudos" />
          </div>

        </div>
      </section>

      {/* Focus Pillars */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Nurturing Excellence
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              GUIDANCE BENCHMARKS FOR PRIMARY KUDOS
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              We focus on child psychology, emotional alignment, and natural talent development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {milestones.map((milestone, idx) => {
              const Icon = milestone.icon;
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
                  <h3 className="text-md font-bold font-sans text-zinc-900">{milestone.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{milestone.desc}</p>
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
