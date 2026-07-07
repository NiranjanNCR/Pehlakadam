import { Landmark, GraduationCap, Building2 } from "lucide-react";
import { motion } from "motion/react";

export default function Industry() {
  const organizations = [
    {
      name: "BITS PILANI",
      type: "Premier Technical Institution",
      color: "border-blue-200 bg-blue-50/50 text-blue-800",
      iconColor: "bg-blue-600 text-white",
      icon: GraduationCap,
    },
    {
      name: "PUNJABI UNIVERSITY",
      type: "State Academic University",
      color: "border-red-200 bg-red-50/50 text-red-800",
      iconColor: "bg-red-600 text-white",
      icon: Landmark,
    },
    {
      name: "HCL TECHNOLOGIES",
      type: "Global Tech Enterprise",
      color: "border-zinc-200 bg-zinc-50/50 text-zinc-800",
      iconColor: "bg-zinc-800 text-white",
      icon: Building2,
    },
  ];

  return (
    <section id="industry-background" className="py-20 bg-white border-b border-zinc-200/50">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold tracking-tight text-zinc-950 font-sans"
          >
            Formidable Mentorship Pedigree
          </motion.h2>
          <p className="text-zinc-500 text-xs sm:text-sm mt-2 uppercase tracking-widest font-mono">
            Direct expertise from leading academic & enterprise boards
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {organizations.map((org, idx) => {
            const Icon = org.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${org.color} shadow-sm hover:shadow-md transition-all`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${org.iconColor} shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-widest font-sans">
                    {org.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium uppercase mt-0.5">
                    {org.type}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
