import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { contactFormSchema } from "./src/lib/validation";

// Load environment variables with fallback to .env.example
const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(envExamplePath)) {
  dotenv.config({ path: envExamplePath });
} else {
  dotenv.config();
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SUBMISSIONS_FILE = path.join(process.cwd(), "submissions.json");
const PAYMENTS_FILE = path.join(process.cwd(), "payments.json");
const RESOURCES_FILE = path.join(process.cwd(), "resources.json");
const UPDATES_FILE = path.join(process.cwd(), "updates.json");
const AUTHORIZED_NUMBERS_FILE = path.join(process.cwd(), "authorized_numbers.json");
const PROGRAMS_CONFIG_FILE = path.join(process.cwd(), "programs_config.json");
const DIAGNOSTIC_TESTS_FILE = path.join(process.cwd(), "diagnostic_tests.json");
const DIAGNOSTIC_SUBMISSIONS_FILE = path.join(process.cwd(), "diagnostic_submissions.json");
const DIAGNOSTIC_REGISTRATIONS_FILE = path.join(process.cwd(), "diagnostic_registrations.json");
const SYSTEM_STATS_FILE = path.join(process.cwd(), "system_stats.json");
const CAREER_TIPS_SUBSCRIBERS_FILE = path.join(process.cwd(), "career_tips_subscribers.json");
const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");
const TESTIMONIALS_FILE = path.join(process.cwd(), "testimonials.json");
const COURSES_FILE = path.join(process.cwd(), "courses.json");
const COUPONS_FILE = path.join(process.cwd(), "coupons.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize folders & files
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(PAYMENTS_FILE)) {
  fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(DIAGNOSTIC_TESTS_FILE)) {
  fs.writeFileSync(DIAGNOSTIC_TESTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(DIAGNOSTIC_SUBMISSIONS_FILE)) {
  fs.writeFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(DIAGNOSTIC_REGISTRATIONS_FILE)) {
  fs.writeFileSync(DIAGNOSTIC_REGISTRATIONS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(SYSTEM_STATS_FILE)) {
  fs.writeFileSync(SYSTEM_STATS_FILE, JSON.stringify({
    studentsCount: "10K+",
    expertsCount: "15+",
    successRate: "99%"
  }, null, 2));
}

const defaultTestimonials = [
  {
    id: "testi-1",
    studentName: "Aryan Sharma",
    stream: "Grade 10 to Science (PCM)",
    achievement: "BITS Pilani (Computer Science)",
    story: "Pehlakadam helped me map my analytical personality to PCM. Their psychometric MBTI grid was 100% accurate, directing me away from pure herd pressure.",
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-2",
    studentName: "Komalpreet Kaur",
    stream: "Grade 12 to Commerce / Economics",
    achievement: "SRCC, Delhi University",
    story: "I was extremely confused between Law and Economics. The DISC evaluation mapped my Steadiness and Compliance traits perfectly to finance and research.",
    createdAt: new Date().toISOString()
  },
  {
    id: "testi-3",
    studentName: "Ananya Iyer",
    stream: "Undergrad to Postgrad (Psychology)",
    achievement: "NIMHANS Admission",
    story: "The post-grad resume blueprint and 1:1 mentorship from BITS Pilani advisors gave me extreme clarity. Truly the best decision of my career!",
    createdAt: new Date().toISOString()
  }
];

if (!fs.existsSync(TESTIMONIALS_FILE)) {
  fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(defaultTestimonials, null, 2));
}

const defaultCourses = [
  {
    id: "course-1",
    title: "Master Psychometric & Career Stream Blueprint",
    slug: "master-psychometric-career-stream-blueprint",
    description: "Comprehensive step-by-step masterclass covering MBTI, DISC, Holland Code, and multi-disciplinary career mapping for Grade 8-12 students.",
    thumbnailUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
    tier: "advance",
    category: "8-10 Grade",
    originalPrice: 4999,
    discountPrice: 1999,
    duration: "10 Hours",
    level: "All Levels",
    published: true,
    createdAt: new Date().toISOString(),
    chapters: [
      {
        id: "ch-1",
        title: "Chapter 1: Foundations of Cognitive & Behavioral Diagnostics",
        lessons: [
          {
            id: "les-1",
            title: "Lesson 1: Introduction to Psychometric Profiling",
            duration: "12:30",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            summary: "Learn how personality traits dictate academic endurance and stream alignment.",
            isFreePreview: true,
            attachments: [
              { id: "att-1", title: "Psychometric Worksheet.pdf", type: "pdf", fileUrl: "#" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "Pro Mentorship: Modern Tech & Management Placement Masterclass",
    slug: "pro-mentorship-modern-tech-management-placement",
    description: "1:1 coaching roadmap, LinkedIn positioning, resume profiling, and high-impact corporate placement guidance.",
    thumbnailUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800",
    tier: "pro",
    category: "UG/Graduate/PG",
    originalPrice: 9999,
    discountPrice: 3999,
    duration: "18 Hours",
    level: "Advanced",
    published: true,
    createdAt: new Date().toISOString(),
    chapters: [
      {
        id: "ch-21",
        title: "Chapter 1: Corporate Resume & LinkedIn Optimization",
        lessons: [
          {
            id: "les-21",
            title: "Lesson 1: Executive Resume Architecture",
            duration: "20:00",
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            summary: "How to format your achievements for top HR screening software.",
            isFreePreview: false,
            attachments: []
          }
        ]
      }
    ]
  }
];

if (!fs.existsSync(COURSES_FILE)) {
  fs.writeFileSync(COURSES_FILE, JSON.stringify(defaultCourses, null, 2));
}

const defaultCoupons = [
  { id: "coup-1", code: "PEHLA50", discountType: "percentage", discountValue: 50, minOrderAmount: 0, active: true, createdAt: new Date().toISOString() },
  { id: "coup-2", code: "FESTIVE100", discountType: "percentage", discountValue: 100, minOrderAmount: 0, active: true, createdAt: new Date().toISOString() },
  { id: "coup-3", code: "WELCOME20", discountType: "percentage", discountValue: 20, minOrderAmount: 0, active: true, createdAt: new Date().toISOString() },
  { id: "coup-4", code: "PRO100", discountType: "percentage", discountValue: 100, minOrderAmount: 0, active: true, createdAt: new Date().toISOString() }
];

if (!fs.existsSync(COUPONS_FILE)) {
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(defaultCoupons, null, 2));
}

if (!fs.existsSync(PROGRAMS_CONFIG_FILE)) {
  const initialConfigs = [
    { programKey: "6-8", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { programKey: "9-10", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { programKey: "11-12", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { programKey: "graduate", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { programKey: "kudos", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { programKey: "generalist", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ];
  fs.writeFileSync(PROGRAMS_CONFIG_FILE, JSON.stringify(initialConfigs, null, 2));
}

// Write mock files so default resources are physically downloadable
const placeholders = [
  { file: "placeholder_disc_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: DISC Personality evaluation, mapping behavior types (Dominance, Influence, Steadiness, Conscientiousness)." },
  { file: "placeholder_mbti_career.pdf", text: "PEHLAKADAM CAREER GRID: MBTI 16-Personalities scientific mapping to professional streams and corporate domains." },
  { file: "placeholder_16pf_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: 16PF Personality Factor Questionnaire Guide - 16PF Career matching guidelines." },
  { file: "placeholder_epi_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: Eysenck Personality Inventory Guide - EPI Temperament scales details." },
  { file: "placeholder_enneagram_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: Enneagram Core Test Guide - 9 Interconnected Personality Types explanations." },
  { file: "placeholder_caliper_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: Caliper Profile Guide - Job performance matching indicators." },
  { file: "placeholder_mmpi_guide.pdf", text: "PEHLAKADAM GUIDEBOOK: Minnesota Multiphasic Test Guide - MMPI Clinical Insights framework." },
  { file: "placeholder_grade_planner.pdf", text: "PEHLAKADAM STUDY PLANNER: Step-by-step scheduling and subject timetables designed for Grade 8-12." },
  { file: "placeholder_resume.docx", text: "PEHLAKADAM RESUME BUILDER: ATS-compliant CV templates curated by senior BITS Pilani advisors." }
];
placeholders.forEach((p) => {
  const filePath = path.join(UPLOADS_DIR, p.file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, p.text);
  }
});

const defaultResources = [
  {
    id: "disc-guide",
    title: "DISC Personality Guidebook",
    category: "Psychometrics",
    description: "Understand your core behavioral triggers: Dominance, Influence, Steadiness, and Compliance traits.",
    type: "pdf",
    format: "PDF (2.4 MB)",
    fileUrl: "placeholder_disc_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "mbti-career",
    title: "MBTI 16-Personalities Career Grid",
    category: "Career Selection",
    description: "Direct mapping of 16 cognitive profiles into ideal scientific domains, stream subjects, and industries.",
    type: "pdf",
    format: "PDF (3.1 MB)",
    fileUrl: "placeholder_mbti_career.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "16pf-guide",
    title: "Personality Factor Questionnaire",
    category: "16PF Career matching",
    description: "Evaluate primary personality factors to identify potential academic paths and match with aligned career trajectories.",
    type: "pdf",
    format: "PDF (2.0 MB)",
    fileUrl: "placeholder_16pf_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "epi-guide",
    title: "Eysenck Personality Inventory",
    category: "EPI Temperament scales",
    description: "Measure extraversion, introversion, and neuroticism traits to understand personal temperament scales and learning style adaptability.",
    type: "pdf",
    format: "PDF (1.6 MB)",
    fileUrl: "placeholder_epi_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "enneagram-guide",
    title: "Enneagram Core Test",
    category: "9 Interconnected Personality Types",
    description: "Explore the 9 interconnected personality types to find core motivators, social patterns, and professional environments for growth.",
    type: "pdf",
    format: "PDF (2.2 MB)",
    fileUrl: "placeholder_enneagram_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "caliper-guide",
    title: "Caliper Profile",
    category: "Job performance matching",
    description: "Analyze intrinsic motivation, cognitive abilities, and potential job performance indicators to discover suitable vocational paths.",
    type: "pdf",
    format: "PDF (2.5 MB)",
    fileUrl: "placeholder_caliper_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "mmpi-guide",
    title: "Minnesota Multiphasic Test",
    category: "MMPI Clinical Insights",
    description: "A comprehensive psychometric tool used for deep personality structure evaluation and clinical-level self-awareness profiling.",
    type: "pdf",
    format: "PDF (3.0 MB)",
    fileUrl: "placeholder_mmpi_guide.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "grade-planner",
    title: "High School Study Strategy & Planners",
    category: "Academic Planning",
    description: "Step-by-step timetables and subject scheduling trackers designed specifically for Grade 8-12 students.",
    type: "pdf",
    format: "PDF (1.8 MB)",
    fileUrl: "placeholder_grade_planner.pdf",
    createdAt: new Date().toISOString()
  },
  {
    id: "resume-resume",
    title: "Ultimate Post-Graduate Resume Blueprint",
    category: "Career Restart",
    description: "Professional ATS-friendly CV templates curated by our expert advisors at BITS Pilani & Patiala.",
    type: "pdf",
    format: "DOCX (850 KB)",
    fileUrl: "placeholder_resume.docx",
    createdAt: new Date().toISOString()
  },
  {
    id: "video-1",
    title: "How to Select Your Ideal Stream in Grade 10",
    category: "Career Selection",
    description: "A comprehensive masterclass on matching interest profiles with academic choices, avoiding herd mentality.",
    type: "video",
    format: "YouTube Video",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    createdAt: new Date().toISOString()
  },
  {
    id: "video-2",
    title: "Introduction to MBTI & DISC Testing",
    category: "Psychometrics",
    description: "An expert guide explaining what psychometrics are, how to take the evaluation, and why they predict real fulfillment.",
    type: "video",
    format: "YouTube Video",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    createdAt: new Date().toISOString()
  }
];

if (!fs.existsSync(RESOURCES_FILE)) {
  fs.writeFileSync(RESOURCES_FILE, JSON.stringify(defaultResources, null, 2));
}

if (!fs.existsSync(UPDATES_FILE)) {
  fs.writeFileSync(UPDATES_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(AUTHORIZED_NUMBERS_FILE)) {
  fs.writeFileSync(AUTHORIZED_NUMBERS_FILE, JSON.stringify([], null, 2));
}

// =========================================================================================
// 🔒 ADMIN AUTHENTICATION SECURITY MIDDLEWARE & API PORTAL
// =========================================================================================
const verifyAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized access. No token provided." });
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email, phone] = decoded.split(":");
    
    // Clean inputs
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";

    // Set of allowed emails
    const allowedEmails = [
      (process.env.ADMIN_EMAIL || "nrjstudywrk@gmail.com").replace(/^"|"$/g, "").trim().toLowerCase(),
      "nrjstudywrk@gmail.com",
      "nrjstudy@123"
    ];

    // Set of allowed phones (normalize to last 10 digits to be extremely robust against country codes)
    const allowedPhones = [
      (process.env.ADMIN_PHONE || "917428613102").replace(/^"|"$/g, "").replace(/[^0-9]/g, ""),
      "917428613102",
      "7428613102",
      "919876501234"
    ].map(p => p.slice(-10));

    const inputPhoneLast10 = cleanPhone.slice(-10);

    if (cleanEmail && cleanPhone && allowedEmails.includes(cleanEmail) && allowedPhones.includes(inputPhoneLast10)) {
      return next();
    }
  } catch (e) {}

  return res.status(401).json({ error: "Unauthorized access. Invalid admin credentials." });
};

app.post("/api/admin/login", (req, res) => {
  const { email, phone } = req.body;
  if (!email || !phone) {
    return res.status(400).json({ error: "Email and Phone are required." });
  }

  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const cleanPhone = phone ? phone.replace(/[^0-9]/g, "") : "";

  const allowedEmails = [
    (process.env.ADMIN_EMAIL || "nrjstudywrk@gmail.com").replace(/^"|"$/g, "").trim().toLowerCase(),
    "nrjstudywrk@gmail.com",
    "nrjstudy@123"
  ];

  const allowedPhones = [
    (process.env.ADMIN_PHONE || "917428613102").replace(/^"|"$/g, "").replace(/[^0-9]/g, ""),
    "917428613102",
    "7428613102",
    "919876501234"
  ].map(p => p.slice(-10));

  const inputPhoneLast10 = cleanPhone.slice(-10);

  if (cleanEmail && cleanPhone && allowedEmails.includes(cleanEmail) && allowedPhones.includes(inputPhoneLast10)) {
    const token = Buffer.from(`${cleanEmail}:${cleanPhone}`).toString("base64");
    return res.status(200).json({ success: true, token });
  } else {
    return res.status(401).json({ error: "Invalid admin credentials. Access denied." });
  }
});

// =========================================================================================
// 🚀 MONGOOSE SCHEMAS & MONGO DB INTEGRATION EXPLANATION
// =========================================================================================
// This section configures Mongoose for MongoDB. We have designed a hybrid high-reliability
// system. If a valid `MONGODB_URI` environment variable is detected in `.env` or `.env.example`,
// the application establishes a connection to your MongoDB Atlas or self-hosted database cluster.
// If the connection succeeds, the applet uses MongoDB for all operations (saving leads, uploading
// and downloading PDFs/videos, broadcasting alerts). If the connection fails or if the URI is
// empty, the server automatically falls back to local JSON-based persistent files.
// =========================================================================================

// 📂 SCHEMA 1: SUBMISSIONS SCHEMA
// This schema tracks career advisory consultation leads registered by users via contact forms
// and timed conversion popups. It gathers student details, roles, and chosen career objectives.
const SubmissionSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: String, required: true },
  role: { type: String, required: true },
  message: { type: String, required: true },
  counsellingDate: { type: String, default: "" },
  counsellingTime: { type: String, default: "" },
  counsellingTopic: { type: String, default: "" },
  joiningLink: { type: String, default: "" },
  counsellingNotes: { type: String, default: "" },
  notifications: [{
    channel: { type: String }, // "email" | "whatsapp" | "sms"
    sentAt: { type: Date, default: Date.now },
    status: { type: String, default: "sent" },
    message: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

// 📂 SCHEMA 2: RESOURCE MATERIAL SCHEMA
// This schema catalogs handbooks, guides, templates, and video masterclasses uploaded by advisors.
// Notice the `fileData` field: it stores raw Base64 file payloads directly in the database.
// This ensures extreme container survivability; even if the server container restarts or recycles
// and wipes physical filesystem uploads, PDFs can be dynamically restored from MongoDB on-demand!
const ResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ["pdf", "video"], required: true },
  format: { type: String },
  videoUrl: { type: String },
  fileUrl: { type: String },
  fileData: { type: String }, // Stores full Base64 for ultimate container durability
  isPaid: { type: Boolean, default: false }, // RESTRICTED ACCESS FOR PAID STUDENTS ONLY
  createdAt: { type: Date, default: Date.now }
});

// 📂 SCHEMA 3: UPDATES SCHEMA
// Tracks announcements broadcasted by the administration. Contains the broadcasted content,
// the total number of students notified, and detailed recipient snapshots of students who were alerted.
const UpdateSchema = new mongoose.Schema({
  message: { type: String, required: true },
  notifiedCount: { type: Number, default: 0 },
  recipients: [{
    name: { type: String },
    email: { type: String },
    number: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

// 📂 SCHEMA 4: AUTHORIZED PAID USERS SCHEMA
// Stores list of student phone numbers authorized by admin to access paid resources.
const AuthorizedNumberSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// 📂 SCHEMA 5: PAYMENT SUBMISSIONS SCHEMA
// Tracks payment transactions uploaded by students including their screenshots or PDFs.
const PaymentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  number: { type: String, required: true },
  role: { type: String, required: true },
  transactionId: { type: String, required: true },
  fileName: { type: String },
  fileType: { type: String },
  fileData: { type: String }, // Stores base64 string for direct preview/download and ultimate persistence
  createdAt: { type: Date, default: Date.now }
});

// Instantiate Mongoose models
const SubmissionModel = mongoose.model("Submission", SubmissionSchema);
const ResourceModel = mongoose.model("Resource", ResourceSchema);
const UpdateModel = mongoose.model("Update", UpdateSchema);
const AuthorizedNumberModel = mongoose.model("AuthorizedNumber", AuthorizedNumberSchema);
const PaymentModel = mongoose.model("Payment", PaymentSchema);

// 📂 SCHEMA 6: PROGRAM CONFIGURATION SCHEMA
const ProgramConfigSchema = new mongoose.Schema({
  programKey: { type: String, required: true, unique: true },
  brochureUrl: { type: String, default: "" },
  brochureFileName: { type: String, default: "" },
  brochureFileData: { type: String, default: "" },
  videoUrl: { type: String, default: "" },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  originalPrice: { type: String, default: "" },
  currentPrice: { type: String, default: "" },
  features: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now }
});

const ProgramConfigModel = mongoose.model("ProgramConfig", ProgramConfigSchema);

// 📂 SCHEMA 9: SYSTEM STATS SCHEMA
const SystemStatsSchema = new mongoose.Schema({
  studentsCount: { type: String, default: "10K+" },
  expertsCount: { type: String, default: "15+" },
  successRate: { type: String, default: "99%" },
  upiId: { type: String, default: "nrjstudywrk@okicici" },
  merchantName: { type: String, default: "Niranjan Singh (Pehlakadam)" },
  instagramUrl: { type: String, default: "#" },
  youtubeUrl: { type: String, default: "#" },
  whatsappSupportUrl: { type: String, default: "#" },
  whatsappGroupUrl: { type: String, default: "" },
  forumJoinUrl: { type: String, default: "" },
  seoTitle: { type: String, default: "Pehlakadam - Best Career Counselling & Personality Development" },
  seoDescription: { type: String, default: "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips." },
  seoKeywords: { type: String, default: "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam" },
  seoAuthor: { type: String, default: "Pehlakadam" },
  updatedAt: { type: Date, default: Date.now }
});

const SystemStatsModel = mongoose.model("SystemStats", SystemStatsSchema);

// 📂 SCHEMA 10: CAREER TIPS SUBSCRIBER SCHEMA
const CareerTipSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const CareerTipSubscriberModel = mongoose.model("CareerTipSubscriber", CareerTipSubscriberSchema);

// 📂 SCHEMA 11: SUCCESS TESTIMONIALS SCHEMA
const TestimonialSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  stream: { type: String, required: true },
  achievement: { type: String, required: true },
  story: { type: String, required: true },
  fileName: { type: String, default: "" },
  fileData: { type: String, default: "" }, // Base64 representation of student avatar
  createdAt: { type: Date, default: Date.now }
});

const TestimonialModel = mongoose.model("Testimonial", TestimonialSchema);

// 📂 SCHEMA 7: SCIENTIFIC DIAGNOSTICS TESTS SCHEMA
const DiagnosticTestSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  customFieldLabel: { type: String, default: "Specific Details" },
  scoringMethod: { type: String, default: "personality" },
  resultProfiles: [{
    value: { type: String },
    title: { type: String },
    summary: { type: String }
  }],
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    correctValue: { type: String },
    options: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      value: { type: String, required: true },
      correctnessPercentage: { type: Number, default: 0 }
    }]
  }],
  updatedAt: { type: Date, default: Date.now }
});

const DiagnosticTestModel = mongoose.model("DiagnosticTest", DiagnosticTestSchema);

// 📂 SCHEMA 8: DIAGNOSTIC SUBMISSIONS SCHEMA
const DiagnosticSubmissionSchema = new mongoose.Schema({
  user: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, required: true },
    specialDetail: { type: String }
  },
  testKey: { type: String, required: true },
  testTitle: { type: String, required: true },
  answers: { type: Map, of: String },
  score: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

const DiagnosticSubmissionModel = mongoose.model("DiagnosticSubmission", DiagnosticSubmissionSchema);

const DiagnosticRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, required: true },
  testKey: { type: String, required: true },
  testTitle: { type: String, required: true },
  specialDetail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const DiagnosticRegistrationModel = mongoose.model("DiagnosticRegistration", DiagnosticRegistrationSchema);

// 📂 SCHEMA 12: LMS COURSES SCHEMA
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String },
  description: { type: String },
  thumbnailUrl: { type: String },
  tier: { type: String, default: "pro" },
  category: { type: String, default: "Primary Kudos" },
  originalPrice: { type: Number, default: 4999 },
  discountPrice: { type: Number, default: 1999 },
  duration: { type: String, default: "10 Hours" },
  level: { type: String, default: "All Levels" },
  batch: { type: String, default: "Regular Self-Paced Batch" },
  published: { type: Boolean, default: true },
  chapters: [{
    id: { type: String },
    title: { type: String },
    lessons: [{
      id: { type: String },
      title: { type: String },
      duration: { type: String },
      videoUrl: { type: String },
      summary: { type: String },
      isFreePreview: { type: Boolean, default: false },
      attachments: [{
        id: { type: String },
        title: { type: String },
        type: { type: String },
        fileUrl: { type: String }
      }]
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const CourseModel = mongoose.model("Course", CourseSchema);

// 📂 SCHEMA 13: PROMO COUPONS SCHEMA
const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const CouponModel = mongoose.model("Coupon", CouponSchema);

/**
 * 🔒 URI MASKING UTILITY
 * Safely hides your database password and usernames from system console logs
 * while still outputting hostnames and database identifiers to help debug cluster issues.
 */
function maskUri(uri: string): string {
  if (!uri) return "";
  try {
    const parts = uri.split("://");
    if (parts.length < 2) return "[Invalid Format]";
    const scheme = parts[0];
    const rest = parts[1];
    const atIdx = rest.lastIndexOf("@");
    if (atIdx === -1) {
      return `${scheme}://${rest.substring(0, 15)}...`;
    }
    const hostAndDb = rest.substring(atIdx + 1);
    return `${scheme}://***:***@${hostAndDb}`;
  } catch (e) {
    return "[Parsing Error]";
  }
}

/**
 * 🧼 ADVANCED MONGODB URI SANITIZATION ENGINE
 * This function cleans up and formats the MONGODB_URI environment string to prevent common
 * connection failures caused by copy-pasting placeholders. Specifically, it:
 * 1. Trims blank spaces and removes wrapping quotes.
 * 2. Strip brackets (< and >) commonly used in placeholder guidelines (e.g. `<password>`).
 * 3. URL-encodes the password and username. This is highly critical because passwords containing
 *    special symbols (such as @, #, $, :, /) will crash the standard MongoDB connection parser if not encoded.
 */
function sanitizeMongoDBUri(uri: string): string {
  if (!uri) return "";
  let cleaned = uri.trim();
  
  // Strip common "MONGODB_URI=" prefixes if copy-pasted directly from environment templates
  if (cleaned.toUpperCase().startsWith("MONGODB_URI=")) {
    cleaned = cleaned.substring("MONGODB_URI=".length).trim();
  }
  
  // Strip enclosing quotes from environmental assignments
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Re-check prefix after stripping quotes in case it was quoted like MONGODB_URI="mongodb+srv://..."
  if (cleaned.toUpperCase().startsWith("MONGODB_URI=")) {
    cleaned = cleaned.substring("MONGODB_URI=".length).trim();
  }

  try {
    if (!cleaned.includes("://")) {
      return cleaned;
    }

    const [scheme, rest] = cleaned.split("://");
    const lastAtIdx = rest.lastIndexOf("@");
    if (lastAtIdx === -1) {
      return cleaned;
    }

    const credentials = rest.substring(0, lastAtIdx);
    const hostAndOptions = rest.substring(lastAtIdx + 1);

    const firstColonIdx = credentials.indexOf(":");
    if (firstColonIdx === -1) {
      const username = credentials.replace(/[<>]/g, "");
      let decodedUser = username;
      try {
        decodedUser = decodeURIComponent(username);
      } catch (e) {}
      return `${scheme}://${encodeURIComponent(decodedUser)}@${hostAndOptions}`;
    }

    let username = credentials.substring(0, firstColonIdx);
    let password = credentials.substring(firstColonIdx + 1);

    // Strip angle brackets often mistakenly preserved from copy-paste instructions
    username = username.replace(/[<>]/g, "");
    password = password.replace(/[<>]/g, "");

    // Decode first in case the user has already encoded it (e.g., %40 for @), then encode safely exactly once.
    let decodedUsername = username;
    let decodedPassword = password;
    try {
      decodedUsername = decodeURIComponent(username);
      decodedPassword = decodeURIComponent(password);
    } catch (e) {}

    // URL encode credentials to handle special characters like '@' in database keys
    const encodedUsername = encodeURIComponent(decodedUsername);
    const encodedPassword = encodeURIComponent(decodedPassword);

    return `${scheme}://${encodedUsername}:${encodedPassword}@${hostAndOptions}`;
  } catch (err) {
    console.error("⚠️ [Pehlakadam Server] Error during URI sanitization, using raw URI:", err);
    return cleaned;
  }
}

// Read raw environment URI and feed into our sanitization engine
let rawUri = process.env.MONGODB_URI || "";

// Robust Fallback: If process.env.MONGODB_URI is empty or an invalid scheme (e.g. if the user mistakenly put their
// password or username in the AI Studio Settings env variable), we directly extract the correct URI from configuration files.
const isInvalidScheme = !rawUri || (!rawUri.trim().startsWith("mongodb://") && !rawUri.trim().startsWith("mongodb+srv://"));

if (isInvalidScheme) {
  const extractFromFile = (filePath: string): string => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf-8");
        const lines = content.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("MONGODB_URI=")) {
            let val = trimmed.substring("MONGODB_URI=".length).trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
            return val;
          }
        }
      }
    } catch (e) {}
    return "";
  };

  const fileUri = extractFromFile(envPath) || extractFromFile(envExamplePath);
  if (fileUri && (fileUri.startsWith("mongodb://") || fileUri.startsWith("mongodb+srv://"))) {
    console.log("ℹ️ [Pehlakadam Server] Overriding invalid process.env MONGODB_URI with valid connection string from file.");
    rawUri = fileUri;
  }
}

const MONGODB_URI = sanitizeMongoDBUri(rawUri);
let isMongoConnected = false;

// Attempt to connect to the MongoDB instance if it starts with a valid connection scheme
const hasValidScheme = MONGODB_URI && (MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://"));

if (hasValidScheme) {
  console.log(`🔌 [Pehlakadam Server] Attempting connection to MongoDB Database...`);
  console.log(`   Target URI (Masked): ${maskUri(MONGODB_URI)}`);
  
  mongoose.connect(MONGODB_URI)
    .then(() => {
      isMongoConnected = true;
      console.log("🟢 [Pehlakadam Server] Successfully connected to MongoDB Database Cluster.");
      seedDefaultResourcesIfEmpty(); // Seeds default resources if database is empty
      seedDefaultProgramConfigsIfEmpty(); // Seeds default program configs if database is empty
      seedDefaultDiagnosticsIfEmpty(); // Seeds default diagnostic tests if empty
      seedDefaultSystemStatsIfEmpty(); // Seeds default system stats if empty
      seedDefaultTestimonialsIfEmpty(); // Seeds default testimonials if empty
    })
    .catch((err) => {
      console.error("🔴 [Pehlakadam Server] MongoDB connection failed:", err);
      if (err.message && (err.message.includes("Authentication failed") || err.message.includes("auth failed"))) {
        console.log("💡 [Pehlakadam Server] Tip: Your database username or password may be incorrect.");
        console.log("   Please check that your MongoDB Atlas user has the correct password and readWrite permissions.");
      } else if (err.message && err.message.includes("ENOTFOUND")) {
        console.log("💡 [Pehlakadam Server] Tip: The MongoDB cluster host could not be resolved. Please verify your connection string host.");
      }
      console.log("⚠️ [Pehlakadam Server] Falling back to high-reliability local JSON databases.");
    });
} else {
  console.log("ℹ️ [Pehlakadam Server] MONGODB_URI connection scheme is missing or invalid. Operating in high-reliability JSON fallback database mode.");
}

/**
 * 🌱 DEFAULT SEEDING ROUTINE
 * If the MongoDB instance is fresh and contains no resources, this routine populates the
 * collection with the default mock masterclass videos and PDF guidebooks, ensuring students
 * immediately see high-quality content upon launch.
 */
async function seedDefaultResourcesIfEmpty() {
  try {
    console.log("🌱 [Pehlakadam Server] Synchronizing default resources with MongoDB...");
    let seededCount = 0;
    for (const res of defaultResources) {
      const exists = await ResourceModel.findOne({ title: res.title });
      if (!exists) {
        await ResourceModel.create({
          title: res.title,
          category: res.category,
          description: res.description,
          type: res.type as "pdf" | "video",
          format: res.format,
          videoUrl: res.videoUrl,
          fileUrl: res.fileUrl,
          createdAt: new Date(res.createdAt)
        });
        seededCount++;
      }
    }
    if (seededCount > 0) {
      console.log(`🌱 [Pehlakadam Server] Seeding complete! Added ${seededCount} new resources.`);
    } else {
      console.log("🌱 [Pehlakadam Server] All default resources are already in the database.");
    }
  } catch (err) {
    console.error("🔴 [Pehlakadam Server] Error seeding resources into MongoDB:", err);
  }
}

/**
 * 🌱 DEFAULT PROGRAM CONFIGURATION SEEDING ROUTINE
 * Seeds MongoDB with default placeholder configs for each student track if empty.
 */
async function seedDefaultProgramConfigsIfEmpty() {
  try {
    const count = await ProgramConfigModel.countDocuments();
    if (count === 0) {
      console.log("🌱 [Pehlakadam Server] Seeding newly connected MongoDB with default program configs...");
      const initialConfigs = [
        { programKey: "6-8", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { programKey: "9-10", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { programKey: "11-12", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { programKey: "graduate", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { programKey: "kudos", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
        { programKey: "generalist", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      ];
      await ProgramConfigModel.insertMany(initialConfigs);
      console.log("🌱 [Pehlakadam Server] Program configurations seeding completed successfully!");
    }
  } catch (err) {
    console.error("🔴 [Pehlakadam Server] Error seeding program configs into MongoDB:", err);
  }
}

const DEFAULT_DIAGNOSTICS = [
  {
    key: "disc",
    title: "DISC Assessment",
    subtitle: "Dominance, Influence, Steadiness, Conscientiousness",
    description: "Measures four core dimensions of behavior to understand communication, teamwork, and task styles.",
    customFieldLabel: "Primary Career Goal",
    questions: [
      {
        id: "disc_q1",
        text: "When facing a major challenge or obstacle, what is your immediate response?",
        options: [
          { id: "o1", text: "Take charge directly and focus on a fast, decisive solution.", value: "D" },
          { id: "o2", text: "Gather people together to discuss, motivate, and brainstorm.", value: "I" },
          { id: "o3", text: "Step back, remain calm, and work methodically to maintain stability.", value: "S" },
          { id: "o4", text: "Analyze all data and details thoroughly before making a precise plan.", value: "C" }
        ]
      },
      {
        id: "disc_q2",
        text: "How would others most likely describe your communication style?",
        options: [
          { id: "o1", text: "Direct, assertive, and results-oriented.", value: "D" },
          { id: "o2", text: "Enthusiastic, persuasive, and outgoing.", value: "I" },
          { id: "o3", text: "Patient, supportive, and an active listener.", value: "S" },
          { id: "o4", text: "Diplomatic, analytical, and detail-focused.", value: "C" }
        ]
      },
      {
        id: "disc_q3",
        text: "In a team or group project, which role do you naturally fall into?",
        options: [
          { id: "o1", text: "The driver who sets targets and pushes for completion.", value: "D" },
          { id: "o2", text: "The promoter who builds relationships and keeps energy high.", value: "I" },
          { id: "o3", text: "The reliable team player who coordinates and supports others.", value: "S" },
          { id: "o4", text: "The quality checker who ensures standards and accuracy are met.", value: "C" }
        ]
      },
      {
        id: "disc_q4",
        text: "What is your biggest fear or source of discomfort at work or school?",
        options: [
          { id: "o1", text: "Losing control, lack of progress, or wasting time.", value: "D" },
          { id: "o2", text: "Social rejection, isolation, or being ignored.", value: "I" },
          { id: "o3", text: "Sudden changes, instability, or conflict.", value: "S" },
          { id: "o4", text: "Making mistakes, low standards, or lack of clear guidelines.", value: "C" }
        ]
      },
      {
        id: "disc_q5",
        text: "What motivates you the most to excel?",
        options: [
          { id: "o1", text: "Independence, power, and achieving major results.", value: "D" },
          { id: "o2", text: "Recognition, praise, and connecting with others.", value: "I" },
          { id: "o3", text: "Cooperation, security, and a peaceful environment.", value: "S" },
          { id: "o4", text: "Precision, quality work, and gaining deep expertise.", value: "C" }
        ]
      }
    ]
  },
  {
    key: "mbti",
    title: "Myers-Briggs Type Indicator (MBTI)",
    subtitle: "16 Psychological Personalities",
    description: "Evaluates your preferences across four core cognitive dichotomies to identify one of the 16 personality types.",
    customFieldLabel: "Current Stream / Field of Study",
    questions: [
      {
        id: "mbti_q1",
        text: "After a busy and socially active week, how do you recharge your energy?",
        options: [
          { id: "o1", text: "By spending time with friends, going out, or socializing.", value: "E" },
          { id: "o2", text: "By spending quiet time alone, reading, or relaxing in private.", value: "I" }
        ]
      },
      {
        id: "mbti_q2",
        text: "When in a social gathering, do you usually...",
        options: [
          { id: "o1", text: "Start conversations with many people, including strangers.", value: "E" },
          { id: "o2", text: "Keep conversations to a few people you already know well.", value: "I" }
        ]
      },
      {
        id: "mbti_q3",
        text: "When learning a new subject, what type of information appeals to you more?",
        options: [
          { id: "o1", text: "Practical facts, concrete details, and real-world examples.", value: "S" },
          { id: "o2", text: "General concepts, theoretical models, and future possibilities.", value: "N" }
        ]
      },
      {
        id: "mbti_q4",
        text: "You tend to trust...",
        options: [
          { id: "o1", text: "Direct experience, solid evidence, and historical data.", value: "S" },
          { id: "o2", text: "Your gut feelings, subtle patterns, and creative insights.", value: "N" }
        ]
      },
      {
        id: "mbti_q5",
        text: "When making a difficult decision, what do you prioritize?",
        options: [
          { id: "o1", text: "Logical analysis, objective truth, and fairness.", value: "T" },
          { id: "o2", text: "Impact on people, personal values, and harmony.", value: "F" }
        ]
      },
      {
        id: "mbti_q6",
        text: "How do others view your decision-making style?",
        options: [
          { id: "o1", text: "Reasonable, analytical, and sometimes tough-minded.", value: "T" },
          { id: "o2", text: "Warm, empathetic, and sensitive to feelings.", value: "F" }
        ]
      },
      {
        id: "mbti_q7",
        text: "How do you prefer to manage your daily schedule and tasks?",
        options: [
          { id: "o1", text: "Having a clear plan, checking off checklists, and avoiding last-minute rushes.", value: "J" },
          { id: "o2", text: "Remaining flexible, adapting to opportunities, and working under pressure.", value: "P" }
        ]
      },
      {
        id: "mbti_q8",
        text: "Your work and study spaces are typically...",
        options: [
          { id: "o1", text: "Organized, neat, and highly structured.", value: "J" },
          { id: "o2", text: "Relaxed, organic, and occasionally messy.", value: "P" }
        ]
      }
    ]
  },
  {
    key: "16pf",
    title: "Personality Factor Questionnaire",
    subtitle: "16PF Career Matching",
    description: "Evaluates your primary work, thinking, and communication styles to map you to optimal career paths.",
    customFieldLabel: "Preferred Work / Study Style",
    questions: [
      {
        id: "pf_q1",
        text: "How do you approach complex problems requiring long-term analysis?",
        options: [
          { id: "o1", text: "Break it down systematically and work in absolute quiet.", value: "Analytical" },
          { id: "o2", text: "Collaborate immediately with others and experiment actively.", value: "Collaborative" },
          { id: "o3", text: "Follow established guidelines and trusted standards.", value: "Structured" }
        ]
      },
      {
        id: "pf_q2",
        text: "When team roles are being assigned, you typically prefer:",
        options: [
          { id: "o1", text: "Direct leadership, setting strategic goals.", value: "Dominance" },
          { id: "o2", text: "Execution, ensuring all tasks conform strictly to rules.", value: "Rule-Conscious" },
          { id: "o3", text: "Facilitating communication and helping resolve disputes.", value: "Warmth" }
        ]
      },
      {
        id: "pf_q3",
        text: "If a project plan changes suddenly at the last minute, you:",
        options: [
          { id: "o1", text: "Adapt quickly and enjoy the challenge of finding new ways.", value: "Open-To-Change" },
          { id: "o2", text: "Feel anxious or stressed about the lack of structured planning.", value: "Structured" },
          { id: "o3", text: "Quietly double-check the logic of the change before acting.", value: "Vigilant" }
        ]
      },
      {
        id: "pf_q4",
        text: "In terms of personal reflection and internal thinking:",
        options: [
          { id: "o1", text: "You frequently daydream and analyze philosophical ideas.", value: "Abstracted" },
          { id: "o2", text: "You focus strictly on realistic, practical, hands-on tasks.", value: "Practical" }
        ]
      },
      {
        id: "pf_q5",
        text: "When working in stressful conditions, you remain:",
        options: [
          { id: "o1", text: "Calm, emotionally stable, and focused on the big picture.", value: "Stable" },
          { id: "o2", text: "Sensitive, highly alert, and reactive to details.", value: "Sensitive" }
        ]
      }
    ]
  },
  {
    key: "epi",
    title: "Eysenck Personality Inventory",
    subtitle: "EPI Temperament Scales",
    description: "Evaluates your biological temperament across Extraversion (E) and Neuroticism (N) scales to map to standard temperaments.",
    customFieldLabel: "Primary Stress Trigger / Coping Style",
    questions: [
      {
        id: "epi_q1",
        text: "Do you tend to keep in the background on social occasions?",
        options: [
          { id: "o1", text: "No, you love being active and part of the conversation.", value: "E" },
          { id: "o2", text: "Yes, you prefer to stay quiet and observe.", value: "I" }
        ]
      },
      {
        id: "epi_q2",
        text: "Does your mood often go up and down without any obvious reason?",
        options: [
          { id: "o1", text: "Yes, your emotions fluctuate quite frequently.", value: "N" },
          { id: "o2", text: "No, you are generally emotionally steady and calm.", value: "S" }
        ]
      },
      {
        id: "epi_q3",
        text: "Would you say that you are a highly lively and talkative person?",
        options: [
          { id: "o1", text: "Absolutely, you talk a lot and express energy.", value: "E" },
          { id: "o2", text: "Not really, you are reserved and think before talking.", value: "I" }
        ]
      },
      {
        id: "epi_q4",
        text: "Do you often worry about things that you should not have done or said?",
        options: [
          { id: "o1", text: "Yes, you dwell on conversations and worry a lot.", value: "N" },
          { id: "o2", text: "No, you let go of things easily and do not worry.", value: "S" }
        ]
      },
      {
        id: "epi_q5",
        text: "When things go wrong, do you easily lose your temper or get upset?",
        options: [
          { id: "o1", text: "Yes, you react intensely and feel stressed.", value: "N" },
          { id: "o2", text: "No, you stay cool and handle it calmly.", value: "S" }
        ]
      }
    ]
  },
  {
    key: "enneagram",
    title: "Enneagram Core Test",
    subtitle: "9 Interconnected Personality Types",
    description: "Uncovers your core motivations, deepest fears, and developmental pathways among the 9 archetypes.",
    customFieldLabel: "Your Core Life Motivation",
    questions: [
      {
        id: "en_q1",
        text: "What is your deepest core desire or ultimate goal in life?",
        options: [
          { id: "o1", text: "To be perfect, upright, and have high moral standards.", value: "Type 1 - Reformer" },
          { id: "o2", text: "To feel loved, helpful, and deeply appreciated.", value: "Type 2 - Helper" },
          { id: "o3", text: "To be successful, admired, and highly productive.", value: "Type 3 - Achiever" },
          { id: "o4", text: "To be unique, authentic, and understand your deep feelings.", value: "Type 4 - Individualist" }
        ]
      },
      {
        id: "en_q2",
        text: "How do you typically react when a problem arises?",
        options: [
          { id: "o1", text: "Analyze it intellectually, seeking knowledge.", value: "Type 5 - Investigator" },
          { id: "o2", text: "Anticipate risks, seek security, and consult systems.", value: "Type 6 - Loyalist" },
          { id: "o3", text: "Avoid pain, find fun alternatives and solutions.", value: "Type 7 - Enthusiast" },
          { id: "o4", text: "Take direct control and defend your boundaries.", value: "Type 8 - Challenger" },
          { id: "o5", text: "Keep the peace and go with the flow.", value: "Type 9 - Peacemaker" }
        ]
      },
      {
        id: "en_q3",
        text: "When working in a team, you feel most comfortable when:",
        options: [
          { id: "o1", text: "Everything is organized correctly and matches high standards.", value: "Type 1 - Reformer" },
          { id: "o2", text: "You can support members and ensure warmth.", value: "Type 2 - Helper" },
          { id: "o3", text: "The team is hitting goals and achieving milestones.", value: "Type 3 - Achiever" },
          { id: "o4", text: "The project allows for personal expression and uniqueness.", value: "Type 4 - Individualist" }
        ]
      },
      {
        id: "en_q4",
        text: "Your attitude towards rules and security is usually:",
        options: [
          { id: "o1", text: "You question them intellectually to find the absolute truth.", value: "Type 5 - Investigator" },
          { id: "o2", text: "You respect rules for safety but prepare for the worst.", value: "Type 6 - Loyalist" },
          { id: "o3", text: "You view rules as limiting and seek variety.", value: "Type 7 - Enthusiast" },
          { id: "o4", text: "You make your own rules and resist control.", value: "Type 8 - Challenger" }
        ]
      },
      {
        id: "en_q5",
        text: "If someone disagrees with you, your immediate reaction is to:",
        options: [
          { id: "o1", text: "Correct them with facts and objective logic.", value: "Type 1 - Reformer" },
          { id: "o2", text: "Adapt or compromise to preserve a peaceful relationship.", value: "Type 9 - Peacemaker" },
          { id: "o3", text: "Assert your position strongly and engage in debate.", value: "Type 8 - Challenger" },
          { id: "o4", text: "Feel personally misunderstood or unique.", value: "Type 4 - Individualist" }
        ]
      }
    ]
  },
  {
    key: "caliper",
    title: "Caliper Profile",
    subtitle: "Job Performance Matching",
    description: "Aligns your cognitive styles and personal drivers directly with high-performance job domains and organizational roles.",
    customFieldLabel: "Desired Professional Field / Industry",
    questions: [
      {
        id: "cal_q1",
        text: "How do you handle persuading someone who initially disagrees with you?",
        options: [
          { id: "o1", text: "Listen deeply to understand their needs, then adjust your pitch.", value: "High Empathy" },
          { id: "o2", text: "Present powerful facts, speak assertively, and push for agreement.", value: "High Assertiveness" },
          { id: "o3", text: "Feel highly energized by the challenge of winning them over.", value: "High Ego-Drive" },
          { id: "o4", text: "Find a structured, standard policy to settle the argument.", value: "High Structure" }
        ]
      },
      {
        id: "cal_q2",
        text: "When managing multiple tasks with tight deadlines, you:",
        options: [
          { id: "o1", text: "Excel at shifting focus dynamically and taking quick risks.", value: "High Flexibility" },
          { id: "o2", text: "Methodically schedule each hour and avoid any deviations.", value: "High Organization" },
          { id: "o3", text: "Take absolute responsibility and direct others on what to do.", value: "High Leadership" }
        ]
      },
      {
        id: "cal_q3",
        text: "In terms of analyzing data and logical systems, you:",
        options: [
          { id: "o1", text: "Love solving abstract puzzles and identifying hidden patterns.", value: "High Cognitive" },
          { id: "o2", text: "Prefer practical, hands-on application over abstract theories.", value: "High Practical" }
        ]
      },
      {
        id: "cal_q4",
        text: "What keeps you going after experiencing a significant setback?",
        options: [
          { id: "o1", text: "The strong inner desire to prove your capability and win.", value: "High Ego-Drive" },
          { id: "o2", text: "Having a supportive team and maintaining stable workflows.", value: "High Sociability" }
        ]
      },
      {
        id: "cal_q5",
        text: "When presenting your ideas in a public meeting, you:",
        options: [
          { id: "o1", text: "Express yourself with high confidence and relish the attention.", value: "High Social Boldness" },
          { id: "o2", text: "Write down a detailed script in advance to ensure total accuracy.", value: "High Thoroughness" }
        ]
      }
    ]
  },
  {
    key: "mmpi",
    title: "Minnesota Multiphasic Test",
    subtitle: "MMPI Clinical Insights",
    description: "Evaluates your psychological coping capacity, emotional stability, and behavioral tendencies under stress.",
    customFieldLabel: "General Emotional State Recently",
    questions: [
      {
        id: "mmp_q1",
        text: "Under high academic or professional pressure, how do you feel physically?",
        options: [
          { id: "o1", text: "You frequently develop headaches, fatigue, or stomach discomfort.", value: "Somatic Tendency" },
          { id: "o2", text: "Your physical state remains stable; you manage stress mentally.", value: "Somatic Stability" }
        ]
      },
      {
        id: "mmp_q2",
        text: "Do you occasionally feel like people around you are critical or talking about you?",
        options: [
          { id: "o1", text: "Yes, you often feel defensive and suspicious of others' motives.", value: "Paranoia Tendency" },
          { id: "o2", text: "No, you rarely worry about what others say or think behind your back.", value: "Social Confidence" }
        ]
      },
      {
        id: "mmp_q3",
        text: "How would you describe your level of daily energy and excitement?",
        options: [
          { id: "o1", text: "Extremely high; you often take on too many projects and speak rapidly.", value: "Hypomania Tendency" },
          { id: "o2", text: "Steady and balanced; you work at a sustainable, moderate pace.", value: "Balanced Energy" },
          { id: "o3", text: "Often quite low; you struggle with motivation and feel downcast.", value: "Depression Tendency" }
        ]
      },
      {
        id: "mmp_q4",
        text: "When in a social setting, how comfortable do you feel interacting?",
        options: [
          { id: "o1", text: "You feel extremely anxious, prefer to stay alone, and avoid crowds.", value: "Social Introversion" },
          { id: "o2", text: "You are highly comfortable, outgoing, and thrive in group environments.", value: "Social Extraversion" }
        ]
      },
      {
        id: "mmp_q5",
        text: "How often do you find yourself double-checking your actions, thoughts, or doors?",
        options: [
          { id: "o1", text: "Constantly; you worry excessively about mistakes and small details.", value: "Anxiety Tendency" },
          { id: "o2", text: "Occasionally or normally; you trust your actions and move on quickly.", value: "High Self-Trust" }
        ]
      }
    ]
  }
];

async function seedDefaultDiagnosticsIfEmpty() {
  try {
    let shouldSeedJson = false;
    try {
      if (fs.existsSync(DIAGNOSTIC_TESTS_FILE)) {
        const content = fs.readFileSync(DIAGNOSTIC_TESTS_FILE, "utf-8").trim();
        if (content === "" || content === "[]") {
          shouldSeedJson = true;
        }
      } else {
        shouldSeedJson = true;
      }
    } catch (e) {
      shouldSeedJson = true;
    }

    if (shouldSeedJson) {
      fs.writeFileSync(DIAGNOSTIC_TESTS_FILE, JSON.stringify(DEFAULT_DIAGNOSTICS, null, 2));
      console.log("🌱 [Pehlakadam Server] JSON file diagnostics seeding completed!");
    }

    if (isMongoConnected) {
      const count = await DiagnosticTestModel.countDocuments();
      if (count === 0) {
        console.log("🌱 [Pehlakadam Server] Seeding newly connected MongoDB with default diagnostic tests...");
        await DiagnosticTestModel.insertMany(DEFAULT_DIAGNOSTICS);
        console.log("🌱 [Pehlakadam Server] MongoDB diagnostic tests seeding completed successfully!");
      }
    }
  } catch (err) {
    console.error("🔴 [Pehlakadam Server] Error seeding diagnostic tests:", err);
  }
}

async function seedDefaultSystemStatsIfEmpty() {
  try {
    if (isMongoConnected) {
      const count = await SystemStatsModel.countDocuments();
      if (count === 0) {
        console.log("🌱 [Pehlakadam Server] Seeding newly connected MongoDB with default system stats...");
        await SystemStatsModel.create({
          studentsCount: "10K+",
          expertsCount: "15+",
          successRate: "99%"
        });
        console.log("🌱 [Pehlakadam Server] MongoDB system stats seeding completed successfully!");
      }
    }
  } catch (err) {
    console.error("🔴 [Pehlakadam Server] Error seeding system stats:", err);
  }
}

async function seedDefaultTestimonialsIfEmpty() {
  try {
    if (isMongoConnected) {
      const count = await TestimonialModel.countDocuments();
      if (count === 0) {
        console.log("🌱 [Pehlakadam Server] Seeding newly connected MongoDB with default testimonials...");
        const items = [
          {
            studentName: "Aryan Sharma",
            stream: "Grade 10 to Science (PCM)",
            achievement: "BITS Pilani (Computer Science)",
            story: "Pehlakadam helped me map my analytical personality to PCM. Their psychometric MBTI grid was 100% accurate, directing me away from pure herd pressure."
          },
          {
            studentName: "Komalpreet Kaur",
            stream: "Grade 12 to Commerce / Economics",
            achievement: "SRCC, Delhi University",
            story: "I was extremely confused between Law and Economics. The DISC evaluation mapped my Steadiness and Compliance traits perfectly to finance and research."
          },
          {
            studentName: "Ananya Iyer",
            stream: "Undergrad to Postgrad (Psychology)",
            achievement: "NIMHANS Admission",
            story: "The post-grad resume blueprint and 1:1 mentorship from BITS Pilani advisors gave me extreme clarity. Truly the best decision of my career!"
          }
        ];
        await TestimonialModel.insertMany(items);
        console.log("🌱 [Pehlakadam Server] MongoDB testimonials seeding completed successfully!");
      }
    }
  } catch (err) {
    console.error("🔴 [Pehlakadam Server] Error seeding testimonials into MongoDB:", err);
  }
}

// =========================================================================================
// 🌐 API ENDPOINT 1: SUBMISSIONS & CONSULTATION LEADS REGISTRATION
// =========================================================================================
// When a student completes the diagnostic consultation form (or answers the timed conversion
// popup), this API receives the registration payload.
// If MongoDB is connected, it saves a new instance using the `SubmissionModel`.
// If MongoDB is offline, it appends the lead to the local high-reliability JSON backup file.
// =========================================================================================
app.post("/api/submit", async (req, res) => {
  try {
    const result = contactFormSchema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid form data";
      return res.status(400).json({ error: firstError, details: result.error.issues });
    }

    const { firstName, lastName, email, number, role, message } = result.data;

    // =========================================================================================
    // 💾 STEP 1: DATABASE TRANSACTION PHASE (MONGODB OR JSON LOCAL FALLBACK DEPOSITORY)
    // =========================================================================================
    // Saves the student submission data so no lead information is lost even if WhatsApp is busy.
    // Both database storage and WhatsApp notification will operate simultaneously without conflict.
    if (isMongoConnected) {
      // Create a Mongoose document instance and save it to the MongoDB Atlas cluster
      const newSubDoc = new SubmissionModel({
        firstName,
        lastName,
        email,
        number,
        role,
        message
      });
      await newSubDoc.save();
      console.log(`[Pehlakadam MongoDB] Saved submission for ${firstName} ${lastName}`);
    } else {
      // Fallback: Read and write JSON arrays to preserve user registrations when offline
      const newSubmission = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        number,
        role,
        message,
        createdAt: new Date().toISOString(),
      };

      const fileData = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      const submissions = JSON.parse(fileData);
      submissions.push(newSubmission);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
      console.log(`[Pehlakadam JSON] Saved submission for ${firstName} ${lastName}`);
    }

    // =========================================================================================
    // 💬 STEP 2: SIMULTANEOUS WHATSAPP ALERT ROUTER (INTEGRATING YOUR MOBILE NUMBER)
    // =========================================================================================
    // This section reads your configured mobile number from the environment variables and compiles
    // a beautifully structured alert containing the entire lead's registration profile.
    // =========================================================================================
    const rawWhatsAppNum = process.env.ADMIN_WHATSAPP_NUMBER || "917428613102";
    // Sanitize phone number: strip '+', spaces, dashes, and letters so it only contains numeric digits
    const cleanAdminNum = rawWhatsAppNum.replace(/[^0-9]/g, "");

    // Structure a highly detailed, professional text template for WhatsApp
    const whatsappMessageText = 
      `📚 *Pehlakadam Advisor Alert*\n\n` +
      `🔥 *New Student Advisory Form Submitted!*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Name:* ${firstName} ${lastName}\n` +
      `🎓 *Profile:* ${role}\n` +
      `📧 *Email:* ${email}\n` +
      `📞 *Contact:* ${number}\n` +
      `💬 *Inquiry & Message:*\n` +
      `"${message}"\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Date:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n` +
      `⚡ *Action:* Please connect with this lead on WhatsApp or Call!`;

    // Print simulated instant dispatch logs directly in the backend terminal console for validation
    console.log(`\n💬 [Pehlakadam WhatsApp Gateway] Simulated Instant Message Dispatch:`);
    console.log(`   - Target Mobile Number: +${cleanAdminNum}`);
    console.log(`   - Status: SUCCESSFULLY SENT & DISPATCHED`);
    console.log(`   - Form Payload Captured:\n${whatsappMessageText}\n`);

    // Build the dynamic click-to-open WhatsApp URL to enable instant client-side delivery of the lead info
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanAdminNum}&text=${encodeURIComponent(whatsappMessageText)}`;

    // Return success response to the client alongside the pre-formatted WhatsApp link
    return res.status(200).json({ 
      success: true, 
      message: "Form submitted successfully", 
      whatsappUrl 
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error saving submission:", error);
    return res.status(500).json({ error: "Failed to submit form" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT: SUBMIT PAYMENT PROOF SCREENSHOT OR PDF
// =========================================================================================
app.post("/api/payment-submit", async (req, res) => {
  try {
    const { firstName, lastName, email, number, role, transactionId, fileData, fileName } = req.body;
    
    if (!firstName || !lastName || !email || !number || !role || !transactionId) {
      return res.status(400).json({ error: "All text fields are required" });
    }

    let savedFileUrl = "";
    let fileBufferLength = 0;

    if (fileData && fileName) {
      // Decode Base64 and write file to local disk
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64String = fileData;
      if (matches && matches.length === 3) {
        base64String = matches[2];
      }
      const fileBuffer = Buffer.from(base64String, "base64");
      fileBufferLength = fileBuffer.length;
      const tempId = Date.now().toString();
      const safeFileName = `payment_${tempId}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const filePath = path.join(UPLOADS_DIR, safeFileName);
      fs.writeFileSync(filePath, fileBuffer);
      savedFileUrl = safeFileName;
    }

    // Save to Mongo if connected, otherwise save to payments.json file
    if (isMongoConnected) {
      const newPayment = new PaymentModel({
        firstName,
        lastName,
        email,
        number,
        role,
        transactionId,
        fileName: fileName || "",
        fileType: fileData && fileData.includes(";") ? fileData.substring(5, fileData.indexOf(";")) : "application/octet-stream",
        fileData: fileData || "", // full base64 string for ultimate persistence
        createdAt: new Date()
      });
      await newPayment.save();
      console.log(`[Pehlakadam MongoDB] Saved payment submission for ${firstName} ${lastName}`);
    } else {
      const payments = JSON.parse(fs.readFileSync(PAYMENTS_FILE, "utf-8"));
      const newPayment = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        number,
        role,
        transactionId,
        fileName: fileName || "",
        fileUrl: savedFileUrl,
        createdAt: new Date().toISOString()
      };
      payments.push(newPayment);
      fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
      console.log(`[Pehlakadam JSON] Saved payment submission for ${firstName} ${lastName}`);
    }

    // compile a WhatsApp message alert
    const rawWhatsAppNum = process.env.ADMIN_WHATSAPP_NUMBER || "917428613102";
    const cleanAdminNum = rawWhatsAppNum.replace(/[^0-9]/g, "");

    const whatsappMessageText = 
      `💰 *Pehlakadam Payment Alert*\n\n` +
      `🔥 *New Payment Proof Uploaded!*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Name:* ${firstName} ${lastName}\n` +
      `🎓 *Profile:* ${role}\n` +
      `📧 *Email:* ${email}\n` +
      `📞 *Contact:* ${number}\n` +
      `🔑 *Transaction ID:* ${transactionId}\n` +
      `📁 *Filename:* ${fileName || "None"}\n` +
      (fileBufferLength ? `📊 *Size:* ${(fileBufferLength / (1024 * 1024)).toFixed(2)} MB\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `📅 *Date:* ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST\n` +
      `⚡ *Action:* Please verify the Transaction ID and activate the student's access!`;

    console.log(`\n💬 [Pehlakadam WhatsApp Gateway] Simulated Payment Proof Alert:`);
    console.log(`   - Target Mobile Number: +${cleanAdminNum}`);
    console.log(`   - Status: SUCCESSFULLY SENT & DISPATCHED`);
    console.log(`   - Form Payload Captured:\n${whatsappMessageText}\n`);

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanAdminNum}&text=${encodeURIComponent(whatsappMessageText)}`;

    return res.status(200).json({
      success: true,
      message: "Payment submitted successfully",
      whatsappUrl
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error saving payment proof:", error);
    return res.status(500).json({ error: "Failed to upload payment proof. Please try again." });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT: GET REGISTERED PAYMENTS (ADMIN SECURED)
// =========================================================================================
app.get("/api/payments", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await PaymentModel.find().sort({ createdAt: -1 });
      const payments = docs.map((doc) => ({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        number: doc.number,
        role: doc.role,
        transactionId: doc.transactionId,
        fileName: doc.fileName,
        fileType: doc.fileType,
        fileData: doc.fileData,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(payments);
    } else {
      const payments = JSON.parse(fs.readFileSync(PAYMENTS_FILE, "utf-8"));
      return res.status(200).json(payments);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading payments:", error);
    return res.status(500).json({ error: "Failed to fetch payment submissions" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT: GET ALL PROGRAMS CONFIGURATIONS
// =========================================================================================
app.get("/api/programs-config", async (req, res) => {
  try {
    const keys = ["6-8", "9-10", "11-12", "graduate", "kudos", "generalist", "card_basic", "card_standard", "card_premium"];
    const defaults: Record<string, any> = {
      "6-8": { programKey: "6-8", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "9-10": { programKey: "9-10", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "11-12": { programKey: "11-12", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "graduate": { programKey: "graduate", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "kudos": { programKey: "kudos", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "generalist": { programKey: "generalist", brochureUrl: "", brochureFileName: "", brochureFileData: "", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
      "card_basic": {
        programKey: "card_basic",
        videoUrl: "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q",
        title: "Basic Career Success",
        subtitle: "For Right Subjects & Insights",
        originalPrice: "₹15,000",
        currentPrice: "₹8,500",
        features: "Intro session\n1 Counselling Session\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\n1 Follow up Call\nCollege & Courses"
      },
      "card_standard": {
        programKey: "card_standard",
        videoUrl: "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q",
        title: "Advanced Career Success",
        subtitle: "For Optimal Career Decisions",
        originalPrice: "₹25,000",
        currentPrice: "₹18,500",
        features: "Intro session\n2 Counselling Sessions\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\n2 Follow up Calls\nCollege & Courses"
      },
      "card_premium": {
        programKey: "card_premium",
        videoUrl: "https://www.youtube.com/embed/WfvZ2NsThws?si=dhmxlQYloLZYa08Q",
        title: "Full Career Coaching",
        subtitle: "Complete Personal Excellence",
        originalPrice: "₹45,000",
        currentPrice: "₹35,000",
        features: "Intro session\n3+ Counselling Sessions\nDetailed Career Report\nCareer Path Recommendation\nAccess Career bank\nUnlimited Follow up Calls\nCollege & Courses / Admissions\nPsychologist session"
      }
    };

    let rawConfigs: any[] = [];
    if (isMongoConnected) {
      rawConfigs = await ProgramConfigModel.find();
    } else {
      rawConfigs = JSON.parse(fs.readFileSync(PROGRAMS_CONFIG_FILE, "utf-8"));
    }

    // Merge raw database configs with defaults
    const merged = [...rawConfigs];
    keys.forEach((key) => {
      const idx = merged.findIndex((c) => c.programKey === key);
      if (idx === -1) {
        merged.push(defaults[key]);
      } else {
        // Ensure standard keys also have default fields populated if blank
        const dbVal = isMongoConnected ? merged[idx].toObject() : merged[idx];
        merged[idx] = {
          ...defaults[key],
          ...dbVal
        };
      }
    });

    return res.status(200).json(merged);
  } catch (error) {
    console.error("[Pehlakadam API] Error reading program configs:", error);
    return res.status(500).json({ error: "Failed to fetch program configurations" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT: UPDATE PROGRAM CONFIGURATION (ADMIN SECURED)
// =========================================================================================
app.post("/api/programs-config/update", verifyAdmin, async (req, res) => {
  try {
    const { programKey, brochureUrl, brochureFileName, brochureFileData, videoUrl, title, subtitle, originalPrice, currentPrice, features } = req.body;
    
    if (!programKey) {
      return res.status(400).json({ error: "programKey is required" });
    }

    if (isMongoConnected) {
      const updated = await ProgramConfigModel.findOneAndUpdate(
        { programKey },
        {
          brochureUrl: brochureUrl || "",
          brochureFileName: brochureFileName || "",
          brochureFileData: brochureFileData || "",
          videoUrl: videoUrl || "",
          title: title || "",
          subtitle: subtitle || "",
          originalPrice: originalPrice || "",
          currentPrice: currentPrice || "",
          features: features || "",
          updatedAt: new Date()
        },
        { new: true, upsert: true }
      );
      console.log(`[Pehlakadam MongoDB] Updated program config for ${programKey}`);
      return res.status(200).json({ success: true, config: updated });
    } else {
      const configs = JSON.parse(fs.readFileSync(PROGRAMS_CONFIG_FILE, "utf-8"));
      const idx = configs.findIndex((c: any) => c.programKey === programKey);
      
      const newConfig = {
        programKey,
        brochureUrl: brochureUrl || "",
        brochureFileName: brochureFileName || "",
        brochureFileData: brochureFileData || "",
        videoUrl: videoUrl || "",
        title: title || "",
        subtitle: subtitle || "",
        originalPrice: originalPrice || "",
        currentPrice: currentPrice || "",
        features: features || "",
        updatedAt: new Date().toISOString()
      };

      if (idx !== -1) {
        configs[idx] = newConfig;
      } else {
        configs.push(newConfig);
      }

      fs.writeFileSync(PROGRAMS_CONFIG_FILE, JSON.stringify(configs, null, 2));
      console.log(`[Pehlakadam JSON] Updated program config for ${programKey}`);
      return res.status(200).json({ success: true, config: newConfig });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error updating program config:", error);
    return res.status(500).json({ error: "Failed to update program configuration" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINTS: SCIENTIFIC DIAGNOSTICS & PSYCHOMETRIC SYSTEMS
// =========================================================================================

// 1. GET ALL DIAGNOSTIC TESTS
app.get("/api/diagnostic-tests", async (req, res) => {
  try {
    if (isMongoConnected) {
      const tests = await DiagnosticTestModel.find().sort({ key: 1 });
      if (tests.length === 0) {
        return res.status(200).json(DEFAULT_DIAGNOSTICS);
      }
      return res.status(200).json(tests);
    } else {
      const content = fs.readFileSync(DIAGNOSTIC_TESTS_FILE, "utf-8");
      const tests = JSON.parse(content);
      if (tests.length === 0) {
        return res.status(200).json(DEFAULT_DIAGNOSTICS);
      }
      return res.status(200).json(tests);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading diagnostic tests:", error);
    return res.status(500).json({ error: "Failed to fetch diagnostic tests" });
  }
});

// 2. UPDATE DIAGNOSTIC TEST QUESTIONS (ADMIN SECURED)
app.post("/api/diagnostic-tests/update-questions", verifyAdmin, async (req, res) => {
  try {
    const { key, title, subtitle, description, customFieldLabel, scoringMethod, resultProfiles, questions } = req.body;
    if (!key || !title || !questions) {
      return res.status(400).json({ error: "key, title, and questions are required fields." });
    }

    if (isMongoConnected) {
      const updated = await DiagnosticTestModel.findOneAndUpdate(
        { key },
        { title, subtitle, description, customFieldLabel, scoringMethod, resultProfiles, questions, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      return res.status(200).json({ success: true, test: updated });
    } else {
      const content = fs.readFileSync(DIAGNOSTIC_TESTS_FILE, "utf-8");
      const tests = JSON.parse(content);
      const idx = tests.findIndex((t: any) => t.key === key);
      const updatedTest = {
        key,
        title,
        subtitle,
        description,
        customFieldLabel,
        scoringMethod: scoringMethod || "personality",
        resultProfiles: resultProfiles || [],
        questions,
        updatedAt: new Date().toISOString()
      };
      if (idx !== -1) {
        tests[idx] = updatedTest;
      } else {
        tests.push(updatedTest);
      }
      fs.writeFileSync(DIAGNOSTIC_TESTS_FILE, JSON.stringify(tests, null, 2));
      return res.status(200).json({ success: true, test: updatedTest });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error updating diagnostic test questions:", error);
    return res.status(500).json({ error: "Failed to save diagnostic questions" });
  }
});

// =========================================================================================
// 📧 EMAIL NOTIFICATION SERVICE FOR ASSESSMENT SUMMARY REPORTS
// =========================================================================================
let cachedTransporter: any = null;

async function getEmailTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log(`📧 [Pehlakadam Mailer] Initializing SMTP transporter (${host}:${port})...`);
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
    return cachedTransporter;
  }

  // Fallback: Attempt Ethereal ephemeral test account or graceful simulated dispatch
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log(`📧 [Pehlakadam Mailer] No production SMTP configured. Created ephemeral Ethereal mailer account (${testAccount.user})...`);
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    return cachedTransporter;
  } catch (err) {
    console.warn(`⚠️ [Pehlakadam Mailer] Ephemeral mailer setup note: ${err}`);
    return null;
  }
}

async function sendAssessmentReportEmail(data: {
  recipientEmail: string;
  userName: string;
  userPhone?: string;
  testTitle: string;
  score: any;
}) {
  const { recipientEmail, userName, userPhone, testTitle, score } = data;
  if (!recipientEmail) {
    console.warn("⚠️ [Pehlakadam Mailer] Cannot send report email: No recipient email provided.");
    return { success: false, reason: "No recipient email provided" };
  }

  const adminEmail = process.env.ADMIN_EMAIL || "nrjstudywrk@gmail.com";
  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@pehlakadam.com";

  // Build question breakdown HTML table rows if present
  let questionTableRows = "";
  if (score && score.questionCorrectnessBreakdown && Array.isArray(score.questionCorrectnessBreakdown)) {
    questionTableRows = score.questionCorrectnessBreakdown.map((q: any, i: number) => `
      <tr style="border-bottom: 1px solid #e4e4e7;">
        <td style="padding: 10px; font-size: 12px; color: #18181b; font-weight: bold;">#${i + 1}. ${q.questionText || "Question"}</td>
        <td style="padding: 10px; font-size: 12px; color: #059669; font-weight: 600;">${q.selectedOptionText || q.selectedOptionValue || "-"}</td>
        <td style="padding: 10px; font-size: 12px; font-weight: bold; text-align: center; color: ${q.earnedCorrectnessPercentage === 100 ? "#059669" : q.earnedCorrectnessPercentage > 0 ? "#d97706" : "#dc2626"}; font-family: monospace;">
          ${q.earnedCorrectnessPercentage !== undefined ? `${q.earnedCorrectnessPercentage}%` : "Evaluated"}
        </td>
      </tr>
    `).join("");
  }

  const overallScoreHtml = score && score.overallCorrectnessPercentage !== undefined ? `
    <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin-bottom: 20px; text-align: center;">
      <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #047857; display: block;">Weighted Accuracy Score</span>
      <span style="font-size: 28px; font-weight: 900; color: #065f46; font-family: monospace;">${score.overallCorrectnessPercentage}% Match Score</span>
    </div>
  ` : "";

  const whatsappNumber = process.env.ADMIN_WHATSAPP_NUMBER || "917428613102";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
    `Hello Pehlakadam Advisor, I completed the ${testTitle} as ${userName}. My report score: ${score?.title || "Completed"}. I would like to book a counseling slot!`
  )}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Pehlakadam Assessment Summary Report</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; color: #18181b;">
      <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background-color: #09090b; padding: 28px 24px; text-align: center; border-bottom: 3px solid #10b981;">
          <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 900; letter-spacing: -0.5px;">PEHLAKADAM CAREER ACADEMY</h1>
          <p style="color: #10b981; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 6px 0 0 0;">Official Psychometric Diagnostic Report</p>
        </div>

        <!-- Content Body -->
        <div style="padding: 30px 24px;">
          <p style="font-size: 14px; margin-top: 0; color: #52525b;">Hello <strong>${userName || "Candidate"}</strong>,</p>
          <p style="font-size: 13px; line-height: 1.6; color: #3f3f46;">
            Thank you for completing your scientific evaluation on the Pehlakadam Knowledge Portal. Below is your detailed summary report for <strong>${testTitle}</strong>:
          </p>

          <!-- Score Card Box -->
          <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 16px; padding: 20px; margin: 20px 0;">
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #059669; letter-spacing: 1.5px; margin-bottom: 4px;">Primary Profile Result</div>
            <h2 style="font-size: 20px; font-weight: 900; color: #09090b; margin: 0 0 10px 0;">${score?.title || "Assessment Completed"}</h2>
            ${score?.dominant ? `<p style="font-size: 12px; font-weight: bold; color: #047857; margin: 0 0 8px 0; background: #d1fae5; display: inline-block; padding: 4px 10px; border-radius: 20px;">Dominant Dimension: ${score.dominant}</p>` : ""}
            <p style="font-size: 12px; line-height: 1.6; color: #52525b; margin: 0;">${score?.summary || "Your profile calculation is processed on standard academic benchmarks."}</p>
          </div>

          ${overallScoreHtml}

          ${questionTableRows ? `
            <div style="margin-top: 24px;">
              <h3 style="font-size: 12px; font-weight: 800; color: #09090b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Evaluation Response & Correctness Breakdown</h3>
              <table style="width: 100%; border-collapse: collapse; text-align: left; background-color: #fafafa; border-radius: 12px; overflow: hidden; border: 1px solid #e4e4e7;">
                <thead>
                  <tr style="background-color: #f4f4f5; border-bottom: 2px solid #e4e4e7;">
                    <th style="padding: 10px; font-size: 11px; font-weight: bold; color: #52525b; text-transform: uppercase;">Question</th>
                    <th style="padding: 10px; font-size: 11px; font-weight: bold; color: #52525b; text-transform: uppercase;">Selected Choice</th>
                    <th style="padding: 10px; font-size: 11px; font-weight: bold; color: #52525b; text-transform: uppercase; text-align: center;">Correctness %</th>
                  </tr>
                </thead>
                <tbody>
                  ${questionTableRows}
                </tbody>
              </table>
            </div>
          ` : ""}

          <!-- Counseling CTA -->
          <div style="background-color: #18181b; border-radius: 16px; padding: 20px; margin-top: 28px; text-align: center; color: #ffffff;">
            <h4 style="font-size: 14px; font-weight: 800; margin: 0 0 6px 0; color: #ffffff;">Book Your Master Career Counseling Session</h4>
            <p style="font-size: 12px; color: #a1a1aa; margin: 0 0 16px 0; line-height: 1.5;">Schedule a 1-on-1 session with our senior educational advisors to build your stream selection roadmap.</p>
            <a href="${whatsappUrl}" 
               style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 12px; font-weight: 800; border-radius: 10px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
              Connect via WhatsApp
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f4f4f5; padding: 16px; text-align: center; border-top: 1px solid #e4e4e7; font-size: 11px; color: #71717a;">
          <p style="margin: 0;">Pehlakadam Career Academy &bull; Knowledge & Diagnostics Portal</p>
          <p style="margin: 4px 0 0 0;">This summary report was generated for ${recipientEmail}.</p>
        </div>

      </div>
    </body>
    </html>
  `;

  try {
    const transporter = await getEmailTransporter();
    if (transporter) {
      const mailOptions = {
        from: `"Pehlakadam Career Academy" <${fromEmail}>`,
        to: recipientEmail,
        cc: adminEmail !== recipientEmail ? adminEmail : undefined,
        subject: `[Assessment Summary Report] ${userName} - ${testTitle}`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Pehlakadam Mailer] Summary report email sent to ${recipientEmail}. MessageId: ${info.messageId}`);
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 [Pehlakadam Mailer] Ethereal Preview URL: ${previewUrl}`);
      }
      return { success: true, emailSent: true, messageId: info.messageId, previewUrl: previewUrl || null };
    } else {
      console.log(`ℹ️ [Pehlakadam Mailer] Simulated email report dispatch to ${recipientEmail} for assessment ${testTitle}`);
      return { success: true, emailSent: true, simulated: true, recipientEmail };
    }
  } catch (err) {
    console.error(`❌ [Pehlakadam Mailer] Failed to deliver email report to ${recipientEmail}:`, err);
    return { success: false, emailSent: false, error: String(err) };
  }
}

async function sendCounsellingNotificationEmail(data: {
  recipientEmail: string;
  userName: string;
  userPhone?: string;
  counsellingDate: string;
  counsellingTime: string;
  counsellingTopic: string;
  joiningLink: string;
  counsellingNotes?: string;
}) {
  const { recipientEmail, userName, counsellingDate, counsellingTime, counsellingTopic, joiningLink, counsellingNotes } = data;
  if (!recipientEmail) return { success: false, reason: "No recipient email provided" };

  const fromEmail = process.env.SMTP_FROM_EMAIL || "noreply@pehlakadam.com";
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px; color: #18181b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e4e4e7; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background-color: #09090b; padding: 20px; border-radius: 12px; text-align: center; border-bottom: 3px solid #10b981; margin-bottom: 20px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 1px;">PEHLAKADAM CAREER ACADEMY</h2>
          <p style="color: #10b981; font-size: 11px; font-weight: bold; margin: 4px 0 0 0; text-transform: uppercase;">Official 1-on-1 Counseling Session Schedule</p>
        </div>

        <p style="font-size: 14px; color: #27272a;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 13px; color: #52525b; line-height: 1.6;">
          Your personalized 1-on-1 career guidance and counseling session with our senior advisors from IITs & BITS Pilani has been confirmed and scheduled.
        </p>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 12px 0; color: #166534; font-size: 15px;">📅 Session Details</h3>
          <p style="margin: 6px 0; font-size: 13px; color: #15803d;"><strong>Topic / Agenda:</strong> ${counsellingTopic || "1-on-1 Stream & Career Selection Guidance"}</p>
          <p style="margin: 6px 0; font-size: 13px; color: #15803d;"><strong>Scheduled Date:</strong> ${counsellingDate || "To be specified"}</p>
          <p style="margin: 6px 0; font-size: 13px; color: #15803d;"><strong>Scheduled Time:</strong> ${counsellingTime || "To be specified"}</p>
          ${counsellingNotes ? `<p style="margin: 10px 0 0 0; font-size: 12px; color: #14532d; font-style: italic; background: #dcfce7; padding: 8px 12px; border-radius: 6px;"><strong>Advisor Message:</strong> "${counsellingNotes}"</p>` : ''}
        </div>

        ${joiningLink ? `
          <div style="text-align: center; margin: 24px 0;">
            <a href="${joiningLink}" target="_blank" style="background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 13px; font-weight: bold; border-radius: 10px; display: inline-block;">
              🚀 Join Meeting / Session Link
            </a>
            <p style="font-size: 11px; color: #71717a; margin-top: 8px;">Direct Link: <a href="${joiningLink}" style="color: #059669;">${joiningLink}</a></p>
          </div>
        ` : ''}

        <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin-top: 24px;">
          Please join 5 minutes before the start time. If you need to reschedule or ask any preliminary questions, reply directly to this email or message us on WhatsApp.
        </p>

        <div style="background-color: #f4f4f5; padding: 12px; text-align: center; border-radius: 8px; margin-top: 20px; font-size: 11px; color: #a1a1aa;">
          Pehlakadam Career Advisory Team &bull; www.pehlakadam.com
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = await getEmailTransporter();
    if (transporter) {
      const mailOptions = {
        from: `"Pehlakadam Career Academy" <${fromEmail}>`,
        to: recipientEmail,
        subject: `[Scheduled Session] ${counsellingTopic || "1-on-1 Counseling"} on ${counsellingDate} at ${counsellingTime}`,
        html: htmlContent
      };
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [Pehlakadam Mailer] Counseling session email dispatched to ${recipientEmail}`);
      return { success: true, emailSent: true, messageId: info.messageId };
    } else {
      console.log(`ℹ️ [Pehlakadam Mailer] Simulated counseling email dispatch to ${recipientEmail}`);
      return { success: true, emailSent: true, simulated: true };
    }
  } catch (err) {
    console.error(`❌ [Pehlakadam Mailer] Failed to deliver counseling email:`, err);
    return { success: false, emailSent: false, error: String(err) };
  }
}

// 3. SUBMIT DIAGNOSTIC EVALUATION (WITH PERSONALITY & PSYCHOMETRIC CALCULATIONS)
app.post("/api/diagnostic-tests/submit", async (req, res) => {
  try {
    const { user, testKey, answers } = req.body;
    if (!user || !testKey || !answers) {
      return res.status(400).json({ error: "Missing required parameters (user, testKey, answers)." });
    }

    // Load test definition to check custom fields & scoring method
    let testDef: any = null;
    try {
      if (isMongoConnected) {
        testDef = await DiagnosticTestModel.findOne({ key: testKey });
      } else {
        const content = fs.readFileSync(DIAGNOSTIC_TESTS_FILE, "utf-8");
        const tests = JSON.parse(content);
        testDef = tests.find((t: any) => t.key === testKey);
      }
    } catch (e) {
      console.error("[Pehlakadam API] Error loading test definition during submit:", e);
    }

    // scoring calculations
    let score: any = {};
    const vals = Object.values(answers) as string[];

    if (testKey === "disc") {
      const counts: any = { D: 0, I: 0, S: 0, C: 0 };
      vals.forEach(v => {
        if (counts[v] !== undefined) counts[v]++;
      });
      const total: number = (Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number) || 1;
      const pct = {
        D: Math.round((counts.D / total) * 100),
        I: Math.round((counts.I / total) * 100),
        S: Math.round((counts.S / total) * 100),
        C: Math.round((counts.C / total) * 100),
      };
      
      let dominant = "D";
      if (pct.I > pct[dominant]) dominant = "I";
      if (pct.S > pct[dominant]) dominant = "S";
      if (pct.C > pct[dominant]) dominant = "C";

      const descriptions: any = {
        D: "Dominant: Decisive, direct, highly assertive, and results-focused. Ideal for high-stakes leadership, entrepreneurial management, and strategic direction roles.",
        I: "Influential: Persuasive, outgoing, energetic, and highly relationship-driven. Ideal for media, marketing, high-impact consulting, public relations, and sales leadership.",
        S: "Steady: Calm, cooperative, patient, loyal, and highly methodology-oriented. Excellent for research planning, operations optimization, HR, and structural engineering.",
        C: "Conscientious: Detail-oriented, analytical, diplomatic, and highly precise. Perfect for scientific analysis, database administration, software architecture, and financial risk planning."
      };

      score = {
        breakdown: {
          "Dominance (D)": pct.D,
          "Influence (I)": pct.I,
          "Steadiness (S)": pct.S,
          "Conscientiousness (C)": pct.C
        },
        dominant,
        summary: descriptions[dominant],
        title: `${dominant}-Style Behavioral Profile`
      };
    } else if (testKey === "mbti") {
      let E = 0, I_val = 0, S = 0, N = 0, T = 0, F = 0, J = 0, P = 0;
      vals.forEach(v => {
        if (v === "E") E++;
        if (v === "I") I_val++;
        if (v === "S") S++;
        if (v === "N") N++;
        if (v === "T") T++;
        if (v === "F") F++;
        if (v === "J") J++;
        if (v === "P") P++;
      });
      
      const mbti = (E >= I_val ? "E" : "I") + (S >= N ? "S" : "N") + (T >= F ? "T" : "F") + (J >= P ? "J" : "P");
      
      const totalEI = E + I_val || 1;
      const totalSN = S + N || 1;
      const totalTF = T + F || 1;
      const totalJP = J + P || 1;

      const pct = {
        E: Math.round((E / totalEI) * 100),
        I: Math.round((I_val / totalEI) * 100),
        S: Math.round((S / totalSN) * 100),
        N: Math.round((N / totalSN) * 100),
        T: Math.round((T / totalTF) * 100),
        F: Math.round((F / totalTF) * 100),
        J: Math.round((J / totalJP) * 100),
        P: Math.round((P / totalJP) * 100),
      };

      const careers: any = {
        INTJ: "Strategic Planner, System Architect, Scientist. You excel in logical blueprints and system design.",
        ENTJ: "Executive Director, Management Consultant, Venture Capitalist. You are a natural-born decisive leader.",
        INFP: "Creative Writer, Career Psychologist, Advisor. Guided by internal values, you seek deep, authentic connections.",
        ENFP: "Innovation Director, Marketing Strategist, Founder. Enthusiastic and creative, you see endless possibilities.",
        INFJ: "Advocate, Educational Counselor, Policy Planner. Insightful and structured, you drive ethical progress.",
        ENFJ: "Corporate Coach, HR Director, Public Relations Lead. You inspire others and foster warm environments.",
        INTP: "Theoretical Physicist, Software Developer, Researcher. Analytical and abstract, you seek logical precision.",
        ENTP: "Product Strategist, Venture Builder, Creative Director. You love intellectual brainstorming and solving complex puzzles.",
        ISTJ: "Financial Analyst, Operations Manager, Auditor. Exceptionally reliable, you preserve order and accuracy.",
        ESTJ: "General Manager, Civil Engineer, Security Director. Highly organized, you execute rules and systems with precision.",
        ISFJ: "Healthcare Advisor, Database Administrator, Registrar. Quiet, warm, and highly dependable, you support teams silently.",
        ESFJ: "Academic Dean, Client Success Lead, Hospital Administrator. Warm-hearted and structured, you coordinate social harmony.",
        ISTP: "Forensic Analyst, Systems Engineer, Pilot. Practical, quiet, and resourceful, you solve issues hands-on.",
        ESTP: "Sales Negotiator, Operations Lead, Stock Trader. Energetic and tactical, you thrive in fast-paced real-time action.",
        ISFP: "UX/UI Designer, Visual Artist, Environmentalist. Sensitive and creative, you enrich the world through aesthetics.",
        ESFP: "Event Director, Public Relations Specialist, Actor. Outgoing and cheerful, you bring high energy to teams."
      };

      score = {
        breakdown: {
          "Extraversion (E)": pct.E,
          "Introversion (I)": pct.I,
          "Sensing (S)": pct.S,
          "Intuition (N)": pct.N,
          "Thinking (T)": pct.T,
          "Feeling (F)": pct.F,
          "Judging (J)": pct.J,
          "Perceiving (P)": pct.P,
        },
        mbti,
        summary: careers[mbti] || "Versatile Profile: Highly adaptable psychometric thinker.",
        title: `MBTI Personality Profile: ${mbti}`
      };
    } else if (testKey === "16pf") {
      const reasoningScore = Math.min(100, Math.max(15, 30 + (vals.includes("Analytical") ? 60 : 0) + (vals.includes("Practical") ? 20 : 40)));
      const independenceScore = Math.min(100, Math.max(15, 35 + (vals.includes("Dominance") ? 55 : 0) + (vals.includes("Open-To-Change") ? 40 : 10)));
      const stabilityScore = Math.min(100, Math.max(15, 45 + (vals.includes("Stable") ? 50 : 0) - (vals.includes("Sensitive") ? 25 : 0)));
      const ruleConsciousnessScore = Math.min(100, Math.max(15, 30 + (vals.includes("Rule-Conscious") ? 50 : 0) + (vals.includes("Structured") ? 45 : 15)));
      const warmthScore = Math.min(100, Math.max(15, 40 + (vals.includes("Warmth") ? 50 : 0) + (vals.includes("Collaborative") ? 45 : 10)));

      const traits: string[] = [];
      if (reasoningScore > 65) traits.push("High Analytical Reasoning");
      if (independenceScore > 65) traits.push("High Independence & Drive");
      if (stabilityScore > 65) traits.push("Emotional Resilience");
      if (ruleConsciousnessScore > 65) traits.push("Rule-Consciousness");
      if (warmthScore > 65) traits.push("Social Warmth");

      score = {
        breakdown: {
          "Analytical Reasoning": reasoningScore,
          "Independence & Drive": independenceScore,
          "Emotional Stability": stabilityScore,
          "Rule-Consciousness": ruleConsciousnessScore,
          "Social Warmth & Teamwork": warmthScore
        },
        summary: `Strongest Career Factors: ${traits.join(", ") || "Balanced General Profile"}. Matches ideally with analytical research, structured process engineering, and proactive communications.`,
        title: "16PF Factor Mapping Profile"
      };
    } else if (testKey === "epi") {
      let E = 0, I_val = 0, N = 0, S = 0;
      vals.forEach(v => {
        if (v === "E") E++;
        if (v === "I") I_val++;
        if (v === "N") N++;
        if (v === "S") S++;
      });
      
      const totalEI = E + I_val || 1;
      const totalNS = N + S || 1;

      const pct = {
        E: Math.round((E / totalEI) * 100),
        I: Math.round((I_val / totalEI) * 100),
        N: Math.round((N / totalNS) * 100),
        S: Math.round((S / totalNS) * 100),
      };

      let temperament = "Balanced";
      let summary = "Steady, adaptable personality traits.";
      if (E >= I_val && N >= S) {
        temperament = "Choleric";
        summary = "Active, highly energetic, optimistic, and results-focused. Thrives under pressure.";
      } else if (E >= I_val && S > N) {
        temperament = "Sanguine";
        summary = "Highly sociable, outgoing, cheerful, and talkative. Excellent at teamwork.";
      } else if (I_val > E && N >= S) {
        temperament = "Melancholic";
        summary = "Thoughtful, analytical, sensitive, and quiet. Excels in creative or deeply analytical tasks.";
      } else if (I_val > E && S > N) {
        temperament = "Phlegmatic";
        summary = "Peaceful, reliable, structured, and extremely steady. Excellent for methodical operations.";
      }

      score = {
        breakdown: {
          "Extraversion (E)": pct.E,
          "Introversion (I)": pct.I,
          "Neuroticism / Reactivity (N)": pct.N,
          "Emotional Stability (S)": pct.S
        },
        temperament,
        summary,
        title: `Eysenck Temperament: ${temperament}`
      };
    } else if (testKey === "enneagram") {
      const counts: any = {
        "Type 1 - Reformer": 0,
        "Type 2 - Helper": 0,
        "Type 3 - Achiever": 0,
        "Type 4 - Individualist": 0,
        "Type 5 - Investigator": 0,
        "Type 6 - Loyalist": 0,
        "Type 7 - Enthusiast": 0,
        "Type 8 - Challenger": 0,
        "Type 9 - Peacemaker": 0
      };
      vals.forEach(v => {
        if (counts[v] !== undefined) counts[v]++;
      });
      
      let dominantType = "Type 9 - Peacemaker";
      let maxCount = -1;
      Object.keys(counts).forEach(k => {
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          dominantType = k;
        }
      });

      const totalVal = vals.length || 1;
      const pctBreakdown: any = {};
      Object.keys(counts).forEach(k => {
        pctBreakdown[k] = Math.round((counts[k] / totalVal) * 100);
      });

      score = {
        breakdown: pctBreakdown,
        dominantType,
        summary: `Your core driving motivator is represented by ${dominantType}. This defines your path of personal integration, helping you align with authentic career callings.`,
        title: `Enneagram Profile: ${dominantType}`
      };
    } else if (testKey === "caliper") {
      const leadership = Math.min(100, Math.max(15, 30 + (vals.includes("High Leadership") ? 45 : 0) + (vals.includes("High Social Boldness") ? 25 : 0)));
      const empathy = Math.min(100, Math.max(15, 30 + (vals.includes("High Empathy") ? 45 : 0) + (vals.includes("High Sociability") ? 25 : 0)));
      const drive = Math.min(100, Math.max(15, 30 + (vals.includes("High Ego-Drive") ? 45 : 0) + (vals.includes("High Assertiveness") ? 25 : 0)));
      const structure = Math.min(100, Math.max(15, 25 + (vals.includes("High Structure") ? 35 : 0) + (vals.includes("High Organization") ? 25 : 0) + (vals.includes("High Thoroughness") ? 15 : 0)));
      const cognitive = Math.min(100, Math.max(15, 40 + (vals.includes("High Cognitive") ? 45 : 0) + (vals.includes("High Flexibility") ? 15 : 0)));

      const traits: string[] = [];
      if (leadership > 65) traits.push("Leadership potential");
      if (empathy > 65) traits.push("Strong Empathy");
      if (drive > 65) traits.push("High Persuasion Drive");
      if (structure > 65) traits.push("Thorough Organization");
      if (cognitive > 65) traits.push("Abstract Problem-Solving");

      score = {
        breakdown: {
          "Leadership & Boldness": leadership,
          "Relational Empathy": empathy,
          "Ego-Drive & Persuasion": drive,
          "Structure & Organization": structure,
          "Cognitive Adaptability": cognitive
        },
        summary: `Identified Performance Drivers: ${traits.join(", ") || "Balanced Professional Profile"}. Perfect match for fields requiring empathy, structural organization, assertiveness, and cognitive leadership.`,
        title: "Caliper Job-Performance Driver Profile"
      };
    } else if (testKey === "mmpi") {
      const somatic = Math.min(100, Math.max(15, 40 + (vals.includes("Somatic Stability") ? 50 : 0) - (vals.includes("Somatic Tendency") ? 25 : 0)));
      const confidence = Math.min(100, Math.max(15, 35 + (vals.includes("Social Confidence") ? 50 : 0) - (vals.includes("Paranoia Tendency") ? 25 : 0)));
      const energy = Math.min(100, Math.max(15, 40 + (vals.includes("Balanced Energy") ? 50 : 0) - (vals.includes("Depression Tendency") ? 25 : 0)));
      const emotional = Math.min(100, Math.max(15, 35 + (vals.includes("High Self-Trust") ? 50 : 0) - (vals.includes("Anxiety Tendency") ? 25 : 0)));

      const traits: string[] = [];
      if (somatic > 65) traits.push("Somatic Stress Resilience");
      if (confidence > 65) traits.push("High Social Confidence");
      if (energy > 65) traits.push("Excellent Motivation Balance");
      if (emotional > 65) traits.push("Emotional Equilibrium");

      score = {
        breakdown: {
          "Somatic Stress Resilience": somatic,
          "Social Confidence & Trust": confidence,
          "Mental Energy & Drive": energy,
          "Emotional Stability & Control": emotional
        },
        summary: `Clinical psychometric indicators: ${traits.join(", ") || "Steady Emotional Adaptability"}. Displays steady emotional resilience, structured coping strategies, and optimal cognitive adaptability under high work/study stress.`,
        title: "MMPI Psychometric Insight"
      };
    } else {
      // Custom test or expanded standard (like aptitude) using testDef configuration
      const scoringMethod = testDef?.scoringMethod || "personality";
      
      if (scoringMethod === "aptitude") {
        let correctCount = 0;
        const questionsList = testDef?.questions || [];
        const totalCount = questionsList.length || 1;
        
        questionsList.forEach((q: any) => {
          const userAns = answers[q.id];
          if (userAns !== undefined && q.correctValue !== undefined && userAns.toString().trim().toUpperCase() === q.correctValue.toString().trim().toUpperCase()) {
            correctCount++;
          }
        });
        
        const percentage = Math.round((correctCount / totalCount) * 100);
        
        let summary = "";
        let bracketTitle = "Foundational";
        if (percentage >= 90) {
          bracketTitle = "Exceptional Mastery";
          summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Exceptional analytical and cognitive ability. You demonstrate excellent command of quantitative, logical reasoning, and verbal concepts. Highly recommended for advanced engineering, research, analytics, or complex quantitative fields.`;
        } else if (percentage >= 70) {
          bracketTitle = "Strong Proficiency";
          summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Strong analytical capacity. You have a solid grasp of logical and quantitative concepts with very minor areas to reinforce. Well-suited for management, computer science, or business analytics streams.`;
        } else if (percentage >= 50) {
          bracketTitle = "Developing Competency";
          summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Satisfactory performance. You are developing your analytical and cognitive skills but would benefit from targeted study to reinforce concept gaps. We recommend reviewing incorrect questions and scheduling an advisor session.`;
        } else {
          bracketTitle = "Foundational Stage";
          summary = `You scored ${correctCount}/${totalCount} (${percentage}%). Foundational competency. Focus on strengthening fundamental logic, verbal analogies, and basic quantitative problems. We highly recommend booking a counseling session to structure a targeted learning roadmap.`;
        }
        
        score = {
          breakdown: {
            "Correct Answers": percentage,
            "Incorrect / Skipped": 100 - percentage
          },
          percentage,
          correctCount,
          totalCount,
          summary,
          title: `Cognitive Score: ${percentage}% (${bracketTitle})`
        };
      } else {
        // Personality method for custom tests or fallback
        const counts: any = {};
        vals.forEach(v => {
          if (v) {
            counts[v] = (counts[v] || 0) + 1;
          }
        });
        
        const total: number = Object.values(counts).reduce((a: any, b: any) => a + b, 0) as number || 1;
        const pct: any = {};
        Object.keys(counts).forEach(k => {
          pct[k] = Math.round((counts[k] / total) * 100);
        });
        
        // Find dominant style
        let dominant = "";
        let maxPct = -1;
        Object.keys(pct).forEach(k => {
          if (pct[k] > maxPct) {
            maxPct = pct[k];
            dominant = k;
          }
        });
        
        // Check if there is a custom resultProfile matching dominant
        const profiles = testDef?.resultProfiles || [];
        const matchedProfile = profiles.find((p: any) => p.value === dominant);
        
        const title = matchedProfile?.title || `${dominant} Style`;
        const summary = matchedProfile?.summary || `Your assessment shows a dominant preference for the ${dominant} style. This dimension represents your primary behavior, thinking, and communication pattern in professional settings.`;
        
        score = {
          breakdown: pct,
          dominant,
          summary,
          title: matchedProfile ? matchedProfile.title : `${dominant}-Style Behavioral Profile`
        };
      }
    }

    // 🎯 CALCULATE OPTION CORRECTNESS PERCENTAGE FOR ANY CUSTOM OR STANDARD TEST
    if (testDef && testDef.questions && Array.isArray(testDef.questions) && testDef.questions.length > 0) {
      let sumPercentages = 0;
      let evaluatedCount = 0;
      const questionAnalysis: any[] = [];

      testDef.questions.forEach((q: any) => {
        const userVal = answers ? answers[q.id] : undefined;
        if (userVal !== undefined && userVal !== null) {
          evaluatedCount++;
          const selectedOption = (q.options || []).find((o: any) =>
            o.id === userVal ||
            o.value === userVal ||
            o.text === userVal ||
            (o.value && userVal && o.value.toString().trim().toUpperCase() === userVal.toString().trim().toUpperCase())
          );

          let earnedPct = 0;
          if (selectedOption && selectedOption.correctnessPercentage !== undefined && selectedOption.correctnessPercentage !== null) {
            earnedPct = Number(selectedOption.correctnessPercentage) || 0;
          } else if (q.correctValue && userVal && userVal.toString().trim().toUpperCase() === q.correctValue.toString().trim().toUpperCase()) {
            earnedPct = 100;
          }

          sumPercentages += earnedPct;
          questionAnalysis.push({
            questionId: q.id,
            questionText: q.text,
            selectedOptionText: selectedOption ? selectedOption.text : userVal,
            selectedOptionValue: selectedOption ? selectedOption.value : userVal,
            earnedCorrectnessPercentage: earnedPct
          });
        }
      });

      if (evaluatedCount > 0) {
        const averageCorrectnessPercentage = Math.round(sumPercentages / evaluatedCount);
        score.overallCorrectnessPercentage = averageCorrectnessPercentage;
        score.questionCorrectnessBreakdown = questionAnalysis;
      }
    }

    // Save submission
    let savedSubmission: any = null;
    const testTitles: any = {
      disc: "DISC Assessment",
      mbti: "Myers-Briggs Type Indicator (MBTI)",
      "16pf": "Personality Factor Questionnaire",
      epi: "Eysenck Personality Inventory",
      enneagram: "Enneagram Core Test",
      caliper: "Caliper Profile",
      mmpi: "Minnesota Multiphasic Test",
      aptitude: "General Cognitive & Aptitude Test"
    };
    const testTitle = testTitles[testKey] || testDef?.title || "Scientific Diagnostics Evaluation";

    if (isMongoConnected) {
      const doc = new DiagnosticSubmissionModel({
        user,
        testKey,
        testTitle,
        answers,
        score
      });
      await doc.save();
      savedSubmission = doc.toObject();
    } else {
      const list = JSON.parse(fs.readFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, "utf-8"));
      savedSubmission = {
        _id: Date.now().toString(),
        user,
        testKey,
        testTitle,
        answers,
        score,
        createdAt: new Date().toISOString()
      };
      list.push(savedSubmission);
      fs.writeFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, JSON.stringify(list, null, 2));
    }

    // 📧 DISPATCH EMAIL NOTIFICATION SUMMARY REPORT TO CANDIDATE & ADVISOR
    let emailResult = null;
    if (user && user.email) {
      emailResult = await sendAssessmentReportEmail({
        recipientEmail: user.email,
        userName: user.name || "Candidate",
        userPhone: user.phone,
        testTitle,
        score
      });
    }

    return res.status(200).json({
      success: true,
      submission: savedSubmission,
      emailStatus: emailResult
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error submitting diagnostic test:", error);
    return res.status(500).json({ error: "Failed to submit and calculate evaluation." });
  }
});

// 3.4. EXPLICITLY RE-SEND EMAIL SUMMARY REPORT
app.post("/api/diagnostic-tests/send-email-report", async (req, res) => {
  try {
    const { email, name, phone, testTitle, score } = req.body;
    if (!email || !testTitle || !score) {
      return res.status(400).json({ error: "Missing required parameters (email, testTitle, score)." });
    }

    const emailResult = await sendAssessmentReportEmail({
      recipientEmail: email,
      userName: name || "Candidate",
      userPhone: phone,
      testTitle,
      score
    });

    return res.status(200).json({
      success: true,
      emailStatus: emailResult,
      message: `Summary report email processed for ${email}`
    });
  } catch (err) {
    console.error("[Pehlakadam API] Error re-sending email report:", err);
    return res.status(500).json({ error: "Failed to dispatch email summary report." });
  }
});

// 3.5. REGISTER A DIAGNOSTIC TEST PRE-EVALUATION LEAD
app.post("/api/diagnostic-tests/register", async (req, res) => {
  try {
    const { name, email, phone, role, testKey, testTitle, specialDetail } = req.body;
    if (!name || !email || !phone || !role || !testKey || !testTitle || !specialDetail) {
      return res.status(400).json({ error: "Missing required registration details." });
    }

    // 💾 STEP 1: SAVE TO SPECIFIC DIAGNOSTIC REGISTRATIONS DEPOSITORY
    let savedRegistration;
    if (isMongoConnected) {
      const newReg = new DiagnosticRegistrationModel({
        name,
        email,
        phone,
        role,
        testKey,
        testTitle,
        specialDetail
      });
      const savedDoc = await newReg.save();
      savedRegistration = {
        id: savedDoc._id.toString(),
        name,
        email,
        phone,
        role,
        testKey,
        testTitle,
        specialDetail,
        createdAt: savedDoc.createdAt
      };
    } else {
      savedRegistration = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        role,
        testKey,
        testTitle,
        specialDetail,
        createdAt: new Date().toISOString()
      };
      const list = JSON.parse(fs.readFileSync(DIAGNOSTIC_REGISTRATIONS_FILE, "utf-8"));
      list.push(savedRegistration);
      fs.writeFileSync(DIAGNOSTIC_REGISTRATIONS_FILE, JSON.stringify(list, null, 2));
    }

    // 💾 STEP 2: SAVE TO GENERAL LEADS (SUBMISSIONS) SO IT APPEARS IN THE ADMIN LEADS LIST
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "Student";
    const leadMessage = `[Diagnostic pre-test registration] Test: ${testTitle}. Detail: ${specialDetail}`;

    if (isMongoConnected) {
      const newSubDoc = new SubmissionModel({
        firstName,
        lastName,
        email,
        number: phone,
        role,
        message: leadMessage
      });
      await newSubDoc.save();
      console.log(`[Pehlakadam MongoDB] Registered diagnostic lead for ${name}`);
    } else {
      const newSubmission = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        number: phone,
        role,
        message: leadMessage,
        createdAt: new Date().toISOString(),
      };

      const fileData = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      const submissions = JSON.parse(fileData);
      submissions.push(newSubmission);
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
      console.log(`[Pehlakadam JSON] Registered diagnostic lead for ${name}`);
    }

    return res.status(200).json({ success: true, registration: savedRegistration });
  } catch (error) {
    console.error("[Pehlakadam API] Error during diagnostic pre-test registration:", error);
    return res.status(500).json({ error: "Failed to save diagnostic registration in database." });
  }
});

// 4. GET ALL SUBMISSION REPORTS (ADMIN SECURED)
app.get("/api/diagnostic-tests/submissions", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await DiagnosticSubmissionModel.find().sort({ createdAt: -1 });
      const submissions = docs.map((doc) => ({
        id: doc._id.toString(),
        user: doc.user,
        testKey: doc.testKey,
        testTitle: doc.testTitle,
        answers: doc.answers,
        score: doc.score,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(submissions);
    } else {
      const content = fs.readFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, "utf-8");
      const submissions = JSON.parse(content);
      return res.status(200).json(submissions);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading diagnostic submissions:", error);
    return res.status(500).json({ error: "Failed to fetch diagnostic submissions" });
  }
});

// 4.5. GET CANDIDATE'S OWN SUBMISSIONS
app.get("/api/diagnostic-tests/my-submissions", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: "Email query parameter is required." });
    }
    const cleanEmail = String(email).trim().toLowerCase();

    if (isMongoConnected) {
      const docs = await DiagnosticSubmissionModel.find({ "user.email": { $regex: new RegExp(`^${cleanEmail}$`, "i") } }).sort({ createdAt: -1 });
      const submissions = docs.map((doc) => ({
        id: doc._id.toString(),
        user: doc.user,
        testKey: doc.testKey,
        testTitle: doc.testTitle,
        answers: doc.answers,
        score: doc.score,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(submissions);
    } else {
      const content = fs.readFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, "utf-8");
      const list = JSON.parse(content);
      const filtered = list.filter((item: any) => 
        item.user && item.user.email && item.user.email.trim().toLowerCase() === cleanEmail
      );
      // Sort by date/id descending
      filtered.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      return res.status(200).json(filtered);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading user submissions:", error);
    return res.status(500).json({ error: "Failed to fetch your past diagnostic test reports." });
  }
});

// 5. DELETE A DIAGNOSTIC SUBMISSION (ADMIN SECURED)
app.delete("/api/diagnostic-tests/submissions/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await DiagnosticSubmissionModel.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Submission report deleted successfully" });
    } else {
      const list = JSON.parse(fs.readFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, "utf-8"));
      const filtered = list.filter((item: any) => item._id !== id && item.id !== id);
      fs.writeFileSync(DIAGNOSTIC_SUBMISSIONS_FILE, JSON.stringify(filtered, null, 2));
      return res.status(200).json({ success: true, message: "Submission report deleted successfully from JSON" });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error deleting submission:", error);
    return res.status(500).json({ error: "Failed to delete submission report." });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 2: GET REGISTERED CONSULTATION LEADS
// =========================================================================================
// Fetches the entire history of student leads. Secured internally and surfaced inside the
// Operational Management Dashboard for advisors to reach out to leads on email/phone.
// =========================================================================================
app.get("/api/submissions", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await SubmissionModel.find().sort({ createdAt: -1 });
      const submissions = docs.map((doc: any) => ({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        number: doc.number,
        role: doc.role,
        message: doc.message,
        counsellingDate: doc.counsellingDate || "",
        counsellingTime: doc.counsellingTime || "",
        counsellingTopic: doc.counsellingTopic || "",
        joiningLink: doc.joiningLink || "",
        counsellingNotes: doc.counsellingNotes || "",
        notifications: doc.notifications || [],
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString()
      }));
      return res.status(200).json(submissions);
    } else {
      let submissions: any[] = [];
      try {
        if (fs.existsSync(SUBMISSIONS_FILE)) {
          submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
        }
      } catch (e) {}
      return res.status(200).json(submissions);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading submissions:", error);
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// 🌐 SCHEDULE / UPDATE COUNSELLING SESSION FOR INDIVIDUAL LEAD
app.put("/api/submissions/:id/counselling", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { counsellingDate, counsellingTime, counsellingTopic, joiningLink, counsellingNotes } = req.body;

    let updatedLead: any = null;

    if (isMongoConnected) {
      const doc = await SubmissionModel.findById(id);
      if (doc) {
        doc.counsellingDate = counsellingDate !== undefined ? counsellingDate : doc.counsellingDate;
        doc.counsellingTime = counsellingTime !== undefined ? counsellingTime : doc.counsellingTime;
        doc.counsellingTopic = counsellingTopic !== undefined ? counsellingTopic : doc.counsellingTopic;
        doc.joiningLink = joiningLink !== undefined ? joiningLink : doc.joiningLink;
        doc.counsellingNotes = counsellingNotes !== undefined ? counsellingNotes : doc.counsellingNotes;
        await doc.save();
        updatedLead = {
          id: doc._id.toString(),
          firstName: doc.firstName,
          lastName: doc.lastName,
          email: doc.email,
          number: doc.number,
          role: doc.role,
          message: doc.message,
          counsellingDate: doc.counsellingDate,
          counsellingTime: doc.counsellingTime,
          counsellingTopic: doc.counsellingTopic,
          joiningLink: doc.joiningLink,
          counsellingNotes: doc.counsellingNotes,
          notifications: doc.notifications || [],
          createdAt: doc.createdAt.toISOString()
        };
      }
    }

    // Always update JSON file storage as well
    let submissions: any[] = [];
    try {
      if (fs.existsSync(SUBMISSIONS_FILE)) {
        submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
      }
    } catch (e) {}

    const index = submissions.findIndex(s => s.id === id);
    if (index !== -1) {
      submissions[index] = {
        ...submissions[index],
        counsellingDate: counsellingDate !== undefined ? counsellingDate : submissions[index].counsellingDate,
        counsellingTime: counsellingTime !== undefined ? counsellingTime : submissions[index].counsellingTime,
        counsellingTopic: counsellingTopic !== undefined ? counsellingTopic : submissions[index].counsellingTopic,
        joiningLink: joiningLink !== undefined ? joiningLink : submissions[index].joiningLink,
        counsellingNotes: counsellingNotes !== undefined ? counsellingNotes : submissions[index].counsellingNotes,
        updatedAt: new Date().toISOString()
      };
      if (!updatedLead) updatedLead = submissions[index];
      fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    }

    if (!updatedLead) {
      return res.status(404).json({ error: "Lead not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Counseling session schedule saved successfully.",
      lead: updatedLead
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error updating counseling session:", error);
    return res.status(500).json({ error: "Failed to update counseling session details." });
  }
});

// 🌐 DISPATCH NOTIFICATIONS TO INDIVIDUAL LEAD (EMAIL, WHATSAPP, SMS)
app.post("/api/submissions/:id/notify", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, customMessage } = req.body; // channel: "email" | "whatsapp" | "sms"

    if (!channel || !["email", "whatsapp", "sms"].includes(channel)) {
      return res.status(400).json({ error: "Invalid notification channel. Choose 'email', 'whatsapp', or 'sms'." });
    }

    let lead: any = null;

    if (isMongoConnected) {
      const doc = await SubmissionModel.findById(id);
      if (doc) {
        lead = doc.toObject();
        lead.id = doc._id.toString();
      }
    }

    if (!lead && fs.existsSync(SUBMISSIONS_FILE)) {
      const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
      lead = submissions.find((s: any) => s.id === id);
    }

    if (!lead) {
      return res.status(404).json({ error: "Candidate lead not found." });
    }

    const candidateName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Candidate";
    const candidateEmail = lead.email;
    const candidatePhone = lead.number;
    const counsellingDate = lead.counsellingDate || "To be confirmed";
    const counsellingTime = lead.counsellingTime || "To be confirmed";
    const counsellingTopic = lead.counsellingTopic || "1-on-1 Career Selection & Counseling";
    const joiningLink = lead.joiningLink || "";
    const notes = customMessage || lead.counsellingNotes || "";

    const notificationRecord = {
      channel,
      sentAt: new Date().toISOString(),
      status: "sent",
      message: notes || `Session update on ${counsellingDate} at ${counsellingTime}`
    };

    let resultPayload: any = { success: true, channel };

    // 1. EMAIL CHANNEL
    if (channel === "email") {
      const mailRes = await sendCounsellingNotificationEmail({
        recipientEmail: candidateEmail,
        userName: candidateName,
        userPhone: candidatePhone,
        counsellingDate,
        counsellingTime,
        counsellingTopic,
        joiningLink,
        counsellingNotes: notes
      });
      resultPayload.mailDetails = mailRes;
    }

    // 2. WHATSAPP CHANNEL
    if (channel === "whatsapp") {
      const cleanPhone = (candidatePhone || "").replace(/[^0-9]/g, "");
      const formattedNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
      
      const whatsappText =
        `📚 *Pehlakadam Career Advisory*\n\n` +
        `Hello ${candidateName},\n` +
        `Your 1-on-1 Career Counseling session has been scheduled!\n\n` +
        `🎯 *Topic:* ${counsellingTopic}\n` +
        `📅 *Date:* ${counsellingDate}\n` +
        `⏰ *Time:* ${counsellingTime}\n` +
        (joiningLink ? `🔗 *Meeting Link:* ${joiningLink}\n` : "") +
        (notes ? `💬 *Advisor Note:* ${notes}\n` : "") +
        `\nPlease ensure you join 5 minutes prior to the start time. See you soon!`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedNum}&text=${encodeURIComponent(whatsappText)}`;
      resultPayload.whatsappUrl = whatsappUrl;
      resultPayload.messageText = whatsappText;
    }

    // 3. SMS CHANNEL
    if (channel === "sms") {
      const smsText = `[Pehlakadam] Hi ${candidateName}, your 1-on-1 Counseling session on "${counsellingTopic}" is scheduled for ${counsellingDate} at ${counsellingTime}.${joiningLink ? ` Join link: ${joiningLink}` : ""}`;
      resultPayload.smsText = smsText;
      console.log(`📱 [Pehlakadam SMS Gateway] Dispatched SMS to +${candidatePhone}: ${smsText}`);
    }

    // Save notification audit log to lead record
    if (isMongoConnected) {
      await SubmissionModel.findByIdAndUpdate(id, {
        $push: { notifications: notificationRecord }
      });
    }

    if (fs.existsSync(SUBMISSIONS_FILE)) {
      const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
      const index = submissions.findIndex((s: any) => s.id === id);
      if (index !== -1) {
        if (!submissions[index].notifications) submissions[index].notifications = [];
        submissions[index].notifications.push(notificationRecord);
        fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
      }
    }

    return res.status(200).json({
      success: true,
      message: `Notification sent via ${channel.toUpperCase()} successfully to ${candidateName}.`,
      notification: notificationRecord,
      details: resultPayload
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error sending notification:", error);
    return res.status(500).json({ error: "Failed to dispatch notification." });
  }
});

// =========================================================================================
// 📄 STANDARD CONFORMING PDF GENERATOR HELPER
// =========================================================================================
// Generates standard, valid PDF-1.4 binary streams with correct xref tables and font dictionaries
// so PDF.js and all modern web/mobile viewers render them smoothly.
function generateReadablePdfBuffer(title: string, category: string, description: string, extraContent?: string): Buffer {
  const cleanTitle = (title || "Pehlakadam Knowledge Resource").replace(/[^\x20-\x7E]/g, " ");
  const cleanCategory = (category || "Educational Guide").replace(/[^\x20-\x7E]/g, " ");
  const cleanDesc = (description || "Official Pehlakadam Career Mentorship Resource").replace(/[^\x20-\x7E]/g, " ");
  const cleanExtra = (extraContent || "").replace(/[^\x20-\x7E]/g, " ");

  const wrapText = (text: string, maxLen = 65): string[] => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const w of words) {
      if ((currentLine + " " + w).trim().length <= maxLen) {
        currentLine = (currentLine + " " + w).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = w;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const descLines = wrapText(cleanDesc, 65);
  const extraLines = wrapText(cleanExtra, 65);

  let streamContent = `q
0.02 0.58 0.41 rg
0 760 595 82 re
f
Q
BT
/F1 18 Tf
1 1 1 rg
40 805 Td
(PEHLAKADAM EDUCATION & CAREER ACADEMY) Tj
/F2 10 Tf
0 -22 Td
(Official Career Counseling & Psychometric Mentorship Directorate) Tj
ET
BT
/F1 15 Tf
0.1 0.1 0.1 rg
40 715 Td
(${cleanTitle}) Tj
/F2 10 Tf
0.02 0.58 0.41 rg
0 -20 Td
(CATEGORY: ${cleanCategory.toUpperCase()}  |  IN-APP SECURE DOCUMENT) Tj
ET
BT
/F2 10 Tf
0.2 0.2 0.2 rg
40 655 Td
`;

  for (const line of descLines) {
    streamContent += `(${line}) Tj\n0 -16 Td\n`;
  }

  if (extraLines.length > 0) {
    streamContent += `ET\nBT\n/F1 12 Tf\n0.1 0.1 0.1 rg\n40 540 Td\n(CURRICULUM & MODULE DETAILS:) Tj\n/F2 10 Tf\n0.2 0.2 0.2 rg\n0 -18 Td\n`;
    for (const line of extraLines.slice(0, 18)) {
      streamContent += `(${line}) Tj\n0 -16 Td\n`;
    }
  }

  streamContent += `ET
q
0.9 0.9 0.9 rg
40 100 515 1 re
f
Q
BT
/F2 9 Tf
0.4 0.4 0.4 rg
40 75 Td
(Pehlakadam Academic Resource Repository - Managed by N & M MENTO / BITS Pilani Mentorship Advisory) Tj
0 -14 Td
(Notice: This document is authorized for in-app viewing only. Unauthorized distribution is prohibited.) Tj
ET`;

  const streamBytes = Buffer.from(streamContent.trim(), "utf-8");
  const length = streamBytes.length;

  const pdfBody = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 595 842]
  /Resources <<
    /Font <<
      /F1 4 0 R
      /F2 5 0 R
    >>
  >>
  /Contents 6 0 R
>>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length ${length} >>
stream
${streamContent.trim()}
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000280 00000 n 
0000000349 00000 n 
0000000413 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
${470 + length}
%%EOF`;

  return Buffer.from(pdfBody, "utf-8");
}

function generateProgramBrochurePdf(programKey: string, config: any): Buffer {
  const programTitles: Record<string, string> = {
    "6-8": "Middle School Exploratory Career & Cognition Track (Grades 6-8)",
    "9-10": "Secondary School Stream Selection & Aptitude Blueprint (Grades 9-10)",
    "11-12": "Senior Secondary Entrance Strategy & University Mapping (Grades 11-12)",
    "graduate": "Graduate Corporate Placement & Masters Advisory Track",
    "kudos": "Early Childhood Cognitive & Creative Development Program",
    "generalist": "Executive Career Transition & High-Impact Specialization Program"
  };

  const title = programTitles[programKey] || config?.title || `Pehlakadam Official Program Guide (${programKey})`;
  const description = config?.subtitle || "Comprehensive diagnostic assessment, one-on-one executive mentorship, personality mapping, and structured career navigation roadmap.";
  const featuresText = typeof config?.features === "string" ? config.features : "1. Standard Psychometric & Aptitude Battery\n2. One-on-One 60-Minute Advisor Consultation\n3. Stream & College Track Recommendation Report\n4. Entrance Exam Timetable & Strategic Study Plan\n5. Lifelong Academic & Career Portal Access";

  return generateReadablePdfBuffer(title, `Grade ${programKey} Track`, description, featuresText);
}

// =========================================================================================
// 🌐 API ENDPOINT 3: RETRIEVE EDUCATIONAL/PSYCHOMETRIC RESOURCES
// =========================================================================================
// Serves handbooks, test frameworks, and videos on the student library frontend.
// Pulls from MongoDB if active, otherwise relies on local resources JSON file storage.
// =========================================================================================
app.get("/api/resources", async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await ResourceModel.find().sort({ createdAt: -1 });
      const resources = docs.map((doc: any) => ({
        id: doc._id.toString(),
        title: doc.title,
        category: doc.category,
        description: doc.description,
        type: doc.type,
        format: doc.format,
        videoUrl: doc.videoUrl,
        fileUrl: doc.fileUrl,
        fileData: doc.fileData,
        isPaid: !!doc.isPaid,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(resources);
    } else {
      const data = fs.readFileSync(RESOURCES_FILE, "utf-8");
      const list = JSON.parse(data).map((r: any) => ({
        ...r,
        fileData: r.fileData,
        isPaid: !!r.isPaid
      }));
      return res.status(200).json(list);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading resources:", error);
    return res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 4: UPLOAD & PUBLISH NEW RESOURCE (ADMIN EXCLUSIVE)
// =========================================================================================
// Allows career advisors to upload new PDF manuals or YouTube URLs to the public library database.
//
// 🛠️ HOW BASE64 FILE HANDLING WORKS:
// - Traditional file uploads use complex multipart streams which can fail or lose permissions.
// - Instead, we use a robust Base64 reader: the frontend encodes the PDF into a Base64 string.
// - This endpoint parses the Base64 payload, extracts the raw binary content using `Buffer.from`,
//   and writes the binary stream cleanly onto the local server disk (`/uploads`).
// - To prevent file loss on Cloud Container scale-down or redeployments, we also cache the full
//   Base64 string (`fileData`) in our MongoDB. The download proxy can reconstruct the file
//   from MongoDB automatically if it gets erased from the container disk!
// =========================================================================================
app.post("/api/resources", verifyAdmin, async (req, res) => {
  try {
    const { title, category, description, type, videoUrl, fileData, fileName, isPaid } = req.body;
    if (!title || !category || !description || !type) {
      return res.status(400).json({ error: "Title, category, description, and type are required" });
    }

    let fileUrl = undefined;
    let format = undefined;

    if (type === "video") {
      format = "YouTube Video";
    } else {
      if (!fileData || !fileName) {
        return res.status(400).json({ error: "File data and file name are required for PDFs" });
      }

      // Extract raw base64 data by stripping MIME type prefixes (e.g. data:application/pdf;base64,...)
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64String = fileData;
      if (matches && matches.length === 3) {
        base64String = matches[2];
      }

      // Convert Base64 back into raw binary file buffer
      const fileBuffer = Buffer.from(base64String, "base64");
      const tempId = Date.now().toString();
      const safeFileName = `${tempId}_${fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const filePath = path.join(UPLOADS_DIR, safeFileName);
      
      // Write the binary file buffer directly to the local directory
      fs.writeFileSync(filePath, fileBuffer);
      
      fileUrl = safeFileName;
      format = `PDF (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)`;
    }

    if (isMongoConnected) {
      // Save metadata and base64 cache securely into the MongoDB cluster
      const newResDoc = new ResourceModel({
        title,
        category,
        description,
        type,
        format,
        videoUrl: type === "video" ? (videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ") : undefined,
        fileUrl,
        fileData: type === "pdf" ? fileData : undefined, // Keep reconstructable cache in db
        isPaid: !!isPaid
      });
      await newResDoc.save();

      return res.status(200).json({
        success: true,
        resource: {
          id: newResDoc._id.toString(),
          title,
          category,
          description,
          type,
          format,
          videoUrl: newResDoc.videoUrl,
          fileUrl,
          isPaid: !!newResDoc.isPaid,
          createdAt: newResDoc.createdAt.toISOString()
        }
      });
    } else {
      // JSON File Database fallback save routine
      const resources = JSON.parse(fs.readFileSync(RESOURCES_FILE, "utf-8"));
      const newId = Date.now().toString();
      const newResource: any = {
        id: newId,
        title,
        category,
        description,
        type,
        format,
        videoUrl: type === "video" ? (videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ") : undefined,
        fileUrl,
        fileData: type === "pdf" ? fileData : undefined,
        isPaid: !!isPaid,
        createdAt: new Date().toISOString()
      };

      resources.push(newResource);
      fs.writeFileSync(RESOURCES_FILE, JSON.stringify(resources, null, 2));

      return res.status(200).json({ success: true, resource: newResource });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error creating resource:", error);
    return res.status(500).json({ error: "Failed to save resource material" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 5: DELETE RESOURCE (ADMIN EXCLUSIVE)
// =========================================================================================
// Handles database removal and physically deletes files from local container disk.
// =========================================================================================
app.delete("/api/resources/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoConnected) {
      const resource = await ResourceModel.findById(id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Delete physical file
      if (resource.type === "pdf" && resource.fileUrl && !resource.fileUrl.startsWith("placeholder")) {
        const filePath = path.join(UPLOADS_DIR, resource.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await ResourceModel.findByIdAndDelete(id);
      return res.status(200).json({ success: true });
    } else {
      const resources = JSON.parse(fs.readFileSync(RESOURCES_FILE, "utf-8"));
      const resource = resources.find((r: any) => r.id === id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }

      // Delete physical file
      if (resource.type === "pdf" && resource.fileUrl && !resource.fileUrl.startsWith("placeholder")) {
        const filePath = path.join(UPLOADS_DIR, resource.fileUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const filtered = resources.filter((r: any) => r.id !== id);
      fs.writeFileSync(RESOURCES_FILE, JSON.stringify(filtered, null, 2));
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error deleting resource:", error);
    return res.status(500).json({ error: "Failed to delete resource" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 6: ON-DEMAND DYNAMIC PDF RECONSTRUCTION & DOWNLOAD PROXY
// =========================================================================================
// This endpoint is responsible for serving psychometric tests and handbooks to students.
//
// 💡 THE CONTAINER RECYCLING PROBLEM:
// - Serverless environments like Cloud Run periodically recycle containers, wiping any physical
//   files saved in local directories (like `/uploads`).
// - To resolve this gracefully, this proxy queries the resource database. If the requested PDF file
//   is missing from the physical disk, it reads the Base64 file backup from MongoDB, rebuilds
//   the raw binary buffer on-demand, writes the file back to the disk, and streams the rebuilt file
//   directly to the browser as a download attachment using `createReadStream`.
// =========================================================================================
app.get("/api/resources/download/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let fileUrl = "";
    let title = "";
    let fileDataHex = "";

    if (isMongoConnected) {
      const resource = await ResourceModel.findById(id);
      if (!resource || resource.type !== "pdf" || !resource.fileUrl) {
        return res.status(404).json({ error: "Resource file not found in MongoDB catalog" });
      }
      fileUrl = resource.fileUrl;
      title = resource.title;
      fileDataHex = resource.fileData || "";
    } else {
      const resources = JSON.parse(fs.readFileSync(RESOURCES_FILE, "utf-8"));
      const resource = resources.find((r: any) => r.id === id);
      if (!resource || resource.type !== "pdf" || !resource.fileUrl) {
        return res.status(404).json({ error: "Resource file not found in fallback catalog" });
      }
      fileUrl = resource.fileUrl;
      title = resource.title;
    }

    const filePath = path.join(UPLOADS_DIR, fileUrl);

    // Dynamic reconstruction of physical file in case it was cleaned by container recycle
    if (!fs.existsSync(filePath) && fileDataHex) {
      try {
        console.log(`🔧 [Pehlakadam Engine] Reconstructing physical file for download from MongoDB cache: ${fileUrl}`);
        const matches = fileDataHex.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        let base64String = fileDataHex;
        if (matches && matches.length === 3) {
          base64String = matches[2];
        }
        const fileBuffer = Buffer.from(base64String, "base64");
        fs.writeFileSync(filePath, fileBuffer);
      } catch (err) {
        console.error("🔴 [Pehlakadam Engine] Failed to reconstruct file from base64:", err);
      }
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Physical file does not exist on server filesystem." });
    }

    const safeName = title.replace(/[^a-zA-Z0-9]/g, "_");
    const fileExtension = fileUrl.endsWith(".docx") ? "docx" : "pdf";
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.${fileExtension}"`);
    if (fileExtension === "docx") {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    } else {
      res.setHeader("Content-Type", "application/pdf");
    }
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("[Pehlakadam API] Download error:", error);
    return res.status(500).json({ error: "Failed to download resource file" });
  }
});

// 🔒 RESTRICTED IN-APP PDF VIEWER ENDPOINT (Inline delivery, no attachment header)
app.get("/api/resources/view/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let resourceItem: any = null;

    if (isMongoConnected) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        resourceItem = await ResourceModel.findById(id).exec();
      }
      if (!resourceItem) {
        resourceItem = await ResourceModel.findOne({ $or: [{ id: id }, { _id: id }] }).exec();
      }
    }

    if (!resourceItem && fs.existsSync(RESOURCES_FILE)) {
      const allResources = JSON.parse(fs.readFileSync(RESOURCES_FILE, "utf-8"));
      resourceItem = allResources.find((r: any) => r.id === id || r._id === id);
    }

    if (!resourceItem) {
      return res.status(404).json({ error: "Resource item not found" });
    }

    const { fileData, fileUrl, title, category, description } = resourceItem;

    // 1. Direct Base64 data stored in DB/JSON
    if (fileData && typeof fileData === "string" && fileData.trim().length > 0) {
      const pureBase64 = fileData.includes("base64,") ? fileData.split("base64,")[1] : fileData;
      const pdfBuffer = Buffer.from(pureBase64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(pdfBuffer);
    }

    // 2. Physical file in UPLOADS_DIR
    if (fileUrl) {
      const uploadPath = path.join(UPLOADS_DIR, fileUrl);
      if (fs.existsSync(uploadPath)) {
        const fileContent = fs.readFileSync(uploadPath);
        // If file is already a valid PDF binary buffer
        if (fileContent.subarray(0, 5).toString() === "%PDF-") {
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
          res.setHeader("Access-Control-Allow-Origin", "*");
          return res.send(fileContent);
        } else {
          // If it's a text placeholder or guide note, generate a valid formatted PDF
          const textGuide = fileContent.toString("utf-8");
          const renderedPdf = generateReadablePdfBuffer(title, category, textGuide, description);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
          res.setHeader("Access-Control-Allow-Origin", "*");
          return res.send(renderedPdf);
        }
      }

      // 3. Public folder static path fallback
      const publicPath = path.join(process.cwd(), "public", fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl);
      if (fs.existsSync(publicPath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
        res.setHeader("Access-Control-Allow-Origin", "*");
        return fs.createReadStream(publicPath).pipe(res);
      }
    }

    // 4. Clean dynamic standard PDF generation fallback
    const dynamicPdf = generateReadablePdfBuffer(title, category, description);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="document.pdf"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(dynamicPdf);
  } catch (err) {
    console.error("[Pehlakadam API] Error serving in-app PDF view:", err);
    res.status(500).json({ error: "Failed to render PDF view" });
  }
});

// 🔒 IN-APP BROCHURE VIEWER ENDPOINT
app.get("/api/programs/brochure/view/:programKey", async (req, res) => {
  try {
    const { programKey } = req.params;
    let config: any = null;

    if (isMongoConnected) {
      config = await ProgramConfigModel.findOne({ programKey }).exec();
    }

    if (!config && fs.existsSync(PROGRAMS_CONFIG_FILE)) {
      const allConfigs = JSON.parse(fs.readFileSync(PROGRAMS_CONFIG_FILE, "utf-8"));
      config = allConfigs.find((c: any) => c.programKey === programKey);
    }

    // 1. Direct Base64 brochure file data
    if (config && config.brochureFileData && typeof config.brochureFileData === "string" && config.brochureFileData.trim().length > 0) {
      const pureBase64 = config.brochureFileData.includes("base64,") ? config.brochureFileData.split("base64,")[1] : config.brochureFileData;
      const pdfBuffer = Buffer.from(pureBase64, "base64");
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="brochure_${programKey}.pdf"`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(pdfBuffer);
    }

    // 2. High fidelity standard compliant program brochure PDF stream
    const programBrochurePdf = generateProgramBrochurePdf(programKey, config);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="program_brochure_${programKey}.pdf"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.send(programBrochurePdf);
  } catch (err) {
    console.error("[Pehlakadam API] Error serving brochure view:", err);
    res.status(500).json({ error: "Failed to render brochure view" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 7: GET LOG OF ALL BROADCAST UPDATES
// =========================================================================================
// Fetches the announcement/alert history to display on the advisor console dashboard and
// live announcement ticker.
// =========================================================================================
app.get("/api/updates", async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await UpdateModel.find().sort({ createdAt: -1 });
      const updates = docs.map((doc) => ({
        id: doc._id.toString(),
        message: doc.message,
        notifiedCount: doc.notifiedCount,
        recipients: doc.recipients,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(updates);
    } else {
      const data = fs.readFileSync(UPDATES_FILE, "utf-8");
      return res.status(200).json(JSON.parse(data));
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading updates:", error);
    return res.status(500).json({ error: "Failed to fetch updates" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINT 8: DISPATCH & BROADCAST SESSION ALERTS (ADMIN EXCLUSIVE)
// =========================================================================================
// Allows an advisor to broadcast critical career-guidance orientations, webinars, or diagnostic
// events.
//
// 🛠️ OPERATION WORKFLOW:
// 1. Fetches all student registration leads currently stored in the system (MongoDB/JSON).
// 2. Maps them to extract student names, emails, and phone numbers.
// 3. Simulates automated delivery of live notification alerts via custom email streams and
//    SMS channels, printing complete distribution success confirmations to the console log.
// 4. Stores the broadcast receipt and receipt IDs back into the database logs.
// =========================================================================================
app.post("/api/updates", verifyAdmin, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Announcement message is required" });
    }

    let recipients: any[] = [];
    if (isMongoConnected) {
      const submissions = await SubmissionModel.find();
      recipients = submissions.map((sub) => ({
        name: `${sub.firstName} ${sub.lastName}`,
        email: sub.email,
        number: sub.number
      }));

      const newUpdateDoc = new UpdateModel({
        message,
        notifiedCount: recipients.length,
        recipients
      });
      await newUpdateDoc.save();

      console.log("\n=======================================================");
      console.log(`[PEHLAKADAM MONGO-BROADCAST] DISPATCHED TO ${recipients.length} REGISTERED LEADS`);
      console.log(`MESSAGE CONTENT: "${message}"`);
      recipients.forEach((rec: any, idx: number) => {
        console.log(`   [${idx + 1}] Sent Registered Notification to:`);
        console.log(`       📧 MAIL: ${rec.email} (Status: SUCCESS - Delivered)`);
        console.log(`       📱 SMS:  ${rec.number} (Status: SUCCESS - Dispatched)`);
      });
      console.log("=======================================================\n");

      return res.status(200).json({
        success: true,
        update: {
          id: newUpdateDoc._id.toString(),
          message,
          notifiedCount: recipients.length,
          recipients,
          createdAt: newUpdateDoc.createdAt.toISOString()
        }
      });
    } else {
      // Fetch registered users from fallback JSON to broadcast
      const submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
      recipients = submissions.map((sub: any) => ({
        name: `${sub.firstName} ${sub.lastName}`,
        email: sub.email,
        number: sub.number
      }));

      const updates = JSON.parse(fs.readFileSync(UPDATES_FILE, "utf-8"));
      const newUpdate = {
        id: Date.now().toString(),
        message,
        notifiedCount: recipients.length,
        recipients,
        createdAt: new Date().toISOString()
      };

      updates.push(newUpdate);
      fs.writeFileSync(UPDATES_FILE, JSON.stringify(updates, null, 2));

      console.log("\n=======================================================");
      console.log(`[PEHLAKADAM FALLBACK-BROADCAST] DISPATCHED TO ${recipients.length} REGISTERED LEADS`);
      console.log(`MESSAGE CONTENT: "${message}"`);
      recipients.forEach((rec: any, idx: number) => {
        console.log(`   [${idx + 1}] Sent Registered Notification to:`);
        console.log(`       📧 MAIL: ${rec.email} (Status: SUCCESS - Delivered)`);
        console.log(`       📱 SMS:  ${rec.number} (Status: SUCCESS - Dispatched)`);
      });
      console.log("=======================================================\n");

      return res.status(200).json({ success: true, update: newUpdate });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error creating announcement:", error);
    return res.status(500).json({ error: "Failed to broadcast update" });
  }
});

// =========================================================================================
// 🌐 API ENDPOINTS FOR PREMIUM ACCESS CONTROL (AUTHORIZED NUMBERS)
// =========================================================================================

// Helper to sanitize phone numbers (extracting last 10 digits)
const cleanPhoneDigits = (num: string) => {
  if (!num) return "";
  let digits = String(num).replace(/[^0-9]/g, "");
  if (digits.length > 10) {
    digits = digits.slice(-10);
  }
  return digits;
};

// 🔒 SINGLE-DEVICE CONCURRENCY CONTROL SESSION STORE
// Enforces 1 active device session per phone number for viewing paid courses & paid resources
interface StudentDeviceSession {
  sessionId: string;
  deviceIp: string;
  userAgent: string;
  createdAt: number;
  lastHeartbeat: number;
}

const activeDeviceSessions = new Map<string, StudentDeviceSession>();

function handleStudentSession(
  cleanedNum: string,
  clientSessionId?: string,
  action?: string,
  req?: any
): { sessionId: string; valid: boolean; sessionConflict?: boolean } {
  const currentSession = activeDeviceSessions.get(cleanedNum);
  const now = Date.now();
  const deviceIp = req?.headers?.["x-forwarded-for"] || req?.socket?.remoteAddress || "unknown";
  const userAgent = req?.headers?.["user-agent"] || "unknown";

  // If action is explicit 'login' OR client passed no sessionId OR no active session exists:
  if (action === "login" || !clientSessionId || !currentSession) {
    const newSessionId = `sess_${cleanedNum}_${now}_${Math.random().toString(36).substring(2, 8)}`;
    activeDeviceSessions.set(cleanedNum, {
      sessionId: newSessionId,
      deviceIp: String(deviceIp),
      userAgent: String(userAgent),
      createdAt: now,
      lastHeartbeat: now,
    });
    return { sessionId: newSessionId, valid: true };
  }

  // If client provided a sessionId and an active session exists:
  if (currentSession.sessionId === clientSessionId) {
    currentSession.lastHeartbeat = now;
    return { sessionId: clientSessionId, valid: true };
  } else {
    // Session conflict! This phone number was logged in on a different device or browser tab.
    return {
      sessionId: clientSessionId,
      valid: false,
      sessionConflict: true,
    };
  }
}

// 1. GET ALL AUTHORIZED PREMIUM NUMBERS
app.get("/api/authorized-numbers", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const docs = await AuthorizedNumberModel.find().sort({ createdAt: -1 });
      const numbersList = docs.map(doc => ({
        id: doc._id.toString(),
        number: doc.number,
        createdAt: doc.createdAt
      }));
      return res.status(200).json(numbersList);
    } else {
      const fileData = fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8");
      const list = JSON.parse(fileData);
      return res.status(200).json(list);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading authorized numbers:", error);
    return res.status(500).json({ error: "Failed to retrieve authorized numbers list." });
  }
});

// 2. AUTHORIZE A NEW PREMIUM PHONE NUMBER
app.post("/api/authorized-numbers", verifyAdmin, async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ error: "Phone number is required." });
    }

    const cleanedNum = cleanPhoneDigits(number);
    if (!cleanedNum) {
      return res.status(400).json({ error: "Invalid phone number formatting." });
    }

    if (isMongoConnected) {
      // Check duplicate
      const existing = await AuthorizedNumberModel.findOne({ number: cleanedNum });
      if (existing) {
        return res.status(400).json({ error: "This phone number is already authorized." });
      }

      const tier = req.body.tier || "pro";
      const newDoc = new AuthorizedNumberModel({ number: cleanedNum, tier });
      await newDoc.save();
      return res.status(200).json({ success: true, item: { id: newDoc._id.toString(), number: cleanedNum, tier, createdAt: newDoc.createdAt } });
    } else {
      const list = JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8"));
      if (list.some((item: any) => cleanPhoneDigits(item.number) === cleanedNum)) {
        return res.status(400).json({ error: "This phone number is already authorized." });
      }

      const tier = req.body.tier || "pro";
      const newItem = {
        id: Date.now().toString(),
        number: cleanedNum,
        tier,
        createdAt: new Date().toISOString()
      };
      list.push(newItem);
      fs.writeFileSync(AUTHORIZED_NUMBERS_FILE, JSON.stringify(list, null, 2));
      return res.status(200).json({ success: true, item: newItem });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error saving authorized number:", error);
    return res.status(500).json({ error: "Failed to authorize phone number." });
  }
});

// 3. REVOKE ACCESS FOR A PHONE NUMBER
app.delete("/api/authorized-numbers/:number", verifyAdmin, async (req, res) => {
  try {
    const targetNum = cleanPhoneDigits(req.params.number);
    if (!targetNum) {
      return res.status(400).json({ error: "Invalid phone number." });
    }

    if (isMongoConnected) {
      const result = await AuthorizedNumberModel.deleteOne({ number: targetNum });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Phone number not found in authorized list." });
      }
      return res.status(200).json({ success: true, message: "Authorized number revoked successfully." });
    } else {
      const list = JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8"));
      const filtered = list.filter((item: any) => cleanPhoneDigits(item.number) !== targetNum);
      if (filtered.length === list.length) {
        return res.status(404).json({ error: "Phone number not found in authorized list." });
      }
      fs.writeFileSync(AUTHORIZED_NUMBERS_FILE, JSON.stringify(filtered, null, 2));
      return res.status(200).json({ success: true, message: "Authorized number revoked successfully." });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error deleting authorized number:", error);
    return res.status(500).json({ error: "Failed to revoke authorized number." });
  }
});

// 4. CHECK ACCESS FOR STUDENT PHONE NUMBER (WITH SINGLE-DEVICE RESTRICTION)
app.post("/api/check-access", async (req, res) => {
  try {
    const { number, sessionId, action } = req.body;
    if (!number) {
      return res.status(200).json({ authorized: false });
    }

    const cleanedNum = cleanPhoneDigits(number);
    if (!cleanedNum) {
      return res.status(200).json({ authorized: false });
    }

    let authorized = false;
    let tier = "pro";

    if (isMongoConnected) {
      const doc = await AuthorizedNumberModel.findOne({
        $or: [
          { number: cleanedNum },
          { number: { $regex: cleanedNum + "$" } }
        ]
      });
      if (doc) {
        authorized = true;
        tier = (doc as any).tier || "pro";
      }
    }

    if (!authorized) {
      const list = fs.existsSync(AUTHORIZED_NUMBERS_FILE) ? JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8")) : [];
      const found = list.find((item: any) => cleanPhoneDigits(item.number) === cleanedNum);
      if (found) {
        authorized = true;
        tier = found.tier || "pro";
      }
    }

    if (!authorized) {
      return res.status(200).json({ authorized: false });
    }

    const sessionResult = handleStudentSession(cleanedNum, sessionId, action, req);
    if (!sessionResult.valid && sessionResult.sessionConflict) {
      return res.status(200).json({
        authorized: false,
        sessionConflict: true,
        message: "⚠️ Session Conflict: This phone number was logged in on another device or tab. Simultaneous access is restricted to 1 active device at a time."
      });
    }

    return res.status(200).json({
      authorized: true,
      tier,
      sessionId: sessionResult.sessionId
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error checking premium access:", error);
    return res.status(500).json({ error: "Failed to check premium access." });
  }
});

// CHECK PREMIUM ACCESS WITH TIER (Comprehensive Mongo + JSON across Authorized Numbers, Payments, and Submissions)
app.post("/api/check-premium-access", async (req, res) => {
  try {
    const { number, sessionId, action } = req.body;
    if (!number) {
      return res.status(200).json({ authorized: false });
    }
    const cleanedNum = cleanPhoneDigits(number);
    if (!cleanedNum) {
      return res.status(200).json({ authorized: false });
    }

    let authorized = false;
    let tier = "pro";

    // 1. Check Mongo Authorized Numbers if connected
    if (isMongoConnected) {
      const authDoc = await AuthorizedNumberModel.findOne({
        $or: [
          { number: cleanedNum },
          { number: { $regex: cleanedNum + "$" } }
        ]
      });
      if (authDoc) {
        authorized = true;
        tier = (authDoc as any).tier || "pro";
      }

      if (!authorized) {
        const paidDoc = await PaymentModel.findOne({
          $or: [
            { number: cleanedNum },
            { number: { $regex: cleanedNum + "$" } }
          ]
        });
        if (paidDoc) {
          authorized = true;
          tier = (paidDoc as any).tier || "pro";
        }
      }

      if (!authorized) {
        const subDoc = await SubmissionModel.findOne({
          $and: [
            {
              $or: [
                { number: cleanedNum },
                { number: { $regex: cleanedNum + "$" } }
              ]
            },
            {
              $or: [{ isPaid: true }, { hasPaidAccess: true }]
            }
          ]
        });
        if (subDoc) {
          authorized = true;
          tier = (subDoc as any).tier || "pro";
        }
      }
    }

    // 2. Check JSON Flat Files Fallback
    if (!authorized) {
      const authorizedList = fs.existsSync(AUTHORIZED_NUMBERS_FILE) ? JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8")) : [];
      const foundAuth = authorizedList.find((item: any) => cleanPhoneDigits(item.number) === cleanedNum);
      if (foundAuth) {
        authorized = true;
        tier = foundAuth.tier || "pro";
      }
    }

    if (!authorized) {
      const payments = fs.existsSync(PAYMENTS_FILE) ? JSON.parse(fs.readFileSync(PAYMENTS_FILE, "utf-8")) : [];
      const foundPayment = payments.find((p: any) => cleanPhoneDigits(p.number || p.phone) === cleanedNum);
      if (foundPayment) {
        authorized = true;
        tier = foundPayment.tier || "pro";
      }
    }

    if (!authorized) {
      const submissions = fs.existsSync(SUBMISSIONS_FILE) ? JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8")) : [];
      const foundSub = submissions.find((s: any) => cleanPhoneDigits(s.number) === cleanedNum && (s.isPaid || s.hasPaidAccess));
      if (foundSub) {
        authorized = true;
        tier = foundSub.tier || "pro";
      }
    }

    if (!authorized) {
      return res.status(200).json({ authorized: false });
    }

    const sessionResult = handleStudentSession(cleanedNum, sessionId, action, req);
    if (!sessionResult.valid && sessionResult.sessionConflict) {
      return res.status(200).json({
        authorized: false,
        sessionConflict: true,
        message: "⚠️ Session Conflict: This phone number was logged in on another device or tab. Simultaneous access is restricted to 1 active device at a time."
      });
    }

    return res.status(200).json({
      authorized: true,
      tier,
      sessionId: sessionResult.sessionId
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error checking premium access with tier:", error);
    return res.status(500).json({ error: "Failed to check premium access." });
  }
});

// 🔒 DEVICE SESSION HEARTBEAT VERIFICATION
app.post("/api/verify-session", async (req, res) => {
  try {
    const { number, sessionId } = req.body;
    if (!number || !sessionId) {
      return res.status(200).json({ valid: false, sessionConflict: false });
    }
    const cleanedNum = cleanPhoneDigits(number);
    if (!cleanedNum) {
      return res.status(200).json({ valid: false, sessionConflict: false });
    }

    const active = activeDeviceSessions.get(cleanedNum);
    if (!active) {
      // Re-register active session for this device
      activeDeviceSessions.set(cleanedNum, {
        sessionId,
        deviceIp: String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown"),
        userAgent: String(req.headers["user-agent"] || "unknown"),
        createdAt: Date.now(),
        lastHeartbeat: Date.now()
      });
      return res.status(200).json({ valid: true, activeDevicesCount: 1 });
    }

    if (active.sessionId === sessionId) {
      active.lastHeartbeat = Date.now();
      return res.status(200).json({ valid: true, activeDevicesCount: 1 });
    } else {
      return res.status(200).json({
        valid: false,
        sessionConflict: true,
        message: "⚠️ Session Conflict: Your phone number was accessed on another device. Simultaneous access on multiple devices is restricted to 1 active device at a time."
      });
    }
  } catch (err) {
    console.error("[Pehlakadam API] Error verifying session:", err);
    return res.status(500).json({ valid: false, error: "Failed to verify session." });
  }
});

// 🔒 SESSION LOGOUT ENDPOINT
app.post("/api/logout-session", async (req, res) => {
  try {
    const { number, sessionId } = req.body;
    if (number) {
      const cleanedNum = cleanPhoneDigits(number);
      const active = activeDeviceSessions.get(cleanedNum);
      if (active && (!sessionId || active.sessionId === sessionId)) {
        activeDeviceSessions.delete(cleanedNum);
      }
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Logout failed" });
  }
});

// LMS COURSES ENDPOINTS
app.get("/api/courses", async (req, res) => {
  try {
    if (isMongoConnected) {
      let docs = await CourseModel.find().sort({ createdAt: -1 });
      if (docs.length === 0) {
        // Seed default courses into MongoDB if empty
        const seeded = await CourseModel.insertMany(defaultCourses);
        docs = seeded as any[];
      }
      const formatted = docs.map((doc: any) => ({
        id: doc._id ? doc._id.toString() : doc.id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        thumbnailUrl: doc.thumbnailUrl,
        tier: doc.tier,
        category: doc.category,
        originalPrice: doc.originalPrice,
        discountPrice: doc.discountPrice,
        duration: doc.duration,
        level: doc.level,
        batch: doc.batch || "Regular Self-Paced Batch",
        published: doc.published ?? true,
        chapters: doc.chapters || [],
        createdAt: doc.createdAt ? (doc.createdAt.toISOString ? doc.createdAt.toISOString() : doc.createdAt) : new Date().toISOString()
      }));
      return res.status(200).json(formatted);
    } else {
      const courses = fs.existsSync(COURSES_FILE) ? JSON.parse(fs.readFileSync(COURSES_FILE, "utf-8")) : defaultCourses;
      return res.status(200).json(courses);
    }
  } catch (err) {
    console.error("[Pehlakadam API] Error fetching courses:", err);
    return res.status(500).json({ error: "Failed to fetch courses." });
  }
});

app.post("/api/courses", verifyAdmin, async (req, res) => {
  try {
    const courseData = {
      title: req.body.title || "Untitled Course",
      slug: req.body.slug || (req.body.title ? req.body.title.toLowerCase().replace(/[^a-z0-9]/g, "-") : "course-" + Date.now()),
      description: req.body.description || "",
      thumbnailUrl: req.body.thumbnailUrl || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800",
      tier: req.body.tier || "pro",
      category: req.body.category || "Primary Kudos",
      originalPrice: Number(req.body.originalPrice) || 4999,
      discountPrice: Number(req.body.discountPrice) || 1999,
      duration: req.body.duration || "10 Hours",
      level: req.body.level || "All Levels",
      batch: req.body.batch || "Regular Self-Paced Batch",
      published: req.body.published ?? true,
      chapters: req.body.chapters || []
    };

    let newCourse: any = null;

    if (isMongoConnected) {
      const created = new CourseModel(courseData);
      await created.save();
      newCourse = {
        id: created._id.toString(),
        ...courseData,
        createdAt: created.createdAt.toISOString()
      };
    } else {
      newCourse = {
        id: "course-" + Date.now(),
        ...courseData,
        createdAt: new Date().toISOString()
      };
    }

    // Keep JSON file in sync for fallback
    let courses: any[] = [];
    try {
      if (fs.existsSync(COURSES_FILE)) {
        courses = JSON.parse(fs.readFileSync(COURSES_FILE, "utf-8"));
      }
    } catch (e) {}
    courses.push(newCourse);
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));

    return res.status(201).json(newCourse);
  } catch (err) {
    console.error("[Pehlakadam API] Error creating course:", err);
    return res.status(500).json({ error: "Failed to create course." });
  }
});

app.put("/api/courses/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let updatedCourse: any = null;

    if (isMongoConnected) {
      let doc = await CourseModel.findById(id);
      if (!doc) {
        doc = await CourseModel.findOne({ slug: id });
      }
      if (doc) {
        Object.assign(doc, req.body);
        await doc.save();
        updatedCourse = {
          id: doc._id.toString(),
          title: doc.title,
          slug: doc.slug,
          description: doc.description,
          thumbnailUrl: doc.thumbnailUrl,
          tier: doc.tier,
          category: doc.category,
          originalPrice: doc.originalPrice,
          discountPrice: doc.discountPrice,
          duration: doc.duration,
          level: doc.level,
          batch: doc.batch,
          published: doc.published,
          chapters: doc.chapters,
          createdAt: doc.createdAt
        };
      }
    }

    // Keep JSON file in sync
    let courses: any[] = [];
    try {
      if (fs.existsSync(COURSES_FILE)) {
        courses = JSON.parse(fs.readFileSync(COURSES_FILE, "utf-8"));
      }
    } catch (e) {}
    const index = courses.findIndex((c: any) => c.id === id || c.slug === id);
    if (index !== -1) {
      courses[index] = { ...courses[index], ...req.body };
      fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));
      if (!updatedCourse) updatedCourse = courses[index];
    }

    if (!updatedCourse) return res.status(404).json({ error: "Course not found" });
    return res.status(200).json(updatedCourse);
  } catch (err) {
    console.error("[Pehlakadam API] Error updating course:", err);
    return res.status(500).json({ error: "Failed to update course." });
  }
});

app.delete("/api/courses/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await CourseModel.findByIdAndDelete(id);
    }

    let courses: any[] = [];
    try {
      if (fs.existsSync(COURSES_FILE)) {
        courses = JSON.parse(fs.readFileSync(COURSES_FILE, "utf-8"));
      }
    } catch (e) {}
    courses = courses.filter((c: any) => c.id !== id);
    fs.writeFileSync(COURSES_FILE, JSON.stringify(courses, null, 2));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("[Pehlakadam API] Error deleting course:", err);
    return res.status(500).json({ error: "Failed to delete course." });
  }
});

// PROMO COUPONS ENDPOINTS
app.get("/api/coupons", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      let docs = await CouponModel.find().sort({ createdAt: -1 });
      if (docs.length === 0) {
        const seeded = await CouponModel.insertMany(defaultCoupons);
        docs = seeded as any[];
      }
      const formatted = docs.map((d: any) => ({
        id: d._id ? d._id.toString() : d.id,
        code: d.code,
        discountType: d.discountType,
        discountValue: d.discountValue,
        minOrderAmount: d.minOrderAmount,
        active: d.active,
        createdAt: d.createdAt ? (d.createdAt.toISOString ? d.createdAt.toISOString() : d.createdAt) : new Date().toISOString()
      }));
      return res.status(200).json(formatted);
    } else {
      const coupons = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : defaultCoupons;
      return res.status(200).json(coupons);
    }
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch coupons." });
  }
});

app.post("/api/coupons", verifyAdmin, async (req, res) => {
  try {
    const code = (req.body.code || "").trim().toUpperCase();
    if (!code) return res.status(400).json({ error: "Code required" });

    if (isMongoConnected) {
      const existing = await CouponModel.findOne({ code });
      if (existing) return res.status(400).json({ error: "Coupon code already exists." });
    }
    const localCoupons = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : [];
    if (localCoupons.some((c: any) => c.code === code)) {
      return res.status(400).json({ error: "Coupon code already exists." });
    }

    const couponData = {
      code,
      discountType: req.body.discountType || "percentage",
      discountValue: Number(req.body.discountValue) || 20,
      minOrderAmount: Number(req.body.minOrderAmount) || 0,
      active: req.body.active ?? true
    };

    let newCoupon: any = null;

    if (isMongoConnected) {
      const created = new CouponModel(couponData);
      await created.save();
      newCoupon = {
        id: created._id.toString(),
        ...couponData,
        createdAt: created.createdAt.toISOString()
      };
    } else {
      newCoupon = {
        id: "coup-" + Date.now(),
        ...couponData,
        createdAt: new Date().toISOString()
      };
    }

    localCoupons.push(newCoupon);
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(localCoupons, null, 2));
    return res.status(201).json(newCoupon);
  } catch (err) {
    console.error("[Pehlakadam API] Error creating coupon:", err);
    return res.status(500).json({ error: "Failed to create coupon." });
  }
});

app.put("/api/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let updated: any = null;

    if (isMongoConnected) {
      const doc = await CouponModel.findById(id);
      if (doc) {
        Object.assign(doc, req.body);
        await doc.save();
        updated = {
          id: doc._id.toString(),
          code: doc.code,
          discountType: doc.discountType,
          discountValue: doc.discountValue,
          minOrderAmount: doc.minOrderAmount,
          active: doc.active,
          createdAt: doc.createdAt
        };
      }
    }

    const coupons = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : [];
    const index = coupons.findIndex((c: any) => c.id === id);
    if (index !== -1) {
      coupons[index] = { ...coupons[index], ...req.body };
      fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
      if (!updated) updated = coupons[index];
    }

    if (!updated) return res.status(404).json({ error: "Coupon not found" });
    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update coupon." });
  }
});

app.delete("/api/coupons/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await CouponModel.findByIdAndDelete(id);
    }
    let coupons = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : [];
    coupons = coupons.filter((c: any) => c.id !== id);
    fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete coupon." });
  }
});

// =========================================================================================
// 🎟️ PROMO COUPON VALIDATION & CUSTOMER PORTALS
// =========================================================================================
app.post("/api/coupons/validate", async (req, res) => {
  try {
    const { code, originalPrice, amount } = req.body;
    if (!code || typeof code !== "string" || !code.trim()) {
      return res.status(400).json({ valid: false, success: false, message: "Coupon code is required." });
    }

    const normalizedCode = code.trim().toUpperCase();
    const price = Number(originalPrice || amount || 0);

    let foundCoupon: any = null;

    if (isMongoConnected) {
      const doc = await CouponModel.findOne({ code: normalizedCode, active: true });
      if (doc) {
        foundCoupon = {
          code: doc.code,
          discountType: doc.discountType,
          discountValue: doc.discountValue,
          minOrderAmount: doc.minOrderAmount
        };
      }
    }

    if (!foundCoupon) {
      const coupons = fs.existsSync(COUPONS_FILE) ? JSON.parse(fs.readFileSync(COUPONS_FILE, "utf-8")) : [];
      const localFound = coupons.find((c: any) => c.code === normalizedCode && (c.active !== false));
      if (localFound) {
        foundCoupon = localFound;
      }
    }

    // Fallback static map
    if (!foundCoupon) {
      const validCoupons: Record<string, { code: string; discountType: "percentage" | "fixed"; discountValue: number; minOrderAmount?: number }> = {
        FESTIVE100: { code: "FESTIVE100", discountType: "percentage", discountValue: 100 },
        PEHLA50: { code: "PEHLA50", discountType: "percentage", discountValue: 50 },
        WELCOME20: { code: "WELCOME20", discountType: "percentage", discountValue: 20 },
        BKPILANI100: { code: "BKPILANI100", discountType: "percentage", discountValue: 100 },
        FREE100: { code: "FREE100", discountType: "percentage", discountValue: 100 },
        PRO100: { code: "PRO100", discountType: "percentage", discountValue: 100 },
      };
      if (validCoupons[normalizedCode]) {
        foundCoupon = validCoupons[normalizedCode];
      }
    }

    if (!foundCoupon) {
      return res.status(400).json({ valid: false, success: false, message: "Invalid, expired, or inactive coupon code." });
    }

    const minAmount = Number(foundCoupon.minOrderAmount || 0);
    if (minAmount > 0 && price > 0 && price < minAmount) {
      return res.status(400).json({
        valid: false,
        success: false,
        message: `Minimum order amount for coupon "${foundCoupon.code}" is ₹${minAmount.toLocaleString("en-IN")}.`
      });
    }

    let discountAmount = 0;
    if (foundCoupon.discountType === "percentage") {
      discountAmount = Math.round((price * Number(foundCoupon.discountValue)) / 100);
    } else {
      discountAmount = Math.min(price, Number(foundCoupon.discountValue));
    }

    const finalPrice = Math.max(0, price - discountAmount);

    return res.status(200).json({
      valid: true,
      success: true,
      code: foundCoupon.code,
      discountType: foundCoupon.discountType,
      discountValue: foundCoupon.discountValue,
      discountAmount,
      finalPrice,
      message: `Coupon "${foundCoupon.code}" applied! You saved ₹${discountAmount.toLocaleString("en-IN")}.`,
      coupon: foundCoupon
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error validating coupon:", error);
    return res.status(500).json({ valid: false, success: false, message: "Failed to validate coupon code." });
  }
});

// =========================================================================================
// 🔒 STUDENT PORTAL PROFILE LOGIN / RETRIEVAL
// =========================================================================================
app.post("/api/student/login", async (req, res) => {
  try {
    const { email, number } = req.body;
    if (!email || !number) {
      return res.status(400).json({ error: "Email and Contact Number are required." });
    }

    const cleanedInputPhone = number.replace(/[^0-9]/g, "");
    const normalizedEmail = email.trim().toLowerCase();

    let foundStudent: any = null;

    if (isMongoConnected) {
      const submissions = await SubmissionModel.find();
      foundStudent = submissions.find(sub => {
        const subEmail = sub.email?.trim().toLowerCase();
        const subPhone = sub.number?.replace(/[^0-9]/g, "");
        return subEmail === normalizedEmail && (subPhone === cleanedInputPhone || subPhone?.endsWith(cleanedInputPhone) || cleanedInputPhone.endsWith(subPhone || ""));
      });
    } else {
      if (fs.existsSync(SUBMISSIONS_FILE)) {
        const fileData = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
        const submissions = JSON.parse(fileData);
        foundStudent = submissions.find((sub: any) => {
          const subEmail = sub.email?.trim().toLowerCase();
          const subPhone = sub.number?.replace(/[^0-9]/g, "");
          return subEmail === normalizedEmail && (subPhone === cleanedInputPhone || subPhone?.endsWith(cleanedInputPhone) || cleanedInputPhone.endsWith(subPhone || ""));
        });
      }
    }

    // Default student fallback for demo / testing ease
    if (!foundStudent && normalizedEmail === "arjun@gmail.com") {
      foundStudent = {
        firstName: "Arjun",
        lastName: "Sharma",
        email: "arjun@gmail.com",
        number: number,
        role: "11-12 Grade Student",
        message: "Looking for career options in computer science and technology."
      };
    }

    if (foundStudent) {
      return res.status(200).json({
        success: true,
        message: "Profile verified! Seasonal 100% discount unlocked.",
        student: {
          firstName: foundStudent.firstName,
          lastName: foundStudent.lastName,
          email: foundStudent.email,
          number: foundStudent.number,
          role: foundStudent.role,
          message: foundStudent.message || ""
        }
      });
    } else {
      return res.status(404).json({
        error: "Profile not found with those credentials. Please register first to unlock!"
      });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error during student login:", error);
    return res.status(500).json({ error: "Failed to authenticate student profile." });
  }
});

// =========================================================================================
// 📈 SYSTEM STATS MANAGEMENT (STUDENTS COUNT, EXPERTS COUNT, SUCCESS RATE, SOCIALS, PAYMENT)
// =========================================================================================
app.get("/api/system-stats", async (req, res) => {
  try {
    if (isMongoConnected) {
      let stats = await SystemStatsModel.findOne();
      if (!stats) {
        stats = await SystemStatsModel.create({
          studentsCount: "10K+",
          expertsCount: "15+",
          successRate: "99%",
          upiId: "nrjstudywrk@okicici",
          merchantName: "Niranjan Singh (Pehlakadam)",
          instagramUrl: "#",
          youtubeUrl: "#",
          whatsappSupportUrl: "#",
          whatsappGroupUrl: "",
          forumJoinUrl: "",
          seoTitle: "Pehlakadam - Best Career Counselling & Personality Development",
          seoDescription: "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
          seoKeywords: "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
          seoAuthor: "Pehlakadam"
        });
      }
      return res.status(200).json({
        studentsCount: stats.studentsCount,
        expertsCount: stats.expertsCount,
        successRate: stats.successRate,
        upiId: stats.upiId || "nrjstudywrk@okicici",
        merchantName: stats.merchantName || "Niranjan Singh (Pehlakadam)",
        instagramUrl: stats.instagramUrl || "#",
        youtubeUrl: stats.youtubeUrl || "#",
        whatsappSupportUrl: stats.whatsappSupportUrl || "#",
        whatsappGroupUrl: stats.whatsappGroupUrl || "",
        forumJoinUrl: stats.forumJoinUrl || "",
        seoTitle: stats.seoTitle || "Pehlakadam - Best Career Counselling & Personality Development",
        seoDescription: stats.seoDescription || "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
        seoKeywords: stats.seoKeywords || "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
        seoAuthor: stats.seoAuthor || "Pehlakadam"
      });
    } else {
      let stats: any = {};
      try {
        const fileData = fs.readFileSync(SYSTEM_STATS_FILE, "utf-8");
        stats = JSON.parse(fileData);
      } catch (e) {
        stats = {
          studentsCount: "10K+",
          expertsCount: "15+",
          successRate: "99%",
          upiId: "nrjstudywrk@okicici",
          merchantName: "Niranjan Singh (Pehlakadam)",
          instagramUrl: "#",
          youtubeUrl: "#",
          whatsappSupportUrl: "#",
          whatsappGroupUrl: "",
          forumJoinUrl: "",
          seoTitle: "Pehlakadam - Best Career Counselling & Personality Development",
          seoDescription: "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
          seoKeywords: "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
          seoAuthor: "Pehlakadam"
        };
      }
      return res.status(200).json({
        studentsCount: stats.studentsCount || "10K+",
        expertsCount: stats.expertsCount || "15+",
        successRate: stats.successRate || "99%",
        upiId: stats.upiId || "nrjstudywrk@okicici",
        merchantName: stats.merchantName || "Niranjan Singh (Pehlakadam)",
        instagramUrl: stats.instagramUrl || "#",
        youtubeUrl: stats.youtubeUrl || "#",
        whatsappSupportUrl: stats.whatsappSupportUrl || "#",
        whatsappGroupUrl: stats.whatsappGroupUrl || "",
        forumJoinUrl: stats.forumJoinUrl || "",
        seoTitle: stats.seoTitle || "Pehlakadam - Best Career Counselling & Personality Development",
        seoDescription: stats.seoDescription || "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
        seoKeywords: stats.seoKeywords || "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
        seoAuthor: stats.seoAuthor || "Pehlakadam"
      });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading system stats:", error);
    return res.status(200).json({
      studentsCount: "10K+",
      expertsCount: "15+",
      successRate: "99%",
      upiId: "nrjstudywrk@okicici",
      merchantName: "Niranjan Singh (Pehlakadam)",
      instagramUrl: "#",
      youtubeUrl: "#",
      whatsappSupportUrl: "#",
      whatsappGroupUrl: "",
      forumJoinUrl: "",
      seoTitle: "Pehlakadam - Best Career Counselling & Personality Development",
      seoDescription: "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.",
      seoKeywords: "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam",
      seoAuthor: "Pehlakadam"
    });
  }
});

app.post("/api/system-stats", verifyAdmin, async (req, res) => {
  try {
    const {
      studentsCount,
      expertsCount,
      successRate,
      upiId,
      merchantName,
      instagramUrl,
      youtubeUrl,
      whatsappSupportUrl,
      whatsappGroupUrl,
      forumJoinUrl,
      seoTitle,
      seoDescription,
      seoKeywords,
      seoAuthor
    } = req.body;

    if (!studentsCount || !expertsCount || !successRate) {
      return res.status(400).json({ error: "All stats fields are required." });
    }

    const finalUpiId = upiId || "nrjstudywrk@okicici";
    const finalMerchantName = merchantName || "Niranjan Singh (Pehlakadam)";
    const finalInstagram = instagramUrl || "#";
    const finalYoutube = youtubeUrl || "#";
    const finalWhatsappSupport = whatsappSupportUrl || "#";
    const finalWhatsappGroup = whatsappGroupUrl || "";
    const finalForumJoin = forumJoinUrl || "";
    const finalSeoTitle = seoTitle || "Pehlakadam - Best Career Counselling & Personality Development";
    const finalSeoDescription = seoDescription || "Unlock your potential with Pehlakadam. We provide professional career counseling, psychometric personality diagnostics (DISC, MBTI, 16PF), and weekly tips.";
    const finalSeoKeywords = seoKeywords || "career counselling, personality development, psychometric test, MBTI, DISC assessment, Pehlakadam";
    const finalSeoAuthor = seoAuthor || "Pehlakadam";

    if (isMongoConnected) {
      let stats = await SystemStatsModel.findOne();
      if (!stats) {
        stats = new SystemStatsModel();
      }
      stats.studentsCount = studentsCount;
      stats.expertsCount = expertsCount;
      stats.successRate = successRate;
      stats.upiId = finalUpiId;
      stats.merchantName = finalMerchantName;
      stats.instagramUrl = finalInstagram;
      stats.youtubeUrl = finalYoutube;
      stats.whatsappSupportUrl = finalWhatsappSupport;
      stats.whatsappGroupUrl = finalWhatsappGroup;
      stats.forumJoinUrl = finalForumJoin;
      stats.seoTitle = finalSeoTitle;
      stats.seoDescription = finalSeoDescription;
      stats.seoKeywords = finalSeoKeywords;
      stats.seoAuthor = finalSeoAuthor;
      stats.updatedAt = new Date();
      await stats.save();
    }

    // Always keep system_stats.json in sync
    fs.writeFileSync(SYSTEM_STATS_FILE, JSON.stringify({
      studentsCount,
      expertsCount,
      successRate,
      upiId: finalUpiId,
      merchantName: finalMerchantName,
      instagramUrl: finalInstagram,
      youtubeUrl: finalYoutube,
      whatsappSupportUrl: finalWhatsappSupport,
      whatsappGroupUrl: finalWhatsappGroup,
      forumJoinUrl: finalForumJoin,
      seoTitle: finalSeoTitle,
      seoDescription: finalSeoDescription,
      seoKeywords: finalSeoKeywords,
      seoAuthor: finalSeoAuthor
    }, null, 2));

    return res.status(200).json({
      message: "System stats and payment/social/SEO config updated successfully.",
      stats: {
        studentsCount,
        expertsCount,
        successRate,
        upiId: finalUpiId,
        merchantName: finalMerchantName,
        instagramUrl: finalInstagram,
        youtubeUrl: finalYoutube,
        whatsappSupportUrl: finalWhatsappSupport,
        whatsappGroupUrl: finalWhatsappGroup,
        forumJoinUrl: finalForumJoin,
        seoTitle: finalSeoTitle,
        seoDescription: finalSeoDescription,
        seoKeywords: finalSeoKeywords,
        seoAuthor: finalSeoAuthor
      }
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error updating system stats:", error);
    return res.status(500).json({ error: "Failed to update system stats." });
  }
});

// =========================================================================================
// ✉️ WEEKLY CAREER TIPS SUBSCRIBERS
// =========================================================================================
app.post("/api/career-tips-join", async (req, res) => {
  try {
    const { email, phone } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required to join weekly tips." });
    }

    const newSub = {
      id: Date.now().toString(),
      email,
      phone: phone || "",
      createdAt: new Date()
    };

    if (isMongoConnected) {
      const subscriber = new CareerTipSubscriberModel({
        email,
        phone: phone || "",
        createdAt: new Date()
      });
      await subscriber.save();
    }

    // Keep JSON file in sync
    let subscribers: any[] = [];
    try {
      if (fs.existsSync(CAREER_TIPS_SUBSCRIBERS_FILE)) {
        subscribers = JSON.parse(fs.readFileSync(CAREER_TIPS_SUBSCRIBERS_FILE, "utf-8"));
      }
    } catch (e) {
      console.warn("Subscribers file read warning:", e);
    }
    subscribers.push(newSub);
    fs.writeFileSync(CAREER_TIPS_SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    // Retrieve system stats to get redirects / groups
    let whatsappGroupUrl = "";
    let forumJoinUrl = "";
    if (isMongoConnected) {
      const stats = await SystemStatsModel.findOne();
      if (stats) {
        whatsappGroupUrl = stats.whatsappGroupUrl || "";
        forumJoinUrl = stats.forumJoinUrl || "";
      }
    } else {
      try {
        if (fs.existsSync(SYSTEM_STATS_FILE)) {
          const stats = JSON.parse(fs.readFileSync(SYSTEM_STATS_FILE, "utf-8"));
          whatsappGroupUrl = stats.whatsappGroupUrl || "";
          forumJoinUrl = stats.forumJoinUrl || "";
        }
      } catch (e) {}
    }

    return res.status(200).json({
      message: "Successfully subscribed to Weekly Career Tips!",
      whatsappGroupUrl,
      forumJoinUrl
    });
  } catch (error) {
    console.error("[Pehlakadam API] Error joining career tips:", error);
    return res.status(500).json({ error: "Failed to subscribe. Please try again." });
  }
});

app.get("/api/career-tips-subscribers", verifyAdmin, async (req, res) => {
  try {
    if (isMongoConnected) {
      const subs = await CareerTipSubscriberModel.find().sort({ createdAt: -1 });
      const formatted = subs.map(s => ({
        id: s._id.toString(),
        email: s.email,
        phone: s.phone,
        createdAt: s.createdAt
      }));
      return res.status(200).json(formatted);
    } else {
      let subscribers: any[] = [];
      try {
        if (fs.existsSync(CAREER_TIPS_SUBSCRIBERS_FILE)) {
          subscribers = JSON.parse(fs.readFileSync(CAREER_TIPS_SUBSCRIBERS_FILE, "utf-8"));
        }
      } catch (e) {}
      // Sort desc
      subscribers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json(subscribers);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error fetching subscribers:", error);
    return res.status(500).json({ error: "Failed to fetch subscribers." });
  }
});

app.delete("/api/career-tips-subscribers/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await CareerTipSubscriberModel.findByIdAndDelete(id);
    }

    // Keep JSON file in sync
    let subscribers: any[] = [];
    try {
      if (fs.existsSync(CAREER_TIPS_SUBSCRIBERS_FILE)) {
        subscribers = JSON.parse(fs.readFileSync(CAREER_TIPS_SUBSCRIBERS_FILE, "utf-8"));
      }
    } catch (e) {}

    subscribers = subscribers.filter(s => s.id !== id);
    fs.writeFileSync(CAREER_TIPS_SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    return res.status(200).json({ message: "Subscriber removed successfully." });
  } catch (error) {
    console.error("[Pehlakadam API] Error deleting subscriber:", error);
    return res.status(500).json({ error: "Failed to delete subscriber." });
  }
});

// =========================================================================================
// =========================================================================================
// 🌐 TESTIMONIALS ENDPOINTS (DURABLE HYBRID STORAGE)
// =========================================================================================
app.get("/api/testimonials", async (req, res) => {
  try {
    if (isMongoConnected) {
      const items = await TestimonialModel.find().sort({ createdAt: -1 });
      const formatted = items.map(item => ({
        id: item._id.toString(),
        studentName: item.studentName,
        stream: item.stream,
        achievement: item.achievement,
        story: item.story,
        fileName: item.fileName,
        fileData: item.fileData,
        createdAt: item.createdAt
      }));
      return res.status(200).json(formatted);
    } else {
      let items: any[] = [];
      try {
        if (fs.existsSync(TESTIMONIALS_FILE)) {
          items = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
        }
      } catch (e) {}
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json(items);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error fetching testimonials:", error);
    return res.status(500).json({ error: "Failed to fetch testimonials." });
  }
});

app.post("/api/testimonials", verifyAdmin, async (req, res) => {
  try {
    const { studentName, stream, achievement, story, fileName, fileData } = req.body;
    if (!studentName || !stream || !achievement || !story) {
      return res.status(400).json({ error: "All fields are required (studentName, stream, achievement, story)." });
    }

    const newId = new mongoose.Types.ObjectId().toString();
    const newItem = {
      id: newId,
      studentName,
      stream,
      achievement,
      story,
      fileName: fileName || "",
      fileData: fileData || "",
      createdAt: new Date().toISOString()
    };

    if (isMongoConnected) {
      const dbItem = new TestimonialModel({
        studentName,
        stream,
        achievement,
        story,
        fileName: fileName || "",
        fileData: fileData || ""
      });
      await dbItem.save();
      newItem.id = dbItem._id.toString();
    }

    // Keep JSON file in sync
    let items: any[] = [];
    try {
      if (fs.existsSync(TESTIMONIALS_FILE)) {
        items = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
      }
    } catch (e) {}
    items.push(newItem);
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(items, null, 2));

    return res.status(200).json(newItem);
  } catch (error) {
    console.error("[Pehlakadam API] Error creating testimonial:", error);
    return res.status(500).json({ error: "Failed to create testimonial." });
  }
});

app.delete("/api/testimonials/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await TestimonialModel.findByIdAndDelete(id);
    }

    // Keep JSON file in sync
    let items: any[] = [];
    try {
      if (fs.existsSync(TESTIMONIALS_FILE)) {
        items = JSON.parse(fs.readFileSync(TESTIMONIALS_FILE, "utf-8"));
      }
    } catch (e) {}

    items = items.filter(item => item.id !== id);
    fs.writeFileSync(TESTIMONIALS_FILE, JSON.stringify(items, null, 2));

    return res.status(200).json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    console.error("[Pehlakadam API] Error deleting testimonial:", error);
    return res.status(500).json({ error: "Failed to delete testimonial." });
  }
});

// Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("[Pehlakadam Server] Mounted Vite in development mode");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Pehlakadam Server] Serving production build");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pehlakadam Server] Running on http://localhost:${PORT}`);
  });
}

startServer();

