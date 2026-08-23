# 🚀 Converge LinkedIn Content & Sales Engine

> **Internal B2B Content Engine & Lead Intelligence Hub** built for **Converge Digitals**.  
> Designed to automate consistent, high-converting LinkedIn authority, offer, AI showcase, and case study posts without manual brainstorming or account ban risks.

---

## 📸 Overview & Key Capabilities

The **Converge LinkedIn Engine** is an end-to-end full-stack web application that combines **AI copywriting**, **autonomous market research**, **ad transparency intelligence**, and **B2B lead discovery**.

- 🎯 **5-Day Fixed Pillar Rotation:** Aligned with LinkedIn's algorithm for maximum topical distribution.
- 🪝 **210-Character Hook Engineering:** Specifically optimizes lines 1–2 (the first ~210 characters) to maximize the `...see more` click-through rate.
- 🛡️ **Strict Anti-AI Slop Filter:** Hard-bans generic AI jargon (`delve`, `game-changer`, `unleash`, `harness`, `secret sauce`) and emoji bullet point spam.
- 💬 **Conversational AI Refinement Drawer:** Allows real-time natural language prompts (*"make it 20% shorter"*, *"remove pricing"*) to edit drafts on the fly.
- 📊 **Performance Tracker & Strategy Engine:** Tracks impressions, reactions, comments, and DMs with 3 interactive SVG charts and automated AI recommendations.
- 🕵️ **3-Tab Competitor & Lead Intelligence Hub:** Crawling public ad transparency libraries (Meta, LinkedIn, Google Ads) and finding pre-qualified business leads with **Google Maps URLs**, **Phone numbers**, and **Contact Emails**.
- 🐙 **Safe GitHub Org Sync:** Crawls shipped client repositories and AI builds (metadata only, zero code exposure) to generate authentic **Proof** case studies.
- ⚡ **Always-On Background Crawlers (`node-cron`):** Runs 3x daily (8am, 2pm, 8pm) to crawl Reddit founder signals (`r/startups`, `r/SaaS`, `r/webdev`), reframing trends into Converge's 5 core services with strict database deduplication.

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

## 🚀 Module-by-Module Breakdown

### 1. Password Gate & Security
- Simple, password-protected team access for internal staff (2–5 people).
- Hardcoded hashed check against `TEAM_PASSWORD` environment variable.

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

### 4. Performance Tracker (`/tracker`)
- Editable posted metrics table: Impressions, Reactions, Comments, DMs Received, Lead Type (*International*, *Local*, *Unclear*), and Notes.
- **3 Interactive SVG Analytics Charts:**
  1. Average DMs per Content Pillar
  2. Average DMs per Day of Week
  3. 8-Week DM Conversion Trend
- **Automated AI Strategy Engine:** Evaluates performance data and outputs actionable recommendations (e.g., *"Thursday Proof posts generate 2.4x more international DMs. Increase case study frequency."*).

### 5. 3-Tab Competitor & Lead Intelligence (`/competitors`)
- **Tab 1: Competitor Ad Libraries:** Discovers active agency competitors in US/Dubai/UK markets and extracts active ad hooks from Meta Ad Library, LinkedIn Ad Library, and Google Ads Transparency. Includes a 1-click *"Suggest Converge Post Idea"* converter.
- **Tab 2: Web Dev & Branding Leads:** Rotates weekly business niches (*Dental Clinics*, *Law Firms*, *Real Estate*). Filters for 3.0–4.2 star Google ratings & slow/outdated mobile sites. Includes **Google Maps links**, **Phone numbers**, and **Emails**.
- **Tab 3: Aradhya AI Video Leads (Visual/D2C Only):** Dedicated strictly for video-suitable niches (*D2C Skincare*, *Luxury Real Estate*, *MedSpas*, *EdTech*). Filters for brands running static Meta image ads or lacking video assets. Includes complete contact verification links.

### 6. GitHub Org Sync (`/github`)
- Read-only integration using GitHub Personal Access Token (`GITHUB_PAT`).
- Crawls repo metadata: repository names, tech stack arrays (`[Next.js, Tailwind, Supabase, Stripe]`), README summaries, and live demo links.
- 🛡️ **Zero Code Risk:** Never reads, downloads, or exposes proprietary source code or secrets — metadata only!
- Auto-generates matching **Proof** or **Aradhya** case study ideas saved directly to `idea_bank`.

### 7. Always-On Background Crawlers (`server/cron.js`)
- Runs automatically via `node-cron` **3 times a day** (8:00 AM, 2:00 PM, 8:00 PM).
- **Service Mapping Engine:** Maps every crawled item to Converge's 5 core services (*Web Dev*, *Branding*, *AI Automation*, *Social Media*, *SEO*).
- **Founder Signal Crawling:** Crawls `r/startups`, `r/SaaS`, `r/webdev` for founder launch pain points and reframes them into Converge sales angles.
- **Strict Database Deduplication:** Uses Supabase `onConflict: 'business_name'` and `onConflict: 'idea_text'` so duplicate cards or leads are never created.

---

## 🛠️ Database Schema (`server/db/schema.sql`)

Created in **Supabase (PostgreSQL)** with 10 tables:

```sql
1. posts (id, pillar, day_slot, idea_text, draft_1, draft_2, draft_3, selected_draft, status, post_url)
2. clients (id, name, industry, project_type, results_summary)
3. competitors (id, name [UNIQUE], website_url, discovered_via, industry_tag, notes, active)
4. competitor_research (id, competitor_id, source, content_notes, date_added)
5. github_projects (id, repo_name [UNIQUE], description, tech_stack, client_name, live_url, used_as_idea)
6. idea_bank (id, pillar, idea_text [UNIQUE], source, times_used, last_used_date)
7. metrics (id, post_id, impressions, reactions, comments, dms_received, client_type_of_dm, notes)
8. draft_chats (id, post_id, role, message, created_at)
9. leads (id, lead_type, business_name [UNIQUE], niche, city_state, rating, website_url, google_map_url, phone_number, email, qualification_reason, ad_status, status)
```

---

## 🔑 Environment Setup (`.env`)

Create a `.env` file in `server/` with the following variables:

```env
PORT=5000
TEAM_PASSWORD=converge2026

# Supabase Credentials
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# AI API Keys
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
GEMINI_API_KEY=AIzaSy-your-gemini-key

# GitHub Access Token (Read-Only)
GITHUB_PAT=ghp_your_github_token
```

---

## 💻 Local Running Instructions

### 1. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Database Migration
Paste the contents of `server/db/schema.sql` and `server/db/seed.sql` into your **Supabase SQL Editor** and click **Run**.

### 3. Start Development Servers

**Terminal 1 (Backend Express Server):**
```bash
cd server
npm start
```
*(Runs Express server & cron scheduler on http://localhost:5000)*

**Terminal 2 (Frontend React App):**
```bash
cd client
npm run dev
```
*(Runs Vite dev server on http://localhost:3000)*

---

## 🤝 Team Workflow Guidelines

1. **Daily Morning Routine (5 Mins):**
   - Open `http://localhost:3000/generator`.
   - The app auto-selects today's pillar. Select an idea card (or click `⚡ Crawl Trends & Founder Signals`).
   - Click **Generate 3 Drafts**, select your favorite version, refine via AI Chat if needed, and click **Save to Calendar**.
2. **Weekly Calendar Review:**
   - Open `/calendar` to verify that Mon–Fri slots have `Ready` posts.
3. **Friday Performance Logging:**
   - Open `/tracker` to log posted impressions and DMs from the past week to trigger AI strategy recommendations.

---

© 2026 **Converge Digitals**. Built with React, Tailwind CSS, Express, Supabase, OpenRouter & Google Gemini 3.5 Flash.
