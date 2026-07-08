import { Link } from "react-router-dom";
import NavigationBar from "../NavigationBar";
import FormModal from "../FormModal";
import Footer from "../Footer";
import CartCourse from "../CartCourse";
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Milestone, Award, Smile, Layers } from "lucide-react";
import { motion } from "motion/react";

export default function Explore() {
  const serviceGrades = [
    {
      title: "Primary Kudos",
      short: "Early Talent & Mindset",
      description: "Nurturing early childhood curiosity, mapping multiple intelligences, and building core cognitive confidence.",
      path: "/programs/program5",
      icon: Smile,
      iconColor: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      title: "6-8 Grade Student",
      short: "Early Exploration",
      description: "Lay an early foundation for academic success, identify natural learning styles, and adopt stress-free study habits.",
      path: "/programs/program1",
      icon: BookOpen,
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      title: "8-10 Grade Student",
      short: "Foundation Stream selection",
      description: "Determine the ideal stream between Science, Commerce, and Humanities by matching logical aptitude to modern opportunities.",
      path: "/programs/program2",
      icon: Sparkles,
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      title: "11-12 Grade Student",
      short: "Advanced Career Tracks",
      description: "Formulate concrete college shortlists, establish robust backup routes, and optimize competitive exam readiness.",
      path: "/programs/program3",
      icon: Milestone,
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      title: "UG/Graduate/PG",
      short: "Industry Placements",
      description: "Excel in placement preparation, audit your LinkedIn & Resume, and map out global postgraduate specializations.",
      path: "/programs/program4",
      icon: Award,
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      title: "Generalist to Specialist",
      short: "Niche Domain Authority",
      description: "Transforming multi-disciplinary skills into highly specialized industry authority and corporate positioning.",
      path: "/programs/program6",
      icon: Layers,
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <motion.div
      id="explore-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50"
    >
      <NavigationBar />

      {/* Main Exploration Header Sec */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-4 py-1.5 rounded-full inline-block">
              Guidance Platform
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Career Counselling & Guidance
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Are you a student searching for the perfect career direction? A recent graduate unsure of your next steps? A working professional seeking to advance your career? Or perhaps an executive ready to re-enter the workforce after a career break?
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              No matter where you are on your career journey, let us help you define a path towards professional fulfillment with our best career counselling in India. Our mission is to empower you with the confidence and clarity to make informed decisions.
            </p>
            <div className="pt-2 flex justify-center lg:justify-start">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl translate-x-3 translate-y-3 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80"
                alt="Diverse students studying"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
          </div>

        </div>
      </section>

      {/* Services explore block */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Academic Divisions
            </span>
            <h2 className="text-3xl font-bold font-sans tracking-tight text-zinc-950 sm:text-4xl">
              CHOOSE YOUR PROFILE PATHWAY
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm mt-2 uppercase tracking-widest font-mono">
              Diagnostic roadmaps tailored for specific age benchmarks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceGrades.map((serv, index) => {
              const Icon = serv.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group flex flex-col justify-between bg-zinc-50 rounded-3xl border border-zinc-200 p-6 hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                >
                  <div>
                    {/* Icon frame */}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${serv.iconColor} mb-6 shadow-sm`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="text-lg font-bold font-sans text-zinc-900 group-hover:text-emerald-600 transition-colors">
                      {serv.title}
                    </h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                      {serv.short}
                    </p>
                    
                    <p className="text-zinc-500 text-xs leading-relaxed mt-4">
                      {serv.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100">
                    <button className="w-full">
                      <Link
                        to={serv.path}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white group-hover:bg-emerald-600 text-zinc-700 group-hover:text-white border border-zinc-200 group-hover:border-emerald-600 py-2 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Explore Program
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Plans Section */}
      <CartCourse />

      <Footer />
    </motion.div>
  );
}
