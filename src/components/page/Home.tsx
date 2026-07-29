import HeroSection from "../HeroSection";
import HomeSecOne from "../HomeSecOne";
import HomeSecTwo from "../HomeSecTwo";
import Industry from "../Industry";
import ContactForm from "../ContactForm";
import NavigationBar from "../NavigationBar";
import Footer from "../Footer";
import Mentors from "../Mentors";
import TestimonyCarousel from "../TestimonyCarousel";
import { motion } from "motion/react";

export default function Home() {
  return (
    <motion.div
      id="home-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-zinc-50"
    >
      <NavigationBar />
      <HeroSection />
      <HomeSecOne />
      <HomeSecTwo />
      <Industry />
      <Mentors />
      <TestimonyCarousel />
      <ContactForm />
      <Footer />
    </motion.div>
  );
}
