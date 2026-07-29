import React, { useState, useEffect } from "react";
import { X, ShieldAlert, FileText, Lock, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  category?: string;
  pdfUrl?: string;
  fileData?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  title,
  category,
  pdfUrl,
  fileData
}: PdfViewerModalProps) {
  const [loading, setLoading] = useState(true);
  const [embedSrc, setEmbedSrc] = useState<string>("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(false);

    if (fileData) {
      let src = fileData;
      if (!src.startsWith("data:")) {
        src = `data:application/pdf;base64,${fileData}`;
      }
      setEmbedSrc(`${src}#toolbar=0&navpanes=0&scrollbar=1`);
      setLoading(false);
    } else if (pdfUrl) {
      const fullUrl = pdfUrl.includes("#") ? pdfUrl : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`;
      setEmbedSrc(fullUrl);
      setLoading(false);
    } else {
      setError(true);
      setLoading(false);
    }
  }, [isOpen, pdfUrl, fileData]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/80 backdrop-blur-md"
        onContextMenu={(e) => e.preventDefault()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl h-[90vh] bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col font-sans select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Header Bar */}
          <div className="bg-zinc-950 text-white px-6 py-4 flex items-center justify-between gap-4 border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full">
                    {category || "In-App Reader"}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Download Restricted
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                  {title || "PDF Document Reader"}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-zinc-800 transition-all cursor-pointer shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 flex items-center justify-between text-amber-900 text-xs font-medium shrink-0">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Restricted Viewing Mode:</strong> Direct downloading and printing are disabled by system policy.
              </span>
            </div>
          </div>

          {/* PDF Frame */}
          <div className="flex-1 bg-zinc-100 relative overflow-hidden flex flex-col items-center justify-center">
            {loading ? (
              <div className="text-center p-8 space-y-3">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto" />
                <p className="text-zinc-600 font-bold text-xs">Loading secure document stream...</p>
              </div>
            ) : error ? (
              <div className="text-center p-8 max-w-md bg-white rounded-2xl border border-zinc-200 space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <h4 className="text-sm font-bold text-zinc-900">Document Reader Notice</h4>
                <p className="text-xs text-zinc-500">Document stream unavailable. Please contact your academic advisor.</p>
              </div>
            ) : (
              <iframe
                src={embedSrc}
                title={title}
                className="w-full h-full border-none"
                onContextMenu={(e) => e.preventDefault()}
              />
            )}
          </div>

          {/* Footer */}
          <div className="bg-white px-6 py-3 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="font-medium text-zinc-700">Pehlakadam Knowledge Portal</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
