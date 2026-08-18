import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Compass, CalendarCheck, GraduationCap } from "lucide-react";
import PaymentModal from "./PaymentModal";
import { motion, AnimatePresence } from "motion/react";

export default function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const programs = [
    { name: "Primary Kudos", path: "/programs/program5" },
    { name: "6-8 Grade Student", path: "/programs/program1" },
    { name: "8-10 Grade Student", path: "/programs/program2" },
    { name: "11-12 Grade Student", path: "/programs/program3" },
    { name: "UG/Graduate/PG", path: "/programs/program4" },
    { name: "Generalist to Specialist", path: "/programs/program6" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/85 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        
        {/* Brand Logo */}
        <Link 
          id="nav-logo-link"
          to="/" 
          className="flex items-center gap-0 group hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-600/30 p-0.5 group-hover:scale-105 transition-transform duration-250 shrink-0">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <span className="text-base font-black tracking-wider animate-pulse font-sans">PK</span>
            </div>
          </div>
          <div className="flex flex-col items-center ml-1">
            <span className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-950 font-sans block leading-none">
              PEHLAKADAM
            </span>
            <div className="flex items-center justify-center gap-1 text-zinc-500 text-[8px] sm:text-[8.5px] font-bold tracking-wide italic select-none mt-1 w-full">
              <svg className="w-5 sm:w-7 h-2 opacity-85 text-emerald-600" viewBox="0 0 48 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 5 1 L 0 4 L 5 7 M 0 4 H 48" stroke="url(#logoLeftGradHeader)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="logoLeftGradHeader" x1="48" y1="4" x2="0" y2="4" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
              <span className="shrink-0 text-zinc-500 font-medium whitespace-nowrap">Choose best Get best</span>
              <svg className="w-5 sm:w-7 h-2 opacity-85 text-emerald-600" viewBox="0 0 48 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 43 1 L 48 4 L 43 7 M 0 4 H 48" stroke="url(#logoRightGradHeader)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="logoRightGradHeader" x1="0" y1="4" x2="48" y2="4" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="1"/>
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-2.5 xl:gap-4 2xl:gap-6 shrink-0">
          <Link
            to="/"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive("/") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive("/about") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            About
          </Link>

          {/* Programs Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={toggleDropdown}
              onMouseEnter={() => setDropdownOpen(true)}
              className={`flex items-center gap-1 text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
                isActive("/programs") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
              }`}
            >
              Programs
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-250 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl bg-white border border-zinc-200 p-2 shadow-xl z-50"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 border-8 border-transparent border-b-white"></div>
                  {programs.map((prog, index) => (
                    <Link
                      key={index}
                      to={prog.path}
                      onClick={() => setDropdownOpen(false)}
                      className={`block rounded-xl px-4 py-2.5 text-xs xl:text-sm font-medium transition-all duration-150 ${
                        location.pathname === prog.path
                          ? "bg-emerald-50 text-emerald-700 font-semibold"
                          : "text-zinc-700 hover:bg-zinc-50 hover:text-emerald-600"
                      }`}
                    >
                      {prog.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/courses"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 flex items-center gap-1 whitespace-nowrap shrink-0 ${
              isActive("/courses") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Courses
            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">LMS</span>
          </Link>

          <Link
            to="/resources"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive("/resources") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Resources
          </Link>

          <Link
            to="/diagnostics"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive("/diagnostics") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Diagnostics
          </Link>

          <Link
            to="/dashboard"
            className={`text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border whitespace-nowrap shrink-0 ${
              isActive("/dashboard") || isActive("/student-dashboard") || isActive("/my-learning")
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/contact"
            className={`text-xs xl:text-sm font-semibold transition-colors duration-200 whitespace-nowrap shrink-0 ${
              isActive("/contact") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Button & Menu Icon */}
        <div className="hidden lg:flex items-center shrink-0">
          <PaymentModal 
            buttonText="Enroll Now"
            buttonClassName="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-emerald-600 px-3.5 py-2 text-xs xl:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all duration-200 shrink-0 cursor-pointer"
          />
        </div>

        <button
          id="nav-mobile-menu-toggle"
          onClick={toggleMenu}
          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 lg:hidden shrink-0 cursor-pointer"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>


      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-200 bg-white lg:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-6 font-sans">
              <Link
                to="/"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                Home
              </Link>

              <Link
                to="/about"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/about") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                About
              </Link>

              {/* Programs Submenu */}
              <div className="py-1.5">
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Academic Programs
                </p>
                <div className="flex flex-col gap-3 pl-4 border-l-2 border-emerald-500">
                  {programs.map((prog, index) => (
                    <Link
                      key={index}
                      to={prog.path}
                      onClick={toggleMenu}
                      className={`text-sm font-medium ${
                        location.pathname === prog.path ? "text-emerald-600 font-semibold" : "text-zinc-600"
                      }`}
                    >
                      {prog.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link
                to="/courses"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 flex items-center justify-between ${
                  isActive("/courses") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                <span>Courses</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">LMS Academy</span>
              </Link>

              <Link
                to="/resources"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/resources") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                Resources
              </Link>

              <Link
                to="/diagnostics"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/diagnostics") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                Diagnostics
              </Link>

              <Link
                to="/dashboard"
                onClick={toggleMenu}
                className={`text-base font-bold py-2 px-3 rounded-xl flex items-center justify-between ${
                  isActive("/dashboard") || isActive("/student-dashboard") || isActive("/my-learning")
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-900 border border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Student Dashboard</span>
                </div>
                <span className="text-[10px] uppercase font-black bg-white/20 px-2 py-0.5 rounded">My Portal</span>
              </Link>

              <Link
                to="/contact"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/contact") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                Contact
              </Link>


              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <PaymentModal />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
