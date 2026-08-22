import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Course, Lesson, Chapter, UserTier, LessonAttachment } from "../types";
import { 
  Plus, Trash2, Edit3, Video, FileText, Layers, CheckCircle, 
  X, Save, Sparkles, BookOpen, Clock, Tag, ExternalLink, ChevronDown, ChevronUp, Upload,
  Check, FileUp, AlertCircle
} from "lucide-react";

const COURSE_BATCH_OPTIONS = [
  "Regular Self-Paced Batch",
  "Weekend Intensive Batch",
  "Fast-Track Mastery Batch",
  "Live Mentorship Batch 2026",
  "Evening Executive Batch",
  "Summer Career Acceleration Batch",
  "Custom Evening Batch",
  "Morning Fast-Track Cohort"
];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Custom Batch States
  const [isCustomBatchNew, setIsCustomBatchNew] = useState(false);
  const [customBatchTextNew, setCustomBatchTextNew] = useState("");
  const [isCustomBatchEdit, setIsCustomBatchEdit] = useState(false);
  const [customBatchTextEdit, setCustomBatchTextEdit] = useState("");

  // New Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnailUrl: "",
    tier: "advance" as UserTier,
    category: "Primary Kudos",
    batch: "Regular Self-Paced Batch",
    originalPrice: 4999,
    discountPrice: 1999,
    duration: "10 Hours",
    level: "All Levels"
  });

  // Chapter & Lesson Management State
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string>("");
  const [collapsedChaptersAdmin, setCollapsedChaptersAdmin] = useState<Record<string, boolean>>({});

  const toggleChapterCollapseAdmin = (chapterId: string) => {
    setCollapsedChaptersAdmin(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const expandAllChaptersAdmin = () => {
    if (!selectedCourseForCurriculum?.chapters) return;
    const next: Record<string, boolean> = {};
    selectedCourseForCurriculum.chapters.forEach(ch => { next[ch.id] = false; });
    setCollapsedChaptersAdmin(next);
  };

  const collapseAllChaptersAdmin = () => {
    if (!selectedCourseForCurriculum?.chapters) return;
    const next: Record<string, boolean> = {};
    selectedCourseForCurriculum.chapters.forEach(ch => { next[ch.id] = true; });
    setCollapsedChaptersAdmin(next);
  };

  // Chapter Editing State
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState<string>("");

  // Lesson Form (New Lesson)
  const [lessonForm, setLessonForm] = useState({
    title: "",
    duration: "15:00",
    videoUrl: "",
    summary: "",
    attachmentTitle: "",
    attachmentUrl: "",
    attachmentFileData: ""
  });

  // Lesson Editing State (Existing Lesson)
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: Lesson } | null>(null);
  const [editLessonForm, setEditLessonForm] = useState({
    title: "",
    duration: "15:00",
    videoUrl: "",
    summary: "",
    attachmentTitle: "",
    attachmentUrl: "",
    attachmentFileData: ""
  });

  // Quick Authorize State
  const [quickPhone, setQuickPhone] = useState("");
  const [quickTier, setQuickTier] = useState<UserTier>("pro");
  const [quickMsg, setQuickMsg] = useState("");

  // In-App Confirmation Modals
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingCourse, setIsDeletingCourse] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<{ id: string; title: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{ chapterId: string; lessonId: string; title: string } | null>(null);

  // Status Notification State
  const [statusNotification, setStatusNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (statusNotification) {
      const timer = setTimeout(() => setStatusNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusNotification]);

  const handleQuickGrantAccess = async (e: FormEvent) => {
    e.preventDefault();
    if (!quickPhone.trim()) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/authorized-numbers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ number: quickPhone.trim(), tier: quickTier })
      });
      const data = await res.json();
      if (res.ok) {
        setQuickMsg(`✅ Access Granted! Phone ${quickPhone} authorized for ${quickTier.toUpperCase()} Tier.`);
        setQuickPhone("");
        setTimeout(() => setQuickMsg(""), 4000);
      } else {
        setQuickMsg(`⚠️ ${data.error || "Failed to grant access."}`);
      }
    } catch (err) {
      console.error("Error granting access:", err);
      setQuickMsg("⚠️ Network error authorizing student.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("[AdminCourses] Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim()) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...courseForm,
          slug: courseForm.slug || courseForm.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          chapters: []
        })
      });
      if (res.ok) {
        setCourseForm({
          title: "",
          slug: "",
          description: "",
          thumbnailUrl: "",
          tier: "advance",
          category: "Primary Kudos",
          batch: "Regular Self-Paced Batch",
          originalPrice: 4999,
          discountPrice: 1999,
          duration: "10 Hours",
          level: "All Levels"
        });
        setIsCreatingCourse(false);
        setStatusNotification({
          type: "success",
          message: "Course created successfully!"
        });
        fetchCourses();
      } else {
        setStatusNotification({
          type: "error",
          message: "Failed to create course."
        });
      }
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  const handleDeleteCourse = (courseId: string, title: string) => {
    setCourseToDelete({ id: courseId, title });
  };

  const performDeleteCourse = async () => {
    if (!courseToDelete) return;
    const { id: courseId, title } = courseToDelete;
    setIsDeletingCourse(true);

    // Optimistic UI update
    setCourses(prev => prev.filter(c => c.id !== courseId && c.slug !== courseId && (c as any)._id !== courseId));
    if (selectedCourseForCurriculum?.id === courseId || selectedCourseForCurriculum?.slug === courseId) {
      setSelectedCourseForCurriculum(null);
    }

    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/courses/${encodeURIComponent(courseId)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setStatusNotification({
          type: "success",
          message: `Course "${title}" has been permanently deleted.`
        });
        setCourseToDelete(null);
        await fetchCourses();
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusNotification({
          type: "error",
          message: errData.error || "Failed to delete course from server."
        });
        await fetchCourses();
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      setStatusNotification({
        type: "error",
        message: "Network error occurred while attempting to delete course."
      });
      await fetchCourses();
    } finally {
      setIsDeletingCourse(false);
    }
  };

  // Image File Uploader Helper
  const handleImageFileUpload = (e: ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEditMode && editingCourse) {
        setEditingCourse({ ...editingCourse, thumbnailUrl: base64 });
      } else {
        setCourseForm(prev => ({ ...prev, thumbnailUrl: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Lesson Attachment File Uploader Helper (PDF local file to base64)
  const handleLessonAttachmentUpload = (e: ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (isEditMode) {
        setEditLessonForm(prev => ({
          ...prev,
          attachmentTitle: prev.attachmentTitle || file.name,
          attachmentFileData: base64,
          attachmentUrl: base64
        }));
      } else {
        setLessonForm(prev => ({
          ...prev,
          attachmentTitle: prev.attachmentTitle || file.name,
          attachmentFileData: base64,
          attachmentUrl: base64
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title.trim()) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingCourse)
      });
      if (res.ok) {
        const updated = await res.json();
        setEditingCourse(null);
        fetchCourses();
        if (selectedCourseForCurriculum?.id === updated.id) {
          setSelectedCourseForCurriculum(updated);
        }
        setStatusNotification({
          type: "success",
          message: "Course updated successfully!"
        });
      } else {
        setStatusNotification({
          type: "error",
          message: "Failed to update course."
        });
      }
    } catch (err) {
      console.error("Error updating course:", err);
    }
  };

  // ----------------------------------------------------
  // CHAPTER HANDLERS (Add, Edit, Delete)
  // ----------------------------------------------------
  const handleAddChapter = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum || !newChapterTitle.trim()) return;

    const newChapter: Chapter = {
      id: "ch_" + Date.now(),
      title: newChapterTitle.trim(),
      lessons: []
    };

    const updatedChapters = [...(selectedCourseForCurriculum.chapters || []), newChapter];
    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    setNewChapterTitle("");
    setActiveChapterId(newChapter.id);
    setStatusNotification({
      type: "success",
      message: `Chapter "${newChapter.title}" added.`
    });
  };

  const startEditChapter = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditingChapterTitle(chapter.title);
  };

  const handleSaveEditChapter = async (chapterId: string) => {
    if (!selectedCourseForCurriculum || !editingChapterTitle.trim()) return;

    const updatedChapters = selectedCourseForCurriculum.chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, title: editingChapterTitle.trim() };
      }
      return ch;
    });

    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    setStatusNotification({
      type: "success",
      message: `Chapter renamed to "${editingChapterTitle.trim()}" successfully.`
    });
    setEditingChapterId(null);
    setEditingChapterTitle("");
  };

  const cancelEditChapter = () => {
    setEditingChapterId(null);
    setEditingChapterTitle("");
  };

  const performDeleteChapter = async () => {
    if (!selectedCourseForCurriculum || !chapterToDelete) return;
    const { id: chapterId, title } = chapterToDelete;

    const updatedChapters = selectedCourseForCurriculum.chapters.filter(ch => ch.id !== chapterId);
    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    if (activeChapterId === chapterId) {
      setActiveChapterId("");
    }
    setChapterToDelete(null);
    setStatusNotification({
      type: "success",
      message: `Chapter "${title}" deleted.`
    });
  };

  // ----------------------------------------------------
  // LESSON HANDLERS (Add, Edit, Delete)
  // ----------------------------------------------------
  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum || !activeChapterId || !lessonForm.title.trim()) return;

    const newLesson: Lesson = {
      id: "les_" + Date.now(),
      title: lessonForm.title.trim(),
      duration: lessonForm.duration || "10:00",
      videoUrl: lessonForm.videoUrl.trim(),
      summary: lessonForm.summary.trim(),
      isFreePreview: false,
      attachments: lessonForm.attachmentTitle.trim() ? [
        {
          id: "att_" + Date.now(),
          title: lessonForm.attachmentTitle.trim(),
          fileUrl: lessonForm.attachmentUrl.trim() || undefined,
          fileData: lessonForm.attachmentFileData || undefined,
          type: "pdf"
        }
      ] : []
    };

    const updatedChapters = selectedCourseForCurriculum.chapters.map(ch => {
      if (ch.id === activeChapterId) {
        return { ...ch, lessons: [...(ch.lessons || []), newLesson] };
      }
      return ch;
    });

    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    setLessonForm({
      title: "",
      duration: "15:00",
      videoUrl: "",
      summary: "",
      attachmentTitle: "",
      attachmentUrl: "",
      attachmentFileData: ""
    });
    setStatusNotification({
      type: "success",
      message: `Lesson "${newLesson.title}" added to chapter.`
    });
  };

  const startEditLesson = (chapterId: string, lesson: Lesson) => {
    const firstAttachment = lesson.attachments?.[0];
    setEditingLesson({ chapterId, lesson });
    setEditLessonForm({
      title: lesson.title,
      duration: lesson.duration || "15:00",
      videoUrl: lesson.videoUrl || "",
      summary: lesson.summary || "",
      attachmentTitle: firstAttachment?.title || "",
      attachmentUrl: firstAttachment?.fileUrl || "",
      attachmentFileData: firstAttachment?.fileData || ""
    });
  };

  const handleUpdateLessonSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum || !editingLesson || !editLessonForm.title.trim()) return;

    const { chapterId, lesson } = editingLesson;
    const updatedLesson: Lesson = {
      ...lesson,
      title: editLessonForm.title.trim(),
      duration: editLessonForm.duration || "10:00",
      videoUrl: editLessonForm.videoUrl.trim(),
      summary: editLessonForm.summary.trim(),
      attachments: editLessonForm.attachmentTitle.trim() ? [
        {
          id: lesson.attachments?.[0]?.id || ("att_" + Date.now()),
          title: editLessonForm.attachmentTitle.trim(),
          fileUrl: editLessonForm.attachmentUrl.trim() || undefined,
          fileData: editLessonForm.attachmentFileData || undefined,
          type: "pdf"
        }
      ] : []
    };

    const updatedChapters = selectedCourseForCurriculum.chapters.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          lessons: ch.lessons.map(l => l.id === lesson.id ? updatedLesson : l)
        };
      }
      return ch;
    });

    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    setStatusNotification({
      type: "success",
      message: `Lesson "${updatedLesson.title}" updated successfully.`
    });
    setEditingLesson(null);
  };

  const performDeleteLesson = async () => {
    if (!selectedCourseForCurriculum || !lessonToDelete) return;
    const { chapterId, lessonId, title } = lessonToDelete;

    const updatedChapters = selectedCourseForCurriculum.chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) };
      }
      return ch;
    });

    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
    setLessonToDelete(null);
    setStatusNotification({
      type: "success",
      message: `Lesson "${title}" deleted.`
    });
  };

  const saveCourseCurriculum = async (courseId: string, chapters: Chapter[]) => {
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ chapters })
      });
      if (res.ok) {
        const updatedCourse = await res.json();
        setSelectedCourseForCurriculum(updatedCourse);
        fetchCourses();
      }
    } catch (err) {
      console.error("Error updating curriculum:", err);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-zinc-900 text-zinc-100 min-h-screen relative">
      {/* STATUS NOTIFICATION TOAST */}
      {statusNotification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-xl animate-fade-in transition-all ${
          statusNotification.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
            : "bg-red-950/90 border-red-500/50 text-red-300"
        }`}>
          <div className="flex items-center gap-2 font-semibold text-xs">
            {statusNotification.type === "success" ? <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" /> : <X className="h-4 w-4 text-red-400 shrink-0" />}
            <span>{statusNotification.message}</span>
          </div>
          <button
            onClick={() => setStatusNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            LMS COURSE CURRICULUM ARCHITECTURE
          </div>
          <h2 className="text-2xl font-black text-white">Course Modules & Chapter Content Manager</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Launch custom programs, set video URLs, manage chapter worksheets, edit lessons & chapters, and assign access tiers.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingCourse(!isCreatingCourse)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30 flex items-center gap-2 cursor-pointer w-fit"
        >
          {isCreatingCourse ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isCreatingCourse ? "Cancel" : "Create New LMS Course"}
        </button>
      </div>

      {/* QUICK STUDENT ACCESS AUTHORIZATION BAR */}
      <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Instant Student Phone Access Authorization</h4>
              <p className="text-[10px] text-zinc-400">Directly grant a phone number instant access to Courses matching their Tier.</p>
            </div>
          </div>

          <form onSubmit={handleQuickGrantAccess} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={quickPhone}
              onChange={e => setQuickPhone(e.target.value)}
              placeholder="Student Phone (e.g. 9876543210)"
              required
              className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white placeholder-zinc-500 w-44"
            />
            <select
              value={quickTier}
              onChange={e => setQuickTier(e.target.value as UserTier)}
              className="rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white font-semibold"
            >
              <option value="basic">Basic Tier</option>
              <option value="advance">Advance Tier</option>
              <option value="pro">Pro Tier (Full Access)</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
            >
              Grant Access
            </button>
          </form>
        </div>
        {quickMsg && (
          <p className="text-xs font-bold mt-2 text-emerald-400 animate-fade-in">{quickMsg}</p>
        )}
      </div>

      {/* CREATE NEW COURSE MODAL FORM */}
      {isCreatingCourse && (
        <form onSubmit={handleCreateCourse} className="p-6 bg-zinc-950 border border-emerald-500/40 rounded-3xl space-y-4 shadow-2xl animate-fade-in">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            Launch New Custom Course
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Title</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="e.g. Master Psychometric & Career Stream Blueprint"
                required
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Access Tier Requirement</label>
              <select
                value={courseForm.tier}
                onChange={e => setCourseForm({ ...courseForm, tier: e.target.value as UserTier })}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
              >
                <option value="basic">Basic Tier (PDFs & Videos)</option>
                <option value="advance">Advance Tier (Interactive Dashboard + Videos)</option>
                <option value="pro">Pro Tier (All Custom Courses + 1:1 Support)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Academic Category / Grade</label>
              <select
                value={courseForm.category}
                onChange={e => setCourseForm({ ...courseForm, category: e.target.value })}
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
              >
                <option value="Primary Kudos">Primary Kudos</option>
                <option value="6-8 Grade Student">6-8 Grade Student</option>
                <option value="8-10 Grade Student">8-10 Grade Student</option>
                <option value="11-12 Grade Student">11-12 Grade Student</option>
                <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                <option value="Generalist to Specialist">Generalist to Specialist</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold uppercase text-zinc-400">Course Batch Option</label>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isCustomBatchNew;
                    setIsCustomBatchNew(next);
                    if (next) {
                      const val = customBatchTextNew || "Custom Special Batch 2026";
                      setCourseForm(prev => ({ ...prev, batch: val }));
                    } else {
                      setCourseForm(prev => ({ ...prev, batch: COURSE_BATCH_OPTIONS[0] }));
                    }
                  }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  {isCustomBatchNew ? "← Select Predefined Batch" : "✍️ Type Custom Batch"}
                </button>
              </div>

              {!isCustomBatchNew ? (
                <select
                  value={courseForm.batch}
                  onChange={e => {
                    if (e.target.value === "__CUSTOM__") {
                      setIsCustomBatchNew(true);
                      const val = customBatchTextNew || "Custom Special Batch 2026";
                      setCourseForm(prev => ({ ...prev, batch: val }));
                    } else {
                      setCourseForm(prev => ({ ...prev, batch: e.target.value }));
                    }
                  }}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white font-medium"
                >
                  {COURSE_BATCH_OPTIONS.map((b, idx) => (
                    <option key={idx} value={b}>{b}</option>
                  ))}
                  <option value="__CUSTOM__">✨ ✍️ Type Custom Batch Name...</option>
                </select>
              ) : (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customBatchTextNew}
                    onChange={e => {
                      setCustomBatchTextNew(e.target.value);
                      setCourseForm(prev => ({ ...prev, batch: e.target.value }));
                    }}
                    placeholder="Enter Custom Batch Name (e.g. JEE Target Batch 2026)"
                    className="w-full rounded-xl bg-zinc-900 border border-emerald-500/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <p className="text-[10px] text-emerald-400">Custom batch name will be assigned to this course.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Original Price (₹)</label>
                <input
                  type="number"
                  value={courseForm.originalPrice}
                  onChange={e => setCourseForm({ ...courseForm, originalPrice: Number(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Discount Price (₹)</label>
                <input
                  type="number"
                  value={courseForm.discountPrice}
                  onChange={e => setCourseForm({ ...courseForm, discountPrice: Number(e.target.value) })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Thumbnail Image (System Upload or URL)</label>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={courseForm.thumbnailUrl}
                  onChange={e => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                  placeholder="Paste Image URL or select file from system ->"
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500"
                />
                <label className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="h-3.5 w-3.5 text-emerald-400" />
                  Upload from System
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageFileUpload(e, false)}
                    className="hidden"
                  />
                </label>
              </div>
              {courseForm.thumbnailUrl && (
                <div className="mt-2 h-20 w-36 rounded-xl overflow-hidden border border-zinc-700 relative bg-zinc-900">
                  <img src={courseForm.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-emerald-400 font-bold">Preview</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Description & Learning Outcomes</label>
              <textarea
                value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
                placeholder="Provide details about what students will learn in this course..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 text-xs transition-all shadow-lg cursor-pointer"
          >
            Publish Course Module
          </button>
        </form>
      )}

      {/* COURSES LIST TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Cards List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Courses ({courses.length})</h3>
          
          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs">
              No courses created yet. Click "Create New LMS Course" above.
            </div>
          ) : (
            courses.map(course => (
              <div
                key={course.id}
                onClick={() => {
                  setSelectedCourseForCurriculum(course);
                  if (course.chapters.length > 0) setActiveChapterId(course.chapters[0].id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedCourseForCurriculum?.id === course.id
                    ? "border-emerald-500 bg-emerald-950/20 shadow-lg"
                    : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    course.tier === "basic" ? "bg-blue-950 text-blue-300 border-blue-500/40" :
                    course.tier === "advance" ? "bg-purple-950 text-purple-300 border-purple-500/40" :
                    "bg-amber-950 text-amber-300 border-amber-500/40"
                  }`}>
                    {course.tier}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCourse(course);
                        const isPre = COURSE_BATCH_OPTIONS.includes(course.batch || "");
                        setIsCustomBatchEdit(!isPre);
                        setCustomBatchTextEdit(course.batch || "");
                      }}
                      className="text-zinc-400 hover:text-amber-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Edit Launch Course"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCourse(course.id, course.title);
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-white text-xs mb-1 line-clamp-2">{course.title}</h4>
                {course.batch && (
                  <div className="mb-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-emerald-400" />
                      Batch: {course.batch}
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3">{course.description}</p>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/80 pt-2">
                  <span>{course.chapters?.length || 0} Chapters</span>
                  <span className="font-mono text-emerald-400 font-bold">₹{course.discountPrice}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* CURRICULUM CHAPTER & LESSON EDITOR */}
        <div className="lg:col-span-2">
          {selectedCourseForCurriculum ? (
            <div className="p-6 rounded-3xl border border-zinc-800 bg-zinc-950 space-y-6">
              <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">Curriculum Builder</span>
                  <h3 className="text-xl font-bold text-white">{selectedCourseForCurriculum.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{selectedCourseForCurriculum.category} • {selectedCourseForCurriculum.tier.toUpperCase()} Tier</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {selectedCourseForCurriculum.chapters?.length || 0} Chapters • {selectedCourseForCurriculum.chapters?.reduce((acc, c) => acc + (c.lessons?.length || 0), 0) || 0} Lessons
                  </span>
                </div>
              </div>

              {/* Add Chapter Input */}
              <form onSubmit={handleAddChapter} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  placeholder="New Chapter Title (e.g. Chapter 1: Foundations of Stream Choice)"
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Chapter
                </button>
              </form>

              {/* Chapters & Lessons List Header Controls */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chapters & Curriculum</span>
                {selectedCourseForCurriculum.chapters && selectedCourseForCurriculum.chapters.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={expandAllChaptersAdmin}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ChevronDown className="h-3 w-3" /> Expand All
                    </button>
                    <button
                      type="button"
                      onClick={collapseAllChaptersAdmin}
                      className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <ChevronUp className="h-3 w-3" /> Collapse All
                    </button>
                  </div>
                )}
              </div>

              {/* Chapters & Lessons List */}
              <div className="space-y-4">
                {selectedCourseForCurriculum.chapters?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-6 text-center border border-dashed border-zinc-800 rounded-2xl">
                    No chapters added yet. Use the field above to create your first chapter module.
                  </p>
                ) : (
                  selectedCourseForCurriculum.chapters?.map((chapter, index) => {
                    const isCollapsed = !!collapsedChaptersAdmin[chapter.id];
                    return (
                    <div key={chapter.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                      {/* Chapter Header with Inline Rename & Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                        {editingChapterId === chapter.id ? (
                          // Chapter Inline Edit Field
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs font-bold text-amber-400 shrink-0">CH {index + 1}:</span>
                            <input
                              type="text"
                              value={editingChapterTitle}
                              onChange={e => setEditingChapterTitle(e.target.value)}
                              autoFocus
                              className="flex-1 rounded-lg bg-zinc-950 border border-amber-500/70 px-2.5 py-1 text-xs text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveEditChapter(chapter.id)}
                              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Save Chapter Name"
                            >
                              <Check className="h-3.5 w-3.5" /> Save
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditChapter}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors cursor-pointer"
                              title="Cancel"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          // Chapter Default View
                          <div 
                            onClick={() => toggleChapterCollapseAdmin(chapter.id)}
                            className="flex items-center gap-2 overflow-hidden flex-1 cursor-pointer select-none group"
                          >
                            <button
                              type="button"
                              className="text-zinc-400 group-hover:text-emerald-400 transition-colors p-0.5"
                              title={isCollapsed ? "Expand Chapter" : "Collapse Chapter"}
                            >
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`} />
                            </button>
                            <span className="text-xs font-bold text-emerald-400 shrink-0">CH {index + 1}</span>
                            <h4 className="font-bold text-white text-xs truncate group-hover:text-emerald-300 transition-colors">{chapter.title}</h4>
                            <span className="text-[10px] text-zinc-500 font-mono">({chapter.lessons?.length || 0} lessons)</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setActiveChapterId(activeChapterId === chapter.id ? "" : chapter.id)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                              activeChapterId === chapter.id 
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                                : "text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                          >
                            {activeChapterId === chapter.id ? "Close Form" : "+ Add Video Lesson"}
                          </button>

                          {editingChapterId !== chapter.id && (
                            <button
                              type="button"
                              onClick={() => startEditChapter(chapter)}
                              className="text-zinc-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                              title="Edit Chapter Name"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setChapterToDelete({ id: chapter.id, title: chapter.title })}
                            className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Delete Chapter"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Add Lesson Sub-Form inside Chapter */}
                      {activeChapterId === chapter.id && (
                        <form onSubmit={handleAddLesson} className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/30 space-y-3 animate-fade-in shadow-lg">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <Plus className="h-3.5 w-3.5" /> Add New Lesson to "{chapter.title}"
                            </h5>
                            <span className="text-[10px] text-zinc-500">Supports YouTube / Vimeo / Google Drive</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Lesson Title *</label>
                              <input
                                type="text"
                                value={lessonForm.title}
                                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                                placeholder="Lesson Title (e.g. Cognitive Traits Assessment)"
                                required
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Duration</label>
                              <input
                                type="text"
                                value={lessonForm.duration}
                                onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                placeholder="e.g. 12:30"
                                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Video Embed URL (YouTube watch / Vimeo / MP4)</label>
                            <input
                              type="url"
                              value={lessonForm.videoUrl}
                              onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                              placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Lesson Summary & Key Takeaways</label>
                            <textarea
                              value={lessonForm.summary}
                              onChange={e => setLessonForm({ ...lessonForm, summary: e.target.value })}
                              placeholder="What will students learn in this video lesson..."
                              rows={2}
                              className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                            ></textarea>
                          </div>
                          
                          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="block text-[10px] font-bold uppercase text-emerald-400">PDF Worksheet / Notes Attachment (Optional)</label>
                              <span className="text-[9px] text-zinc-400">Google Drive share links or direct upload</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={lessonForm.attachmentTitle}
                                onChange={e => setLessonForm({ ...lessonForm, attachmentTitle: e.target.value })}
                                placeholder="Attachment Title (e.g. Worksheets.pdf)"
                                className="rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                              />
                              <input
                                type="text"
                                value={lessonForm.attachmentUrl}
                                onChange={e => setLessonForm({ ...lessonForm, attachmentUrl: e.target.value })}
                                placeholder="Google Drive Link or File URL"
                                className="rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800">
                              <span className="text-[10px] text-zinc-400">Or upload local PDF file:</span>
                              <label className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold cursor-pointer flex items-center gap-1.5 border border-zinc-700">
                                <FileUp className="h-3 w-3 text-emerald-400" />
                                Select PDF
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={e => handleLessonAttachmentUpload(e, false)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setActiveChapterId("")}
                              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Save className="h-3.5 w-3.5" /> Save Lesson to Chapter
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Chapter Lessons List (Collapsible) */}
                      {!isCollapsed && (
                        <div className="divide-y divide-zinc-800/60">
                          {chapter.lessons && chapter.lessons.length > 0 ? (
                            chapter.lessons.map((les) => (
                              <div key={les.id} className="py-2.5 flex items-center justify-between text-xs group hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <Video className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  <span className="font-medium text-white truncate">{les.title}</span>
                                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">({les.duration})</span>
                                  {les.attachments && les.attachments.length > 0 && (
                                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono shrink-0 flex items-center gap-1">
                                      <FileText className="h-2.5 w-2.5" /> PDF Attached
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => startEditLesson(chapter.id, les)}
                                    className="text-zinc-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                                    title="Edit Lesson"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setLessonToDelete({ chapterId: chapter.id, lessonId: les.id, title: les.title })}
                                    className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Delete Lesson"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-3 text-center text-zinc-600 text-[11px] italic">
                              No lessons added in this chapter. Click "+ Add Video Lesson" above.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 text-zinc-500 text-xs">
              Select a course from the left panel to manage its chapters, video links, and PDF worksheets.
            </div>
          )}
        </div>
      </div>

      {/* ✏️ EDIT LAUNCH COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 pt-16 pb-6 sm:p-6 overflow-y-auto">
          <form onSubmit={handleUpdateCourse} className="relative w-full max-w-2xl bg-zinc-950 border border-amber-500/40 rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-400" />
                Edit Launch Course Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  required
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Access Tier Requirement</label>
                <select
                  value={editingCourse.tier}
                  onChange={e => setEditingCourse({ ...editingCourse, tier: e.target.value as UserTier })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                >
                  <option value="basic">Basic Tier (PDFs & Videos)</option>
                  <option value="advance">Advance Tier (Interactive Dashboard + Videos)</option>
                  <option value="pro">Pro Tier (All Custom Courses + 1:1 Support)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Academic Category / Grade</label>
                <select
                  value={editingCourse.category}
                  onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                >
                  <option value="Primary Kudos">Primary Kudos</option>
                  <option value="6-8 Grade Student">6-8 Grade Student</option>
                  <option value="8-10 Grade Student">8-10 Grade Student</option>
                  <option value="11-12 Grade Student">11-12 Grade Student</option>
                  <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                  <option value="Generalist to Specialist">Generalist to Specialist</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400">Course Batch Option</label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomBatchEdit;
                      setIsCustomBatchEdit(next);
                      if (next) {
                        const val = customBatchTextEdit || editingCourse.batch || "Custom Batch 2026";
                        setEditingCourse({ ...editingCourse, batch: val });
                      } else {
                        setEditingCourse({ ...editingCourse, batch: COURSE_BATCH_OPTIONS[0] });
                      }
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {isCustomBatchEdit ? "← Select Predefined Batch" : "✍️ Type Custom Batch"}
                  </button>
                </div>

                {!isCustomBatchEdit ? (
                  <select
                    value={COURSE_BATCH_OPTIONS.includes(editingCourse.batch || "") ? editingCourse.batch : "__CUSTOM__"}
                    onChange={e => {
                      if (e.target.value === "__CUSTOM__") {
                        setIsCustomBatchEdit(true);
                        const val = customBatchTextEdit || editingCourse.batch || "Custom Batch 2026";
                        setEditingCourse({ ...editingCourse, batch: val });
                      } else {
                        setEditingCourse({ ...editingCourse, batch: e.target.value });
                      }
                    }}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white font-medium"
                  >
                    {COURSE_BATCH_OPTIONS.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                    <option value="__CUSTOM__">✨ ✍️ Type Custom Batch Name...</option>
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editingCourse.batch || customBatchTextEdit}
                      onChange={e => {
                        setCustomBatchTextEdit(e.target.value);
                        setEditingCourse({ ...editingCourse, batch: e.target.value });
                      }}
                      placeholder="Enter Custom Batch Name (e.g. JEE Rankers Batch 2026)"
                      className="w-full rounded-xl bg-zinc-900 border border-amber-500/60 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
                    />
                    <p className="text-[10px] text-amber-400">Custom batch name will be saved for this course.</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={editingCourse.originalPrice}
                    onChange={e => setEditingCourse({ ...editingCourse, originalPrice: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={editingCourse.discountPrice}
                    onChange={e => setEditingCourse({ ...editingCourse, discountPrice: Number(e.target.value) })}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Thumbnail Image (System Upload or Link)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={editingCourse.thumbnailUrl}
                    onChange={e => setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })}
                    placeholder="Image URL or upload from device ->"
                    className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                  />
                  <label className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="h-3.5 w-3.5 text-amber-400" />
                    Upload from System
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleImageFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
                {editingCourse.thumbnailUrl && (
                  <div className="mt-2 h-20 w-36 rounded-xl overflow-hidden border border-zinc-700 relative bg-zinc-900">
                    <img src={editingCourse.thumbnailUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-amber-400 font-bold">Updated Preview</span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Description & Overview</label>
                <textarea
                  value={editingCourse.description}
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🎬 DEDICATED EDIT LESSON MODAL */}
      {editingLesson && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 pt-16 pb-6 sm:p-6 overflow-y-auto">
          <form onSubmit={handleUpdateLessonSubmit} className="relative w-full max-w-2xl bg-zinc-950 border border-emerald-500/50 rounded-3xl p-6 space-y-4 shadow-2xl animate-scale-up my-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Lesson Details</h3>
                  <p className="text-[11px] text-zinc-400">Update video URL, duration, summary, and PDF worksheets</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    value={editLessonForm.title}
                    onChange={e => setEditLessonForm({ ...editLessonForm, title: e.target.value })}
                    required
                    placeholder="Lesson Title"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editLessonForm.duration}
                    onChange={e => setEditLessonForm({ ...editLessonForm, duration: e.target.value })}
                    placeholder="e.g. 15:00"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Video Embed URL</label>
                <input
                  type="url"
                  value={editLessonForm.videoUrl}
                  onChange={e => setEditLessonForm({ ...editLessonForm, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or Vimeo link"
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Lesson Summary / Key Takeaways</label>
                <textarea
                  value={editLessonForm.summary}
                  onChange={e => setEditLessonForm({ ...editLessonForm, summary: e.target.value })}
                  rows={3}
                  placeholder="Summary of this lesson..."
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                ></textarea>
              </div>

              {/* PDF Handout Attachment Section */}
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-xs font-bold text-white">Lesson Handout & PDF Attachment</h4>
                  </div>
                  <span className="text-[10px] text-zinc-400">Google Drive share links or direct upload</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Attachment Title</label>
                    <input
                      type="text"
                      value={editLessonForm.attachmentTitle}
                      onChange={e => setEditLessonForm({ ...editLessonForm, attachmentTitle: e.target.value })}
                      placeholder="e.g. Worksheets_Module_1.pdf"
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Attachment URL / Drive Link</label>
                    <input
                      type="text"
                      value={editLessonForm.attachmentUrl}
                      onChange={e => setEditLessonForm({ ...editLessonForm, attachmentUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[11px]">
                  <span className="text-zinc-400">Or replace with local PDF file from your device:</span>
                  <label className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1.5">
                    <FileUp className="h-3.5 w-3.5 text-emerald-400" />
                    Select PDF File
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={e => handleLessonAttachmentUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setEditingLesson(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" /> Save Lesson Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DEDICATED IN-APP DELETE COURSE CONFIRMATION MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Course Permanently?</h3>
                <p className="text-[11px] text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <p className="text-zinc-400">You are about to delete:</p>
              <p className="font-bold text-white text-sm line-clamp-2">"{courseToDelete.title}"</p>
              <p className="text-[10px] text-red-400/80 pt-1">
                All associated curriculum chapters, video lessons, and worksheets will be removed.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingCourse}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCourse}
                onClick={performDeleteCourse}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/50 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {isDeletingCourse ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED IN-APP DELETE CHAPTER CONFIRMATION MODAL */}
      {chapterToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Chapter?</h3>
                <p className="text-[11px] text-zinc-400">This will remove the chapter and all its lessons.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <p className="text-zinc-400">Chapter Title:</p>
              <p className="font-bold text-white text-sm">"{chapterToDelete.title}"</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setChapterToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDeleteChapter}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED IN-APP DELETE LESSON CONFIRMATION MODAL */}
      {lessonToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-950 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Lesson?</h3>
                <p className="text-[11px] text-zinc-400">Remove this video lesson from the curriculum.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs space-y-1">
              <p className="text-zinc-400">Lesson Title:</p>
              <p className="font-bold text-white text-sm">"{lessonToDelete.title}"</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setLessonToDelete(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={performDeleteLesson}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Lesson
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
