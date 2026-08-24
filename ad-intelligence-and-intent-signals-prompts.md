# Converge LinkedIn Engine — Additional Prompts
### Ad Intelligence Pipeline + Intent Signal Mining

Paste these into Antigravity as additions to the existing converge-linkedin-engine project.
Both reference existing tables/patterns from the main build spec, so they should slot in cleanly.

---

## Prompt A — Ad Intelligence Pipeline (Longevity Tracking + Delayed Analysis)

```
Add an Ad Intelligence module to converge-linkedin-engine (existing project). The goal is to
track competitor ads over time and only analyze WHY an ad appears to be working after real
duration data has accumulated — never from a single same-day look at one ad.

1. DATABASE CHANGES
   Create a new table:

   tracked_ads
   - id UUID PRIMARY KEY
   - competitor_id (fk to existing competitors table)
   - source (enum: meta_ad_library / linkedin_ad_library)
   - platform_ad_id (the ad's own ID from Meta/LinkedIn's library, used for dedupe)
   - creative_image_url (nullable)
   - creative_video_url (nullable)
   - ad_copy_text
   - first_seen_at (timestamp, set once, never updated)
   - last_seen_at (timestamp, updated every time the ad is still found active)
   - stopped_running_at (nullable timestamp, set the first time the ad is no longer found)
   - days_active (integer, computed/updated: last_seen_at - first_seen_at)
   - analysis_status (enum: too_new / analyzed / stopped)
   - ai_analysis (nullable text — filled in once analysis actually runs)
   - analyzed_at (nullable timestamp)

2. DAILY TRACKING JOB (runs once daily, e.g. 10am, via node-cron alongside existing scheduled
   jobs)

   For each active competitor in the competitors table:
   a) Query the Meta Ad Library public API (no login required) for ads currently running under
      that competitor's name/page.
   b) For each ad returned, check if platform_ad_id already exists in tracked_ads:
      - If NEW: insert it with first_seen_at = now, last_seen_at = now, analysis_status =
        'too_new'.
      - If EXISTING and still returned by the API: update last_seen_at = now and recompute
        days_active.
      - If an ad that was previously tracked is NO LONGER returned by the API: set
        stopped_running_at = now (only once — don't overwrite if already set) and update
        analysis_status = 'stopped'.
   c) Repeat the same logic for LinkedIn's public Ad Library search page for that competitor,
      tagging source accordingly. If LinkedIn's ad library returns limited or no structured
      data for a given competitor, log it and continue — don't fail the whole job over one
      thin source.
   d) Handle API failures/rate limits gracefully — skip and retry next run, never crash the
      whole job over one competitor's failed lookup.

3. DELAYED ANALYSIS JOB (runs once daily, separate from the tracking job above, e.g. 6pm)

   Only process ads where:
   - days_active >= 7 (do not analyze anything younger than this — insufficient signal)
   - analysis_status is 'too_new' (not yet analyzed) OR the ad has just crossed into
     'stopped' status (worth a final analysis pass noting it stopped after X days)

   For each qualifying ad:
   a) Use a multimodal/vision-capable model (Gemini, passing the creative_image_url or a video
      thumbnail alongside the ad_copy_text) to analyze the actual creative — not just the text.
   b) The prompt sent to the model MUST include: the ad copy, the creative image/thumbnail,
      days_active (how long it has run), whether it's still active or stopped, and — if
      available — the competitor's OTHER tracked ads for comparison (are they running multiple
      variants of the same offer? A completely different angle?).
   c) The model should return a structured analysis covering: visual style, hook/angle used,
      offer structure, CTA placement, and an explicit "why this is likely working" hypothesis
      grounded in the duration data provided — not a bare aesthetic opinion.
   d) CRITICAL: the model's output must be explicitly framed as inference, not fact. Enforce
      this with a system instruction like: "Your analysis is a hypothesis based on limited
      signals (creative content + how long the ad has run). Never state performance as
      confirmed fact. Use phrasing like 'this suggests...' or 'a likely reason is...' rather
      than definitive claims."
   e) Save the result into ai_analysis, set analysis_status = 'analyzed', analyzed_at = now.

4. AD INTELLIGENCE REPORT VIEW (new page or section: /ad-intelligence)
   Build a view showing, grouped by competitor:
   - All currently active tracked ads with days_active prominently shown (this is the primary
     trust signal — sort by days_active descending by default)
   - Each ad's creative thumbnail, copy, and (once available) the ai_analysis text, clearly
     labeled "AI Analysis (Inference)" in the UI so nobody mistakes it for verified fact
   - A simple pattern-summary section: across a competitor's longest-running ads (top 3-5 by
     days_active), does the AI analysis show a repeating theme? Surface this as a secondary,
     even-more-clearly-labeled "Pattern Observation" rather than baking it silently into the
     UI as a confident insight
   - A "Suggest content idea from this" button (matching the existing pattern from the
     Competitor Research module) that sends the ad + its analysis to the content generation
     model to produce a Converge-angle idea inspired by (never copying) the approach, saved
     into idea_bank with source=competitor_research

Do not scrape LinkedIn profiles/feeds directly anywhere in this module — only the official
public Ad Library sources listed above.
```

---

## Prompt B — Intent Signal Mining (Reddit RSS + Search-Grounded AI)

```
Add an Intent Signal Mining module to converge-linkedin-engine (existing project). This finds
public posts where someone expresses a real need or pain point relevant to Converge's services
(web dev, branding, AI video/Aradhya, SEO, social media) — BEFORE they've searched for an
agency. This is explicitly a DIFFERENT data category from the verified leads pipeline: these
are unverified signals for the team to review, never auto-pushed to the Google Sheet or treated
with the same confidence as a Places-verified lead.

Do NOT use Reddit's or X/Twitter's official commercial API in this build — both are cost-
prohibitive at this stage. Use only the two methods below.

1. DATABASE CHANGES
   Create a new table:

   intent_signals
   - id UUID PRIMARY KEY
   - source (enum: reddit_rss / grounded_search)
   - subreddit_or_platform (text, e.g. "r/ecommerce" or "web search")
   - post_title
   - post_url
   - post_excerpt (text, short snippet, not the full scraped content)
   - detected_service_area (enum: web_dev / branding / seo / social_media / aradhya_ai_video /
     general)
   - ai_relevance_classification (enum: genuine_intent / ambiguous / noise)
   - ai_reasoning (short text explaining the classification)
   - status (enum: new / reviewed / dismissed / acted_on)
   - discovered_at (timestamp)

2. RSS FEED JOB (runs 2-3x daily, node-cron, alongside existing scheduled jobs)

   Maintain a small, fixed config list of subreddit RSS feed URLs (format:
   https://www.reddit.com/r/SUBREDDIT/new/.rss), starting with a SHORT list — 4-5 subreddits
   total across service areas, not more, e.g.:
   - r/ecommerce, r/shopify (web dev + Aradhya AI video signals)
   - r/smallbusiness, r/Entrepreneur (general agency signals)
   - r/DTC (Aradhya AI video signals specifically — D2C brands)

   (I will confirm/adjust this exact list before going live — treat it as a config array that's
   easy to edit, not hardcoded deep in logic.)

   For each feed:
   a) Fetch and parse the RSS feed (standard XML/RSS parsing, no authentication needed).
   b) For each new post not already in intent_signals (dedupe by post_url), pass the title +
      excerpt to the content generation model with a classification prompt: "Does this post
      express genuine buying intent or a real pain point related to [list Converge's service
      areas]? Classify as genuine_intent, ambiguous, or noise, and briefly explain why. Most
      posts even in relevant subreddits are NOT genuine intent — be conservative, don't over-
      classify as genuine_intent."
   c) Insert into intent_signals with the classification result. Only posts classified
      genuine_intent or ambiguous should be surfaced by default in the UI (noise stays logged
      but hidden by default, for tuning the classifier over time).
   d) Rate-limit feed checks sensibly (a few hours between checks per feed, not continuous
      polling) to stay respectful of Reddit's infrastructure even though RSS requires no API
      key.

3. GROUNDED SEARCH JOB (runs once daily, node-cron)

   Using the same Perplexity Sonar API or Gemini Search Grounding already configured for the
   Competitor Research module (reuse the existing API key/setup, don't duplicate config):

   a) Run a small rotating set of open-ended search queries (rotate through different angles
      across days, similar to the competitor discovery pattern), for example:
      - "recent Reddit posts from ecommerce brands complaining about video ad production costs"
      - "small business owners asking for web developer recommendations on Reddit or Twitter"
      - "D2C brands discussing AI avatar or UGC-style video ads"
      - "startup founders complaining about slow or outdated websites"
   b) Parse the search results for specific post references (platform, url if available, and
      the relevant excerpt/quote).
   c) Classify each result the same way as step 2b above (genuine_intent / ambiguous / noise)
      and insert into intent_signals with source = 'grounded_search'.
   d) This job should also be able to surface relevant signals from X/Twitter and other
      platforms indirectly, since grounded search covers indexed public content across the
      web — without ever calling X's paid API directly.

4. INTENT SIGNALS DASHBOARD (new page or section: /signals)
   Build a view, clearly visually distinct from the Leads/Competitor Research pages (different
   accent color or a visible "Unverified — Review Required" badge), showing:
   - A filterable list of intent_signals, filterable by detected_service_area and
     ai_relevance_classification
   - Each entry shows the post title, excerpt, source, link to the original post, and the AI's
     reasoning for its classification
   - Simple actions per entry: mark as Reviewed, Dismiss, or Acted On (for the team's own
     tracking — this app does not auto-message or auto-contact anyone found this way)
   - A basic weekly count showing how many genuine_intent signals were found per subreddit/
     search angle, so the team can see which sources are actually worth keeping over time and
     drop low-signal ones

CRITICAL: nowhere in this module should the app attempt to log into Reddit, X/Twitter, or any
platform, or use any endpoint that requires a paid commercial API key from those platforms.
RSS and search-grounded AI (via existing Perplexity/Gemini setup) are the only two data paths.
```

---

## Notes

- **Prompt A** can go in any time after your Competitor Research module (Prompt 6 in the main spec) is working, since it extends the same `competitors` table.
- **Prompt B** can go in independently — it only needs your existing content-generation model and Perplexity/Gemini API keys already configured.
- Before running Prompt B live, confirm the subreddit shortlist (Antigravity will ask, per the prompt's note) — start small and expand only after checking the signal-to-noise ratio for about a week.
- Both modules explicitly avoid anything that could put your actual LinkedIn/Reddit/X accounts at risk — same safety posture as the rest of the build.
