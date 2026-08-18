import { useState, useEffect } from "react";
import { Check, X, Play, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import YouTubeModal from "./YouTubeModal";
import FormModal from "./FormModal";
import PaymentModal from "./PaymentModal";
import { motion } from "motion/react";

export default function CartCourse() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const openModal = (url: string) => {
    setVideoUrl(url);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setVideoUrl("");
  };

  useEffect(() => {
    fetch("/api/programs-config")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to load configs");
      })
      .then((data) => {
        setConfigs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading pricing card configs:", err);
        setLoading(false);
      });
  }, []);

  const getCardDetails = (
    key: string,
    defaultTitle: string,
    defaultSubtitle: string,
    defaultOriginalPrice: string,
    defaultCurrentPrice: string,
    defaultFeatures: string[],
    defaultVideoUrl: string
  ) => {
    const config = configs.find((c) => c.programKey === key);
    
    const title = config?.title || defaultTitle;
    const subtitle = config?.subtitle || defaultSubtitle;
    const originalPrice = config?.originalPrice !== undefined ? config.originalPrice : defaultOriginalPrice;
    const currentPrice = config?.currentPrice || defaultCurrentPrice;
    const videoLink = config?.videoUrl || defaultVideoUrl;

    let featuresList: { name: string; included: boolean }[] = [];
    if (config?.features) {
      featuresList = config.features.split("\n").map((f: string) => {
        const line = f.trim();
        if (line.startsWith("-")) {
          return { name: line.substring(1).trim(), included: false };
        }
        return { name: line, included: true };
      }).filter((f: any) => f.name.length > 0);
    } else {
      featuresList = defaultFeatures.map((f) => {
        if (f.startsWith("-")) {
          return { name: f.substring(1).trim(), included: false };
        }
        return { name: f, included: true };
      });
    }

    return { title, subtitle, originalPrice, currentPrice, features: featuresList, videoUrl: videoLink };
  };

  const basicCard = getCardDetails(
    "card_basic",
    "Basic Career Success",
    "For Right Subjects & Insights",
    "₹15,000",
    "₹8,500",
    [
      "Intro session",
      "1 Counselling Session",
      "Detailed Career Report",
      "Career Path Recommendation",
      "Access Career bank",
      "1 Follow up Call",
      "College & Courses",
      "- Psychologist session"
    ],
    "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q"
  );

  const standardCard = getCardDetails(
    "card_standard",
    "Advanced Career Success",
    "For Optimal Career Decisions",
    "₹25,000",
    "₹18,500",
    [
      "Intro session",
      "2 Counselling Sessions",
      "Detailed Career Report",
      "Career Path Recommendation",
      "Access Career bank",
      "2 Follow up Calls",
      "College & Courses",
      "- Psychologist session"
    ],
    "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q"
  );

  const premiumCard = getCardDetails(
    "card_premium",
    "Full Career Coaching",
    "Complete Personal Excellence",
    "₹45,000",
    "₹35,000",
    [
      "Intro session",
      "3+ Counselling Sessions",
      "Detailed Career Report",
      "Career Path Recommendation",
      "Access Career bank",
      "Unlimited Follow up Calls",
      "College & Courses / Admissions",
      "Psychologist session"
    ],
    "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q"
  );

  return (
    <section id="pricing-section" className="py-20 bg-zinc-50 border-t border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full inline-block mb-4"
          >
            Plans & Pricing
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-zinc-950 font-sans sm:text-5xl"
          >
            Ideal Career Plans for Every Ambitious Individual
          </motion.h2>
        </div>

        {/* Free Consultation Banner */}
        <motion.div
          id="free-consultation-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full mb-4">
              <Sparkles className="h-3.5 w-3.5" /> Special Limited Offer
            </span>
            <h3 className="text-2xl md:text-3xl font-bold font-sans tracking-tight text-white mb-3 drop-shadow-sm">
              Book a 30-min Consultation With Our Expert
            </h3>
            <p className="text-emerald-100/80 leading-relaxed text-sm md:text-base">
              Our expert career advisors will assess your current standing and guide you towards the next steps, empowering you to plan your career strategically and turn your dreams and aspirations into reality.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-5 shrink-0 relative z-10">
            <div className="text-center md:text-right">
              <p className="text-sm text-emerald-300/90 font-medium">Original Consultation Value</p>
              <div className="flex items-baseline justify-center md:justify-end gap-2">
                <span className="text-zinc-400 line-through text-lg font-medium">₹4,000</span>
                <span className="text-3xl font-black text-emerald-400 font-sans">₹0</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FormModal />
              <button
                id="play-free-consultation-video"
                onClick={() => openModal("https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q")}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white transition-all hover:scale-110 active:scale-95"
                title="Watch Intro Video"
              >
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Basic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
          >
            <div className="p-8 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Basic</span>
                <UserCheck className="h-5 w-5 text-zinc-400" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 font-sans">{basicCard.title}</h4>
              <p className="text-sm text-zinc-500 mt-1">{basicCard.subtitle}</p>
              
              <div className="mt-6 flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black text-zinc-950 font-sans">{basicCard.currentPrice}</span>
                {basicCard.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-semibold">{basicCard.originalPrice}</span>
                )}
                <span className="text-xs text-zinc-500 font-medium font-sans">/ student</span>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <ul className="space-y-4">
                {basicCard.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feat.included ? (
                      <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feat.included ? "text-zinc-700 font-medium" : "text-zinc-400 line-through"}`}>
                      {feat.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-4">
              <div className="flex-grow">
                <PaymentModal 
                  planName={basicCard.title} 
                  planPrice={basicCard.currentPrice} 
                  defaultProgram="6-8 Grade Student" 
                  defaultPlan="Basic"
                  buttonText="Pay & Enroll"
                />
              </div>
              <button
                onClick={() => openModal(basicCard.videoUrl)}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-pointer"
                title="Watch Plan Details"
              >
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Card 2: Standard (Popular) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col bg-white rounded-3xl border-2 border-emerald-500 shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden relative scale-105 z-10"
          >
            <div className="bg-emerald-500 text-white py-1.5 px-4 text-center text-xs font-bold tracking-widest uppercase">
              Most Popular Plan
            </div>
            
            <div className="p-8 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Standard</span>
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 font-sans">{standardCard.title}</h4>
              <p className="text-sm text-zinc-500 mt-1">{standardCard.subtitle}</p>
              
              <div className="mt-6 flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black text-zinc-950 font-sans">{standardCard.currentPrice}</span>
                {standardCard.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-semibold">{standardCard.originalPrice}</span>
                )}
                <span className="text-xs text-zinc-500 font-medium font-sans">/ student</span>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <ul className="space-y-4">
                {standardCard.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feat.included ? (
                      <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feat.included ? "text-zinc-700 font-semibold" : "text-zinc-400 line-through"}`}>
                      {feat.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-4">
              <div className="flex-grow">
                <PaymentModal 
                  planName={standardCard.title} 
                  planPrice={standardCard.currentPrice} 
                  defaultProgram="11-12 Grade Student" 
                  defaultPlan="Standard"
                  buttonText="Pay & Enroll"
                />
              </div>
              <button
                onClick={() => openModal(standardCard.videoUrl)}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-pointer"
                title="Watch Plan Details"
              >
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </button>
            </div>
          </motion.div>

          {/* Card 3: Pro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden relative"
          >
            <div className="p-8 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Premium Pro</span>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold text-zinc-900 font-sans">{premiumCard.title}</h4>
              <p className="text-sm text-zinc-500 mt-1">{premiumCard.subtitle}</p>
              
              <div className="mt-6 flex items-baseline gap-2 flex-wrap">
                <span className="text-4xl font-black text-zinc-950 font-sans">{premiumCard.currentPrice}</span>
                {premiumCard.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through font-semibold">{premiumCard.originalPrice}</span>
                )}
                <span className="text-xs text-zinc-500 font-medium font-sans">/ student</span>
              </div>
            </div>

            <div className="p-8 flex-grow">
              <ul className="space-y-4">
                {premiumCard.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feat.included ? (
                      <Check className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-zinc-300 shrink-0 mt-0.5" />
                    )}
                    <span className={`text-sm ${feat.included ? "text-zinc-700 font-medium" : "text-zinc-400 line-through"}`}>
                      {feat.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-4">
              <div className="flex-grow">
                <PaymentModal 
                  planName={premiumCard.title} 
                  planPrice={premiumCard.currentPrice} 
                  defaultProgram="Generalist to Specialist" 
                  defaultPlan="Premium Pro"
                  buttonText="Pay & Enroll"
                />
              </div>
              <button
                onClick={() => openModal(premiumCard.videoUrl)}
                className="flex items-center justify-center h-12 w-12 rounded-full border border-zinc-200 bg-white text-zinc-600 hover:text-emerald-600 hover:border-emerald-200 transition-colors cursor-pointer"
                title="Watch Plan Details"
              >
                <Play className="h-4 w-4 fill-current ml-0.5" />
              </button>
            </div>
          </motion.div>

        </div>

      </div>

      {/* YouTube Modal */}
      <YouTubeModal videoUrl={videoUrl} isOpen={isOpen} onClose={closeModal} />
    </section>
  );
}
