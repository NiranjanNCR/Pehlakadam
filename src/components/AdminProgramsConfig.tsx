import { useState, ChangeEvent } from "react";
import { FileText, Play, Upload, Save, CheckCircle, RefreshCw, AlertCircle, HelpCircle, Eye } from "lucide-react";
import PdfViewerModal from "./PdfViewerModal";

interface ProgramConfig {
  programKey: string;
  brochureUrl: string;
  brochureFileName: string;
  brochureFileData: string;
  videoUrl: string;
  title?: string;
  subtitle?: string;
  originalPrice?: string;
  currentPrice?: string;
  features?: string;
}

interface AdminProgramsConfigProps {
  configs: ProgramConfig[];
  onRefresh: () => void;
}

// Map database program keys to user-friendly titles
const PROGRAM_KEY_TO_NAME: Record<string, string> = {
  "6-8": "6-8 Grade Student Page",
  "9-10": "8-10 Grade Student Page",
  "11-12": "11-12 Grade Student Page",
  graduate: "UG/Graduate/PG Page",
  kudos: "Primary Kudos Page",
  generalist: "Generalist to Specialist Page",
  "card_basic": "Pricing Card: Basic Plan",
  "card_standard": "Pricing Card: Standard Plan",
  "card_premium": "Pricing Card: Premium Plan"
};

export default function AdminProgramsConfig({ configs, onRefresh }: AdminProgramsConfigProps) {
  // Store saving states per programKey to provide feedback
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});
  const [successStates, setSuccessStates] = useState<Record<string, boolean>>({});
  const [localConfigs, setLocalConfigs] = useState<Record<string, ProgramConfig>>({});
  const [previewPdf, setPreviewPdf] = useState<{
    isOpen: boolean;
    title: string;
    category: string;
    pdfUrl?: string;
    fileData?: string;
  }>({
    isOpen: false,
    title: "",
    category: ""
  });

  // Ensure every program has local state initialized
  const getLocalConfig = (programKey: string, dbConfig?: ProgramConfig): ProgramConfig => {
    if (localConfigs[programKey]) {
      return localConfigs[programKey];
    }

    let defaultTitle = "";
    let defaultSubtitle = "";
    let defaultOriginalPrice = "";
    let defaultCurrentPrice = "";
    let defaultFeatures = "";
    let defaultVideoUrl = "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q";

    if (programKey === "card_basic") {
      defaultTitle = "Basic Career Success";
      defaultSubtitle = "For Right Subjects & Insights";
      defaultOriginalPrice = "₹15,000";
      defaultCurrentPrice = "₹8,500";
      defaultFeatures = "Intro session\n1 Counselling Session\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\n1 Follow up Call\nCollege & Courses";
    } else if (programKey === "card_standard") {
      defaultTitle = "Advanced Career Success";
      defaultSubtitle = "For Optimal Career Decisions";
      defaultOriginalPrice = "₹25,000";
      defaultCurrentPrice = "₹18,500";
      defaultFeatures = "Intro session\n2 Counselling Sessions\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\n2 Follow up Calls\nCollege & Courses";
    } else if (programKey === "card_premium") {
      defaultTitle = "Full Career Coaching";
      defaultSubtitle = "Complete Personal Excellence";
      defaultOriginalPrice = "₹45,000";
      defaultCurrentPrice = "₹35,000";
      defaultFeatures = "Intro session\n3+ Counselling Sessions\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\nUnlimited Follow up Calls\nCollege & Courses / Admissions\nPsychologist session";
    }

    const base = dbConfig || {
      programKey,
      brochureUrl: "",
      brochureFileName: "",
      brochureFileData: "",
      videoUrl: defaultVideoUrl,
      title: defaultTitle,
      subtitle: defaultSubtitle,
      originalPrice: defaultOriginalPrice,
      currentPrice: defaultCurrentPrice,
      features: defaultFeatures
    };

    return {
      ...base,
      title: base.title || defaultTitle,
      subtitle: base.subtitle || defaultSubtitle,
      originalPrice: base.originalPrice || defaultOriginalPrice,
      currentPrice: base.currentPrice || defaultCurrentPrice,
      features: base.features || defaultFeatures,
      videoUrl: base.videoUrl || defaultVideoUrl
    };
  };

  const updateLocalField = (programKey: string, field: keyof ProgramConfig, value: string) => {
    const current = getLocalConfig(programKey, configs.find(c => c.programKey === programKey));
    setLocalConfigs(prev => ({
      ...prev,
      [programKey]: {
        ...current,
        [field]: value
      }
    }));
    // Reset success badge on edit
    if (successStates[programKey]) {
      setSuccessStates(prev => ({ ...prev, [programKey]: false }));
    }
  };

  const handlePdfUpload = (programKey: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 12 * 1024 * 1024) {
      alert("File is too large! Maximum limit is 12MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const current = getLocalConfig(programKey, configs.find(c => c.programKey === programKey));
      setLocalConfigs(prev => ({
        ...prev,
        [programKey]: {
          ...current,
          brochureFileName: file.name,
          brochureFileData: base64Data,
          brochureUrl: "" // Clear url since we have direct file data
        }
      }));
    };
    reader.readAsDataURL(file);

    if (successStates[programKey]) {
      setSuccessStates(prev => ({ ...prev, [programKey]: false }));
    }
  };

  const handleSaveConfig = async (programKey: string) => {
    const dataToSave = getLocalConfig(programKey, configs.find(c => c.programKey === programKey));
    
    setSavingStates(prev => ({ ...prev, [programKey]: true }));
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const response = await fetch("/api/programs-config/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dataToSave)
      });

      if (response.ok) {
        setSuccessStates(prev => ({ ...prev, [programKey]: true }));
        try {
          localStorage.setItem("pehlakadam_programs_config_timestamp", Date.now().toString());
          window.dispatchEvent(new CustomEvent("pehlakadam_programs_config_updated", { detail: { programKey } }));
        } catch (e) {}
        onRefresh(); // Pull refreshed data
        setTimeout(() => {
          setSuccessStates(prev => ({ ...prev, [programKey]: false }));
        }, 4000);
      } else {
        const err = await response.json();
        alert(err.error || `Failed to save configuration for ${programKey}`);
      }
    } catch (err) {
      console.error("Error saving program config:", err);
      alert("Connection failed. Could not save program configurations.");
    } finally {
      setSavingStates(prev => ({ ...prev, [programKey]: false }));
    }
  };

  return (
    <div id="admin-programs-config-subsystem" className="space-y-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900 text-white rounded-3xl p-6 border border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Landing Page Asset Manager
          </h2>
          <p className="text-zinc-400 text-xs">
            Upload custom PDF brochures and link active briefing videos (YouTube, Vimeo, MP4) for each grade track page.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs px-4 py-2.5 font-bold transition-all border border-zinc-700 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Registry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(PROGRAM_KEY_TO_NAME).map(([key, title]) => {
          const dbConfig = configs.find(c => c.programKey === key);
          const current = getLocalConfig(key, dbConfig);
          const isSaving = savingStates[key] || false;
          const isSuccess = successStates[key] || false;

          return (
            <div
              key={key}
              id={`panel-config-${key}`}
              className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      Key: {key}
                    </span>
                    <h3 className="text-base font-bold text-zinc-950 font-sans">
                      {title}
                    </h3>
                  </div>
                  {isSuccess ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <CheckCircle className="h-3.5 w-3.5" /> Saved
                    </span>
                  ) : (
                    <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono">
                      Active
                    </span>
                  )}
                </div>

                {/* 1. PDF BROCHURE SECTION */}
                {key.startsWith("card_") ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={current.title || ""}
                        onChange={(e) => updateLocalField(key, "title", e.target.value)}
                        placeholder="e.g. Basic Career Success"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Card Subtitle / Description
                      </label>
                      <input
                        type="text"
                        value={current.subtitle || ""}
                        onChange={(e) => updateLocalField(key, "subtitle", e.target.value)}
                        placeholder="e.g. For Right Subjects & Insights"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Original Price (with ₹ crossed out)
                        </label>
                        <input
                          type="text"
                          value={current.originalPrice || ""}
                          onChange={(e) => updateLocalField(key, "originalPrice", e.target.value)}
                          placeholder="e.g. ₹15,000"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                          Current Price (with ₹ currency)
                        </label>
                        <input
                          type="text"
                          value={current.currentPrice || ""}
                          onChange={(e) => updateLocalField(key, "currentPrice", e.target.value)}
                          placeholder="e.g. ₹8,500"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all font-bold font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Points Offered (Features - one per line)
                      </label>
                      <textarea
                        rows={4}
                        value={current.features || ""}
                        onChange={(e) => updateLocalField(key, "features", e.target.value)}
                        placeholder="e.g. Intro session&#10;1 Counselling Session"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all font-sans leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                        Watch Details - Video Link (YouTube/Vimeo/MP4)
                      </label>
                      <input
                        type="url"
                        value={current.videoUrl || ""}
                        onChange={(e) => updateLocalField(key, "videoUrl", e.target.value)}
                        placeholder="e.g. https://www.youtube.com/embed/dQw4w9WgXcQ"
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-emerald-600" />
                        Program Brochure (PDF)
                      </h4>

                      {/* Direct File Upload Option */}
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-3">
                        <label className="block text-[11px] font-semibold text-zinc-600">
                          Upload Brochure File directly:
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex items-center gap-2 bg-white hover:bg-zinc-100 border border-zinc-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer text-zinc-800 transition-all hover:border-zinc-300">
                            <Upload className="h-3.5 w-3.5 text-zinc-500" />
                            <span>Choose PDF File</span>
                            <input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handlePdfUpload(key, e)}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-zinc-500 truncate max-w-[150px]">
                            {current.brochureFileName || "No file uploaded yet"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewPdf({
                                isOpen: true,
                                title: `${PROGRAM_KEY_TO_NAME[key] || key} - Official Program Guide`,
                                category: `Grade ${key} Syllabus`,
                                pdfUrl: current.brochureUrl || `/api/programs/brochure/view/${key}`,
                                fileData: current.brochureFileData
                              });
                            }}
                            className="flex items-center gap-1.5 bg-zinc-900 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ml-auto"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-400" />
                            <span>Preview Brochure</span>
                          </button>
                        </div>

                        {/* Or Manual URL Option */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-semibold text-zinc-600 mb-1.5">
                            Or enter PDF URL path manually:
                          </label>
                          <input
                            type="url"
                            value={current.brochureUrl || ""}
                            onChange={(e) => updateLocalField(key, "brochureUrl", e.target.value)}
                            placeholder="e.g. https://example.com/assets/brochure.pdf"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. BRIEFING VIDEO LINK SECTION */}
                    <div className="space-y-3 pt-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Play className="h-3.5 w-3.5 text-emerald-600" />
                        Briefing Video Stream Link
                      </h4>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-2">
                        <label className="block text-[11px] font-semibold text-zinc-600">
                          YouTube, Vimeo, or direct MP4 URL:
                        </label>
                        <input
                          type="url"
                          required
                          value={current.videoUrl || ""}
                          onChange={(e) => updateLocalField(key, "videoUrl", e.target.value)}
                          placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1.5 focus:ring-emerald-500/40"
                        />
                        {current.videoUrl && (
                          <div className="text-[10px] text-emerald-700 bg-emerald-50/50 p-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5 font-medium">
                            <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Real-time embedding dynamic translation active
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
 
               {/* Footer Save CTA */}
              <div className="pt-6 mt-6 border-t border-zinc-100">
                <button
                  onClick={() => handleSaveConfig(key)}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                      Saving and Syncing...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 text-emerald-400" />
                      {key.startsWith("card_") ? `Update ${current.title}` : `Update ${key} Landing Page`}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Brochure PDF Viewer Modal for Admin instant testing */}
      <PdfViewerModal
        isOpen={previewPdf.isOpen}
        onClose={() => setPreviewPdf(prev => ({ ...prev, isOpen: false }))}
        title={previewPdf.title}
        category={previewPdf.category}
        pdfUrl={previewPdf.pdfUrl}
        fileData={previewPdf.fileData}
      />
    </div>
  );
}
