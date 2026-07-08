import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Milestone, Layers } from "lucide-react";
import { motion } from "motion/react";

export default function HomeSecTwo() {
  const services = [
    {
      title: "Career Counselling",
      description: "Specially designed diagnostic evaluations to find strengths early and recommend subjects.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80",
      icon: Sparkles,
    },
    {
      title: "Career Coaching & Mentoring",
      description: "One-on-one sessions with industry stalwarts and academic coaches for comprehensive roadmaps.",
      image: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=400&q=80",
      icon: Milestone,
    },
    {
      title: "Restart your Career",
      description: "Tailored counseling for professionals re-entering the workforce after career gaps or transitions.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
      icon: Layers,
    },
  ];

  return (
    <section id="services-section" className="py-24 bg-zinc-50 border-t border-b border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
            Our Offerings
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-sans">
            OUR COMPREHENSIVE SERVICES
          </h2>
          <p className="text-zinc-500 mt-2 text-sm sm:text-base">
            Expertly crafted tracks to navigate academic choices and professional benchmarks.
          </p>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((serv, index) => {
            const IconComponent = serv.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group flex flex-col bg-white rounded-3xl border border-zinc-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Image Wrap */}
                <div className="relative h-56 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    src={serv.image}
                    alt={serv.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Icon badge floating */}
                  <div className="absolute top-4 left-4 z-20 h-10 w-10 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm text-emerald-600 shadow-md">
                    <IconComponent className="h-5 w-5" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-8 flex flex-grow flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 font-sans group-hover:text-emerald-600 transition-colors">
                      {serv.title}
                    </h3>
                    <p className="text-zinc-500 text-sm mt-3 leading-relaxed">
                      {serv.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-zinc-100">
                    <button className="w-full">
                      <Link
                        to="/explore"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-50 hover:bg-emerald-50 border border-zinc-200/85 hover:border-emerald-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:text-emerald-700 transition-all cursor-pointer"
                      >
                        Explore Offerings
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
