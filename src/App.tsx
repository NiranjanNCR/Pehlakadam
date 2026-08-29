import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./components/page/Home";
import About from "./components/page/About";
import Explore from "./components/page/Explore";
import Resources from "./components/page/Resources";
import Contact from "./components/page/Contact";
import Programs from "./components/page/Programs";
import AdminSubmissions from "./components/page/AdminSubmissions";
import Diagnostics from "./components/page/Diagnostics";
import Courses from "./components/page/Courses";
import StudentDashboard from "./components/page/StudentDashboard";
import TermsAndPolicies from "./components/page/TermsAndPolicies";
import AnnouncementBanner from "./components/AnnouncementBanner";

export default function App() {
  useEffect(() => {
    fetch("/api/system-stats")
      .then((res) => {
        if (res.ok) return res.json();
      })
      .then((data) => {
        if (data) {
          const title = data.seoTitle || "Pehlakadam - Best Career Counselling & Personality Development";
          const desc = data.seoDescription || "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics, and weekly tips.";
          const keywords = data.seoKeywords || "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam";
          const author = data.seoAuthor || "Pehlakadam";

          document.title = title;

          // 🌟 Dynamic Favicon Update
          const favicon = data.faviconData || data.faviconUrl;
          if (favicon) {
            const updateFavicon = (iconHref: string) => {
              const links = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
              if (links.length > 0) {
                links.forEach((link) => {
                  link.href = iconHref;
                });
              } else {
                const newLink = document.createElement("link");
                newLink.rel = "icon";
                newLink.href = iconHref;
                document.head.appendChild(newLink);
              }
            };
            updateFavicon(favicon);
          }

          const updateMeta = (name: string, value: string, isProperty = false) => {
            const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
            let element = document.querySelector(selector);
            if (!element) {
              element = document.createElement("meta");
              if (isProperty) {
                element.setAttribute("property", name);
              } else {
                element.setAttribute("name", name);
              }
              document.head.appendChild(element);
            }
            element.setAttribute("content", value);
          };

          updateMeta("description", desc);
          updateMeta("keywords", keywords);
          updateMeta("author", author);
          updateMeta("og:title", title, true);
          updateMeta("og:description", desc, true);
        }
      })
      .catch((err) => console.error("Error loading SEO configurations:", err));
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <div id="pehlakadam-app-root" className="flex flex-col min-h-screen">
          <AnnouncementBanner />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/*" element={<StudentDashboard />} />
            <Route path="/my-learning" element={<StudentDashboard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/programs/*" element={<Programs />} />
            <Route path="/diagnostics" element={<Diagnostics />} />
            <Route path="/terms" element={<TermsAndPolicies />} />
            <Route path="/privacy" element={<TermsAndPolicies />} />
            <Route path="/refund-policy" element={<TermsAndPolicies />} />
            <Route path="/legal" element={<TermsAndPolicies />} />
            <Route path="/admin" element={<AdminSubmissions />} />
            <Route path="/resources/admin" element={<AdminSubmissions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

