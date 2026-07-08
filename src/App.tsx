import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/page/Home";
import About from "./components/page/About";
import Explore from "./components/page/Explore";
import Resources from "./components/page/Resources";
import Contact from "./components/page/Contact";
import Programs from "./components/page/Programs";
import AdminSubmissions from "./components/page/AdminSubmissions";
import Diagnostics from "./components/page/Diagnostics";
import AnnouncementBanner from "./components/AnnouncementBanner";
import AutoTriggerForm from "./components/AutoTriggerForm";

export default function App() {
  return (
    <BrowserRouter>
      <div id="pehlakadam-app-root" className="flex flex-col min-h-screen">
        <AnnouncementBanner />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/programs/*" element={<Programs />} />
          <Route path="/diagnostics" element={<Diagnostics />} />
          <Route path="/admin" element={<AdminSubmissions />} />
          <Route path="/resources/admin" element={<AdminSubmissions />} />
        </Routes>
        <AutoTriggerForm />
      </div>
    </BrowserRouter>
  );
}
