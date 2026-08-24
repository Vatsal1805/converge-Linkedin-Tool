# 🚀 Converge LinkedIn Content & Lead Engine (v2.0)

> **Internal B2B Content Engine & Real-Time Lead Intelligence Hub** built for **Converge Digitals**.  
> Designed to automate consistent, high-converting LinkedIn authority, offer, AI showcase, and case study posts, while autonomously discovering grounded B2B sales leads and archiving them live to Google Sheets.

---

## 📸 Overview & Key Capabilities

The **Converge LinkedIn Engine** is an end-to-end full-stack web application that combines **AI copywriting**, **autonomous market research**, **ad transparency intelligence**, **grounded B2B lead discovery**, and **real-time Google Sheets archiving**.

- 🎯 **5-Day Fixed Pillar Rotation:** Mon=Authority, Tue=Offer, Wed=Aradhya AI, Thu=Proof, Fri=Offer/Personal (aligned with LinkedIn's algorithm).
- 🪝 **210-Character Hook Engineering:** Specifically optimizes lines 1–2 (the first ~210 characters) to maximize the `...see more` click-through rate.
- 🛡️ **Strict Anti-AI Slop Filter:** Hard-bans generic AI jargon (`delve`, `game-changer`, `unleash`, `harness`, `secret sauce`) and emoji bullet point spam.
- 📍 **Grounded Google Maps Search Engine:** Uses direct Google Search Grounding (`tools: [{ google_search: {} }]`) to discover 100% real, operational businesses.
- 🛑 **Operational & SMB Size Guard:** Automatically excludes permanently closed businesses and massive 50+ location corporate conglomerates, targeting high-converting boutique owners (5–30 team size).
- 📊 **Real-Time Google Sheets Lead Archiver:** Automatically syncs verified leads to your live Google Sheet with single-quoted phone formatting (`'+971-4-330-0441'`) to eliminate math subtraction errors.
- 🗑️ **7-Day Automatic Database Purge:** Automatically cleans up Supabase storage every Sunday night while Google Sheets preserves all historical leads permanently.
- 💰 **100% Free AI Architecture ($0.00 Cost):** Powered by direct Google Gemini 3.5 Flash and free OpenRouter fallbacks (`google/gemini-2.0-flash-lite-001`, `meta-llama/llama-3.1-8b-instruct:free`).

---

## 🏗️ Repository Directory Architecture

```text
Linkedin-tool/ (Repository Root)
├── client/                     <-- React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         <-- Header, Sidebar, PasswordGate
│   │   ├── pages/              <-- Dashboard, Generator, Calendar, Tracker, CompetitorResearch, GitHubSync
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     <-- Node.js + Express + Supabase Backend
│   ├── config/
│   │   ├── googleSheets.js     <-- Real-time Google Sheets & Webhook Sync Engine
│   │   └── supabase.js         <-- Supabase Postgres Client Initializer
│   ├── db/
│   │   ├── schema.sql          <-- Full PostgreSQL Migration Schema & Enums
│   │   └── seed.sql            <-- 40 Starter Content Ideas Across 4 Pillars
│   ├── routes/                 <-- Generator, Competitors, Calendar, Tracker, GitHub, Crawler
│   ├── cron.js                 <-- Node-Cron Daily Job Engine (8am, 2pm, 8pm & Sunday Purge)
│   ├── index.js                <-- Express Server Entry Point
│   └── package.json
├── PRODUCT_REQUIREMENTS_DOCUMENT.md  <-- Complete v2.0 Production PRD
└── README.md                   <-- System Documentation
```

---

## 🎨 Design System (`design.md`)

The application strictly follows a **Dark, Hacker-Builder Editorial Aesthetic** (similar to Linear and Vercel dashboards):

- **Background Neutral:** `#0A0A0C` (Soft Dark Neutral)
- **Card Fill:** `#121216`
- **Border Token:** `#23232F`
- **Typography:** `Plus Jakarta Sans` (Headings), `Inter` (Body text), `JetBrains Mono` (Badges, metrics, technical tags)

### 🗓️ 4 Content Pillars & Color Tokens:
| Day | Pillar | Accent Color | Hex Code | Strategy & Hook Focus |
|---|---|---|---|---|
| **Mon** | **Authority** | Indigo | `#6366F1` | Industry trends, contrarian takes, soft CTA |
| **Tue** | **Offer** | Emerald | `#10B981` | Web Dev / SEO services, price anchors ($1,500+), 10-day turnaround, direct DM CTA |
| **Wed** | **Aradhya AI** | Violet | `#8B5CF6` | Flagship AI persona showcase, 4K video ads, curiosity CTA |
| **Thu** | **Proof** | Amber | `#F59E0B` | Client case studies (Gelato, Ahuja, Kunj), real metrics (380ms load speed), soft CTA |
| **Fri** | **Offer / Personal** | Emerald | `#10B981` | Service package offer or founder personal profile post |

---

## 🚀 Core Module Breakdown

### 1. Password Gate & Security (`/`)
- Simple, password-protected team access for internal staff (2–5 people).
- Hardcoded hashed check against `TEAM_PASSWORD` environment variable (`converge2026`).

### 2. Content Generator & AI Refinement Chat (`/generator`)
- **Idea Cards:** Rotates 5 cards per pillar tagged by source (`From GitHub`, `Trending News`, `Competitor Ad`, `Client Result`, `Idea Bank`).
- **3 AI Draft Variations:** Generates 3 distinct post angles powered by **OpenRouter** (`Llama 3.3 70B` primary, `DeepSeek V3` / `Gemini 3.5 Flash` fallbacks).
- **210-Character Hook Obsession:**
  - *Authority Hook:* Contrarian industry truth (*"Unpopular opinion: 90% of agency website redesigns fail because..."*).
  - *Offer Hook:* Price anchor + turnaround + pain point (*"Web Dev starting at $1,500. 10-day turnaround. If your site load >3s, you're losing deals."*).
  - *Aradhya Hook:* Transformation curiosity (*"We tested AI video shorts vs $5k studio shoots for 20 hours..."*).
  - *Proof Hook:* Before ➔ Turning Point ➔ Outcome (*"Gelato's website took 3.4 seconds to load..."*).
- **AI Refinement Drawer:** Slide-out chat drawer to refine drafts conversationally in real time.

### 3. Content Calendar (`/calendar`)
- 5-column Monday–Friday weekly grid view.
- Status Badges: `Draft` (gray), `Ready` (amber), `Posted` (emerald).
- Interactive detail modal allowing team members to edit copy, switch selected draft variations, attach post URLs, and mark posts as live.

### 4. Performance Tracker & Analytics (`/tracker`)
- Editable posted metrics table: Impressions, Reactions, Comments, DMs Received, Lead Type (*International*, *Local*, *Unclear*), and Notes.
- **3 Interactive SVG Analytics Charts:**
  1. Average DMs per Content Pillar
  2. Average DMs per Day of Week
  3. 8-Week DM Conversion Trend
- **Automated AI Strategy Engine:** Evaluates performance data and outputs actionable recommendations.

### 5. Grounded Competitor & Lead Intelligence (`/competitors`)
- **Tab 1: Competitor Ad Libraries:** Discovers active agency competitors in US/Dubai/UK markets and extracts active ad hooks from Meta Ad Library, LinkedIn Ad Library, and Google Ads Transparency.
- **Tab 2: Web Dev & Branding Leads:**
  - **Scenario 1 (No Website Target):** Active Google Business profile (3.0-4.8★) with NO website listed.
  - **Scenario 2 (Flawed Website Target):** Verified website with 2–3 concrete pitchable technical flaws (slow mobile load speed >3.5s, non-responsive desktop-first UI, missing WhatsApp CTA).
- **Tab 3: Aradhya AI Video Leads (D2C & Visual Brands):** Target independent D2C skincare, medspas, and luxury real estate running static image Meta ads or lacking 4K video spokespersons.
- **Strict Anti-Hallucination Guard:** Hard bans synthetic domain generation (`www.businessname.com`) and guessed emails (`info@domain.com`). Unlisted emails default to `'Unlisted'`.
- **Operational & SMB Size Filters:** Automatically rejects permanently/temporarily closed businesses and 50+ location corporate conglomerates, focusing exclusively on SMB owners (5–30 team size).

### 6. Real-Time Google Sheets Lead Archiver
- Automatically pushes discovered leads to your live Google Sheet (`17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ`) via **Google Apps Script Webhook** or **Google Service Account**.
- **Universal Phone Sanitizer:** Formats phone numbers as single-quoted plain text (`'+971-4-330-0441'`) to eliminate math subtraction errors (`-410`) in Google Sheets.

### 7. GitHub Org Sync (`/github`)
- Read-only integration using GitHub Personal Access Token (`GITHUB_PAT`).
- Crawls repo metadata: repository names, tech stack arrays (`[Next.js, Tailwind, Supabase, Stripe]`), README summaries, and live demo links.
- 🛡️ **Zero Code Risk:** Never reads, downloads, or exposes proprietary source code or secrets — metadata only!

### 8. Always-On Background Crawlers & 7-Day Purge (`server/cron.js`)
- Runs automatically via `node-cron` **3 times a day** (8:00 AM, 2:00 PM, 8:00 PM) for automated trend, competitor, and lead discovery.
- **Sunday 11:59 PM Auto Purge:** Automatically deletes leads older than 7 days from Supabase (`DELETE FROM leads WHERE created_at < NOW() - INTERVAL '7 days';`) to keep Supabase storage lightweight while Google Sheets preserves historical data permanently.

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js v18+ installed
- Supabase account (Free Tier)
- Google AI Studio Gemini API key (Free Tier)

### 1. Environment Setup
Create a `.env` file inside the `server/` directory:

```env
PORT=5000
TEAM_PASSWORD=converge2026

# Database
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Model Keys (100% Free Stack)
GEMINI_API_KEY=your-google-ai-studio-key
OPENROUTER_API_KEY=your-openrouter-key
GITHUB_PAT=your-github-personal-access-token

# Google Sheets Sync
GOOGLE_SHEET_ID=17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/your-apps-script-webhook-id/exec
```

### 2. Install & Start Backend
```bash
cd server
npm install
npm start
```

### 3. Install & Start Frontend
```bash
cd client
npm install
npm run dev
```

4. Open **`http://localhost:3000`** and log in with password **`converge2026`**! 🚀
