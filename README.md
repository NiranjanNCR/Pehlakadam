# Pehlakadam — Career Counseling, Psychometric Assessment & LMS Portal

**Pehlakadam** is a full-stack career guidance, psychometric assessment, and digital learning portal designed to help students and young professionals navigate academic choices and career paths.

---

## 🌟 Key Features

- **🎓 Interactive LMS Courses**: Multi-chapter video curriculums with lesson summaries, progress tracking, and downloadable PDF worksheets.
- **🧠 Psychometric & Diagnostic Testing**: Automated evaluation for DISC, MBTI, 16PF, and Stream Selector tests with instant score analysis and downloadable PDF reports.
- **⚡ High-Speed Caching & Data Acceleration**: Multi-tier in-memory caching with ETag validation, HTTP 304 Not Modified caching, and dynamic Gzip compression delivering sub-2ms API responses.
- **🛡️ Enterprise Security Suite**: OWASP defensive headers (CSP, XSS, nosniff, frame protection), recursive NoSQL & XSS input sanitization, timing-attack-safe admin authentication, and token-bucket rate limiting.
- **💳 Automated Razorpay Payment Gateway**: 1-click seamless online checkout supporting Google Pay, PhonePe, Paytm, BHIM UPI, Credit/Debit Cards, and Netbanking with instant automated cryptographic whitelisting and real-time webhook event processing (`/api/razorpay/webhook`).
- **📱 Single-Device Concurrency Control**: Restricts simultaneous active sessions to 1 device per phone number with automatic heartbeat verification.
- **🎟️ Promo Coupon Manager**: Percentage and fixed discount codes with minimum order constraints.
- **📅 1-on-1 Counseling Scheduler**: Appointment booking with multi-channel notification dispatch (Email, WhatsApp, SMS).
- **🎛️ Admin Governance Control Room**: 12 dedicated management modules for leads, courses, payments, whitelisting, coupons, diagnostic tests, brochures, and SEO settings.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

### 4. Start Production Server
```bash
npm start
```

---

## 📖 Complete Documentation

For complete architectural details, database schemas, full REST API endpoints reference, and admin governance workflows, please refer to:
👉 **[DEVELOPMENT_DOCUMENTATION.md](./DEVELOPMENT_DOCUMENTATION.md)**

---

## 🔒 Environment Variables

See `.env.example` for environment variable configuration.
```env
# Optional MongoDB URI (Falls back to synchronized JSON flat-files if unconfigured)
MONGODB_URI=
```
