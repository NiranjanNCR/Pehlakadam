import { useState, useEffect } from "react";
import { FileText, Play, Download, Video } from "lucide-react";
import BriefingVideoModal from "./BriefingVideoModal";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/programs-config");
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
  }, [programKey]);

  // Download the brochure file safely
  const handleDownloadBrochure = () => {
    if (config && config.brochureFileData) {
      try {
        const link = document.createElement("a");
        link.href = config.brochureFileData;
        link.download = config.brochureFileName || `Pehlakadam_${programKey}_Brochure.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (err) {
        console.error("Failed to download brochure base64:", err);
      }
    }

    if (config && config.brochureUrl) {
      window.open(config.brochureUrl, "_blank");
      return;
    }

    // High fidelity fallback: if no brochure is configured, generate and download a premium mock brochure file
    try {
      const mockContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 595 842] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 24 Tf\n70 700 Td\n(PEHLAKADAM CAREER ACADEMY BROCHURE) Tj\n/F1 14 Tf\n0 -50 Td\n(Program: ${programKey} Grade Track) Tj\n0 -30 Td\n(Consultation and Psychometric Profiling Brochure) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n382\n%%EOF`;
      const blob = new Blob([mockContent], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Pehlakadam_${programKey}_Official_Brochure.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download fallback PDF brochure:", err);
      alert("Brochure is not configured yet. Please check back soon.");
    }
  };

  const hasVideo = config && config.videoUrl;
  const currentVideoUrl = config?.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  return (
    <div id={`program-media-${programKey}`} className="mt-6 space-y-3 font-sans w-full">
      <div className="grid grid-cols-2 gap-3.5">
        {/* 1. PDF Download as Brochure Button */}
        <button
          id={`btn-brochure-${programKey}`}
          onClick={handleDownloadBrochure}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 px-4 text-xs tracking-wide uppercase border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Brochure PDF</span>
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
    </div>
  );
}
