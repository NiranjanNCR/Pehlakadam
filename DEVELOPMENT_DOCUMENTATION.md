# PEHLAKADAM — Full-Stack Portal Documentation & Reference Manual

This document serves as an exhaustive reference guide covering the system architecture, active databases, admin workspace configurations, security parameters, and design guidelines of the **Pehlakadam** platform.

---

## 1. System Overview & Architecture

Pehlakadam is a high-performance, full-stack career counseling, skill diagnosis, and personality assessment suite. Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS** on the frontend, and backed by an **Express.js** and **Mongoose (MongoDB)** backend with automated JSON file-system backups.

The architecture guarantees high availability and resilient persistence:
*   **Database Dual-Persistence Pattern**: When MongoDB is connected, the server utilizes real Mongoose models for querying and updates. If the database goes into transient offline states, it falls back to parsing and writing to synchronized JSON flat-files (`system_stats.json`, `career_tips_subscribers.json`, etc.) instantly, preventing any disruption to user operations.
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

### 💳 Premium Course Whitelist & Dynamic UPI System
*   **Flow**:
    1. Students click "Enroll Now" or "Unlock Premium".
    2. The platform dynamically queries `GET /api/system-stats` to retrieve the current secure payee account (e.g., **UPI Address** and **Merchant Registered Name**).
    3. A dynamic UPI payload string is compiled: `upi://pay?pa={upiId}&pn={merchantName}&am={price}&cu=INR&tn={planName}`.
    4. A scannable custom QR code is rendered instantly using this payload.
    5. After transferring funds, the student uploads their transaction screenshot.
    6. Admin logs into the Admin panel under **Payment Proofs**, verifies the transaction ID and image, and clicks **Approve & Whitelist**.
    7. The student’s mobile number is instantly authorized, giving them immediate entry to all premium courses and scientific evaluations.

### ✉️ Weekly Career Tips & Community Conversion Funnel
*   **Active Funnel**:
    1. Visitors enter their Email or Mobile Number in the Newsletter section of the footer.
    2. A secure request is dispatched to `POST /api/career-tips-join`.
    3. The details are safely persisted in MongoDB under `CareerTipSubscriber` (or `career_tips_subscribers.json` fallback).
    4. Upon successful submission, the system fetches the Admin-specified **WhatsApp Group Link** and **Alternative Forum Link** (e.g. Telegram or custom forum) in the response.
    5. The UI dynamically morphs to present premium **"Join Official WhatsApp Group"** and **"Join Career Forum"** buttons instantly, converting standard subscribers into highly active community members.

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

### ✉️ Career Tips Subscriber Schema (`CareerTipSubscriberModel`)
```typescript
{
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 4. Admin Panel Layout

The Admin panel is structured as an elegant, multi-tab console containing:
1.  **Consultation Leads**: View name, class, contact phone, counseling selections, and date.
2.  **Payment Proofs**: Interactive verification table displaying proof screenshot attachments, transaction codes, and the instant **Approve & Whitelist** button.
3.  **Resources**: Add new PDF Handbooks or briefing videos to the static resource library.
4.  **Broadcast Manager**: Dispatch bulk communications.
5.  **Paid Access Manager**: View manually whitelisted premium phone numbers.
6.  **Programs Config**: Customize brochures and counseling video highlights.
7.  **Home Page Stats (Control Room)**:
    *   Modify Students Count, Experts Count, and Success Rate metrics.
    *   Set dynamic **UPI Address** and **Merchant Name** configurations.
    *   Update social links (**Instagram**, **YouTube**, and **WhatsApp Support**).
    *   Configure dynamic **Weekly WhatsApp Group Invite Links** and **Forum Join Links**.
    *   **World-Class SEO Metadata Configuration**: Control Global Page Titles, Meta Descriptions, Focus Keywords, and Meta Author attributes to drive maximum search visibility.
8.  **Tips Subscribers**: Live database tracker showing all users registered for career newsletters with contact details, sign-up date, and a safe **Remove Subscriber** action.

---

## 5. Global Search Engine Optimization (SEO) Architecture

Pehlakadam implements a professional, dynamic SEO injection system to achieve peak organic search results:
*   **Static Meta Tags**: `/index.html` has pre-rendered optimized semantic meta tags (Title, Description, Keywords, og:title, og:description, og:type) ensuring instant indexability by search engines and spiders.
*   **Dynamic Head Hydration**: On client startup, a secure background thread queries `GET /api/system-stats` and dynamically synchronizes browser attributes:
    *   `document.title` is populated with the custom admin-configured title.
    *   Descriptions, comma-separated search keywords, and author tag values are updated dynamically on the `document.head` meta tree.
    *   Open Graph tags (`og:title`, `og:description`) are updated dynamically to facilitate high click-through sharing previews across social platforms (LinkedIn, Facebook, WhatsApp, etc.).

---

## 6. Responsiveness & Styling Reference

*   **Fluid Layouts**: Integrated elegant Tailwind configurations using `w-full max-w-7xl mx-auto px-6` to prevent ultra-wide viewport stretching.
*   **Touch Targets**: Touch targets for input buttons and links are strictly set to `min-h-[44px]` or robust paddings to provide perfect click/tap actions on mobile interfaces.
*   **Card Containers**: Cards utilize elegant, modern borders (`border border-zinc-200 shadow-sm hover:shadow-md transition-all rounded-3xl`) which transition beautifully on screens of all dimensions.
*   **Theme Continuity**: A professional, high-contrast dark-mode footer and workspace accents are rendered using custom colors (`emerald-600`, `zinc-900`, `zinc-950`).
