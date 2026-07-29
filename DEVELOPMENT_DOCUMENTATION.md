# PEHLAKADAM — Full-Stack Portal Documentation & Reference Manual

This document serves as an exhaustive reference guide covering the system architecture, active databases, admin workspace configurations, security parameters, and design guidelines of the **Pehlakadam** platform.

---

## 1. System Overview & Architecture

Pehlakadam is a high-performance, full-stack career counseling, skill diagnosis, and personality assessment suite. Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS** on the frontend, and backed by an **Express.js** and **Mongoose (MongoDB)** backend with automated JSON file-system backups.

The architecture guarantees high availability and resilient persistence:
*   **Database Dual-Persistence Pattern**: When MongoDB is connected, the server utilizes real Mongoose models for querying and updates. If the database goes into transient offline states, it falls back to parsing and writing to synchronized JSON flat-files (`system_stats.json`, `career_tips_subscribers.json`, `submissions.json`, `authorized_numbers.json`, etc.) instantly, preventing any disruption to user operations.
*   **Secure API Routing**: Secret-key operations, whitelisting, and credential verifications are proxied strictly server-side through `/api/*` routes.
*   **Hot-Module Ingress Routing**: The application is served on port `3000` via automated reverse-proxying.

---

## 2. Core Dynamic Features & Flowcharts

### 📈 Trust Stats System (Hero Section)
*   **Endpoint**: `GET /api/system-stats` & `POST /api/system-stats` (Admin Secured)
*   **Pathways**:
    1. The Hero section on the homepage fetches trust numbers dynamically (Students Count, Expert Count, and Success Rate).
    2. Admin updates these inside the **Admin Control Room** tab.
    3. The updated metrics persist to MongoDB and `system_stats.json` and refresh in real time.

### 💳 Course Enrollment & Program Selection System
*   **Flow**:
    1. Students click "Enroll Now" or "Unlock Premium" on any course card across the platform.
    2. The checkout modal opens with a fully interactive program selection dropdown, pre-filling or allowing the user to select their exact grade or track ("Primary Kudos", "6-8 Grade", "8-10 Grade", "11-12 Grade", "UG/Graduate/PG", "Generalist to Specialist").
    3. The platform dynamically queries `GET /api/system-stats` to retrieve the current payee account details (**UPI Address** and **Merchant Registered Name**).
    4. A dynamic UPI payload string is generated: `upi://pay?pa={upiId}&pn={merchantName}&am={price}&cu=INR&tn={planName}`.
    5. A scannable custom QR code is rendered instantly using this payload alongside deep-linking buttons for GPay, PhonePe, and Paytm.
    6. Students upload their transaction screenshot and submit proof.
    7. Admin verifies the transaction under **Payment Proofs** and clicks **Approve & Whitelist** to grant immediate access.

### 🔑 Leads Manager - Direct Paid Section Whitelisting
*   **Flow**:
    1. Admins reviewing registered leads in the **Consultation Leads** tab can see each candidate's Paid Access Status.
    2. Admins can click **"Add to Paid Section"** directly on any lead card to instantly authorize their mobile number for full paid resource access on `/resources` without navigating away.
    3. The system immediately registers the phone number in `authorized_numbers.json` and MongoDB, with a **"Revoke Access"** option available at any time.

### 📅 1-on-1 Counseling Scheduler & Multi-Channel Dispatch
*   **Flow**:
    1. Inside the **Consultation Leads** manager, advisors can click **"Schedule & Notify Counseling"** for any candidate.
    2. A rich modal opens allowing the advisor to set the session topic, scheduled date, time, online joining link (Google Meet/Zoom), and personalized advisor notes.
    3. The schedule is saved server-side under `PUT /api/submissions/:id/counselling`.
    4. Admins can dispatch notifications with 1-click via:
        *   **Email**: Professional HTML formatted invitation delivered via SMTP mailer.
        *   **WhatsApp**: Generates formatted session link and opens direct outreach thread.
        *   **SMS**: Dispatches instant text message confirmation.

### ✉️ Weekly Career Tips & Community Conversion Funnel
*   **Active Funnel**:
    1. Visitors enter their Email or Mobile Number in the Newsletter section of the footer.
    2. A secure request is dispatched to `POST /api/career-tips-join`.
    3. The details are safely persisted in MongoDB under `CareerTipSubscriber` (or `career_tips_subscribers.json` fallback).
    4. Upon successful submission, the system fetches the Admin-specified **WhatsApp Group Link** and **Alternative Forum Link** in the response.
    5. The UI dynamically morphs to present premium **"Join Official WhatsApp Group"** and **"Join Career Forum"** buttons instantly.

---

## 3. Database Schemas

### 📊 System Stats & Config Schema (`SystemStatsModel`)
```typescript
{
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
}
```

### 📋 Candidate Lead Submission Schema (`SubmissionModel`)
```typescript
{
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
}
```

---

## 4. Admin Panel Layout

The Admin panel is structured as an elegant, multi-tab console containing:
1.  **Consultation Leads**: View lead profiles, schedule 1-on-1 counseling sessions, dispatch notifications (Email, WhatsApp, SMS), and directly grant or revoke Paid Section Access with 1-click.
2.  **Payment Proofs**: Interactive verification table displaying proof screenshot attachments, transaction codes, and the instant **Approve & Whitelist** button.
3.  **Resources**: Add new PDF Handbooks or briefing videos to the static resource library.
4.  **Broadcast Manager**: Dispatch bulk communications.
5.  **Paid Access Manager**: View and manage manually whitelisted premium phone numbers.
6.  **Programs Config**: Customize brochures and counseling video highlights for all grade levels.
7.  **Home Page Stats (Control Room)**:
    *   Modify Students Count, Experts Count, and Success Rate metrics.
    *   Set dynamic **UPI Address** and **Merchant Name** configurations.
    *   Update social links (**Instagram**, **YouTube**, and **WhatsApp Support**).
    *   Configure dynamic **Weekly WhatsApp Group Invite Links** and **Forum Join Links**.
    *   **SEO Metadata Configuration**: Control Global Page Titles, Meta Descriptions, Focus Keywords, and Meta Author attributes.
8.  **Tips Subscribers**: Live database tracker showing all newsletter subscribers with contact details and removal controls.
9.  **Success Testimonials**: Manage featured student reviews and ratings.

---

## 5. Global Search Engine Optimization (SEO) Architecture

Pehlakadam implements a dynamic SEO injection system:
*   **Static Meta Tags**: `/index.html` contains pre-rendered semantic meta tags for search engine crawling.
*   **Dynamic Head Hydration**: On client startup, the app fetches `GET /api/system-stats` and dynamically updates `document.title` and meta tags for description, focus keywords, author, and Open Graph previews (`og:title`, `og:description`).

---

## 6. Responsiveness & Styling Reference

*   **Fluid Layouts**: Tailwind configurations with `w-full max-w-7xl mx-auto px-6` prevent ultra-wide stretching.
*   **Touch Targets**: Input buttons and links maintain touch target sizes (`min-h-[44px]`) for mobile accessibility.
*   **Card Containers**: Cards utilize clean, high-contrast borders (`border border-zinc-200 shadow-sm hover:shadow-md transition-all rounded-3xl`).
*   **Theme Continuity**: Dark and light elements use accessible, high-contrast color palettes (`emerald-600`, `zinc-900`, `zinc-950`).

