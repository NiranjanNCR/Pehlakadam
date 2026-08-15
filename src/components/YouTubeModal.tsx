import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface YouTubeModalProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function YouTubeModal({ videoUrl, isOpen, onClose }: YouTubeModalProps) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="youtube-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 p-3 pt-14 pb-4 sm:p-6 backdrop-blur-sm"
        >
          <motion.div
            id="youtube-modal-content"
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl sm:rounded-3xl bg-zinc-950 shadow-2xl border border-zinc-800"
          >
            {/* Header / Close button */}
            <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10">
              <button
                id="close-youtube-modal"
                onClick={onClose}
                className="rounded-full bg-black/60 p-2 sm:p-2.5 text-zinc-400 hover:bg-black/80 hover:text-white transition-colors duration-200 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="aspect-video w-full">
              <iframe
                id="youtube-iframe"
                src={videoUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              ></iframe>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

