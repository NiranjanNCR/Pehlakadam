import { useState, useEffect } from "react";
import { FileText, Play, Eye } from "lucide-react";
import BriefingVideoModal from "./BriefingVideoModal";
import PdfViewerModal from "./PdfViewerModal";

interface ProgramMediaSectionProps {
  programKey: string;
}

interface ProgramConfig {
  programKey: string;
  brochureUrl: string;
  brochureFileName: string;
  brochureFileData: string;
  videoUrl: string;
}

export default function ProgramMediaSection({ programKey }: ProgramMediaSectionProps) {
  const [config, setConfig] = useState<ProgramConfig | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/api/programs-config?_t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
          }
        });
        if (response.ok) {
          const data = await response.json();
          const match = data.find((c: any) => c.programKey === programKey);
          if (match) {
            setConfig(match);
          }
        }
      } catch (error) {
        console.error("Error fetching program configs:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConfig();

    const handleUpdate = () => {
      fetchConfig();
    };

    window.addEventListener("pehlakadam_programs_config_updated", handleUpdate);
    return () => {
      window.removeEventListener("pehlakadam_programs_config_updated", handleUpdate);
    };
  }, [programKey]);

  // View brochure in secure PDF viewer modal
  const handleViewBrochure = () => {
    setIsBrochureModalOpen(true);
  };

  const hasVideo = config && config.videoUrl;
  const currentVideoUrl = config?.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <div id={`program-media-${programKey}`} className="mt-6 space-y-3 font-sans w-full">
      <div className="grid grid-cols-2 gap-3.5">
        {/* 1. PDF View Brochure Button */}
        <button
          id={`btn-brochure-${programKey}`}
          onClick={handleViewBrochure}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 px-4 text-xs tracking-wide uppercase border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Eye className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>View Brochure</span>
        </button>

        {/* 2. Briefing Video Button */}
        <button
          id={`btn-video-${programKey}`}
          onClick={() => setIsVideoOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 text-xs tracking-wide uppercase transition-all duration-300 shadow-md hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Play className="h-4 w-4 fill-white shrink-0" />
          <span>Briefing Video</span>
        </button>
      </div>

      {/* Video Lightbox Modal overlay */}
      <BriefingVideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={currentVideoUrl}
      />

      {/* PDF Brochure Reader Modal overlay */}
      <PdfViewerModal
        isOpen={isBrochureModalOpen}
        onClose={() => setIsBrochureModalOpen(false)}
        title={`Pehlakadam Official Syllabus & Program Guide (${programKey})`}
        category={`Grade ${programKey} Track`}
        pdfUrl={config?.brochureUrl || `/api/programs/brochure/view/${programKey}`}
        fileData={config?.brochureFileData}
      />
    </div>
  );
}
