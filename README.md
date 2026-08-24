# 🚀 Converge LinkedIn Content & Lead Engine (v2.0)

> **Internal B2B Content Engine & Real-Time Lead Intelligence Hub** built for **Converge Digitals**.  
> Designed to automate consistent, high-converting LinkedIn authority, offer, AI showcase, and case study posts, while autonomously discovering grounded B2B sales leads, tracking competitor ad longevity, mining buyer intent signals, and archiving verified leads live to Google Sheets.

---

## 📸 Overview & Key Capabilities

The **Converge LinkedIn Engine** is an end-to-end full-stack web application combining:

- 🎯 **5-Day Fixed Pillar Rotation:** Mon=Authority, Tue=Offer, Wed=Aradhya AI, Thu=Proof, Fri=Offer/Personal (aligned with LinkedIn's algorithm).
- 🪝 **210-Character Hook Engineering:** Specifically optimizes lines 1–2 (the first ~210 characters) to maximize the `...see more` click-through rate.
- 🛡️ **Strict Anti-AI Slop Filter:** Hard-bans generic AI jargon (`delve`, `game-changer`, `unleash`, `harness`, `secret sauce`) and emoji bullet point spam.
- 📈 **Ad Intelligence & Longevity Pipeline (`/ad-intelligence`):** Tracks competitor ads on Meta & LinkedIn Ad Libraries. Calculates `days_active` and executes multimodal Gemini Vision analysis **ONLY after an ad has been active for 7+ days** (isolating proven winners!). Includes a 1-click post converter.
- 📡 **Intent Signal Mining (`/signals`):** Scans public Reddit RSS feeds (`r/ecommerce`, `r/shopify`, `r/DTC`, `r/smallbusiness`, `r/Entrepreneur`) & search-grounded queries for real buyer pain points *before* prospects search for an agency.
- 🛡️ **Independent Lead Verification Pipeline (`/verification`):** Runs 4 independent, deterministic checks (Places API cross-check, `google-libphonenumber` phone validation, 5s HTTP site reachability, and Scenario 1 claim check) BEFORE auto-pushing to Google Sheets.
- 📍 **Grounded Google Maps Search Engine:** Uses direct Google Search Grounding (`tools: [{ google_search: {} }]`) to discover 100% real, operational businesses.
- 📊 **Real-Time Google Sheets Lead Archiver:** Automatically syncs verified leads (`verification_status = 'passed'`) to live Google Sheets with single-quoted phone formatting (`'+971-4-330-0441'`).
- 💰 **100% Free Operating Architecture ($0.00 Cost):** Powered by direct Google Gemini 3.5 Flash, free public RSS feeds, and OpenRouter fallbacks.

---

## 🏗️ Repository Directory Architecture

```text
Linkedin-tool/ (Repository Root)
├── client/                     <-- React 18 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/         <-- Header, Sidebar, PasswordGate
│   │   ├── pages/              <-- Dashboard, Generator, Calendar, Tracker, CompetitorResearch, AdIntelligence, IntentSignals, Verification, GitHubSync
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                     <-- Node.js + Express + Supabase Backend
│   ├── config/
│   │   ├── googleSheets.js     <-- Real-time Google Sheets & Webhook Sync Engine
│   │   └── supabase.js         <-- Supabase Postgres Client Initializer
│   ├── services/
│   │   ├── leadVerifier.js     <-- Independent 4-Check Lead Verification Service
│   │   ├── adIntelligence.js   <-- Competitor Ad Longevity Tracking & Vision Analysis
│   │   └── intentMiner.js      <-- Reddit RSS & Grounded Intent Classifier
│   ├── db/
│   │   ├── schema.sql          <-- Full PostgreSQL Migration Schema & Enums
│   │   └── seed.sql            <-- Starter Content Ideas
│   ├── routes/                 <-- Generator, Competitors, Calendar, Tracker, Verification, AdIntelligence, IntentSignals, GitHub, Crawler
│   ├── cron.js                 <-- Node-Cron Daily Job Engine (8am, 10am, 2pm, 6pm, 8pm)
│   ├── index.js                <-- Express Server Entry Point
│   └── package.json
├── PRODUCT_REQUIREMENTS_DOCUMENT.md  <-- Complete v2.0 Production PRD
├── ad-intelligence-and-intent-signals-prompts.md <-- Module Specifications
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
- Simple, password-protected team access for internal staff (`converge2026`).

### 2. Content Generator & AI Refinement Chat (`/generator`)
- **3 AI Draft Variations:** Powered by OpenRouter / Gemini with 210-character hook obsession & anti-AI slop filters. Includes real-time conversational chat refinement drawer.

### 3. Competitor Ad Intelligence Pipeline (`/ad-intelligence`)
- Tracks competitor ad longevity (`days_active`). Executes multimodal Gemini Vision analysis **only when days_active ≥ 7** to analyze proven converting ads. Includes 1-click post converter.

### 4. Intent Signal Mining Hub (`/signals`)
- Parses public Reddit RSS feeds (`r/ecommerce`, `r/shopify`, `r/smallbusiness`, `r/Entrepreneur`, `r/DTC`) and search queries for buyer intent signals with AI relevance classification (`genuine_intent`, `ambiguous`, `noise`).

### 5. Independent Lead Verification Hub (`/verification`)
- 4-check deterministic pipeline (Places API cross-check, `google-libphonenumber`, 5s HTTP reachability, Scenario 1 claim check). Surfaces `partial` and `failed` leads for manual review.

### 6. Real-Time Google Sheets Lead Archiver
- Pushes verified leads (`passed`) to Google Sheets with single-quoted phone formatting (`'+971-4-330-0441'`).

---

## ⚡ Quick Start & Setup

### Prerequisites
- Node.js v18+ installed
- Supabase account (Free Tier)
- Google AI Studio Gemini API key (Free Tier)

### 1. Environment Setup
Create a `.env` file inside `server/`:

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
