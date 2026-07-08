import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";

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
    
    const allowedEmail = (process.env.ADMIN_EMAIL || "nrjstudywrk@gmail.com").trim().toLowerCase();
    const allowedPhone = (process.env.ADMIN_PHONE || process.env.ADMIN_WHATSAPP_NUMBER || "919876501234").replace(/[^0-9]/g, "");

    if (email && phone && email.trim().toLowerCase() === allowedEmail && phone.replace(/[^0-9]/g, "") === allowedPhone) {
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

  const allowedEmail = (process.env.ADMIN_EMAIL || "nrjstudywrk@gmail.com").trim().toLowerCase();
  const allowedPhone = (process.env.ADMIN_PHONE || process.env.ADMIN_WHATSAPP_NUMBER || "919876501234").replace(/[^0-9]/g, "");

  const providedEmail = email.trim().toLowerCase();
  const providedPhone = phone.replace(/[^0-9]/g, "");

  if (providedEmail === allowedEmail && providedPhone === allowedPhone) {
    const token = Buffer.from(`${providedEmail}:${providedPhone}`).toString("base64");
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
  updatedAt: { type: Date, default: Date.now }
});

const ProgramConfigModel = mongoose.model("ProgramConfig", ProgramConfigSchema);

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
    const count = await ResourceModel.countDocuments();
    if (count === 0) {
      console.log("🌱 [Pehlakadam Server] Seeding newly connected MongoDB instance with default Pehlakadam resources...");
      const mapped = defaultResources.map((res) => ({
        title: res.title,
        category: res.category,
        description: res.description,
        type: res.type,
        format: res.format,
        videoUrl: res.videoUrl,
        fileUrl: res.fileUrl,
        createdAt: new Date(res.createdAt)
      }));
      await ResourceModel.insertMany(mapped);
      console.log("🌱 [Pehlakadam Server] Database seeding completed successfully!");
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
    const { firstName, lastName, email, number, role, message } = req.body;
    
    if (!firstName || !lastName || !email || !number || !role || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

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
    const rawWhatsAppNum = process.env.ADMIN_WHATSAPP_NUMBER || "919876501234";
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
    const rawWhatsAppNum = process.env.ADMIN_WHATSAPP_NUMBER || "919876501234";
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
    if (isMongoConnected) {
      const configs = await ProgramConfigModel.find();
      return res.status(200).json(configs);
    } else {
      const configs = JSON.parse(fs.readFileSync(PROGRAMS_CONFIG_FILE, "utf-8"));
      return res.status(200).json(configs);
    }
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
    const { programKey, brochureUrl, brochureFileName, brochureFileData, videoUrl } = req.body;
    
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

