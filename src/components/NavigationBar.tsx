import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Compass, CalendarCheck } from "lucide-react";
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
    { name: "6th - 8th Std Student", path: "/programs/program1" },
    { name: "9th - 10th Std Student", path: "/programs/program2" },
    { name: "11th - 12th Std Student", path: "/programs/program3" },
    { name: "Graduate Student", path: "/programs/program4" },
    { name: "Generalist to Specialist", path: "/programs/program6" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/85 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Link 
          id="nav-logo-link"
          to="/" 
          className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-250">
            <Compass className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-zinc-950 font-sans block leading-tight">
              PEHLAKADAM
            </span>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block -mt-0.5">
              N & M MENTO GROUP
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-semibold transition-colors duration-200 ${
              isActive("/") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`text-sm font-semibold transition-colors duration-200 ${
              isActive("/about") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            About
          </Link>

          {/* Programs Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              onMouseEnter={() => setDropdownOpen(true)}
              className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-200 ${
                isActive("/programs") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
              }`}
            >
              Programs
              <ChevronDown className={`h-4 w-4 transition-transform duration-250 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 rounded-2xl bg-white border border-zinc-200 p-2 shadow-xl"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 border-8 border-transparent border-b-white"></div>
                  {programs.map((prog, index) => (
                    <Link
                      key={index}
                      to={prog.path}
                      onClick={() => setDropdownOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150 ${
                        location.pathname === prog.path
                          ? "bg-emerald-50 text-emerald-700"
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
            to="/resources"
            className={`text-sm font-semibold transition-colors duration-200 ${
              isActive("/resources") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Resources
          </Link>

          <Link
            to="/contact"
            className={`text-sm font-semibold transition-colors duration-200 ${
              isActive("/contact") ? "text-emerald-600" : "text-zinc-600 hover:text-emerald-600"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Action Button & Menu Icon */}
        <div className="hidden md:flex items-center gap-4">
          <PaymentModal />
        </div>

        <button
          id="nav-mobile-menu-toggle"
          onClick={toggleMenu}
          className="rounded-xl border border-zinc-200 p-2 text-zinc-600 hover:bg-zinc-50 md:hidden"
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
            className="border-t border-zinc-200 bg-white md:hidden overflow-hidden"
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
                to="/resources"
                onClick={toggleMenu}
                className={`text-base font-semibold py-1.5 ${
                  isActive("/resources") ? "text-emerald-600" : "text-zinc-700"
                }`}
              >
                Resources
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
