import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BriefingVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function BriefingVideoModal({ isOpen, onClose, videoUrl }: BriefingVideoModalProps) {
  if (typeof document === "undefined") return null;

  // Format the video URL safely for iframe embedding
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    let cleanUrl = url.trim();

    // YouTube checks
    if (cleanUrl.includes("youtube.com/watch?v=")) {
      const videoId = cleanUrl.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (cleanUrl.includes("youtu.be/")) {
      const videoId = cleanUrl.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (cleanUrl.includes("youtube.com/embed/")) {
      if (!cleanUrl.includes("autoplay=1")) {
        cleanUrl += (cleanUrl.includes("?") ? "&" : "?") + "autoplay=1";
      }
      return cleanUrl;
    }

    // Vimeo checks
    if (cleanUrl.includes("vimeo.com/")) {
      const videoId = cleanUrl.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }

    return cleanUrl;
  };

  const embedUrl = getEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl && (videoUrl.endsWith(".mp4") || videoUrl.endsWith(".webm") || videoUrl.endsWith(".ogg"));

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="briefing-video-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            id="briefing-video-content"
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl aspect-video rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <button
              id="close-briefing-video-btn"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white transition-all duration-200 border border-white/10 hover:scale-105 active:scale-95 cursor-pointer"
              aria-label="Close video player"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Player Render */}
            {isDirectVideo ? (
              <video
                id="direct-video-player"
                src={videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            ) : embedUrl ? (
              <iframe
                id="iframe-video-player"
                src={embedUrl}
                title="Pehlakadam Briefing Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <div id="no-video-alert" className="w-full h-full flex flex-col items-center justify-center text-zinc-400 p-6 text-center">
                <p className="text-lg font-bold text-white mb-1">No video stream link configured</p>
                <p className="text-sm">Please provide a valid YouTube, Vimeo, or MP4 link via the advisor dashboard.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
