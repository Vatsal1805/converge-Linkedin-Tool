# Converge Digitals — LinkedIn Content Engine
### Build Spec + Antigravity Prompts

---

## Prompt 0 — Master Context Prompt (paste this into Antigravity FIRST, before any other prompt)

```
I'm building an internal tool for my digital marketing agency, Converge Digitals. Read this
whole message carefully — it's the context you should keep in mind for every piece of this
project I ask you to build afterward. Don't write any code yet from this message alone; just
understand the vision. I'll give you specific build prompts one at a time after this.

THE PROBLEM:
My team doesn't have consistent time or content ideas to post on LinkedIn regularly, so our
company page stays inactive. We have real, credible client work (web development, branding,
AI automation, social media management, SEO) but almost none of it reaches LinkedIn, where
both local and international potential clients are actively looking for agencies like ours.

THE VISION:
Build a private, internal, team-only web app (not a public product) that removes every
friction point stopping us from posting consistently and credibly on LinkedIn. It should:
- Auto-suggest fresh content ideas every day so nobody has to brainstorm from a blank page
- Generate ready-to-post LinkedIn drafts in our specific tone
- Let us refine drafts conversationally with AI, like briefing a copywriter
- Track what performs so we learn what actually drives DMs
- Research competitors and gather industry trends completely on its own, in the background,
  with zero manual data entry required from the team

THE CONTENT STRATEGY (this logic must be reflected throughout the app):
Four repeatable content "pillars," each with one clear job:
1. Authority — AI/marketing tips and trends, proves we're sharp and current. Soft CTA
   (engagement first, not a hard sell).
2. Offer — states a specific service with a "starting at $X" price range plus turnaround
   time, so cold/international audiences can self-qualify. Direct CTA ("DM us").
3. Aradhya / AI Showcase — showcases our AI persona, Aradhya, used for AI-powered video/
   content work. This is our flagship differentiator, aimed specifically at international
   clients. Soft, curiosity-driven CTA.
4. Proof — real case studies (real clients, real screenshots/results — never AI-generated
   visuals for real work). Soft CTA ("sound familiar?").

These rotate Monday–Friday: Mon=Authority, Tue=Offer, Wed=Aradhya, Thu=Proof, Fri=Offer or a
personal-profile post. Tone across all posts is hooky, punchy, short lines, bold claims — no
corporate fluff. We post mainly on the Converge Digitals company page, occasionally on a
personal profile.

WHO THIS APP IS FOR:
Just our small internal team (2-5 people) — no public signup, no multi-tenant concerns. It
should feel like a premium, clean internal SaaS dashboard — dark, hacker-builder editorial
aesthetic matching our existing brand, card-based layout, sidebar navigation.

CRITICAL SAFETY CONSTRAINT (never violate this in any part of the build):
Our actual LinkedIn account must never be put at risk. That means:
- NEVER scrape LinkedIn profiles, posts, or feed content directly, and never attempt any
  kind of automated login to LinkedIn.
- All competitor/trend research must come ONLY from official public APIs or purpose-built
  public transparency tools: RSS feeds, Reddit's public API, Meta Ad Library, LinkedIn's
  public Ad Library search page, Google Ads Transparency Center, and AI models with live web
  search (e.g. Perplexity Sonar, Gemini with Search Grounding).
- Publishing the final post to LinkedIn itself stays a manual, human action — this app
  prepares content, it does not auto-post anything.

HOW THE APP SHOULD GET ITS CONTENT IDEAS (this is important — ideas must come from real,
live, or first-party data, not just generic AI suggestions):
1. An always-on background crawler that pulls trend headlines across ALL our service domains
   (web dev, branding, social media, SEO, AI) from RSS/Reddit, a few times a day, and turns
   them into tagged content ideas.
2. A sync with our GitHub organization, which contains our real project work (websites, UI,
   AI builds) — pulling metadata (names, descriptions, tech stack, README summaries, never
   actual source code) and turning real shipped work into Proof/Aradhya content ideas
   automatically.
3. Fully autonomous competitor research — the app should discover likely competitor agencies
   on its own using live AI web search (no manual competitor list from us), then research
   what they're promoting and advertising using the public ad libraries above, and turn
   findings into fresh content angles.
4. Logged results from our own real clients, entered directly into the app.
The team should rarely, if ever, need to manually type a topic — though a manual override
should always remain available as a fallback.

KEY FEATURES TO EXPECT ACROSS UPCOMING PROMPTS (so you have the shape of the whole system
in mind, even though I'll ask for each piece separately):
- A Content Generator: opens knowing today's pillar, shows 5 auto-sourced idea cards (each
  tagged with where it came from), generates 3 AI draft variations per chosen idea.
- An AI chat interface to conversationally refine a chosen draft ("make it shorter," "remove
  the pricing line," etc.) — optional, not forced into the flow.
- A Content Calendar: weekly Mon-Fri view with Draft/Ready/Posted status per day.
- A Tracker: manual entry of LinkedIn metrics per post (impressions, reactions, DMs, client
  type), with auto-generated insights on which pillar/day performs best.
- A Competitor Research view: mostly read-only, showing what the autonomous research has
  found, with a manual-add fallback and an "ignore this competitor" option.
- A GitHub sync view/status showing what's been pulled from our org.

I will now give you specific, scoped prompts to build each part step by step. Confirm you've
understood the vision, then wait for the next prompt before writing any code.
```

---

## 0. Strategy Recap (context for every prompt below — same info as Prompt 0 above, kept here as quick reference while working through the build)

- **Goal:** Inbound DMs (local + international) via LinkedIn, mainly on Converge Digitals company page.
- **4 content pillars, Mon–Fri:**
  - Mon: **Authority** (AI/marketing trends, tips) — soft CTA
  - Tue: **Offer** (services, "starting at $X" + turnaround) — direct CTA
  - Wed: **Aradhya/AI showcase** (flagship differentiator, intl-facing)
  - Thu: **Proof** (real case studies — Gelato, Ahuja, Kunj — real screenshots, no AI visuals)
  - Fri: **Offer or personal-profile post**
- **Tone:** Hooky, punchy, short lines, bold claims.
- **Visuals:** AI-generated for concepts/tips/Aradhya; real footage for client proof.
- **Pricing:** ranges ("starting at $X") + turnaround, exact quote pushed to DM.
- **Tracking:** manual metric entry + auto insights (best pillar/day/DM conversion).
- **Competitor research:** the crawler discovers competitors itself and researches them itself (no manual competitor list needed) via Meta Ad Library, LinkedIn Ad Library, Google Ads Transparency Center, and live web search — all public, ToS-safe. No LinkedIn scraping of profiles/posts (ban risk).
- **Idea sources:** the Generator pulls ideas from three places automatically — the crawler's daily findings, the team's GitHub org (real project metadata), and logged client results. The team should rarely if ever need to type a topic manually.
- **Draft refinement:** after generating 3 drafts, the user can open a chat interface to iterate on a draft conversationally ("make it shorter," "add more humor," "remove the pricing line") instead of only picking as-is.

---

## 1. Tech Stack Recommendation

| Layer | Tool | Why |
|---|---|---|
| Frontend | React + Tailwind | Antigravity handles well, matches your MERN skills |
| Backend | Node.js + Express | You already know it |
| Database | Supabase (free tier, Postgres) | Free hosting, easy auth, works with cron |
| Scheduled jobs | Supabase Edge Functions or Render Cron Jobs (free tier) | Runs crawler on schedule without your laptop on |
| Content generation model | Qwen (free tier, via OpenRouter), fallback DeepSeek V3 | Cheap/free, strong writing quality — see model doc |
| Draft chat/refinement model | Same as above (Qwen/DeepSeek) — conversational, so keep consistent | Keeps voice consistent between the 3 drafts and the chat refinement |
| Competitor discovery + research model | Perplexity Sonar API (primary), Gemini + Search Grounding (backup) | Only these can genuinely browse live web and find/research real competitors — plain LLMs will hallucinate this |
| GitHub data source | GitHub REST API + a scoped read-only Personal Access Token | Official, safe, no ban risk — pulls repo metadata only, not code |
| Hosting | Render or Railway (free tier) | Deploys Node backend, sleeps when idle (fine for internal tool) |

Get free/cheap API keys before starting:
- OpenRouter API key (Qwen, DeepSeek) → https://openrouter.ai
- Perplexity API key → https://www.perplexity.ai/settings/api
- Gemini API key (backup research + optional grounding) → https://aistudio.google.com/apikey
- GitHub Personal Access Token (read-only, scoped to your org) → https://github.com/settings/tokens
- Supabase project → https://supabase.com (free tier)
- (Optional later) Groq API key → https://console.groq.com
- (Optional later) Claude Haiku API key, for a quality upgrade → https://console.anthropic.com

See the separate `ai-models-comparison.md` doc for full cost/quality reasoning behind each model choice.

---

## 2. PHASE 1 — Core App (Generator + Calendar + Tracker + Competitor Research)

### Prompt 1: Project Setup
```
Create a new full-stack project called "converge-linkedin-engine" using React + Tailwind CSS for
the frontend and Node.js + Express for the backend. Use Supabase (Postgres) as the database —
set up the client connection using environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) that
I will provide in a .env file, do not hardcode them.

Design direction: dark, hacker-builder editorial aesthetic (dark background, high-contrast
accent color, monospace or bold sans headings, card-based layout, generous whitespace) —
premium SaaS feel, similar to Linear or Vercel dashboards but darker/edgier. Sidebar navigation
with sections: Dashboard, Generator, Calendar, Tracker, Competitor Research, Settings.

This is an internal tool for a small team (2-5 people), no need for public signup — just a
simple login screen with a hardcoded team password stored in env vars.
```

### Prompt 2: Database Schema
```
Set up the following Supabase tables for the converge-linkedin-engine project:

1. posts
   - id, created_at, pillar (enum: authority/offer/aradhya/proof), day_slot (mon-fri),
     idea_text, draft_1, draft_2, draft_3, selected_draft, status (draft/ready/posted),
     scheduled_date, posted_date, post_url, visual_type (ai/real/none)

2. metrics
   - id, post_id (fk to posts), impressions, reactions, comments, dms_received,
     client_type_of_dm, notes, entered_at

3. clients
   - id, name, industry, project_type, results_summary (for feeding Proof-pillar ideas)

4. competitors
   - id, name, website_url, discovered_via (ai_search/manual), first_discovered_at,
     industry_tag, notes, active (boolean — allows marking a competitor irrelevant later)

5. competitor_research
   - id, competitor_id (fk to competitors), source (meta_ad_library/linkedin_ad_library/
     google_ads/web_search/manual), content_notes, screenshot_url (optional), date_added

6. github_projects
   - id, repo_name, description, tech_stack, client_name (nullable), live_url (nullable),
     last_synced_at, used_as_idea (boolean)

7. idea_bank
   - id, pillar, idea_text, source (manual/crawler_news/github/competitor_research/client),
     source_ref_id (nullable fk to whichever source table), times_used, last_used_date

8. draft_chats
   - id, post_id (fk to posts), role (user/assistant), message, created_at
   (stores the back-and-forth chat history used to refine a draft)

Write the SQL migration files and a seed script for idea_bank with ~10 starter idea angles
per pillar (source = manual) so the Generator has content even before the crawler runs
for the first time.
```

### Prompt 3: Content Generator Module
```
Build the Generator page for converge-linkedin-engine:

1. On load, auto-detect today's day (Mon-Fri) and map it to the correct pillar
   (Mon=authority, Tue=offer, Wed=aradhya, Thu=proof, Fri=offer). Show this pillar clearly
   at the top.

2. Fetch 5 idea cards from the idea_bank table for that pillar, prioritizing a MIX of
   sources rather than one source dominating: pull from source=crawler_news (recent trend
   findings), source=github (recent repo/project entries relevant to Proof/Aradhya pillars),
   source=competitor_research (ideas generated from competitor findings), and source=client
   (pulled from the clients table, e.g. "Gelato Independence Day campaign results"). Order by
   oldest last_used_date within the mix so ideas rotate and don't repeat. Each idea card
   should show a small tag indicating its source (e.g. "From GitHub," "Trending," "Inspired
   by competitor research") so the user knows where it came from.

3. User clicks an idea card → calls the content generation model (Qwen via OpenRouter,
   server-side, using OPENROUTER_API_KEY from env vars, never expose it to frontend) with a
   prompt that includes: the idea, the pillar's tone rules (hooky, punchy, short lines, bold
   claims), the correct CTA style (direct for offer, soft for authority/proof/aradhya), and
   for offer-pillar posts include instruction to use a "starting at $X, delivered in Y days"
   pricing format. If the OpenRouter/Qwen call fails, fall back to DeepSeek V3 automatically.

4. Return 3 draft variations, shown as cards the user can pick from.

5. Add a toggle: "Full draft" vs "Outline only" — outline mode returns bullet structure
   instead of finished copy.

6. When user selects a draft, save it to the posts table with status "draft" and update
   idea_bank's last_used_date + times_used for that idea.

Also add a manual topic input field as a fallback, in case the user wants to override the
auto-suggested ideas with their own topic.
```

### Prompt 3b: Draft Chat / Refinement Interface
```
Add a chat interface to the Generator, available after 3 drafts have been generated (and
also reopenable later from the Calendar detail view for any saved draft):

1. Below/beside the 3 draft cards, add a "Refine with AI" button that opens a simple chat
   panel (message bubbles, input box at bottom — standard chat UI, not a form).

2. When opened, the chat starts with context already loaded: the selected draft's full text,
   the pillar, and the original idea — the user should NOT have to re-explain anything.

3. User can type free-form feedback like "make it shorter," "add more personality," "remove
   the pricing line," "make it punchier," "rewrite the hook" — each message calls the content
   generation model (same Qwen/DeepSeek setup as Prompt 3) with the full chat history + current
   draft text as context, and returns an updated version of the draft in the chat as the
   assistant's reply.

4. Every message (both user and assistant) is saved to the draft_chats table linked to the
   post_id, so the refinement history isn't lost if the user navigates away and comes back.

5. Add a clear "Use this version" button on any assistant message in the chat — clicking it
   updates the post's selected_draft field in the posts table to that version.

6. This entire chat step is OPTIONAL — the user can also just pick one of the original 3
   drafts directly without ever opening the chat. Don't force the chat step into the flow.
```

### Prompt 4: Calendar Module
```
Build the Calendar page: a weekly view (Mon-Fri columns) pulling from the posts table.
Each day slot shows its assigned pillar and any draft/ready/posted post for that date.
Allow drag-and-drop (or a simple dropdown) to assign a saved draft from the Generator to
a specific date. Status badges: Draft (gray), Ready (yellow), Posted (green).
Clicking a post opens a detail view showing all 3 original drafts + the selected one,
with an editable text field so the user can tweak before marking as Posted.
```

### Prompt 5: Tracker Module
```
Build the Tracker page: a table of all posts with status "Posted", each row editable to
add: impressions, reactions, comments, dms_received, client_type_of_dm (dropdown: local/
international/unclear), notes. Save to the metrics table linked by post_id.

Below the table, add an Insights section with 3 simple charts:
1. Bar chart: average DMs received per pillar (identifies best-performing pillar)
2. Bar chart: average DMs received per day of week
3. Line chart: DM count trend over time (last 8 weeks)

Add a text summary auto-generated below the charts, e.g. "Your best-performing pillar is
[X] with an average of [Y] DMs per post. Consider posting it more often."
```

### Prompt 6: Competitor Research Module
```
Build the Competitor Research page for converge-linkedin-engine. This page is mostly a
READ/REVIEW view of what the autonomous crawler (Prompt 8) has already found — the team
should rarely need to manually enter anything here.

1. Show a list of all entries in the competitors table (name, website, industry_tag,
   first_discovered_at, active toggle). Clicking a competitor expands to show all linked
   competitor_research entries (source, content_notes, date_added).

2. Include a manual-add form as a fallback only (in case the team wants to flag a specific
   competitor themselves), but this should not be the primary way data gets in.

3. Add a "Suggest content idea from this" button on each research entry that sends the
   content_notes to the content generation model asking it to suggest a Converge-angle post
   idea inspired by (not copying) the competitor's approach, and saves the result into the
   idea_bank table with source=competitor_research and source_ref_id set to that entry's id.

4. Add an "Ignore this competitor" toggle (sets active=false) in case the crawler
   auto-discovers something irrelevant (e.g. a company with a similar name in an unrelated
   industry) — future crawler runs should skip inactive competitors.
```

### Prompt 6b: GitHub Org Sync Module
```
Add a scheduled job (once daily) plus a manual "Sync now" button on a new GitHub section
of the Competitor Research or Calendar page for converge-linkedin-engine that:

1. Uses the GitHub REST API with a GITHUB_TOKEN (read-only, scoped to the Converge org)
   from env vars to list all repos in the org (public and private).

2. For each repo, pulls: repo name, description, primary language(s)/tech stack, README
   content (first ~500 words), and any live URL found in the repo metadata or README.

3. Uses the content generation model to summarize each repo into a short client-facing
   description (e.g. "Full e-commerce site for [client] — Next.js, Stripe integration,
   dark theme"). If a client name can be inferred from the repo name/description, save it.

4. Upserts results into the github_projects table (update if repo already synced, insert if
   new). Skip repos already marked used_as_idea=true within the last 30 days to avoid
   generating duplicate ideas from the same project repeatedly.

5. For any new/updated project, generate ONE idea and insert into idea_bank with
   source=github and source_ref_id set to the github_projects.id — tag it to whichever
   pillar fits best (Proof for client work, Aradhya for AI-related repos, Authority if it's
   a tools/experiments repo).

This only pulls metadata (names, descriptions, tech stack) — never actual source code — since
the Generator needs summaries for post ideas, not code itself.
```

---

## 3. PHASE 2 — Always-On, Self-Driving Crawler (build after Phase 1 is working and deployed)

Everything in this phase should run WITHOUT the team feeding it data manually — it discovers
competitors itself, finds news itself, and researches itself, on a schedule, in the background.

### Prompt 7: Scheduled Trend Crawler (all service domains, self-fetching)
```
Add a scheduled backend job (using node-cron or Render Cron Jobs, running 3x daily —
8am, 2pm, 8pm) to converge-linkedin-engine that:

1. Fetches trend headlines automatically across ALL of Converge's service domains — not just
   AI: web development, branding, social media marketing, SEO, and AI/automation. Use a fixed
   set of free RSS feeds spanning these domains (e.g. TechCrunch AI, Marketing Dive, Smashing
   Magazine for web/design, Search Engine Journal for SEO) plus Reddit's free API across
   relevant subreddits (r/marketing, r/artificial, r/webdev, r/SEO, r/socialmedia).

2. For each fetched item, calls the content generation model to convert it into a
   Converge-relevant content idea (1-2 lines) tagged to the most fitting pillar and to
   whichever service domain it relates to.

3. Inserts new entries into the idea_bank table with source=crawler_news (dedupe against
   existing entries from the last 7 days to avoid repeats).

Do NOT scrape any LinkedIn pages, profiles, or posts directly — only use the official
RSS/API sources listed above. This must never attempt login-based scraping of LinkedIn.
```

### Prompt 8: Autonomous Competitor Discovery + Research
```
Add a second scheduled job (once daily, 9am) to converge-linkedin-engine that runs FULLY
AUTONOMOUSLY — the team should never need to supply a competitor list.

1. DISCOVERY: Use the Perplexity Sonar API (server-side, PERPLEXITY_API_KEY from env vars)
   to search for digital marketing / web development / AI automation agencies that could be
   considered competitors to Converge Digitals — search using a rotating set of query angles
   (e.g. "digital marketing agencies in Gujarat," "AI content agencies for small business,"
   "web development agencies serving international clients," "social media management
   agencies India") so discovery covers different angles over time rather than the same
   query daily. Parse the response for company names + websites.

2. For each newly discovered name not already in the competitors table, insert it with
   discovered_via='ai_search', and set active=true by default (team can deactivate
   irrelevant ones later via Prompt 6's UI).

3. RESEARCH: For each active competitor (both newly discovered and existing ones, on a
   rotating basis so not all get re-checked every single day), use Perplexity Sonar again
   to research what services they're currently promoting, and separately query the public
   Meta Ad Library API and LinkedIn's public Ad Library search page for that competitor's
   name to find any active ads.

4. Store all findings into the competitor_research table linked to the correct competitor_id,
   with source correctly tagged (web_search/meta_ad_library/linkedin_ad_library).

5. Skip any individual lookup gracefully (log and continue) if a source blocks the request or
   returns nothing — never let one failed lookup crash the whole scheduled job.

6. Rate-limit yourself sensibly (e.g. max ~20 Perplexity calls per run) to stay within free/
   cheap tier limits — this does not need to be exhaustive, just steadily building coverage
   over time.
```

---

## 4. Order of Operations

1. Prompt 1 → 2 → 3 → 3b → 4 → 5 → 6 → 6b (get full working app, deploy to Render/Railway)
2. Use it for a week or two — Generator will lean on the manual idea_bank seed + GitHub sync
   while the news/competitor crawler phase isn't live yet
3. Come back to Prompt 7 → 8 once the core habit is working — this is what makes the Generator
   fully self-feeding, no manual research required at all

---

## 5. Notes for You

- Paste all API keys (OpenRouter, Perplexity, Gemini, GitHub token) directly into the `.env` file in the project, never into frontend code, never commit `.env` to GitHub.
- Ask Antigravity to explain any step you don't understand before accepting its output — you're the one maintaining this after.
- If Meta/LinkedIn ad library requests start failing (rate limits or structure changes), that's expected occasionally — it's a "nice to have" layer, not core to the app working.
- The self-driving crawler (Prompt 7 & 8) will take a few days to build up meaningful coverage — don't expect a rich competitor list or idea bank on day one, it grows over time as it runs on schedule.
- Keep an eye on Perplexity usage in early weeks since it's the only paid-by-default piece — the rate-limit built into Prompt 8 (~20 calls/run) is intentionally conservative to control cost.
