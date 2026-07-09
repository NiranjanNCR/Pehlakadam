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
            <Link to="/" className="flex items-center gap-0 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-600/30 p-0.5 group-hover:scale-105 transition-transform duration-250">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm shadow-emerald-500/10">
                  <span className="text-sm font-black tracking-wider animate-pulse font-sans">PK</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-black tracking-tight text-white font-sans block leading-none">
                  PEHLAKADAM
                </span>
                <div className="flex items-center justify-center gap-1 text-[7.5px] font-bold tracking-wide italic select-none mt-1 w-full text-zinc-500">
                  <svg className="w-6.5 h-2 opacity-85 text-emerald-500" viewBox="0 0 48 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 5 1 L 0 4 L 5 7 M 0 4 H 48" stroke="url(#logoLeftGradFooter)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="logoLeftGradFooter" x1="48" y1="4" x2="0" y2="4" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="shrink-0 font-medium">Choose best Get best</span>
                  <svg className="w-6.5 h-2 opacity-85 text-emerald-500" viewBox="0 0 48 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 43 1 L 48 4 L 43 7 M 0 4 H 48" stroke="url(#logoRightGradFooter)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="logoRightGradFooter" x1="0" y1="4" x2="48" y2="4" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
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
                <li key={index}>
                  <Link to="/diagnostics" className="group flex items-start gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                    <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <div>
                      <span className="font-semibold text-zinc-400 group-hover:text-white transition-colors block">
                        {prog.name}
                      </span>
                      <span className="text-[10px] text-zinc-600 block mt-0.5">
                        {prog.desc}
                      </span>
                    </div>
                  </Link>
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
                <Link to="/diagnostics" className="text-zinc-500 hover:text-emerald-400 transition-colors">
                  Diagnostics Suite
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
          <p className="text-xs text-zinc-500 font-sans italic">
            Choose best Get best
          </p>
        </div>
      </div>
    </footer>
  );
}
