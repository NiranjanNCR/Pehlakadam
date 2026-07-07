import NavigationBar from "../NavigationBar";
import ContactForm from "../ContactForm";
import Footer from "../Footer";
import { motion } from "motion/react";

export default function Contact() {
  return (
    <motion.div
      id="contact-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-zinc-50 flex flex-col justify-between"
    >
      <NavigationBar />
      <div className="flex-grow">
        <ContactForm />
      </div>
      <Footer />
    </motion.div>
  );
}
