import express from 'express';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Helper: Call AI (Gemini or OpenRouter) to convert raw trend/founder post into Converge Content Angle
async function convertTrendToConvergeIdea(headline, summary, sourceDomain) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const systemPrompt = `You are the lead sales strategist at Converge Digitals, a digital agency offering 5 core services:
1. Web Development (Next.js/React, <500ms speed, DM conversion funnels)
2. Branding & Visual Systems (Logo, brand books, social kits)
3. AI Automation (CRM workflows, lead qualification agents)
4. Social Media Growth (Content management, personal branding)
5. SEO & Core Web Vitals (GEO AI search ranking)

TASK: Analyze this trend headline/founder discussion and reframe it into an agency perspective that helps Converge sell one of these 5 services.

RULES:
- Never sound like a news reporter. Sound like a sharp agency builder.
- Reframe the item around CLIENT IMPACT (e.g. lost sales, conversion growth, speed advantage).
- Tone: Hooky, punchy, bold claims, short lines.
- Map to one pillar: 'authority', 'offer', 'aradhya', or 'proof'.
- Output JSON format ONLY: {"idea_text": "...", "pillar": "...", "service_tag": "..."}`;

  const userPrompt = `Source Domain: ${sourceDomain}
Raw Headline/Discussion: "${headline}"
Context: "${summary || ''}"

Generate a Converge Digitals post angle. Return pure JSON: {"idea_text": "...", "pillar": "...", "service_tag": "..."}`;

  // Try Gemini 3.5 Flash first if available
  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      console.log('[Crawler AI] Calling Gemini 2.5 Flash for trend reframe...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.6 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err) {
      console.warn('[Crawler Gemini Error]:', err.message);
    }
  }

  // Fallback to OpenRouter
  if (openRouterKey && !openRouterKey.includes('placeholder')) {
    try {
      console.log('[Crawler AI] Calling OpenRouter for trend reframe...');
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.6,
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (err) {
      console.warn('[Crawler OpenRouter Error]:', err.message);
    }
  }

  // Fallback angle
  return {
    idea_text: `Why recent ${sourceDomain} shifts mean 90% of old agency tactics lose clients — and how our custom Next.js/AI workflow keeps clients converting.`,
    pillar: 'authority',
    service_tag: 'web_dev'
  };
}

// Helper: Fetch top Reddit posts from founder and dev communities
async function fetchRedditTrends() {
  const subreddits = ['startups', 'SaaS', 'webdev', 'marketing', 'artificial', 'SEO'];
  const items = [];

  for (const sub of subreddits) {
    try {
      console.log(`[Reddit Crawler] Fetching top posts from r/${sub}...`);
      const response = await fetch(`https://www.reddit.com/r/${sub}/top.json?t=day&limit=3`, {
        headers: { 'User-Agent': 'Converge-LinkedIn-Engine/1.0' }
      });

      if (response.ok) {
        const data = await response.json();
        const posts = data.data?.children || [];
        for (const p of posts) {
          const postData = p.data;
          if (postData && postData.title && !postData.stickied) {
            items.push({
              title: postData.title,
              summary: postData.selftext ? postData.selftext.substring(0, 300) : '',
              domain: `r/${sub} (Founder/Community Signal)`,
            });
          }
        }
      }
    } catch (err) {
      console.warn(`[Reddit Error r/${sub}]:`, err.message);
    }
  }

  return items;
}

// Main Crawler Execution Function: Live Google Search News Grounding -> idea_bank
export async function runScheduledCrawl() {
  console.log('[Scheduled Crawler] Running live Google News & AI trend crawl...');

  const geminiKey = process.env.GEMINI_API_KEY;
  let addedCount = 0;

  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      const promptText = `Perform a live Google Search for today's top 3 trending news items in:
1. B2B AI Video & AI Persona Marketing
2. High-Performance Web Design, PageSpeed, and Conversion Rate Optimization
3. High-Converting Meta/LinkedIn Ad Hooks & Visual Strategies

For each trend found, reframe it into an agency perspective for Converge Digitals (offering Web Dev, AI Video Avatars, and Marketing).
Return PURE JSON ONLY:
{
  "ideas": [
    {
      "pillar": "authority",
      "idea_text": "...",
      "source_ref": "Live AI & Marketing News"
    }
  ]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          tools: [{ google_search: {} }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const cleanText = text.replace(/```json|```/g, '').trim();
          const match = cleanText.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            for (const item of (parsed.ideas || [])) {
              if (!item.idea_text) continue;

              const { data: existing } = await supabase
                .from('idea_bank')
                .select('id')
                .eq('idea_text', item.idea_text)
                .maybeSingle();

              if (!existing) {
                await supabase.from('idea_bank').insert([
                  {
                    pillar: item.pillar || 'authority',
                    idea_text: item.idea_text,
                    source: 'news_trend',
                    created_at: new Date().toISOString()
                  }
                ]);
                addedCount++;
              }
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Live News Crawl Warning]:', err.message);
    }
  }

  // Fallback to Reddit RSS Trends
  const redditItems = await fetchRedditTrends();
  for (const item of redditItems) {
    try {
      const converted = await convertTrendToConvergeIdea(item.title, item.summary, item.domain);

      if (converted && converted.idea_text) {
        const { data: existing } = await supabase
          .from('idea_bank')
          .select('id')
          .eq('idea_text', converted.idea_text)
          .maybeSingle();

        if (!existing) {
          await supabase.from('idea_bank').insert([
            {
              pillar: converted.pillar || 'authority',
              idea_text: converted.idea_text,
              source: 'reddit',
              created_at: new Date().toISOString()
            }
          ]);
          addedCount++;
        }
      }
    } catch (err) {
      console.warn('[Reddit Trend Insert Error]:', err.message);
    }
  }

  console.log(`[Scheduled Crawler] Completed trend crawl. Inserted ${addedCount} new ideas into idea_bank.`);
  return { addedCount };
}

// 1. Manual trigger route: GET /api/crawler/run-now
router.get('/crawler/run-now', async (req, res) => {
  try {
    const result = await runScheduledCrawl();
    return res.json({
      success: true,
      message: `Crawl completed successfully! Added ${result.addedCount} fresh trend & founder ideas to your Idea Bank.`,
      result
    });
  } catch (err) {
    console.error('Error running crawler:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Cron Audit Status route: GET /api/cron/status (returns recent 20 rows from cron_run_logs)
router.get('/cron/status', async (req, res) => {
  try {
    const { getRecentCronLogs } = await import('../services/cronLogger.js');
    const { getCronStatusAudit } = await import('../cron.js');
    const logs = await getRecentCronLogs(20);
    const audit = await getCronStatusAudit();

    return res.json({
      success: true,
      lastRun: logs?.[0] || null,
      logs: logs || [],
      audit
    });
  } catch (err) {
    console.error('Error getting cron status:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Trigger Full Auto Crawl Routine route: POST & GET /api/cron/run-full
const handleCronTrigger = (req, res) => {
  // 1. Flush HTTP 204 No Content response IMMEDIATELY (< 0.1s, 0 bytes body)
  res.status(204).end();

  // 2. Run crawl routine asynchronously on next event loop tick
  setImmediate(async () => {
    try {
      const { runFullAutoCrawlRoutine } = await import('../cron.js');
      console.log('[Cron Webhook] Triggered via cron-job.org. Executing crawl routine in background...');
      const result = await runFullAutoCrawlRoutine();
      console.log('[Cron Webhook] Background crawl routine finished successfully:', result);
    } catch (err) {
      console.error('[Cron Webhook Error]:', err.message);
    }
  });
};

router.post('/cron/run-full', handleCronTrigger);
router.get('/cron/run-full', handleCronTrigger);

export default router;
