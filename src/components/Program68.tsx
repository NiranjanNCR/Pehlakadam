import NavigationBar from "./NavigationBar";
import Footer from "./Footer";
import FormModal from "./FormModal";
import CartCourse from "./CartCourse";
import ProgramMediaSection from "./ProgramMediaSection";
import { AlertCircle, Eye, EyeOff, ShieldCheck, Compass, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function Program68() {
  const challenges = [
    {
      title: "Lack of Awareness",
      desc: "Many students in early grades have limited exposure to modern careers, assuming traditional professions are the only pathways.",
      color: "border-blue-200 bg-blue-50/30 text-blue-800",
    },
    {
      title: "Peer & Social Pressure",
      desc: "Students often copy stream selections blindly based on childhood friend networks or popular cinematic portrayals.",
      color: "border-purple-200 bg-purple-50/30 text-purple-800",
    },
    {
      title: "Stream Anxiety",
      desc: "Anxiety builds early as Grade 8 approaches, since choosing primary subject streams sets the foundation for Board selections.",
      color: "border-amber-200 bg-amber-50/30 text-amber-800",
    },
    {
      title: "Unidentified Talents",
      desc: "Standard academic metrics fail to measure multiple intelligences, leaving creative, verbal, or spatial strengths completely ignored.",
      color: "border-emerald-200 bg-emerald-50/30 text-emerald-800",
    },
  ];

  return (
    <motion.div
      id="program68-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50"
    >
      <NavigationBar />

      {/* Hero Section */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden border-b border-zinc-900">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full inline-block">
              Foundational Track
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-sans text-white leading-tight">
              Career Counselling & Guidance for 6-8 Grade Student
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-medium">
              Are you looking to lay an early, rock-solid foundation for your child's educational journey? Our dedicated 6-8 Grade program identifies innate cognitive talents, learning orientations, and multiple intelligences before secondary school stress begins.
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              We specialize in early-stage cognitive mapping. By understanding a child's natural learning temperament (visual, auditory, kinesthetic, or logical), we help parents adopt stress-free study strategies, choose suitable extra-curricular profiles, and cultivate analytical thinking habits early on. This prepares them smoothly for the streaming challenges of the upcoming years.
            </p>
            <div className="pt-2">
              <FormModal />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
              <img
                src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=800&q=80"
                alt="Middle school student studying"
                className="rounded-3xl w-full object-cover aspect-[4/3] shadow-xl border border-zinc-800"
              />
            </div>
            <ProgramMediaSection programKey="6-8" />
          </div>

        </div>
      </section>

      {/* Structural Challenges Section */}
      <section className="py-24 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
              Overcoming Barriers
            </span>
            <h2 className="text-3xl font-bold font-sans text-zinc-950 sm:text-4xl">
              RIGHT SUBJECT SELECTION MATTERS
            </h2>
            <p className="text-zinc-500 text-sm mt-2">
              We diagnose and mitigate the major cognitive hurdles that early schoolers face.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {challenges.map((chal, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-6 rounded-3xl border ${chal.color} shadow-sm flex flex-col justify-between`}
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold font-sans">{chal.title}</h3>
                  <p className="text-xs leading-relaxed opacity-95">{chal.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Pricing & Modal Details */}
      <CartCourse programName="6-8 Grade Student" />

      <Footer />
    </motion.div>
  );
}
