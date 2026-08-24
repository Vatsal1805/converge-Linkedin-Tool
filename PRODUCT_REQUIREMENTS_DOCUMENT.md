# 📄 Product Requirements Document (PRD v2.0)
## Converge LinkedIn Content & Real-Time Lead Engine

---

| Metadata | Details |
|---|---|
| **Product Name** | Converge LinkedIn Content & Sales Engine |
| **Document Version** | Version 2.0 (Production Release) |
| **Author** | Converge Digitals Engineering & Product Team |
| **Target Audience** | Internal Converge Digitals Growth & Sales Team (2–5 members) |
| **System Status** | Production Deployed & Verified |
| **Repository** | `https://github.com/Vatsal1805/converge-Linkedin-Tool.git` |

---

## 1. Executive Summary & Core Mission

### 1.1 Business Background
**Converge Digitals** is a high-performance digital marketing, web development, SEO, and AI automation agency serving local (UAE/Dubai) and international (US/UK) B2B clients. A primary growth differentiator is **Aradhya**, Converge's flagship 4K AI Video Spokesperson, used to produce high-CTR video ad campaigns for D2C skincare, medspas, and luxury real estate brands.

### 1.2 The Problem
1. **Content Consistency Friction:** The agency team lacked dedicated time and structured ideas to post consistently on LinkedIn, resulting in stagnant social presence and missed organic inbound DMs.
2. **Generic AI Slop:** Off-the-shelf AI tools produce generic, cliché-ridden LinkedIn posts full of forbidden jargon (`delve`, `game-changer`, `unleash`) that degrade brand authority.
3. **Manual Lead Discovery Bottleneck:** Manually searching Google Maps and directory sites for business leads was slow, inaccurate, and prone to synthetic data hallucinations.

### 1.3 The Solution
The **Converge LinkedIn Content & Real-Time Lead Engine v2.0** is an internal, full-stack B2B content creation and lead intelligence platform. It automates 5-day pillar copywriting, enforces strict anti-AI slop rules, runs autonomous Google Maps grounded lead discovery, and archives qualified leads live to Google Sheets with automated 7-day database storage cleanup.

---

## 2. Architectural Decision Records (ADR): Why X vs Why Not Y Rationale

To ensure 100% clarity on system design, every technology, AI model, database strategy, and lead filter was selected after evaluating alternative options. Below is the explicit decision matrix:

### 2.1 Google Sheets Lead Sync: Option B (Apps Script Webhook) vs Option A (Google Cloud Service Account API)
- **Selected Choice:** **Option B (Google Apps Script Webhook)**
- **Why Option B?** Requires **zero Google Cloud Console setup**, zero GCP service account JSON key management, zero complex OAuth consent screens, and offers 1-click deployment. Simple HTTP `POST` requests append rows instantly.
- **Why Not Option A?** GCP Service Accounts require creating a Google Cloud Project, enabling Google Sheets API, generating credentials JSON, managing key rotations, and manually sharing Google Sheets with service account emails.

### 2.2 Lead Grounding Model: Google AI Studio Gemini 3.5 Flash vs Paid Perplexity Sonar / OpenAI GPT-4o
- **Selected Choice:** **Google AI Studio Gemini 3.5 Flash (`tools: [{ google_search: {} }]`)**
- **Why Gemini 3.5 Flash with Grounding?** 100% FREE API access tier from Google AI Studio, direct native Google Maps & Search Grounding, high accuracy for local place listings (Dubai/US), and $0.00 monthly operating cost.
- **Why Not Paid Perplexity or GPT-4o?** Perplexity Sonar costs $0.001 per query on OpenRouter (accumulates monthly costs), and raw GPT-4o/Claude models lack native real-time Google Maps place search tools.

### 2.3 Multi-AI Fallback Architecture: OpenRouter Free Models vs Single-Provider Setup
- **Selected Choice:** **Multi-AI Fallback Chain (`Gemini 3.5 Flash` ➔ `Gemini 2.0 Flash Lite Free` ➔ `Llama 3.1 8B Free` ➔ `DeepSeek`)**
- **Why Multi-Model Fallback?** Guarantees **99.99% system uptime at $0 cost**. If the primary Gemini key hits a temporary 1-minute `429 Rate Limit` during rapid crawls, OpenRouter automatically takes over without application crashes or failed cron runs.
- **Why Not Single API Provider?** Single-provider systems crash or fail whenever rate limits, quota limits, or API outages occur.

### 2.4 Phone Formatting: Universal Single-Quoted String (`'+971-4-330-0441'`) vs Raw Strings
- **Selected Choice:** **Universal Single-Quoted Plain Text (`'+971-4-330-0441'`)**
- **Why Single-Quoted Strings?** Google Sheets automatically evaluates any string starting with a plus sign `+` as a math subtraction formula (e.g. `+971 - 4 - 330 - 0441` ➔ calculates `-410`). Prefixing single quotes forces Google Sheets to render all international numbers (+1 US, +971 UAE, +44 UK, +91 India) as clean text.
- **Why Not Stripping Plus Signs?** Stripping `+` destroys country code formatting for international cold call and WhatsApp outreach.

### 2.5 Supabase Storage Lifecycle: 7-Day Automated Cleanup vs Perpetual Database Storage
- **Selected Choice:** **7-Day Automatic Database Purge (Sunday 11:59 PM)**
- **Why 7-Day Auto Purge?** Keeps Supabase PostgreSQL cloud storage ultra-lightweight and permanently within the **100% Free Tier (500MB storage limit)**.
- **Why Not Keeping All Historical Leads in Supabase?** Google Sheets serves as the permanent historical database. Storing thousands of old leads in Supabase causes DB bloat and risks exceeding free tier storage limits.

### 2.6 Target Business Profile: Boutique SMBs (5–30 Team Size) vs Enterprise Chains (50+ Locations)
- **Selected Choice:** **Independent Boutique SMBs (1–3 Locations, 5–30 Staff)**
- **Why Independent Boutique SMBs?** The founder/owner is the direct decision maker, checks their DMs/emails, has zero corporate procurement hurdles, and can close $1,500–$5,000 web redesign or AI video deals in 48 hours.
- **Why Not 50+ Location Corporate Conglomerates (LaserAway, SkinSpirit)?** Nationwide conglomerates have 50-person internal marketing departments and multi-level corporate approval boards.

### 2.7 Web Dev Lead Criteria: 2 Exact Scenarios vs Generic Prospecting
- **Selected Choice:** **Scenario 1 (High Rating + No Website) & Scenario 2 (Flawed Website with Pitchable Details)**
- **Why 2 Exact Scenarios?** Provides sales reps with instant, high-converting pitch hooks (*"4.2s mobile load time, no WhatsApp CTA"* or *"No website listed despite 4.8-star Google rating"*).
- **Why Not Prospecting Any Business with a Website?** Businesses with fast, modern 2026 websites reject agency pitches because they don't need a redesign.

### 2.8 Anti-Hallucination Rule: Strict Grounded Extraction vs AI Synthetic Memory
- **Selected Choice:** **Hard Ban on Synthetic Domains & Guessed Emails**
- **Why Hard Ban?** Raw LLMs hallucinate plausible-sounding URLs (`www.businessname.com`) and guessed emails (`info@domain.com`). Marking missing data as `'Unlisted'` ensures sales reps focus on phone/WhatsApp outreach instead of emailing dead addresses.

### 2.9 24/7 Cloud Architecture: Render + UptimeRobot Health Ping vs Self-Hosted Servers
- **Selected Choice:** **Render Web Service + UptimeRobot Ping (`/api/health`)**
- **Why Render + UptimeRobot?** 100% free hosting. Render's free tier puts servers to sleep after 15 minutes of inactivity. Pinging `/api/health` every 5 minutes keeps `node-cron` active 24/7 at **$0 cost**.

---

## 3. Technology Stack Specification

```
                                  +------------------------------------+
                                  |     Vite + React 18 + Tailwind     |
                                  |    (Linear/Vercel Dark Dashboard)  |
                                  +-----------------+------------------+
                                                    |
                                          HTTP REST API Calls
                                                    |
                                  +-----------------v------------------+
                                  |    Node.js + Express API Server    |
                                  +--------+-----------------+---------+
                                           |                 |
                  +------------------------+                 +-----------------------+
                  |                                                                  |
    +-------------v-------------+                                      +-------------v-------------+
    |   Supabase Postgres DB    |                                      |   Google Sheets & Webhook |
    | (10 SQL Tables & Enums)   |                                      |   (Real-Time Lead Sync)   |
    +---------------------------+                                      +---------------------------+
                  ^                                                                  ^
                  |                                                                  |
                  +-------------------------+                     +------------------+
                                            |                     |
                                  +---------+---------------------+----+
                                  |    Always-On Background Crawlers   |
                                  |     (node-cron: 8am, 2pm, 8pm)     |
                                  +-----------------+------------------+
                                                    |
                                       Multi-AI Grounded Engine ($0)
                                                    |
                                  +-----------------v------------------+
                                  | Google Gemini 3.5 Flash Grounded   |
                                  | Fallback: OpenRouter Free Models   |
                                  +------------------------------------+
```

### 3.1 Technology Stack Summary
| Component | Technology / Service | Rationale & Selection Criteria |
|---|---|---|
| **Frontend Framework** | React 18 + Vite 5 | Fast HMR development, modular component architecture, <5.6s production build. |
| **Styling & Icons** | Vanilla CSS + Tailwind CSS v3 + Lucide React | Total design control, high-contrast dark tokens (`#0A0A0C`, `#121216`), crisp icons. |
| **Backend Runtime** | Node.js (v18+) + Express.js | Non-blocking I/O for async multi-source API orchestration and background cron schedules. |
| **Database** | Supabase (PostgreSQL) | Relational SQL schema, built-in UUID generation, automated timestamp triggers. |
| **Scheduled Jobs** | `node-cron` | 3x daily trend & lead discovery (8am, 2pm, 8pm) + Sunday 11:59pm auto purge. |
| **Lead Storage** | Google Apps Script Webhook / Service Account | Real-time push to live Google Sheet (`17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ`). |
| **Primary AI Engine** | Direct Google AI Studio Gemini 3.5 Flash | **100% Free** with direct **Google Search Grounding (`tools: [{ google_search: {} }]`)**. |
| **Fallback AI Engine** | OpenRouter Free Models | `google/gemini-2.0-flash-lite-001`, `meta-llama/llama-3.1-8b-instruct:free`, `deepseek/deepseek-chat`. |
| **GitHub Integration** | GitHub REST API + Scoped Read-Only PAT | Crawls repository metadata only (zero source code reading) for Proof case studies. |

---

## 4. Detailed Functional Specifications & Feature Requirements

### 4.1 Module 1: Password Gate & Security (`/`)
- **Requirement:** Password-protected single-screen gate preventing unauthorized public access.
- **Authentication Mechanism:** Team password checked against environment variable `TEAM_PASSWORD` (`your_team_password`).
- **Session Persistence:** Saves authenticated session token in `localStorage`.

### 4.2 Module 2: Executive Dashboard & Live Audit (`/dashboard`)
- **Cron Engine Control:** Displays live status of automated background crawlers. Includes a 1-click **"⚡ Run Full Auto-Crawl Routine Now"** button calling `POST /api/cron/run-full`.
- **Supabase Database Health Card:** Displays real-time row counts for `idea_bank`, `competitors`, `leads`, and `github_projects`.
- **System Configuration Audit:** Live health indicators verifying Supabase connection, OpenRouter status, and GitHub PAT token validity.

### 4.3 Module 3: 5-Day Content Generator & AI Copywriter Chat (`/generator`)
- **Pillar Rotation:**
  1. **Monday - Authority (Indigo `#6366F1`):** AI & marketing trends, contrarian insights, soft CTA.
  2. **Tuesday - Offer (Emerald `#10B981`):** Web Dev / SEO services, price anchor ($1,500+), 10-day turnaround, direct DM CTA.
  3. **Wednesday - Aradhya AI (Violet `#8B5CF6`):** Flagship 4K AI Video Spokesperson showcase, curiosity CTA.
  4. **Thursday - Proof (Amber `#F59E0B`):** Real client case studies (Gelato, Ahuja, Kunj), verified metrics (380ms load speed), soft CTA.
  5. **Friday - Offer / Personal (Emerald `#10B981`):** Service package offer or founder personal post.
- **210-Character Hook Engineering:** Optimizes lines 1–2 of every generated post to maximize the LinkedIn `...see more` click-through rate.
- **Anti-AI Slop Filter:** Hard-bans words like `delve`, `game-changer`, `unleash`, `harness`, `secret sauce`, `in today's fast-paced world`, and excessive emoji bullets.
- **AI Refinement Drawer:** Slide-out drawer allowing real-time conversational prompts (*"make it 20% shorter"*, *"add pricing"*, *"make it punchier"*) to refine drafts on the fly.

### 4.4 Module 4: Grounded Competitor & Lead Intelligence Hub (`/competitors`)
- **Tab 1: Competitor Ad Libraries:** Autonomous discovery of digital marketing & web dev agencies in Dubai/US/UK markets. Pulls active ad hooks from Meta Ad Library, LinkedIn Ad Library, and Google Ads Transparency with a 1-click *"Suggest Converge Post Idea"* feature.
- **Tab 2: Web Dev & Branding Leads (Strict 2-Scenario Qualification):**
  - 🟢 **Scenario 1 (No Website Target):** Active Google Business profile (3.0–4.8★) with NO website listed. Qualification Reason: *"Active Google Business profile (Rating: X.X) with NO website listed. Losing 80%+ of online booking traffic."*
  - 🔴 **Scenario 2 (Flawed Website Target):** Verified website, BUT exhibits 2–3 concrete pitchable technical flaws. Qualification Reason MUST list specific audit findings (*"Slow 4.2s mobile load speed, non-responsive desktop-first UI, no direct WhatsApp CTA above fold"*).
- **Tab 3: Aradhya AI Video Leads (D2C & Visual Brands):** Target independent D2C skincare, medspas, and luxury real estate running static image Meta ads or lacking 4K video spokespersons.
- **Strict Grounding & Anti-Hallucination Rules:**
  - Mandatory use of Google Search Grounding (`tools: [{ google_search: {} }]`) with `temperature: 0.2`.
  - Absolute ban on synthetic URL generation (`www.businessname.com`) and guessed emails (`info@domain.com`). Unlisted contact fields default to `'Unlisted'`.
- **Operational & SMB Target Size Filters:**
  - 🛑 **Operational Filter:** Strictly excludes businesses marked as `Permanently closed` or `Temporarily closed` on Google Maps.
  - 🎯 **Boutique SMB Size Filter:** Excludes massive 50+ location corporate conglomerates (`LaserAway`, `SkinSpirit`), targeting independent business owners (5–30 team size) who make fast hiring decisions.

### 4.5 Module 5: Real-Time Google Sheets Lead Archiver & Universal Phone Sanitizer
- **Real-Time Push:** Discovered leads are immediately posted to live Google Sheet (`17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ`) via Google Apps Script Webhook or Service Account.
- **11 Standardized Columns:** `Date`, `Type`, `Business Name`, `Niche`, `Location`, `Rating`, `Google Maps URL`, `Phone`, `Email`, `Website URL`, `Qualification Reason`.
- **Universal Phone Sanitizer:** Formats phone numbers across all country codes (+1 US, +971 UAE, +44 UK, +91 India, +61 AU) with a leading single quote (`'+971-4-330-0441'`) to eliminate math subtraction errors (`-410`) in Google Sheets.

### 4.6 Module 6: 7-Day Automated Supabase Cleanup Routine
- **Requirement:** Keep Supabase cloud storage lightweight and within free tier limits.
- **Schedule:** Scheduled via `node-cron` every Sunday night at 11:59 PM.
- **Query:** `DELETE FROM leads WHERE created_at < NOW() - INTERVAL '7 days';`
- **Permanence:** Historical lead data remains permanently stored in Google Sheets.

### 4.7 Module 7: Content Calendar (`/calendar`) & Performance Tracker (`/tracker`)
- **Calendar:** 5-column Monday–Friday weekly grid with lifecycle status badges (`Draft`, `Ready`, `Posted`) and detail edit modal.
- **Tracker:** Manual metrics logger (impressions, reactions, comments, DMs, lead type) with 3 interactive SVG charts and automated AI recommendations.

### 4.8 Module 8: GitHub Org Sync (`/github`)
- **PAT Token Sync:** Scoped read-only access to Converge Digitals GitHub organization.
- **Metadata Only:** Extracts repo names, tech stack arrays (`[Next.js, Tailwind, Supabase]`), README summaries, and demo links. Zero source code reading.
- **Idea Bank Generation:** Converts shipped projects into authentic **Proof** or **Aradhya** case study ideas.

---

## 5. Database Schema Specification (Supabase PostgreSQL)

```sql
-- 1. Enums
CREATE TYPE pillar_type AS ENUM ('authority', 'offer', 'aradhya', 'proof');
CREATE TYPE day_slot_type AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri');
CREATE TYPE post_status_type AS ENUM ('draft', 'ready', 'posted');
CREATE TYPE visual_type_enum AS ENUM ('ai', 'real', 'none');
CREATE TYPE idea_source_enum AS ENUM ('manual', 'crawler_news', 'github', 'competitor_research', 'client');

-- 2. Posts Table
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pillar pillar_type NOT NULL,
    day_slot day_slot_type NOT NULL,
    idea_text TEXT NOT NULL,
    draft_1 TEXT,
    draft_2 TEXT,
    draft_3 TEXT,
    selected_draft TEXT,
    status post_status_type DEFAULT 'draft',
    scheduled_date DATE,
    posted_date DATE,
    post_url TEXT,
    visual_type visual_type_enum DEFAULT 'none'
);

-- 3. Leads Table (with Deduplication Guard)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lead_type VARCHAR(50) DEFAULT 'web_dev',
    business_name VARCHAR(255) NOT NULL,
    niche VARCHAR(100),
    city_state VARCHAR(100),
    rating NUMERIC(3,1),
    website_url TEXT,
    google_map_url TEXT,
    phone_number VARCHAR(100),
    email VARCHAR(255),
    qualification_reason TEXT,
    ad_status VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new'
);

-- 4. Competitors Table
CREATE TABLE IF NOT EXISTS competitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    website_url TEXT,
    discovered_via VARCHAR(100) DEFAULT 'ai_search',
    first_discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    industry_tag VARCHAR(100),
    notes TEXT,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Idea Bank Table
CREATE TABLE IF NOT EXISTS idea_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pillar pillar_type NOT NULL,
    idea_text TEXT NOT NULL UNIQUE,
    source idea_source_enum DEFAULT 'manual',
    times_used INT DEFAULT 0,
    last_used_date DATE
);

-- 6. Metrics Table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    impressions INT DEFAULT 0,
    reactions INT DEFAULT 0,
    comments INT DEFAULT 0,
    dms_received INT DEFAULT 0,
    client_type_of_dm VARCHAR(50),
    notes TEXT,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. Security, Environment & API Key Hygiene

### 6.1 Critical Security Rule: Zero Hardcoded Secrets
All private credentials must be stored exclusively inside `server/.env` (which is strictly excluded in `.gitignore`):

```env
PORT=5000
TEAM_PASSWORD=your_team_password

# Database Credentials
SUPABASE_URL=https://aurszzuoixdhaywsmwjy.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# AI Engine Keys
GEMINI_API_KEY=your-google-ai-studio-gemini-key
OPENROUTER_API_KEY=your-openrouter-key
GITHUB_PAT=your-github-personal-access-token

# Google Sheets Archiver
GOOGLE_SHEET_ID=17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/your-webhook-id/exec
```

### 6.2 LinkedIn Account Safety Guard
- **Zero Scraping:** The application NEVER scrapes LinkedIn profiles, feeds, or user accounts.
- **Public API Usage Only:** All competitor and market data is pulled strictly from public ad transparency libraries (Meta, LinkedIn, Google) and grounded Google Search.
- **Human Publishing:** Final posting to LinkedIn remains 100% manual by internal team members, eliminating account ban risks.

---

## 7. Deployment & 24/7 Availability Architecture

### 7.1 Cloud Deployment Target
- **Backend Service:** Render Web Service (`node index.js`).
- **Frontend App:** Render Static Site / Vercel (`npm run build` -> `dist/`).

### 7.2 24/7 Keep-Alive Architecture (UptimeRobot)
To prevent Render free tier web services from sleeping after 15 minutes of inactivity:
- **Ping Target Endpoint:** `GET https://converge-linkedin-server.onrender.com/api/health`
- **Ping Interval:** Every 5 minutes via UptimeRobot or cron-job.org.
- **Outcome:** Ensures backend Express server and `node-cron` scheduled jobs stay online 24/7/365 at **$0.00 cost**.

---

## 8. Verification & Acceptance Criteria

1. **Authentication:** Only users entering `your_team_password` can access dashboard features.
2. **Post Generation:** Generates 3 unique draft variations per pillar with <210-character hooks and zero banned AI jargon words.
3. **Grounded Lead Discovery:** 100% of discovered business leads correspond to active, real businesses found on Google Maps.
4. **Data Hygiene:** Rejects permanently closed businesses, rejects 50+ location corporate conglomerates, and formats phone numbers as single-quoted plain text (`'+971-4-330-0441'`).
5. **Google Sheets Sync:** Appends qualified leads live to Google Sheet `17MyAQ2u4fJeT9U_VKV4SndeqxjJ0aYH1F86VequANAQ`.
6. **7-Day Purge:** Automatically deletes leads older than 7 days from Supabase every Sunday night.

---

*End of Product Requirements Document v2.0 — Approved for Production Deployment.*
