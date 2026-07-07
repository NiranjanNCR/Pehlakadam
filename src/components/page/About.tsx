import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import Mentors from "../Mentors";
import FormModal from "../FormModal";
import { Compass, Sparkles, BookOpen, HeartHandshake, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

export default function About() {
  const values = [
    {
      title: "Scientific Diagnostic Tests",
      desc: "Our evaluations aren't guessing games. We rely on worldwide gold standards like DISC, MBTI, and Enneagram testing to map cognitive traits.",
      icon: BookOpen,
    },
    {
      title: "Unbiased Advisory Counsel",
      desc: "We stand strictly for student alignment. Our mentors advise objectively to fit individual traits, never pushing unsuited commercial degrees.",
      icon: ShieldAlert,
    },
    {
      title: "Comprehensive Care",
      desc: "From subject streaming in 8th class up to post-graduation placements and career restarts, we provide persistent handholding at every phase.",
      icon: HeartHandshake,
    },
  ];

  return (
    <motion.div
      id="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50"
    >
      <NavigationBar />

      {/* Hero Header */}
      <section className="relative py-20 bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-4 py-1.5 rounded-full inline-block">
            Our Journey & Vision
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans text-white">
            About PEHLAKADAM
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Taking the first step in your career can be daunting. We build the compass, clear the fog, and hold your hand to ensure you walk with confidence.
          </p>
        </div>
      </section>

      {/* Vision & Narrative */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3.5 py-1 rounded-full">
                Why We Exist
              </span>
              <h2 className="text-3xl font-bold font-sans text-zinc-900">
                Guiding India's Ambitious Individuals Into Fulfilled Careers
              </h2>
              <p className="text-zinc-600 leading-relaxed">
                PEHLAKADAM (meaning "First Step" in Hindi) is a premium diagnostic career counseling and cognitive planning platform. Managed by the N & M MENTO group, we serve as trusted guides helping children and mature adults unlock their native strengths.
              </p>
              <p className="text-zinc-600 leading-relaxed">
                Too many students choose subjects or colleges due to herd mentality, only to realize years later that their personality traits clash with their job demands. By combining psychometric tests with one-on-one sessions, we eliminate guesswork and plan strategic milestones.
              </p>
              <div className="pt-4">
                <FormModal />
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600 rounded-3xl translate-x-3 translate-y-3 opacity-10 -z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                  alt="Career mentoring workspace"
                  className="rounded-3xl w-full object-cover aspect-[16/10] shadow-md border border-zinc-200"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-zinc-50 border-t border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold font-sans text-zinc-950">
              The Pillars of Our Counseling Pedigree
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm uppercase tracking-wider font-mono mt-1">
              Ethical, scientific, and results-driven
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-zinc-200/60 p-8 shadow-sm">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 border border-emerald-100">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold font-sans text-zinc-900 mb-3">{v.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Faculty list */}
      <Mentors />

      <Footer />
    </motion.div>
  );
}
