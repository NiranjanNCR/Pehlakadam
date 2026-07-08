import { Award, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function Mentors() {
  const mentorList = [
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
    {
      name: "DR. SIMRAN KAUR",
      institution: "IIT DELHI",
      qualification: "Ph.D. & Senior Cognitive Counselor",
      roleDescription: "Student Behavior Analyst & Academic Stress Specialist",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "AMIT VERMA",
      institution: "IIM AHMEDABAD",
      qualification: "MBA & Placement Strategy Advisor",
      roleDescription: "Industry Readiness, Mock Interviews & Corporate Pathways Coach",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Responsive items-per-page calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1); // Mobile
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2); // Tablet
      } else {
        setItemsPerPage(3); // Desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.max(1, mentorList.length - itemsPerPage + 1);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  return (
    <section id="mentors-section" className="py-24 bg-zinc-50 border-b border-zinc-200/50 relative overflow-hidden">
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

        {/* Carousel Container */}
        <div className="relative px-4 sm:px-8 max-w-6xl mx-auto">
          {/* Navigation Arrows */}
          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-500 shadow-md transition-all cursor-pointer -ml-2 sm:-ml-4 focus:outline-none"
                aria-label="Previous mentor"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:text-emerald-600 hover:border-emerald-500 shadow-md transition-all cursor-pointer -mr-2 sm:-mr-4 focus:outline-none"
                aria-label="Next mentor"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Masked Slider Viewport */}
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6 transition-transform duration-500 ease-out"
              animate={{ x: `calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * 16}px)` }}
            >
              {mentorList.map((mentor, index) => (
                <div
                  key={index}
                  className="flex-shrink-0"
                  style={{
                    width: `calc(${100 / itemsPerPage}% - ${(16 * (itemsPerPage - 1)) / itemsPerPage}px)`
                  }}
                >
                  <div className="group h-full flex flex-col bg-white rounded-3xl border border-zinc-200/60 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-center">
                    {/* Avatar Frame */}
                    <div className="relative mx-auto h-32 w-32 mb-6 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-emerald-400 transition-all duration-300">
                      <img
                        src={mentor.image}
                        alt={mentor.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Identity info */}
                    <div className="space-y-2 flex-grow flex flex-col">
                      <h3 className="text-md font-bold tracking-tight text-zinc-900 font-sans group-hover:text-emerald-600 transition-colors">
                        {mentor.name}
                      </h3>
                      
                      {/* Institution badge */}
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-[10px] sm:text-[11px] font-bold text-emerald-700 uppercase tracking-wide mx-auto max-w-full">
                        <GraduationCap className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{mentor.institution}</span>
                      </div>

                      <p className="text-zinc-400 text-xs font-mono font-medium pt-1">
                        {mentor.qualification}
                      </p>

                      <p className="text-zinc-500 text-xs leading-relaxed max-w-xs mx-auto pt-3 border-t border-zinc-200/50 mt-4 flex-grow">
                        {mentor.roleDescription}
                      </p>
                    </div>

                    {/* Bottom tag */}
                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-emerald-600 font-semibold text-xs cursor-pointer hover:underline">
                      <Award className="h-3.5 w-3.5" /> Certified Counselor
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicator */}
          {totalSlides > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentIndex === idx ? "w-6 bg-emerald-600" : "w-2 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

