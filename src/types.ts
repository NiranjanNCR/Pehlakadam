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
