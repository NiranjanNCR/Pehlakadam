# PEHLAKADAM — Comprehensive Full-Stack Portal Documentation & Reference Manual

This document is the definitive engineering reference manual covering the system architecture, dual-persistence data layers, security controls, API interfaces, admin governance suites, and user experience workflows of the **Pehlakadam** platform.

---

## Table of Contents
1. [System Overview & Architecture](#1-system-overview--architecture)
2. [Enterprise Security & Defensive Hardening Suite](#2-enterprise-security--defensive-hardening-suite)
3. [High-Speed Data Delivery & In-Memory Caching Engine](#3-high-speed-data-delivery--in-memory-caching-engine)
4. [Session Concurrency & Single-Device Control](#4-session-concurrency--single-device-control)
5. [Payment & Checkout Architecture & Post-Payment Flows](#5-payment--checkout-architecture--post-payment-flows)
6. [LMS Video & Interactive Curriculum Portal](#6-lms-video--interactive-curriculum-portal)
7. [Unified Student Learning Dashboard](#7-unified-student-learning-dashboard)
8. [Client-Side Routing & Fallback Protection Architecture](#8-client-side-routing--fallback-protection-architecture)
9. [Psychometric & Diagnostic Assessment Suite](#9-psychometric--diagnostic-assessment-suite)
10. [Promo Coupon & Dynamic Pricing Engine](#10-promo-coupon--dynamic-pricing-engine)
11. [1-on-1 Counseling & Lead Management System](#11-1-on-1-counseling--lead-management-system)
12. [Admin Governance Control Room](#12-admin-governance-control-room)
13. [Complete REST API Reference](#13-complete-rest-api-reference)
14. [Database Schemas & Data Models](#14-database-schemas--data-models)
15. [PDF Handbook & Rendering System](#15-pdf-handbook--rendering-system)
16. [SEO & Head Hydration Architecture](#16-seo--head-hydration-architecture)
17. [Deployment, Cold-Start Prevention & Cloud Guide](#17-deployment-cold-start-prevention--cloud-guide)

---

## 1. System Overview & Architecture

Pehlakadam is a high-performance, full-stack educational and career counseling ecosystem tailored for students (Grades 6–12), undergraduates, postgraduates, and career switchers.

### Technology Stack
*   **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Motion (`motion/react`).
*   **Backend Server**: Express.js (Node.js runtime with `tsx` development runner and `esbuild` production bundling to `dist/server.cjs`).
*   **Performance & Security**: Gzip Compression, In-Memory Multi-Tier Cache with ETag validation, Token-Bucket Rate Limiters, OWASP Defensive Security Headers, Recursive XSS & NoSQL sanitization.
*   **Persistence Layer**: Dual-Persistence Architecture:
    *   **Primary Cloud Database**: MongoDB via Mongoose ORM with non-blocking 2.5s timeout boundaries.
    *   **Resilient JSON Flat-File Fallback**: Synchronized JSON storage files (`system_stats.json`, `courses.json`, `course_progress.json`, `coupons.json`, `authorized_numbers.json`, `submissions.json`, `diagnostic_tests.json`, `diagnostic_submissions.json`, `resources.json`, `resource_history.json`, `testimonials.json`, `updates.json`, `programs_config.json`).
*   **Networking & Port Routing**: The dev and production servers strictly bind to `0.0.0.0:3000` behind the reverse-proxy environment.

---

## 2. Enterprise Security & Defensive Hardening Suite

The application incorporates defense-in-depth security mechanisms designed to mitigate OWASP Top 10 vulnerabilities:

### 1. HTTP Defensive Security Headers
Every outgoing HTTP response is configured with protective browser headers:
*   `Content-Security-Policy (CSP)`: Strict source restrictions allowing verified external media (YouTube embeds, font CDNs, and API services) while preventing inline script injection.
*   `X-Content-Type-Options: nosniff`: Prevents MIME-type sniffing exploits.
*   `X-Frame-Options: SAMEORIGIN`: Protects against clickjacking attacks.
*   `X-XSS-Protection: 1; mode=block`: Activates active browser XSS filters.
*   `Referrer-Policy: strict-origin-when-cross-origin`: Restricts sensitive referrer leakage.
*   `Permissions-Policy`: Restricts unauthorized client hardware access (`camera=(), microphone=(), geolocation=()`).
*   `X-Download-Options: noopen`: Prevents direct execution of downloaded HTML/scripts in older clients.
*   `X-Powered-By`: Stripped to prevent server fingerprinting.

### 2. Multi-Tier Token-Bucket Rate Limiting
Granular in-memory rate limiting shields server endpoints against DoS, brute-force, and spam attacks:
*   **Global Limiter**: Caps general IP activity to 500 requests / minute.
*   **Authentication Limiter**: Restricts admin login (`/api/admin/login`) to 20 attempts per 5 minutes with automatic `Retry-After` calculation.
*   **Lead & Submission Limiter**: Caps consultation inquiries and checkout submissions to 40 attempts per 5 minutes.
*   **Automatic Memory Pruning**: Stale IP entries are garbage-collected every 60 seconds to maintain minimal RAM usage.

### 3. Deep Recursive Input Sanitization
*   All incoming payloads (`req.body` and `req.query`) are recursively inspected.
*   **NoSQL Injection Prevention**: Strips dangerous MongoDB operator keys starting with `$` or containing `.` delimiters.
*   **Cross-Site Scripting (XSS) Stripping**: Strips embedded `<script>` blocks, `javascript:` pseudoprotocols, and malicious DOM `on*` event attributes.

### 4. Admin Timing-Attack & Access Verification
*   Constant-time credential comparisons protect the administrative panel against side-channel analysis.
*   Whitelisted emails and phone numbers are verified on every protected API endpoint (`verifyAdmin` middleware).

---

## 3. High-Speed Data Delivery & In-Memory Caching Engine

To ensure sub-millisecond response times (<2ms) and minimize backend query overhead:

### 1. Multi-Tier In-Memory Caching (`apiCache`)
*   Frequently requested public datasets (`/api/programs-config`, `/api/diagnostic-tests`, `/api/resources`, `/api/courses`, `/api/coupons`, `/api/system-stats`, `/api/policies`) are cached in an optimized in-memory store.
*   **Instant Cache Invalidation**: Any administrator mutation (`POST`, `PUT`, `DELETE`) automatically invalidates matching cache keys, guaranteeing that students always receive up-to-date data without manual cache flushing.

### 2. Large File Payload Optimization & Base64 On-Demand Stripping
*   **The Problem**: Local JSON fallback storage files (`resources.json` at ~28MB and `programs_config.json` at ~18MB) contain embedded Base64 PDF files and deep metadata. Parsing and transferring these massive files on every request caused noticeable delays when loading prices, masterclass videos, and dashboard curriculum.
*   **The Solution**:
    *   **Lightweight Feeds (`fileData` Stripping)**: List endpoints (`/api/resources`, `/api/student/dashboard-data`, and `/api/courses`) automatically strip heavy Base64 `fileData` strings from list responses, returning only resource metadata (`id`, `title`, `category`, `type`, `url`, `createdAt`).
    *   **On-Demand Asset Fetching**: When a student clicks to open or read a specific PDF handbook, the application fetches the full content on-demand via `/api/resources/:id` or `/api/resources/download/:id`.
    *   **Drastic Latency Reduction**: Reduces `/api/student/dashboard-data` and `/api/resources` payload sizes by **>90%** (from 28MB+ down to <150KB), delivering instant sub-50ms responses for course videos and prices even under local fallback conditions.

### 3. HTTP Conditional Caching & ETags
*   Endpoints generate MD5-hashed ETags for each cached payload.
*   If the client sends an `If-None-Match` header matching the current ETag, the server returns an ultra-fast `304 Not Modified` status code with zero payload body transfer.
*   Configured with modern `Cache-Control: public, max-age=60, stale-while-revalidate=120` directives.

### 4. Dynamic Gzip Payload Compression
*   Built-in Gzip/Deflate compression automatically compresses all JSON payloads, reducing bandwidth usage by up to 90%.

### 5. Non-Blocking MongoDB Resilience (`safeMongoQuery`)
*   All database interactions run through an isolated 2.5-second timeout wrapper.
*   If MongoDB is unreachable or experiencing network latency, the server instantly serves data from local JSON flat-files without stalling user requests or freezing the UI.

---

## 4. Session Concurrency & Single-Device Control

### Single-Device Parallel Access Concurrency Control
To prevent unauthorized account sharing across multiple users or pirate devices:
*   **Active Session Enforcement**: Restricts access to **1 active device / browser session** per registered phone number for all paid LMS courses (`/courses`), diagnostic tools, and premium resources (`/resources`).
*   **Token Allocation**: Upon entering a phone number, the server issues a session token: `sess_{phone}_{timestamp}_{rand}`.
*   **Session Overwrite on New Login**: When a user logs in on Device B, Device B is granted the current active session ID, overriding the record in server memory (`activeDeviceSessions`).
*   **Heartbeat Verification**: Active clients trigger a non-blocking background heartbeat every 6 seconds to `POST /api/verify-session`.
*   **Instant Remote Logout**: If Device A's heartbeat detects a mismatched session ID, it immediately revokes local credentials (`pehlakadam_student_phone`, `pehlakadam_premium_phone`), locks video/course content, and shows a session conflict alert:
    > *"⚠️ Session Conflict: Account active on another device. Simultaneous access on multiple devices is restricted to 1 active device at a time."*

---

## 5. Payment & Checkout Architecture & Post-Payment Flows

Pehlakadam features a modern, fully automated **Razorpay Payment Gateway** integration alongside resilient manual UPI payment verification for frictionless, instant course and program enrollment across all devices.

```
[Student Clicks "Enroll Now" or "Pay Online"]
                 │
                 ▼
[Modal Displays Program / Course Breakdown & Dynamic Price Calculation]
                 │
                 ▼
[Student Enters Promo Coupon (Optional)] ──► [Server Validates Code & Discounts Price]
                 │
                 ▼
[Student Clicks "Pay Online (Instant 1-Click Access)"]
                 │
                 ▼
[Frontend Requests Order: POST /api/razorpay/create-order]
                 │
                 ▼
[Backend Initializes Razorpay Instance with Secret Key & Generates Order ID]
                 │
                 ▼
[Razorpay Standard Checkout Modal Opens (Google Pay, PhonePe, Paytm, UPI, Cards, Netbanking)]
                 │
                 ▼
[Student Completes Payment in Razorpay Gateway]
                 │
                 ▼
[Frontend Captures Razorpay Response (Payment ID, Order ID, Signature)]
                 │
                 ▼
[Backend Verification: POST /api/razorpay/verify-payment]
                 │
                 ▼
[Cryptographic HMAC-SHA256 Signature Verification]
                 │
  ┌──────────────┴───────────────────────────────────────────────────────┐
  ▼                                                                      ▼
[✅ Valid Signature]                                            [🚨 Signature Mismatch]
  │                                                                      │
  ├─► Auto-whitelists Student Phone Number in Authorized Database        └─► Flags Fraud & Blocks Access
  ├─► Enrolls Student in Course (if Course Checkout)
  ├─► Logs Payment Record with Status "approved"
  ├─► Sends Instant WhatsApp Activation Receipt
  └─► Auto-redirects Student to LMS Dashboard with Whitelisted Access
```

### Post-Payment Redirection & Direct Learning Entry
Upon completing payment (whether via 1-Click Razorpay or manual UPI proof submission), the application prevents drop-offs and guarantees instant access:
1. **Deterministic Client Routing**: Rather than issuing an unauthenticated hard reload (`window.location.href`), `PaymentModal` and `CourseCheckoutModal` utilize React Router's `useNavigate` hook.
2. **Synchronous Credential Persistence**: Before initiating `navigate()`, both modal components synchronously write credentials to `localStorage` (`pehlakadam_student_phone`, `pehlakadam_premium_phone`, and `pehlakadam_student_email`). This prevents any loss of state if the page is refreshed or if URL parameters are stripped by browser extensions.
3. **Credential Forwarding**: The redirect carries the student's cleaned phone number and registered email directly in the URL query string:
   ```typescript
   navigate(`/dashboard?phone=${encodeURIComponent(cleanPhone)}&email=${encodeURIComponent(cleanEmail)}`);
   ```
4. **Reactive Dashboard Hydration**: The Student Learning Dashboard (`/dashboard`) listens to `searchParams` reactively. When navigation occurs from payment or checkout, it instantly triggers `fetchDashboard` without requiring a manual browser refresh.
5. **Defensive White-Screen Immunization**:
   * **Root ErrorBoundary**: A robust `ErrorBoundary` component wraps the entire route tree in `App.tsx`, catching any unexpected runtime exceptions and providing interactive recovery actions (*"Sync / Refresh Data"*, *"Re-authenticate & Open Dashboard"*, and *"Return to Home"*).
   * **Null-Safe Data Access**: All dynamic fields in `StudentDashboard`—including student profile badges, test keys, course progress records, and enrollment timestamps—use defensive null checks (`formatDateSafe`, `formatDateTimeSafe`, and optional chaining).
6. **Dual Post-Payment Action CTAs**:
   * **"Go to Student Dashboard" Button**: Launches directly into the interactive LMS courses, video lessons, and worksheets.
   * **"WhatsApp Confirm" Button**: Generates a pre-filled, encrypted WhatsApp message link to the designated advisor with payment and transaction verification details.

### Razorpay Webhook Event Synchronizer
The platform includes an automated Webhook receiver at `/api/razorpay/webhook`:
* **HMAC-SHA256 Webhook Verification**: Validates `x-razorpay-signature` against the configured `RAZORPAY_WEBHOOK_SECRET`.
* **Handled Events**:
  * `payment.captured` & `order.paid`: Automatically whitelists the student's mobile number, approves enrollment, and updates payment state even if the student closes their browser before returning.
  * `payment.failed`: Logs transaction errors for customer support visibility.
  * `refund.created` & `refund.processed`: Tracks refund lifecycle.

### Key Workflow Highlights
1. **Zero-Friction Checkout**: Eliminates manual UTR entry, screenshots, and manual admin whitelisting bottlenecks.
2. **Instant Automated Whitelisting**: Students receive immediate access to their courses, video lessons, and diagnostic reports within milliseconds of payment completion.
3. **Admin Key Configuration**: Razorpay credentials (`Key ID`, `Key Secret`, `Webhook Secret`, and Gateway Toggle) can be configured dynamically from the Admin Panel (`/admin -> System & Site Config`) or via environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`).
4. **Dynamic Promo Discounts**: Promo coupons apply seamlessly to the Razorpay order amount before order creation.

---

## 6. LMS Video & Interactive Curriculum Portal

Accessible via `/courses` with full tiered authorization:
*   **Curriculum Structure**: Courses contain structured Chapters, each composed of Lessons with duration, YouTube/Vimeo/MP4 video embeds, comprehensive lesson notes, and downloadable PDF worksheets.
*   **Standardized Program & Course Categories (`SYSTEM_LMS_CATEGORIES`)**:
    The system standardizes course and program categories across the entire application:
    1. `Primary Kudos` (Class 1–5 foundational learning & aptitude)
    2. `6-8 Grade Student` (Middle school career foundations & cognitive exploration)
    3. `8-10 Grade Student` (High school stream selection roadmap & psychometric readiness)
    4. `11-12 Grade Student` (Higher secondary competitive exam prep & career launch)
    5. `UG/Graduate/PG` (Undergraduate, postgraduate, and early career acceleration)
    6. `Generalist to Specialist` (Career transition, lateral mobility, and specialization)
    7. Additional specialized tracks: `Foundation & Aptitude`, `Stream Selection`, `Career Discovery`, `Skill Development`, `Exam Preparation`, `College Admissions`, `Professional Skills`.
*   **Category-Specific Tiered Access Control Matrix**:
    Access control is strictly evaluated per-category and per-tier, ensuring students access only the courses corresponding to their purchased program category:
    *   **Tier Hierarchy**: `basic` (Rank 1) < `advance` (Rank 2) < `pro` (Rank 3).
    *   **Rule 1 — Basic Enrollment in Category**: If a student is enrolled in a program at the **Basic** tier (e.g. *6-8 Grade Student (Basic)*), they can **only** access **Basic** tier courses within that exact category. They cannot access Advance or Pro courses in their category, nor can they access courses from other categories (e.g. *8-10 Grade* or *UG/Graduate/PG*).
    *   **Rule 2 — Advance Enrollment in Category**: If a student is enrolled at the **Advance** tier in a category (e.g. *8-10 Grade Student (Advance)*), they unlock both **Basic + Advance** courses in that specific category. They do not see Advance courses of other categories, nor Pro courses.
    *   **Rule 3 — Pro Enrollment in Category**: If a student is enrolled at the **Pro** tier, they unlock **Basic + Advance + Pro** courses in their own category, with global cross-category privileges enabled for premium institutional access.
    *   **Rule 4 — Direct Course Enrollment**: If a student purchases/enrolls directly in an individual course by Course ID (via `/api/courses/enroll`), they are granted direct access to that course regardless of program category.
*   **Interactive Player**: Video player equipped with chapter navigation dropdowns, complete/incomplete lesson toggles, and PDF worksheet viewer.
*   **Progress Tracking**: Tracks student lesson completion percentage with local and server synchronization (`/api/courses/progress`).

---

## 7. Unified Student Learning Dashboard

Accessible via `/dashboard` (with route aliases `/student-dashboard`, `/student/dashboard`, and `/my-learning`), the Student Learning Dashboard serves as the central student cockpit.

### Authentication & Credential Detection
The dashboard supports frictionless authentication:
1. **URL Parameter Auto-Auth**: If accessed with `?phone=9876543210&email=student@example.com` (such as after checkout), it immediately verifies whitelist access and loads enrolled modules without a login prompt.
2. **Local Session Recovery**: Reads cached student credentials from `localStorage` (`pehlakadam_student_phone`, `pehlakadam_premium_phone`, `pehlakadam_student_email`).
3. **Manual Phone / Email Login**: If unauthenticated, provides a clean single-input login allowing students to look up their enrolled records using their registered mobile number.
4. **Server-Side Access Filtering (`/api/student/dashboard-data`)**:
   The backend `/api/student/dashboard-data` endpoint evaluates `canUserAccessCourse` using the student's authorized tier, enrolled programs list, and enrolled course IDs. It returns strictly the filtered list of permitted courses according to category-specific tiered boundaries.
    *   Tracks grade-level program enrollments (Class 8–10, Class 11–12, College/UG, Professional).
    *   Displays program tier badges (**Basic**, **Advance**, **Pro**) and counselor access status.
*   **3. Diagnostic Assessment Reports (`tab=diagnostics`)**:
    *   Archive of all completed psychometric evaluations (DISC, MBTI, 16PF, Stream Selector).
    *   Summary of cognitive archetypes, behavioral strengths, and recommended career paths.
    *   Direct link to download or view comprehensive PDF assessment reports.
*   **4. Resource History (`tab=resources`)**:
    *   Audit log of all accessed career handbooks, downloadable PDF guides, and briefing materials.

---

## 8. Client-Side Routing & Fallback Protection Architecture

Pehlakadam implements client-side single-page application (SPA) routing powered by `react-router-dom`:

| Route Path | Associated Component | Description & Access Permissions |
| :--- | :--- | :--- |
| `/` | `Home` | Public landing page featuring hero lead capture, trust metrics, and program previews. |
| `/dashboard` | `StudentDashboard` | Primary unified Student Learning Dashboard. |
| `/student-dashboard` | `StudentDashboard` | Route alias for student dashboard. |
| `/student/dashboard` | `StudentDashboard` | Route alias for post-payment redirects and LMS deep-links. |
| `/student/*` | `StudentDashboard` | Sub-path wildcard alias for student portal. |
| `/my-learning` | `StudentDashboard` | Student bookmark alias. |
| `/courses` | `Courses` | LMS course catalog, curriculum outline, and standalone lesson player. |
| `/diagnostics` | `Diagnostics` | Interactive psychometric evaluation and career aptitude assessment suite. |
| `/diagnostic` | `Diagnostics` | Route alias for diagnostic assessments. |
| `/resources` | `Resources` | Downloadable PDF handbooks, curriculum syllabi, and briefing videos. |
| `/programs/*` | `Programs` | Dynamic grade-specific program pages (e.g. `/programs/class-8-10`). |
| `/contact` | `Contact` | 1-on-1 counseling appointment scheduler and advisor contact form. |
| `/payment` | `Payment` | Standalone payment verification and checkout page. |
| `/checkout` | `Payment` | Route alias for standalone checkout. |
| `/legal` | `TermsAndPolicies` | Terms of service, privacy policy, refund policy, and disclosures. |
| `/admin` | `AdminSubmissions` | Password & phone whitelisted administrative control room. |
| `/resources/admin` | `AdminSubmissions` | Route alias for admin portal. |
| `*` | `<Navigate to="/" replace />` | **Global Fallback Route**: Catches all unregistered or malformed paths and redirects safely to `/` to eliminate blank/white screen errors. |

---

## 9. Psychometric & Diagnostic Assessment Suite

Accessible via `/diagnostics` or directly inside the Student Dashboard:
*   **Assessment Frameworks**:
    *   **DISC Behavioral Analysis**: Evaluates Dominance, Influence, Steadiness, and Conscientiousness.
    *   **MBTI-Style Personality Matrix**: Classifies 16 distinct cognitive archetypes.
    *   **16PF (Personality Factors)**: Assesses career readiness and behavioral drivers.
    *   **Stream & Career Selector**: Guides Class 10/12 students toward Science, Commerce, Arts, or Vocational streams.
*   **Instant Result Analysis**:
    *   Automated multi-trait scoring algorithms.
    *   Visual radar & bar graphs highlighting strengths and development areas.
    *   Actionable career recommendations and recommended LMS course modules.
    *   One-click downloadable PDF diagnostic report.

---

## 10. Promo Coupon & Dynamic Pricing Engine

*   **Coupon Types**: Percentage Discount (e.g., 20% off) or Fixed Amount (e.g., ₹100 off).
*   **Cart Requirements**: Configurable minimum order amount (`minOrderAmount`) to prevent discount abuse.
*   **Real-Time Validation**: Evaluated server-side via `POST /api/coupons/validate`.
*   **Admin Controls**: Add, edit, toggle active/inactive status, or delete coupons directly inside the **Coupon Manager** tab.

---

## 11. 1-on-1 Counseling & Lead Management System

*   **Lead Capture**: Captures inquiries from the homepage consultation form and program landing pages.
*   **Counseling Scheduler**:
    *   Advisors configure session topic, date, time, meeting link (Google Meet / Zoom), and personalized notes.
    *   Persisted under `PUT /api/submissions/:id/counselling`.
*   **Multi-Channel Notification Dispatcher**:
    *   **Email**: Automated HTML session confirmation.
    *   **WhatsApp**: Pre-formatted direct messaging link with session details.
    *   **SMS**: Instant text message confirmation.
*   **Instant Access Granting**: Advisors can directly whitelist a lead's phone number for Basic, Advance, or Pro tier access without leaving the leads table.

---

## 12. Admin Governance Control Room

The Admin Panel (`/admin`) is a multi-tab administrative workspace:

| Tab Name | Purpose & Functionality |
| :--- | :--- |
| **Consultation Leads** | View leads, schedule counseling sessions, dispatch notifications (Email/WhatsApp/SMS), and grant access. |
| **Payment Proofs** | Review submitted payments with 12-digit UTRs, filter by status, and click **Approve & Whitelist** for instant access. |
| **LMS Courses** | Create and edit courses, add chapters/lessons, embed videos, attach PDF worksheets, and set tier levels. |
| **Diagnostic Tests** | Create, manage, and review psychometric and career aptitude tests, question banks, and student submissions. |
| **Resources** | Upload or update downloadable PDF handbooks, guides, and briefing videos. |
| **Coupon Manager** | Manage discount codes, discount rates (% or ₹), minimum order thresholds, and active statuses. |
| **Paid Access Manager** | Directly view, add, modify, or revoke whitelisted phone numbers and their assigned access tier (Basic/Advance/Pro). |
| **Programs Config** | Configure grade-specific brochures, syllabus summaries, and video highlight links. |
| **Home Page Stats (Control Room)** | Update public Trust Stats (Students Count, Experts, Success Rate), UPI ID & Merchant Name, Social URLs, and SEO metadata. |
| **Broadcast Manager** | Compose and send batch announcements to students via multi-channel templates. |
| **Tips Subscribers** | View and manage newsletter subscribers registered from the career tips footer funnel. |
| **Success Testimonials** | Curate and publish student reviews, star ratings, and success stories. |

---

## 13. Complete REST API Reference

### System & Health
*   `GET /api/health` — High-availability server health check (used for container probes and external uptime pingers).
*   `GET /api/system-stats` — Fetch dynamic trust numbers, UPI payee info, social URLs, Razorpay public config, and SEO metadata.
*   `POST /api/system-stats` — (Admin) Update system configurations, Razorpay credentials, and metadata.

### Student Learning Dashboard & Profile
*   `GET /api/student/dashboard-data` — Unified student learning center endpoint.
    *   **Query Parameters**: `phone` (string, e.g. `919876543210`), `email` (optional string).
    *   **Response Payload**:
        ```typescript
        {
          authenticated: boolean;
          student: {
            phone: string;
            email?: string;
            name?: string;
            role?: string;
            isWhitelisted: boolean;
            tier: "basic" | "advance" | "pro";
            registeredAt?: string;
          };
          enrolledCourses: Course[];
          enrolledPrograms: EnrolledProgram[];
          diagnosticHistory: DiagnosticRecord[];
          resourceHistory: ResourceHistoryItem[];
          progress: Record<string, number>; // courseId -> completion percentage (0-100)
          completedLessons: Record<string, string[]>; // courseId -> array of completed lesson IDs
        }
        ```

### Authentication & Device Concurrency
*   `POST /api/check-access` — Validate student phone number for resource access.
*   `POST /api/check-premium-access` — Validate student phone number and return active tier level + session ID.
*   `POST /api/verify-session` — Periodic 6-second heartbeat checking for single-device concurrency conflicts.
*   `POST /api/logout-session` — Terminate active device session for a phone number.

### Razorpay Automated Payment Gateway
*   `GET /api/razorpay/config` — Public endpoint providing active state and public Razorpay Key ID.
*   `POST /api/razorpay/create-order` — Create Razorpay order with currency INR, dynamic amount, receipt, and notes.
*   `POST /api/razorpay/verify-payment` — Cryptographically verify HMAC-SHA256 signature, auto-whitelist student, and activate access.
*   `POST /api/razorpay/webhook` — Process incoming Razorpay webhook events (`payment.captured`, `order.paid`, `payment.failed`).

### Courses & LMS
*   `GET /api/courses` — Retrieve list of all published LMS courses and curriculums (cached with ETag).
*   `POST /api/courses` — (Admin) Create a new LMS course.
*   `PUT /api/courses/:id` — (Admin) Update course details, chapters, or lessons.
*   `DELETE /api/courses/:id` — (Admin) Delete an LMS course.
*   `POST /api/courses/enroll` — Submit a course enrollment request with UTR.
*   `GET /api/courses/progress` — Fetch student lesson completion history.
*   `POST /api/courses/progress` — Record completed lesson IDs for a student.

### Programs Configuration
*   `GET /api/programs-config` — Retrieve grade-specific program pricing, brochure URLs, video links, and curriculum summaries (cached with ETag).
*   `PUT /api/programs-config/:id` — (Admin) Update grade program details, brochure URLs, and pricing.

### Payments & Whitelisting
*   `POST /api/payment-submit` — Submit general program payment verification with UTR.
*   `GET /api/payment-proofs` — (Admin) Fetch all payment records.
*   `PUT /api/payment-proofs/:id/status` — (Admin) Update payment record status.
*   `POST /api/payment-proofs/:id/approve` — (Admin) Approve payment and automatically whitelist student phone number.
*   `GET /api/authorized-numbers` — (Admin) Fetch list of all whitelisted numbers and tiers.
*   `POST /api/authorized-numbers` — (Admin) Add or update whitelisted number.
*   `DELETE /api/authorized-numbers/:phone` — (Admin) Remove number from whitelist.

### Coupons
*   `GET /api/coupons` — (Admin) List all coupons.
*   `POST /api/coupons` — (Admin) Create a new coupon.
*   `PUT /api/coupons/:id` — (Admin) Update coupon details or active status.
*   `DELETE /api/coupons/:id` — (Admin) Delete a coupon.
*   `POST /api/coupons/validate` — Validate a promo code against cart value.

### Submissions & Counseling
*   `GET /api/submissions` — (Admin) Fetch all consultation leads.
*   `POST /api/submissions` — Submit a new consultation inquiry from the public portal.
*   `PUT /api/submissions/:id/counselling` — (Admin) Update counseling schedule, topic, notes, and meeting link.
*   `POST /api/submissions/:id/notify` — (Admin) Dispatch counseling notification via Email, WhatsApp, or SMS.

### Diagnostic Tests
*   `GET /api/diagnostics/tests` — Fetch available diagnostic tests.
*   `POST /api/diagnostics/submit` — Submit test answers and compute diagnostic scores.
*   `GET /api/diagnostics/submissions` — (Admin) Fetch test submission records.

### Career Tips & Community
*   `POST /api/career-tips-join` — Subscribe to weekly newsletter and retrieve WhatsApp group links.
*   `GET /api/career-tips-subscribers` — (Admin) Fetch list of all newsletter subscribers.
*   `DELETE /api/career-tips-subscribers/:id` — (Admin) Remove a subscriber.

### Policies & Testimonials
*   `GET /api/policies` — Fetch live Terms of Service, Privacy Policy, and Refund Policy.
*   `POST /api/policies` — (Admin) Update policy content.
*   `GET /api/testimonials` — Retrieve approved student reviews and star ratings.
*   `POST /api/testimonials` — (Admin) Manage published testimonials.

---

## 14. Database Schemas & Data Models

### LMS Course (`Course`)
```typescript
{
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  tier: "basic" | "advance" | "pro";
  category: string;
  originalPrice: number;
  discountPrice: number;
  duration: string;
  level: string;
  published: boolean;
  createdAt: string;
  chapters: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      duration: string;
      videoUrl: string;
      summary: string;
      isFreePreview: boolean;
      attachments: {
        id: string;
        title: string;
        type: "pdf" | "doc" | "link";
        fileUrl: string;
      }[];
    }[];
  }[];
}
```

### Student Dashboard Aggregate (`StudentDashboardData`)
```typescript
{
  authenticated: boolean;
  student: {
    phone: string;
    email?: string;
    name?: string;
    role?: string;
    isWhitelisted: boolean;
    tier: "basic" | "advance" | "pro";
    registeredAt?: string;
  };
  enrolledCourses: Course[];
  enrolledPrograms: {
    id: string;
    programId: string;
    programTitle: string;
    tier: "basic" | "advance" | "pro";
    enrolledAt: string;
    status: "active" | "completed";
  }[];
  diagnosticHistory: {
    id: string;
    testId: string;
    testTitle: string;
    archetype?: string;
    scores: Record<string, number>;
    summary: string;
    completedAt: string;
    reportUrl?: string;
  }[];
  resourceHistory: {
    id: string;
    title: string;
    category: string;
    accessedAt: string;
    downloadUrl: string;
  }[];
  progress: Record<string, number>;
  completedLessons: Record<string, string[]>;
}
```

### Payment Record (`PaymentProof`)
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  role: string;          // Academic track / grade program
  plan: string;          // Selected tier ("Basic" | "Advance" | "Pro")
  amount: number;        // Final paid amount after discounts
  transactionId: string; // 12-digit UTR / UPI reference ID or Razorpay Payment ID
  couponCode?: string;   // Applied coupon (if any)
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
```

### System Configuration (`SystemStats`)
```typescript
{
  studentsCount: string;       // e.g. "10K+"
  expertsCount: string;        // e.g. "15+"
  successRate: string;         // e.g. "99%"
  razorpayEnabled?: boolean;   // Master Razorpay gateway toggle
  razorpayKeyId?: string;      // Public Razorpay Key ID
  razorpayKeySecret?: string;  // Private secret for HMAC verification
  razorpayWebhookSecret?: string; // Webhook secret for event dispatch verification
  upiId: string;               // Payee VPA address
  merchantName: string;        // Merchant registered name
  instagramUrl: string;
  youtubeUrl: string;
  whatsappSupportUrl: string;
  whatsappGroupUrl: string;
  forumJoinUrl: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  updatedAt: string;
}
```

---

## 15. PDF Handbook & Rendering System

*   **Component**: `src/components/PdfViewerModal.tsx`.
*   **High-DPI Rendering**: Automatically applies device pixel ratio scaling (`dpr = Math.max(window.devicePixelRatio, 2)`) with high smoothing quality for crisp display on high-density phone and tablet screens.
*   **Aspect Ratio Protection**: Strict container constraints prevent image or text distortion across varying viewport sizes.
*   **Reading Controls**: Zoom (50%–300%), 90-degree page rotation, full-screen mode, single-page, and continuous scroll views.

---

## 16. SEO & Head Hydration Architecture

1.  **Static Crawlability**: `index.html` defines semantic meta tags, OpenGraph previews, and robots directives.
2.  **Dynamic Client Hydration**: On app startup, the frontend fetches `/api/system-stats` and dynamically updates:
    *   `document.title`
    *   `meta[name="description"]`
    *   `meta[name="keywords"]`
    *   `meta[name="author"]`
    *   `meta[property="og:title"]`
    *   `meta[property="og:description"]`

---

## 17. Deployment, Cold-Start Prevention & Cloud Guide

### Available Scripts
```bash
# Start dev server (tsx server.ts with Vite middleware)
npm run dev

# Run TypeScript linter
npm run lint

# Production build (Vite client build + esbuild backend bundling to dist/server.cjs)
npm run build

# Launch production server
npm start
```

### Environment Variables (`.env.example`)
```env
# MongoDB Connection String (Optional, automatically falls back to JSON flat files if unconfigured)
MONGODB_URI=

# Razorpay Payment Gateway Credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Admin Credentials & WhatsApp Dispatch
ADMIN_EMAIL=
ADMIN_PHONE=
ADMIN_WHATSAPP_NUMBER=

# Container port configuration (fixed to 3000 by proxy layer)
PORT=3000
```

### Production Hosting Best Practices (Render, Cloud Run, VPS)

#### 1. Free-Tier Cold-Start Mitigation
If hosted on platforms that spin down containers after inactivity (such as Render free web services sleeping after 15 minutes):
*   **Automated Uptime Pingers**: Configure a free external monitor (e.g. [UptimeRobot](https://uptimerobot.com) or [Cron-Job.org](https://cron-job.org)) to perform a lightweight HTTP `GET` request every 10 minutes to:
    ```
    https://<your-deployed-app-url>/api/health
    ```
*   Because `/api/health` responds instantly with `{"status":"ok"}`, this keeps the Node.js container warm 24/7 without consuming significant compute cycles.

#### 2. Dual-Persistence Startup Synchronization (`performStartupSync`)
*   When a valid `MONGODB_URI` is provided, the backend attempts to establish a connection with an isolated 2.5-second timeout window.
*   Upon successful connection, `performStartupSync` runs in the background to guarantee data parity between MongoDB collections and local JSON flat files.
*   If MongoDB Atlas is unreachable or latency spikes occur, the application falls back seamlessly to the synchronized JSON files without crashing or returning HTTP 500 errors to students.

#### 3. Asset & Brochure Optimization
*   Avoid storing large multi-megabyte base64-encoded PDF files directly inside JSON configurations.
*   Use Google Drive direct preview links, AWS S3/Cloud Storage URLs, or public static assets for course syllabi, brochures, and worksheets to keep API response payloads under 50KB.
