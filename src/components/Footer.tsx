import { Link } from "react-router-dom";
import { Instagram, Youtube, MessageSquare, Compass, ArrowUpRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const programs = [
    { name: "DISC Assessment", desc: "Dominance, Influence, Steadiness" },
    { name: "Myers-Briggs Type Indicator (MBTI)", desc: "16 Psychological Personalities" },
    { name: "Personality Factor Questionnaire", desc: "16PF Career matching" },
    { name: "Eysenck Personality Inventory", desc: "EPI Temperament scales" },
    { name: "Enneagram Core Test", desc: "9 Interconnected Personality Types" },
    { name: "Caliper Profile", desc: "Job performance matching" },
    { name: "Minnesota Multiphasic Test", desc: "MMPI Clinical Insights" },
  ];

  return (
    <footer id="main-footer" className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Section 1: About Us */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-500/10">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white font-sans block leading-none">
                  PEHLAKADAM
                </span>
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mt-0.5">
                  N & M MENTO GROUP
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
              Welcome to <strong>“PEHLAKADAM”</strong>, your trusted companion in unlocking your true potential. Our mission is to empower individuals to transform their lives through comprehensive personality development, expert career guidance, and actionable self-improvement strategies.
            </p>
            
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all hover:scale-105"
                title="Follow on Instagram"
              >
                <Instagram className="h-4.5 w-4.5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all hover:scale-105"
                title="Subscribe on Youtube"
              >
                <Youtube className="h-4.5 w-4.5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all hover:scale-105"
                title="Chat on Whatsapp"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>

          {/* Section 2: Programs List */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Scientific Diagnostics
            </h3>
            <ul className="space-y-3.5">
              {programs.map((prog, index) => (
                <li key={index} className="group flex items-start gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  <div>
                    <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors block">
                      {prog.name}
                    </span>
                    <span className="text-[10px] text-zinc-600 block mt-0.5">
                      {prog.desc}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Short Links & Support */}
          <div className="md:col-span-3 flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Navigation
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  Home Page
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  Resources Library
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  Contact Counselor
                </Link>
              </li>
            </ul>

            <div className="mt-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              <p className="font-semibold text-white mb-1">Weekly Career Tips</p>
              <p className="text-zinc-500 leading-normal mb-3">
                Get psychometric test updates and expert study plans directly.
              </p>
              <div className="flex gap-1.5">
                <input
                  type="email"
                  placeholder="name@email.com"
                  className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full"
                />
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3 py-1.5 font-bold transition-colors cursor-pointer">
                  Join
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-mono">
            &copy; {currentYear} PEHLAKADAM. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600 font-mono tracking-widest">
            ALL RIGHTS RESERVED AT N & M MENTO
          </p>
        </div>
      </div>
    </footer>
  );
}
