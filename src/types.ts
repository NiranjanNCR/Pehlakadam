export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  role: string;
  plan?: string;
  message: string;
}

export interface PaymentSubmission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  role: string;
  plan?: string;
  amount?: number;
  transactionId: string;
  fileName?: string;
  fileType?: string;
  fileData?: string;
  fileUrl?: string;
  status?: "auto_approved" | "pending_manual_review" | "approved" | "revoked";
  autoVerified?: boolean;
  verificationMethod?: "AUTO_UTR_OCR" | "MANUAL_APPROVAL" | "MANUAL_WHITELIST" | string;
  verifiedAt?: string;
  couponCode?: string;
  createdAt: string;
}

export interface Submission extends ContactFormData {
  id: string;
  createdAt: string;
  counsellingDate?: string;
  counsellingTime?: string;
  counsellingTopic?: string;
  joiningLink?: string;
  counsellingNotes?: string;
  notifications?: {
    channel: "email" | "whatsapp" | "sms";
    sentAt: string;
    status: string;
    message?: string;
  }[];
}

export interface Mentor {
  name: string;
  institution: string;
  image: string;
  roleDescription?: string;
}

export interface CoursePlan {
  id: string;
  name: string;
  tagline: string;
  price: string;
  frequency: string;
  features: { name: string; included: boolean }[];
  videoUrl: string;
}

export interface ResourceMaterial {
  id: string;
  title: string;
  category: string;
  description: string;
  type: "pdf" | "video";
  format?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileData?: string;
  isPaid?: boolean;
  createdAt?: string;
}

export interface SessionUpdate {
  id: string;
  message: string;
  scheduledTime?: string;
  notifiedCount: number;
  recipients: { name: string; email: string; number: string }[];
  createdAt: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  stream: string;
  achievement: string;
  story: string;
  fileName?: string;
  fileData?: string;
  createdAt?: string;
}

export type UserTier = "basic" | "advance" | "pro";

export interface AuthorizedUser {
  id: string;
  number: string;
  tier: UserTier;
  studentName?: string;
  email?: string;
  enrolledPrograms?: string[];
  enrolledCourses?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  active: boolean;
  createdAt?: string;
}

export interface LessonAttachment {
  id: string;
  title: string;
  fileUrl?: string;
  fileData?: string;
  type?: "pdf" | "link" | "document";
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  summary: string;
  attachments?: LessonAttachment[];
  isFreePreview?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  tier: UserTier;
  category: string;
  originalPrice: number;
  discountPrice: number;
  duration: string;
  level: string;
  batch?: string;
  chapters: Chapter[];
  published: boolean;
  createdAt?: string;
}

export interface ResourceHistoryItem {
  id: string;
  resourceId?: string;
  title: string;
  category: string;
  type: "pdf" | "video";
  url?: string;
  fileData?: string;
  accessedAt: string;
}

export interface DiagnosticRecord {
  id: string;
  testKey: string;
  testTitle: string;
  dominant?: string;
  score?: any;
  answers?: Record<string, string>;
  createdAt: string;
}

export interface EnrolledProgram {
  key: string;
  title: string;
  path: string;
  enrolledAt: string;
  plan?: string;
  status: "active" | "completed" | "pending";
}

export interface StudentDashboardData {
  student: {
    name: string;
    phone: string;
    email: string;
    role: string;
    tier: UserTier;
    isAuthorized: boolean;
  };
  enrolledCourses: Course[];
  enrolledPrograms: EnrolledProgram[];
  diagnosticHistory: DiagnosticRecord[];
  resourceHistory: ResourceHistoryItem[];
  progress: Record<string, number>; // courseId -> completion percentage
  completedLessons?: Record<string, string[]>; // courseId -> array of completed lesson IDs
}

export interface SystemStats {
  studentsCount: string;
  expertsCount: string;
  successRate: string;
  upiId: string;
  merchantName: string;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappSupportUrl: string;
  whatsappGroupUrl: string;
  forumJoinUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  faviconUrl?: string;
  faviconData?: string;
  termsContent?: string;
  privacyContent?: string;
  refundContent?: string;
  disclaimerContent?: string;
}


