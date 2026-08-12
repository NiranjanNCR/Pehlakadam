# PEHLAKADAM — Full-Stack Portal Documentation & Reference Manual

This document serves as an exhaustive reference guide covering the system architecture, active databases, admin workspace configurations, security parameters, and design guidelines of the **Pehlakadam** platform.

---

## 1. System Overview & Architecture

Pehlakadam is a high-performance, full-stack career counseling, skill diagnosis, and personality assessment suite. Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS** on the frontend, and backed by an **Express.js** and **Mongoose (MongoDB)** backend with automated JSON file-system backups.

The architecture guarantees high availability and resilient persistence:
*   **Database Dual-Persistence Pattern**: When MongoDB is connected, the server utilizes real Mongoose models for querying and updates. If the database goes into transient offline states, it falls back to parsing and writing to synchronized JSON flat-files (`system_stats.json`, `career_tips_subscribers.json`, `submissions.json`, `authorized_numbers.json`, `courses.json`, `coupons.json`, etc.) instantly, preventing any disruption to user operations.
*   **Secure API Routing**: Secret-key operations, whitelisting, and credential verifications are proxied strictly server-side through `/api/*` routes.
*   **Access Tier Hierarchy**: Standardized 3-tier access architecture across all courses and resources:
    1. **Basic Tier**: Free/standard PDFs & basic resource guides.
    2. **Advance Tier**: Interactive LMS Video Courses & Dashboard access.
    3. **Pro Tier**: Full unrestricted access to all Custom Courses, LMS Video Modules, and 1:1 Expert Support.
*   **Hot-Module Ingress Routing**: The application is served on port `3000` via automated reverse-proxying.

---

## 2. Core Dynamic Features & Flowcharts

### 📈 Trust Stats System (Hero Section)
*   **Endpoint**: `GET /api/system-stats` & `POST /api/system-stats` (Admin Secured)
*   **Pathways**:
    1. The Hero section on the homepage fetches trust numbers dynamically (Students Count, Expert Count, and Success Rate).
    2. Admin updates these inside the **Admin Control Room** tab.
    3. The updated metrics persist to MongoDB and `system_stats.json` and refresh in real time.

### 📚 LMS Course Curriculum & Video Player System (`/courses`)
*   **Endpoints**: `GET /api/courses`, `POST /api/courses`, `PUT /api/courses/:id`, `DELETE /api/courses/:id`
*   **Pathways**:
    1. Students browse available courses filtered by Tier requirement (Basic, Advance, Pro) or Academic Category ("Primary Kudos", "6-8 Grade", "8-10 Grade", "11-12 Grade", "UG/Graduate/PG", "Generalist to Specialist").
    2. Students authorize their registered phone number to verify tier access level (`POST /api/check-premium-access`).
    3. Unlocked courses launch an interactive course modal equipped with chapter dropdowns, video embeds, lesson summaries, and downloadable PDF worksheets.
    4. Admins manage chapters, video links, and worksheet attachments directly inside the **LMS Courses** tab in the Admin Panel.

### 🎟️ Promo Coupons & Discount Manager
*   **Endpoints**: `GET /api/coupons`, `POST /api/coupons`, `PUT /api/coupons/:id`, `DELETE /api/coupons/:id`, `POST /api/coupons/validate`
*   **Pathways**:
    1. Admins create custom promo codes (Percentage % or Flat ₹ Off, min cart requirements, active/inactive toggles).
    2. During course enrollment checkout or payment modal interaction, students enter promo codes (e.g., `PEHLA50`, `PRO100`, `FESTIVE100`, `WELCOME20`).
    3. The checkout engine dispatches `POST /api/coupons/validate` to validate the code against MongoDB/JSON stored coupons and static fallback maps.
    4. The server returns the applied discount value, minimum order check status, and computed `finalPrice`.
    5. **UPI Payload Synchronization**: The payment QR code (`upi://pay?pa={upiId}&pn={merchantName}&am={finalPrice}&cu=INR&tn={planName}`) and deep links for GPay, PhonePe, and Paytm instantly recalculate to reflect the discounted amount.

### 🛡️ Single-Device Parallel Access Concurrency Control System
*   **Endpoints**: `POST /api/check-access`, `POST /api/check-premium-access`, `POST /api/verify-session`, `POST /api/logout-session`
*   **Mechanism**:
    1. Enforces strict **1 active device / browser session per phone number** for paid LMS courses (`/courses`) and paid resources (`/resources`).
    2. When a student verifies their phone number on Device A, a unique session ID (`sess_{phone}_{timestamp}_{rand}`) is issued by the server and registered in `activeDeviceSessions`.
    3. If the same phone number is entered or accessed on Device B, Device B is granted access and receives a new session ID, immediately overwriting the active session on the server.
    4. Active clients maintain a background heartbeat interval (`useEffect` every 6 seconds) invoking `POST /api/verify-session`.
    5. When Device A sends its next heartbeat, the server detects that Device A's session ID no longer matches the current active session ID for that phone number.
    6. Device A receives `{ valid: false, sessionConflict: true }`, automatically revokes local session tokens (`pehlakadam_student_phone`, `pehlakadam_premium_phone`), locks paid course/video/PDF content, and displays a prominent warning:
       `"⚠️ Session Conflict: Account active on another device. Simultaneous access on multiple devices is restricted to 1 active device at a time."`

### 💳 Course Enrollment & Program Selection System
*   **Flow**:
    1. Students click "Enroll Now" or "Unlock Premium" on any course card across the platform.
    2. The checkout modal opens with a fully interactive program selection dropdown, pre-filling or allowing the user to select their exact grade or track ("Primary Kudos", "6-8 Grade", "8-10 Grade", "11-12 Grade", "UG/Graduate/PG", "Generalist to Specialist").
    3. Students apply discount coupons (`PRO100`, `PEHLA50`, etc.) to reduce final cart prices, triggering server-side validation.
    4. The platform dynamically queries `GET /api/system-stats` to retrieve the current payee account details (**UPI Address** and **Merchant Registered Name**).
    5. A dynamic UPI payload string is generated: `upi://pay?pa={upiId}&pn={merchantName}&am={finalPrice}&cu=INR&tn={planName}`.
    6. A scannable custom QR code is rendered instantly using this payload alongside deep-linking buttons for GPay, PhonePe, and Paytm.
    7. Students upload their transaction screenshot and submit proof.
    8. Admin verifies the transaction under **Payment Proofs** and clicks **Approve & Whitelist** to grant immediate access.

### 🔑 Leads & Quick Student Tier Authorization Bar
*   **Flow**:
    1. Admins reviewing registered leads or inside the LMS manager can grant instant course access via the **Instant Student Phone Access Authorization** bar.
    2. Admins input student phone numbers and select their access level (**Basic**, **Advance**, **Pro**).
    3. The system immediately registers the phone number in `authorized_numbers.json` and MongoDB with the specified tier, authorizing the student instantly across the `/courses` and `/resources` portals.

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

### 🎓 LMS Course Schema (`Course`)
```typescript
{
  id: string,
  title: string,
  slug: string,
  description: string,
  thumbnailUrl: string,
  tier: "basic" | "advance" | "pro",
  category: string,
  originalPrice: number,
  discountPrice: number,
  duration: string,
  level: string,
  published: boolean,
  createdAt: string,
  chapters: [{
    id: string,
    title: string,
    lessons: [{
      id: string,
      title: string,
      duration: string,
      videoUrl: string,
      summary: string,
      isFreePreview: boolean,
      attachments: [{
        id: string,
        title: string,
        type: "pdf" | "doc" | "link",
        fileUrl: string
      }]
    }]
  }]
}
```

### 🎟️ Promo Coupon Schema (`Coupon`)
```typescript
{
  id: string,
  code: string,
  discountType: "percentage" | "fixed",
  discountValue: number,
  minOrderAmount: number,
  active: boolean,
  createdAt: string
}
```

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
4.  **LMS Courses**: Launch new custom LMS courses, build multi-chapter video curriculums, link downloadable PDF worksheets, and set tier access requirements (Basic, Advance, Pro).
5.  **Coupon Manager**: Create percentage (%) or flat (₹) discount codes with cart limits and live activation toggles.
6.  **Broadcast Manager**: Dispatch bulk communications.
7.  **Paid Access Manager**: View and manage whitelisted student phone numbers with tier assignments (Basic, Advance, Pro).
8.  **Programs Config**: Customize brochures and counseling video highlights for all grade levels.
9.  **Home Page Stats (Control Room)**:
    *   Modify Students Count, Experts Count, and Success Rate metrics.
    *   Set dynamic **UPI Address** and **Merchant Name** configurations.
    *   Update social links (**Instagram**, **YouTube**, and **WhatsApp Support**).
    *   Configure dynamic **Weekly WhatsApp Group Invite Links** and **Forum Join Links**.
    *   **SEO Metadata Configuration**: Control Global Page Titles, Meta Descriptions, Focus Keywords, and Meta Author attributes.
10. **Tips Subscribers**: Live database tracker showing all newsletter subscribers with contact details and removal controls.
11. **Success Testimonials**: Manage featured student reviews and ratings.

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
*   **Theme Continuity & High Contrast Typography**: Dark banners and cards enforce explicit high-contrast text styling (`text-white`, `drop-shadow-sm`, `text-emerald-100`) to guarantee high readability across dark background overlays, cards, and modal headings. Accent headings reset appropriately without forced dark color overrides on dark backgrounds.

