import { useState, useEffect, FormEvent } from "react";
import { Course, Lesson, Chapter, UserTier, LessonAttachment } from "../types";
import { 
  Plus, Trash2, Edit3, Video, FileText, Layers, CheckCircle, 
  X, Save, Sparkles, BookOpen, Clock, Tag, ExternalLink, ChevronDown, Upload
} from "lucide-react";

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // New Course Form State
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnailUrl: "",
    tier: "advance" as UserTier,
    category: "Primary Kudos",
    originalPrice: 4999,
    discountPrice: 1999,
    duration: "10 Hours",
    level: "All Levels"
  });

  // Chapter & Lesson Management State
  const [selectedCourseForCurriculum, setSelectedCourseForCurriculum] = useState<Course | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [activeChapterId, setActiveChapterId] = useState<string>("");

  // Lesson Form
  const [lessonForm, setLessonForm] = useState({
    title: "",
    duration: "15:00",
    videoUrl: "",
    summary: "",
    attachmentTitle: "",
    attachmentUrl: ""
  });

  // Quick Authorize State
  const [quickPhone, setQuickPhone] = useState("");
  const [quickTier, setQuickTier] = useState<UserTier>("pro");
  const [quickMsg, setQuickMsg] = useState("");

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
          originalPrice: 4999,
          discountPrice: 1999,
          duration: "10 Hours",
          level: "All Levels"
        });
        setIsCreatingCourse(false);
        fetchCourses();
      } else {
        alert("Failed to create course.");
      }
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete course: ${title}?`)) return;
    try {
      const token = localStorage.getItem("pehlakadam_admin_token");
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCourses();
        if (selectedCourseForCurriculum?.id === courseId) {
          setSelectedCourseForCurriculum(null);
        }
      }
    } catch (err) {
      console.error("Error deleting course:", err);
    }
  };

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
  };

  const handleAddLesson = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForCurriculum || !activeChapterId || !lessonForm.title.trim()) return;

    const newLesson: Lesson = {
      id: "les_" + Date.now(),
      title: lessonForm.title.trim(),
      duration: lessonForm.duration || "10:00",
      videoUrl: lessonForm.videoUrl,
      summary: lessonForm.summary,
      isFreePreview: false,
      attachments: lessonForm.attachmentTitle ? [
        {
          id: "att_" + Date.now(),
          title: lessonForm.attachmentTitle,
          fileUrl: lessonForm.attachmentUrl,
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
      attachmentUrl: ""
    });
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    if (!selectedCourseForCurriculum) return;
    const updatedChapters = selectedCourseForCurriculum.chapters.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, lessons: ch.lessons.filter(l => l.id !== lessonId) };
      }
      return ch;
    });
    await saveCourseCurriculum(selectedCourseForCurriculum.id, updatedChapters);
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
    <div className="p-6 space-y-8 bg-zinc-900 text-zinc-100 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2">
            <BookOpen className="h-3.5 w-3.5" />
            LMS COURSE CURRICULUM ARCHITECTURE
          </div>
          <h2 className="text-2xl font-black text-white">Course Modules & Chapter Content Manager</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Launch custom programs, set video URLs, manage chapter worksheets, and assign access tiers (Basic, Advance, Pro).
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
                <option value="6-8 Grade">6-8 Grade</option>
                <option value="8-10 Grade">8-10 Grade</option>
                <option value="11-12 Grade">11-12 Grade</option>
                <option value="UG/Graduate/PG">UG/Graduate/PG</option>
                <option value="Generalist to Specialist">Generalist to Specialist</option>
              </select>
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

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Course Thumbnail Image URL</label>
              <input
                type="url"
                value={courseForm.thumbnailUrl}
                onChange={e => setCourseForm({ ...courseForm, thumbnailUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2 text-xs text-white placeholder-zinc-500"
              />
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCourse(course.id, course.title);
                    }}
                    className="text-zinc-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-white text-xs mb-1 line-clamp-2">{course.title}</h4>
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
              <div className="border-b border-zinc-800 pb-4">
                <span className="text-[10px] font-bold uppercase text-emerald-400 font-mono">Curriculum Builder</span>
                <h3 className="text-xl font-bold text-white">{selectedCourseForCurriculum.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{selectedCourseForCurriculum.category} • {selectedCourseForCurriculum.tier.toUpperCase()} Tier</p>
              </div>

              {/* Add Chapter Input */}
              <form onSubmit={handleAddChapter} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={e => setNewChapterTitle(e.target.value)}
                  placeholder="New Chapter Title (e.g. Chapter 1: Foundations of Stream Choice)"
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-700 px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Chapter
                </button>
              </form>

              {/* Chapters & Lessons List */}
              <div className="space-y-4">
                {selectedCourseForCurriculum.chapters?.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-4 text-center border border-dashed border-zinc-800 rounded-2xl">
                    No chapters added yet. Use the field above to create your first chapter module.
                  </p>
                ) : (
                  selectedCourseForCurriculum.chapters?.map((chapter, index) => (
                    <div key={chapter.id} className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-400">CH {index + 1}</span>
                          <h4 className="font-bold text-white text-xs">{chapter.title}</h4>
                        </div>
                        <button
                          onClick={() => setActiveChapterId(activeChapterId === chapter.id ? "" : chapter.id)}
                          className="text-[10px] text-emerald-400 font-semibold hover:underline"
                        >
                          {activeChapterId === chapter.id ? "Close Add Lesson" : "+ Add Video Lesson"}
                        </button>
                      </div>

                      {/* Add Lesson Sub-Form inside Chapter */}
                      {activeChapterId === chapter.id && (
                        <form onSubmit={handleAddLesson} className="p-3.5 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-2.5">
                          <h5 className="text-[11px] font-bold text-emerald-400">Add New Lesson to {chapter.title}</h5>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={lessonForm.title}
                              onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                              placeholder="Lesson Title (e.g. Cognitive Traits Assessment)"
                              required
                              className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={lessonForm.duration}
                              onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                              placeholder="Duration (e.g. 12:30)"
                              className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>
                          <input
                            type="url"
                            value={lessonForm.videoUrl}
                            onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                            placeholder="Video Embed URL (YouTube watch / Vimeo / MP4 link)"
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                          />
                          <textarea
                            value={lessonForm.summary}
                            onChange={e => setLessonForm({ ...lessonForm, summary: e.target.value })}
                            placeholder="Lesson Summary / Key Takeaways"
                            rows={2}
                            className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                          ></textarea>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={lessonForm.attachmentTitle}
                              onChange={e => setLessonForm({ ...lessonForm, attachmentTitle: e.target.value })}
                              placeholder="Attachment PDF Title (e.g. Worksheets.pdf)"
                              className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                            />
                            <input
                              type="url"
                              value={lessonForm.attachmentUrl}
                              onChange={e => setLessonForm({ ...lessonForm, attachmentUrl: e.target.value })}
                              placeholder="Attachment Download File URL"
                              className="rounded-lg bg-zinc-900 border border-zinc-700 px-2.5 py-1.5 text-xs text-white"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 text-xs"
                          >
                            Save Lesson to Chapter
                          </button>
                        </form>
                      )}

                      {/* Chapter Lessons List */}
                      <div className="divide-y divide-zinc-800/60">
                        {chapter.lessons?.map((les) => (
                          <div key={les.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <Video className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="font-medium text-white">{les.title}</span>
                              <span className="text-[10px] text-zinc-500 font-mono">({les.duration})</span>
                            </div>

                            <button
                              onClick={() => handleDeleteLesson(chapter.id, les.id)}
                              className="text-zinc-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
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
    </div>
  );
}
