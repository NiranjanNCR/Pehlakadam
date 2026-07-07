import { useState, useEffect } from "react";
import { Bell, X, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SessionUpdate } from "../types";

export default function AnnouncementBanner() {
  const [latestUpdate, setLatestUpdate] = useState<SessionUpdate | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchLatestUpdate = async () => {
      try {
        const response = await fetch("/api/updates");
        if (response.ok) {
          const updates: SessionUpdate[] = await response.json();
          if (updates && updates.length > 0) {
            // Sort to get the absolute newest update
            const newest = updates.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
            
            // Check if dismissed in sessionStorage
            const dismissedId = sessionStorage.getItem("pehlakadam_dismissed_update");
            if (dismissedId !== newest.id) {
              setLatestUpdate(newest);
              setIsVisible(true);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load latest announcement:", error);
      }
    };

    fetchLatestUpdate();
  }, []);

  const handleClose = () => {
    if (latestUpdate) {
      sessionStorage.setItem("pehlakadam_dismissed_update", latestUpdate.id);
    }
    setIsVisible(false);
  };

  if (!latestUpdate || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="announcement-banner-wrapper"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-emerald-600 text-white border-b border-emerald-500 overflow-hidden relative z-50 text-center"
      >
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 mx-auto text-xs sm:text-sm font-semibold">
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
            <Bell className="h-4 w-4 text-emerald-100 flex-shrink-0 animate-bounce" />
            <span className="text-emerald-100 font-mono font-bold uppercase tracking-wider text-[10px] bg-emerald-700 px-2 py-0.5 rounded mr-1">
              Live Session Alert:
            </span>
            <span className="font-sans line-clamp-1">
              {latestUpdate.message}
            </span>
          </div>

          <button
            id="dismiss-announcement-btn"
            onClick={handleClose}
            className="text-emerald-100 hover:text-white transition-colors p-1 rounded-full hover:bg-emerald-700/50 cursor-pointer"
            aria-label="Close Announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
