export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  role: string;
  message: string;
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
  createdAt?: string;
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

