# Pehlakadam — Career Counseling, Psychometric Assessment & LMS Portal

**Pehlakadam** is an enterprise-grade full-stack career guidance, psychometric assessment, and digital learning management (LMS) portal designed to help students (Grades 6–12), college undergraduates, and young professionals navigate academic choices, discover career paths, and master curated skills.

---

## 🌟 Key Features & Capabilities

- **🎓 Unified Student Learning Dashboard (`/dashboard`)**:
  - Centralized learning center tracking enrolled courses, chapters, and video lessons.
  - Interactive video player with chapter selector, completion toggles, and live progress bars.
  - Grade program enrollment history, psychometric assessment test scores, and downloaded resource archives.
  - Instant post-payment redirection deep-linking student phone and email directly into their personalized dashboard.

- **💳 Automated Razorpay Payment Gateway & Instant Whitelisting**:
  - 1-click seamless online checkout supporting Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, and Netbanking.
  - Cryptographic HMAC-SHA256 signature verification with instant automated access whitelisting.
  - Asynchronous webhook receiver (`/api/razorpay/webhook`) handling `payment.captured`, `order.paid`, and `payment.failed`.
  - Manual UPI transaction verification fallback with 12-digit UTR proof submission.

- **🧠 Psychometric & Diagnostic Assessment Suite**:
  - Automated evaluation for DISC Behavioral Analysis, MBTI-Style Personality Matrix, 16PF, and Stream Selector tests.
  - Visual radar charts and bar graphs highlighting strengths and recommended career pathways.
  - Downloadable branded PDF diagnostic evaluation reports.

- **⚡ High-Speed Caching & Data Acceleration**:
  - Multi-tier in-memory caching with ETag validation, HTTP 304 Not Modified status handling, and dynamic Gzip compression delivering sub-2ms API responses.
  - Automated cache invalidation on any administrative update.

- **🛡️ Enterprise Defensive Security Suite**:
  - OWASP defensive headers (CSP, XSS, nosniff, frame protection, referrers, permissions policy).
  - Deep recursive NoSQL operator stripping and XSS payload sanitization.
  - Timing-attack-safe admin authentication and token-bucket IP rate limiters.

- **📱 Single-Device Concurrency Control**:
  - Restricts simultaneous active sessions to 1 device per phone number with automatic background heartbeat verification.
  - Instant remote logout upon duplicate session detection.

- **🎟️ Promo Coupon & Dynamic Pricing Engine**:
  - Percentage and fixed discount codes with minimum order constraints and real-time cart validation.

- **📅 1-on-1 Counseling Scheduler & Lead Management**:
  - Appointment booking with multi-channel notification dispatch (Email, WhatsApp, SMS) and 1-click student whitelisting.

- **🎛️ Admin Governance Control Room (`/admin`)**:
  - 12 comprehensive administrative modules managing leads, courses, payments, whitelisted students, coupons, brochures, and live site settings.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` (or configure in your hosting provider's dashboard):
```bash
cp .env.example .env
```
Key configuration keys include `MONGODB_URI`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PHONE`.

### 3. Run Development Server
```bash
npm run dev
```
The server boots on `http://localhost:3000` with Express backend API routes and Vite frontend middleware.

### 4. Build for Production
```bash
npm run build
```
Compiles client static assets into `dist/` and bundles the TypeScript backend into `dist/server.cjs` via `esbuild`.

### 5. Start Production Server
```bash
npm start
```

---

## 🗺️ Key Client Routes

| Route | Description |
| :--- | :--- |
| `/` | Landing page featuring counseling booking, diagnostic intro, stats, and course highlights. |
| `/dashboard` | Unified Student Learning Dashboard (aliases: `/student-dashboard`, `/student/dashboard`, `/my-learning`). |
| `/courses` | LMS Course catalog, syllabus breakdowns, and video lesson player. |
| `/diagnostics` | Interactive psychometric assessments and career guidance evaluation tests. |
| `/resources` | Career guidance handbooks, PDF worksheets, and briefing video archive. |
| `/programs/*` | Grade-specific program overviews (Class 8–10, Class 11–12, College, etc.). |
| `/contact` | 1-on-1 counseling appointment scheduler and advisor contact form. |
| `/admin` | Secure Admin Governance Control Room (whitelist, payments, LMS courses, coupons). |

---

## 📖 Complete Engineering Documentation

For complete architectural details, database schemas, full REST API endpoints reference, and deployment guidelines, refer to:
👉 **[DEVELOPMENT_DOCUMENTATION.md](./DEVELOPMENT_DOCUMENTATION.md)**
