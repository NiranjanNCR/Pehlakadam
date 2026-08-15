import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { 
  X, 
  ShieldAlert, 
  FileText, 
  Lock, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  BookOpen,
  Layers,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF.js worker
if (typeof window !== "undefined") {
  // Use cloudflare CDN worker matching the installed version, or unpkg
  const version = pdfjsLib.version || "4.10.38";
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
}

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
  const [loadingProgress, setLoadingProgress] = useState("Initializing secure document stream...");
  const [error, setError] = useState<string | null>(null);
  
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return 0.85;
    }
    return 1.15;
  });
  const [rotation, setRotation] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"continuous" | "single">("continuous");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rawTextFallback, setRawTextFallback] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderTasksRef = useRef<Map<number, any>>(new Map());

  // 1. Fetch & Load Document
  useEffect(() => {
    if (!isOpen) {
      setPdfDoc(null);
      setNumPages(0);
      setCurrentPage(1);
      setError(null);
      setRawTextFallback(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);
    setRawTextFallback(null);
    setLoadingProgress("Loading document bytes...");

    async function loadPdfDocument() {
      try {
        let uint8Data: Uint8Array | null = null;

        // Case A: Direct Base64 provided
        if (fileData && fileData.trim().length > 0) {
          try {
            let base64 = fileData;
            if (base64.includes("base64,")) {
              base64 = base64.split("base64,")[1];
            }
            const binaryString = window.atob(base64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            uint8Data = bytes;
          } catch (b64Err) {
            console.warn("[PdfViewer] Base64 decoding failed:", b64Err);
          }
        }

        // Case B: Fetch from URL
        if (!uint8Data && pdfUrl) {
          setLoadingProgress("Fetching document stream from server...");
          const res = await fetch(pdfUrl, {
            headers: {
              "Accept": "application/pdf, application/octet-stream, */*"
            }
          });
          
          if (!res.ok) {
            throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
          }

          const arrayBuffer = await res.arrayBuffer();
          uint8Data = new Uint8Array(arrayBuffer);
        }

        if (!uint8Data || uint8Data.length === 0) {
          throw new Error("No readable document data received.");
        }

        // Check if data starts with %PDF-
        const header = String.fromCharCode(...uint8Data.slice(0, 5));
        if (header !== "%PDF-") {
          // If it's a text-based handbook
          const decoder = new TextDecoder("utf-8");
          const textContent = decoder.decode(uint8Data);
          if (isMounted) {
            setRawTextFallback(textContent);
            setLoading(false);
          }
          return;
        }

        setLoadingProgress("Parsing PDF document structure...");
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Data,
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
          cMapPacked: true,
        });

        const loadedDoc = await loadingTask.promise;

        if (isMounted) {
          setPdfDoc(loadedDoc);
          setNumPages(loadedDoc.numPages);
          setCurrentPage(1);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("[PdfViewer] Error loading PDF:", err);
        if (isMounted) {
          setError(err.message || "Failed to render PDF document.");
          setLoading(false);
        }
      }
    }

    loadPdfDocument();

    return () => {
      isMounted = false;
      // Cancel active renders
      renderTasksRef.current.forEach(task => {
        try { task.cancel(); } catch (_) {}
      });
      renderTasksRef.current.clear();
    };
  }, [isOpen, pdfUrl, fileData]);

  // 2. Render Page onto Canvas
  const renderPage = useCallback(async (pageNum: number, canvas: HTMLCanvasElement) => {
    if (!pdfDoc) return;

    // Cancel existing render task for this page if running
    if (renderTasksRef.current.has(pageNum)) {
      try {
        renderTasksRef.current.get(pageNum).cancel();
      } catch (_) {}
      renderTasksRef.current.delete(pageNum);
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      // Use higher DPR for Retina/Super AMOLED phone screens to eliminate all blur
      const dpr = Math.max(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({ scale: scale * dpr, rotation });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;
      canvas.style.maxWidth = "100%";
      canvas.style.objectFit = "contain";

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTasksRef.current.set(pageNum, renderTask);

      await renderTask.promise;
      renderTasksRef.current.delete(pageNum);
    } catch (err: any) {
      if (err?.name !== "RenderingCancelledException") {
        console.error(`[PdfViewer] Error rendering page ${pageNum}:`, err);
      }
    }
  }, [pdfDoc, scale, rotation]);

  // Trigger render when scale, rotation, viewMode or doc changes
  useEffect(() => {
    if (!pdfDoc || loading) return;

    if (viewMode === "single") {
      const canvas = canvasRefs.current.get(currentPage);
      if (canvas) {
        renderPage(currentPage, canvas);
      }
    } else {
      // Continuous: render all visible pages
      for (let p = 1; p <= numPages; p++) {
        const canvas = canvasRefs.current.get(p);
        if (canvas) {
          renderPage(p, canvas);
        }
      }
    }
  }, [pdfDoc, scale, rotation, viewMode, currentPage, numPages, loading, renderPage]);

  // Scroll listener for continuous mode to update page indicator
  const handleScroll = () => {
    if (viewMode !== "continuous" || !containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    
    let activePage = 1;
    canvasRefs.current.forEach((canvas, pageNum) => {
      if (canvas) {
        const offsetTop = canvas.offsetTop - container.offsetTop;
        if (scrollTop >= offsetTop - 120) {
          activePage = pageNum;
        }
      }
    });
    setCurrentPage(activePage);
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setScale(1.2);
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const nextP = currentPage - 1;
      setCurrentPage(nextP);
      if (viewMode === "continuous") {
        const canvas = canvasRefs.current.get(nextP);
        if (canvas && containerRef.current) {
          canvas.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      const nextP = currentPage + 1;
      setCurrentPage(nextP);
      if (viewMode === "continuous") {
        const canvas = canvasRefs.current.get(nextP);
        if (canvas && containerRef.current) {
          canvas.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          id="pdf-viewer-overlay"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-2 pt-14 pb-2 sm:p-4 bg-zinc-950/85 backdrop-blur-md overflow-hidden select-none"
          onContextMenu={(e) => e.preventDefault()}
        >
          <motion.div
            id="pdf-viewer-content"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", duration: 0.35 }}
            className={`relative w-full ${isFullscreen ? "h-[100dvh] max-w-none rounded-none" : "max-w-5xl h-[calc(100dvh-4.5rem)] sm:h-[92vh] rounded-2xl sm:rounded-3xl"} bg-zinc-900 border border-zinc-700/60 shadow-2xl overflow-hidden flex flex-col font-sans`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* 1. Header Bar */}
            <div className="bg-zinc-950 text-white px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden min-w-0">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      {category || "In-App Reader"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> Read-Only
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white truncate leading-tight">
                    {title || "PDF Document Reader"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  onClick={() => setIsFullscreen(prev => !prev)}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg sm:rounded-xl border border-zinc-800 transition-all cursor-pointer hidden sm:flex items-center justify-center"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  id="close-pdf-modal-btn"
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg sm:rounded-xl border border-zinc-800 transition-all cursor-pointer"
                  aria-label="Close PDF Viewer"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* 2. Interactive Reader Toolbar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300 shrink-0">
              {/* Pagination Controls */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || loading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <span className="font-mono text-[11px] sm:text-xs text-zinc-300 font-semibold px-2">
                  Page <strong className="text-emerald-400">{currentPage}</strong> of <strong className="text-zinc-400">{numPages || 1}</strong>
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage >= numPages || loading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none text-white transition-all cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>

              {/* View & Zoom Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* View Mode Toggle */}
                <button
                  onClick={() => setViewMode(prev => prev === "continuous" ? "single" : "continuous")}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    viewMode === "continuous" 
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300" 
                      : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  }`}
                  title="Toggle Layout"
                >
                  <Layers className="h-3 w-3" />
                  <span className="hidden sm:inline">{viewMode === "continuous" ? "Continuous Scroll" : "Single Page"}</span>
                </button>

                {/* Zoom Out */}
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5 || loading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {/* Zoom Level Indicator / Reset */}
                <button
                  onClick={handleResetZoom}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-mono text-[10px] sm:text-xs font-bold text-zinc-300 transition-all cursor-pointer"
                  title="Reset Zoom"
                >
                  {Math.round(scale * 100)}%
                </button>

                {/* Zoom In */}
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0 || loading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-white transition-all cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                {/* Rotate */}
                <button
                  onClick={handleRotate}
                  disabled={loading}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  title="Rotate 90°"
                >
                  <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* 3. Security Notice Banner */}
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-6 py-1.5 flex items-center justify-between text-amber-300 text-[10px] sm:text-xs font-medium shrink-0">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="leading-tight">
                  <strong>Protected In-App Document:</strong> Direct downloading and printing are restricted by system policy.
                </span>
              </div>
            </div>

            {/* 4. PDF Reader Canvas Area */}
            <div 
              ref={containerRef}
              onScroll={handleScroll}
              className="flex-1 bg-zinc-950 relative overflow-auto flex flex-col items-center p-3 sm:p-6"
            >
              {loading ? (
                <div className="my-auto text-center p-8 space-y-4 max-w-sm">
                  <div className="relative w-12 h-12 mx-auto">
                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-white font-bold text-sm">Loading Document</h4>
                    <p className="text-zinc-400 text-xs">{loadingProgress}</p>
                  </div>
                </div>
              ) : error ? (
                <div className="my-auto text-center p-8 max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-400 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Document Viewer Notice</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{error}</p>
                  </div>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry Loading
                  </button>
                </div>
              ) : rawTextFallback ? (
                // Clean structured text handbook fallback
                <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-4 text-zinc-200 text-left my-auto shadow-xl">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{category || "Study Material"}</span>
                      <h3 className="text-lg font-bold text-white">{title}</h3>
                    </div>
                    <FileText className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="font-sans text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-2">
                    {rawTextFallback}
                  </div>
                </div>
              ) : (
                // PDF Canvas Pages
                <div className="space-y-6 flex flex-col items-center w-full my-auto">
                  {viewMode === "single" ? (
                    <div 
                      key={`page-${currentPage}`}
                      className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-zinc-800"
                    >
                      <canvas 
                        ref={(el) => {
                          if (el) canvasRefs.current.set(currentPage, el);
                          else canvasRefs.current.delete(currentPage);
                        }}
                        className="block max-w-full"
                      />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-zinc-950/75 backdrop-blur-sm text-white font-mono text-[9px] rounded font-bold">
                        Page {currentPage} of {numPages}
                      </div>
                    </div>
                  ) : (
                    Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
                      <div 
                        key={`page-${pageNum}`}
                        className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-zinc-800 transition-transform duration-200"
                      >
                        <canvas 
                          ref={(el) => {
                            if (el) canvasRefs.current.set(pageNum, el);
                            else canvasRefs.current.delete(pageNum);
                          }}
                          className="block max-w-full"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-zinc-950/75 backdrop-blur-sm text-white font-mono text-[9px] rounded font-bold">
                          Page {pageNum} of {numPages}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 5. Modal Footer */}
            <div className="bg-zinc-950 px-3 sm:px-6 py-2.5 sm:py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-zinc-300 text-[11px] sm:text-xs">
                  Pehlakadam Knowledge & Career Portal
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-1 sm:py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg sm:rounded-xl text-[11px] sm:text-xs transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
