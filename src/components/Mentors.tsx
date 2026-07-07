import { Award, GraduationCap, Link2 } from "lucide-react";
import { motion } from "motion/react";

export default function Mentors() {
  const mentorList = [
    {
      name: "MOHIT ANAND DUBEY",
      institution: "BITS PILANI",
      qualification: "M.Tech in Technical Communications",
      roleDescription: "Unified Communications and Collaboration Consultant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "NIRANJAN SINGH",
      institution: "PUNJABI UNIVERSITY, PATIALA",
      qualification: "B.Tech & Career Psychology Consultant",
      roleDescription: "Personality Development & Core Mindset Mentor",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "MANISH KUMAR RANA",
      institution: "BITS PILANI",
      qualification: "B.E. & Student Mentorship Board Member",
      roleDescription: "Strategic Career Roadmap Planner & Corporate Advisor",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
  ];

  return (
    <section id="mentors-section" className="py-24 bg-white border-b border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4">
            Our Faculty
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 font-sans">
            MEET OUR EXPERT MENTORS
          </h2>
          <p className="text-zinc-500 mt-2 text-sm sm:text-base">
            Seasoned guides from premium universities committed to structural handholding and student empowerment.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {mentorList.map((mentor, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group flex flex-col bg-zinc-50 rounded-3xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-center"
            >
              {/* Avatar Frame */}
              <div className="relative mx-auto h-32 w-32 mb-6 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-emerald-400 transition-all duration-300">
                <img
                  src={mentor.image}
                  alt={mentor.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Identity info */}
              <div className="space-y-2 flex-grow">
                <h3 className="text-md font-bold tracking-tight text-zinc-900 font-sans group-hover:text-emerald-600 transition-colors">
                  {mentor.name}
                </h3>
                
                {/* Institution badge */}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                  {mentor.institution}
                </div>

                <p className="text-zinc-400 text-xs font-mono font-medium pt-1">
                  {mentor.qualification}
                </p>

                <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto pt-3 border-t border-zinc-200/50 mt-4">
                  {mentor.roleDescription}
                </p>
              </div>

              {/* Bottom tag */}
              <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-emerald-600 font-semibold text-xs cursor-pointer hover:underline">
                <Award className="h-3.5 w-3.5" /> Certified Counselor
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
