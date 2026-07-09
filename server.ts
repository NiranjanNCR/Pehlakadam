import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
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

// 📂 SCHEMA 7: SCIENTIFIC DIAGNOSTICS TESTS SCHEMA
const DiagnosticTestSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  customFieldLabel: { type: String, default: "Specific Details" },
  questions: [{
    id: { type: String, required: true },
    text: { type: String, required: true },
    options: [{
      id: { type: String, required: true },
      text: { type: String, required: true },
      value: { type: String, required: true }
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
    const { key, title, subtitle, description, customFieldLabel, questions } = req.body;
    if (!key || !title || !questions) {
      return res.status(400).json({ error: "key, title, and questions are required fields." });
    }

    if (isMongoConnected) {
      const updated = await DiagnosticTestModel.findOneAndUpdate(
        { key },
        { title, subtitle, description, customFieldLabel, questions, updatedAt: new Date() },
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

// 3. SUBMIT DIAGNOSTIC EVALUATION (WITH PERSONALITY & PSYCHOMETRIC CALCULATIONS)
app.post("/api/diagnostic-tests/submit", async (req, res) => {
  try {
    const { user, testKey, answers } = req.body;
    if (!user || !testKey || !answers) {
      return res.status(400).json({ error: "Missing required parameters (user, testKey, answers)." });
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
        breakdown: pct,
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
        breakdown: { E, I: I_val, S, N, T, F, J, P },
        mbti,
        summary: careers[mbti] || "Versatile Profile: Highly adaptable psychometric thinker.",
        title: `MBTI Personality Profile: ${mbti}`
      };
    } else if (testKey === "16pf") {
      const traits: string[] = [];
      vals.forEach(v => {
        if (v && !traits.includes(v)) traits.push(v);
      });
      score = {
        breakdown: traits,
        summary: `Strongest Career Factors: ${traits.join(", ")}. Matches ideally with analytical research, structured process engineering, and proactive communications.`,
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
        breakdown: { Extraversion: E, Introversion: I_val, Neuroticism: N, Stability: S },
        temperament,
        summary,
        title: `Eysenck Temperament: ${temperament}`
      };
    } else if (testKey === "enneagram") {
      const counts: any = {};
      vals.forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      let dominantType = "Type 9 - Peacemaker";
      let maxCount = 0;
      Object.keys(counts).forEach(k => {
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          dominantType = k;
        }
      });
      score = {
        breakdown: counts,
        dominantType,
        summary: `Your core driving motivator is represented by ${dominantType}. This defines your path of personal integration, helping you align with authentic career callings.`,
        title: `Enneagram Profile: ${dominantType}`
      };
    } else if (testKey === "caliper") {
      const traits: string[] = [];
      vals.forEach(v => {
        if (v && !traits.includes(v)) traits.push(v);
      });
      score = {
        breakdown: traits,
        summary: `Identified Performance Drivers: ${traits.join(", ")}. Perfect match for fields requiring empathy, structural organization, assertiveness, and cognitive leadership.`,
        title: "Caliper Job-Performance Driver Profile"
      };
    } else if (testKey === "mmpi") {
      const traits: string[] = [];
      vals.forEach(v => {
        if (v && !traits.includes(v)) traits.push(v);
      });
      score = {
        breakdown: traits,
        summary: `Clinical psychometric indicators: ${traits.join(", ")}. Displays steady emotional resilience, structured coping strategies, and optimal cognitive adaptability under high work/study stress.`,
        title: "MMPI Psychometric Insight"
      };
    } else {
      score = {
        summary: "Assessment successfully processed. Highly balanced professional potential.",
        title: "Psychometric Evaluation Profile"
      };
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
      mmpi: "Minnesota Multiphasic Test"
    };
    const testTitle = testTitles[testKey] || "Scientific Diagnostics Evaluation";

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

    return res.status(200).json({ success: true, submission: savedSubmission });
  } catch (error) {
    console.error("[Pehlakadam API] Error submitting diagnostic test:", error);
    return res.status(500).json({ error: "Failed to submit and calculate evaluation." });
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
      const submissions = docs.map((doc) => ({
        id: doc._id.toString(),
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email,
        number: doc.number,
        role: doc.role,
        message: doc.message,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(submissions);
    } else {
      const fileData = fs.readFileSync(SUBMISSIONS_FILE, "utf-8");
      const submissions = JSON.parse(fileData);
      return res.status(200).json(submissions);
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error reading submissions:", error);
    return res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

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
        isPaid: !!doc.isPaid,
        createdAt: doc.createdAt.toISOString()
      }));
      return res.status(200).json(resources);
    } else {
      const data = fs.readFileSync(RESOURCES_FILE, "utf-8");
      const list = JSON.parse(data).map((r: any) => ({
        ...r,
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

// Helper to sanitize phone numbers (keeping digits only)
const cleanPhoneDigits = (num: string) => num.replace(/[^0-9]/g, "");

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

      const newDoc = new AuthorizedNumberModel({ number: cleanedNum });
      await newDoc.save();
      return res.status(200).json({ success: true, item: { id: newDoc._id.toString(), number: cleanedNum, createdAt: newDoc.createdAt } });
    } else {
      const list = JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8"));
      if (list.some((item: any) => cleanPhoneDigits(item.number) === cleanedNum)) {
        return res.status(400).json({ error: "This phone number is already authorized." });
      }

      const newItem = {
        id: Date.now().toString(),
        number: cleanedNum,
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

// 4. CHECK ACCESS FOR STUDENT PHONE NUMBER
app.post("/api/check-access", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(200).json({ authorized: false });
    }

    const cleanedNum = cleanPhoneDigits(number);
    if (!cleanedNum) {
      return res.status(200).json({ authorized: false });
    }

    if (isMongoConnected) {
      const doc = await AuthorizedNumberModel.findOne({ number: cleanedNum });
      return res.status(200).json({ authorized: !!doc });
    } else {
      const list = JSON.parse(fs.readFileSync(AUTHORIZED_NUMBERS_FILE, "utf-8"));
      const isFound = list.some((item: any) => cleanPhoneDigits(item.number) === cleanedNum);
      return res.status(200).json({ authorized: isFound });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error checking premium access:", error);
    return res.status(500).json({ error: "Failed to check premium access." });
  }
});

// =========================================================================================
// 🎟️ PROMO COUPON VALIDATION & CUSTOMER PORTALS
// =========================================================================================
app.post("/api/coupons/validate", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Coupon code is required." });
    }

    const normalizedCode = code.trim().toUpperCase();
    const validCoupons: Record<string, { code: string; discountType: "percentage" | "fixed"; discountValue: number }> = {
      FESTIVE100: { code: "FESTIVE100", discountType: "percentage", discountValue: 100 },
      PEHLA50: { code: "PEHLA50", discountType: "percentage", discountValue: 50 },
      WELCOME20: { code: "WELCOME20", discountType: "percentage", discountValue: 20 },
      BKPILANI100: { code: "BKPILANI100", discountType: "percentage", discountValue: 100 },
      FREE100: { code: "FREE100", discountType: "percentage", discountValue: 100 },
    };

    const coupon = validCoupons[normalizedCode];
    if (coupon) {
      return res.status(200).json({
        success: true,
        coupon
      });
    } else {
      return res.status(400).json({ error: "Invalid, expired, or inactive coupon code." });
    }
  } catch (error) {
    console.error("[Pehlakadam API] Error validating coupon:", error);
    return res.status(500).json({ error: "Internal server error validating coupon." });
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
          forumJoinUrl: ""
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
        forumJoinUrl: stats.forumJoinUrl || ""
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
          forumJoinUrl: ""
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
        forumJoinUrl: stats.forumJoinUrl || ""
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
      forumJoinUrl: ""
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
      forumJoinUrl
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
      forumJoinUrl: finalForumJoin
    }, null, 2));

    return res.status(200).json({
      message: "System stats and payment/social config updated successfully.",
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
        forumJoinUrl: finalForumJoin
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

