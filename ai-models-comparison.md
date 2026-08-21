# AI Models Reference — Converge LinkedIn Content Engine

This document lists every AI model/tool discussed for the app, split by task, with cost and reasoning — for you to make the final pricing call.

---

## Task 1: Content Generation (writing LinkedIn post drafts)

| Model | Approx Cost (per 1M tokens, in/out) | Free tier? | Notes |
|---|---|---|---|
| **Gemini 2.5 Flash** | ~$0.075 / $0.30 | Yes, generous free tier | Best all-round cost-to-quality ratio. Great at marketing copy. Primary recommendation initially. |
| **Gemini 2.0 Flash-Lite** | ~$0.0375 / $0.15 | Yes | Cheapest Gemini option, slightly less nuanced writing. Fine for quick draft variations. |
| **Qwen 2.5 / Qwen3 (via OpenRouter)** | Some variants **fully free** (rate-limited); paid tiers ~$0.05–0.20/1M | Yes, free tier available | Strong multilingual writing, good instruction-following. Handles Hinglish well (useful for Gelato-style captions). Genuinely competitive with Gemini Flash. |
| **Qwen3-235B (larger variant)** | Higher cost, still cheap | Limited free | Better reasoning power — overkill for LinkedIn post writing. |
| **DeepSeek V3** | ~$0.14 / $0.28 (cheaper off-peak — DeepSeek has time-based discount pricing) | Small free tier via some providers | Excellent long-form/structured writing. Often praised for sounding more natural, less "AI-generic" than other cheap models. |
| **DeepSeek R1** (reasoning model) | ~$0.55 / $2.19 | No meaningful free tier | Overkill for post generation — built for reasoning/analysis tasks, not needed here. |
| **Groq (hosts Llama/Mixtral models)** | Free tier available | Yes | Very fast inference, decent quality, good as a backup/quick-draft option. |
| **Claude Haiku 4.5** (via Anthropic API) | ~$1 / $5 | No free tier | Noticeably better tone/quality control than the cheap options above. Worth it only if post quality matters more than minimizing cost — still cheap relative to Sonnet/Opus. |

**Final recommendation (content generation):**
- **Primary:** Qwen (free tier via OpenRouter) — free, quality is genuinely good enough for LinkedIn copy.
- **Fallback:** DeepSeek V3 — if Qwen output feels too generic, switch here; still near-free, more natural-sounding writing.
- **Upgrade path (optional, later):** Claude Haiku 4.5 — if budget opens up and post quality becomes a priority over cost.

---

## Task 2: Competitor Research (needs LIVE web search, not just text generation)

Plain Qwen/DeepSeek/Gemini (without search grounding) **cannot** browse the live web — they will guess or hallucinate competitor details from training data only. This task needs a model/tool with real search capability.

| Model/Tool | Approx Cost | Free tier? | Notes |
|---|---|---|---|
| **Gemini API with Google Search Grounding** | ~$35 per 1000 grounded queries (~$0.035/query) | Free tier available before hitting paid usage | Real web search + synthesis. Cheap at your volume (daily competitor checks = a few queries/day). |
| **Perplexity Sonar API** | ~$1 per 1000 requests + ~$1/$1 per 1M tokens | Limited free tier | Purpose-built for "find X and summarize" — exactly this use case. Genuinely strong quality. |

**Final recommendation (competitor research):** **Perplexity Sonar API** — built specifically for exactly this job (find competitors, research their ads/positioning, summarize). Gemini Search Grounding is the backup if Perplexity's free tier runs out.

---

## Task Split Summary

| Task | Model | Reasoning |
|---|---|---|
| Daily post draft generation | **Qwen (OpenRouter, free tier)** | Free, good quality, handles multilingual/Hinglish |
| Fallback if Qwen output is weak | **DeepSeek V3** | Near-free, more natural writing tone |
| Competitor research (needs live search) | **Perplexity Sonar API** | Purpose-built for search + synthesis |
| Backup for competitor research | **Gemini + Search Grounding** | Cheap, real search capability |
| Optional quality upgrade (later) | **Claude Haiku 4.5** | Better tone control, worth it once budget allows |

**Estimated total monthly cost at your usage** (5 posts/day generation + daily competitor checks): likely **under $3–5/month**, and possibly $0 if staying within free tiers.

---

## API Keys Needed

- Gemini API key → https://aistudio.google.com/apikey (free)
- OpenRouter API key (for Qwen/DeepSeek access) → https://openrouter.ai (free signup, some models fully free)
- Perplexity API key → https://www.perplexity.ai/settings/api (paid, cheap)
- (Optional) Groq API key → https://console.groq.com (free)
- (Optional, later) Anthropic API key for Claude Haiku → https://console.anthropic.com

All keys go directly into the backend `.env` file when built in Antigravity — never hardcoded into frontend code, never committed to GitHub.
