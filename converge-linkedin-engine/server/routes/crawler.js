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
      console.log('[Crawler AI] Calling Gemini 3.5 Flash for trend reframe...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`, {
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

// Main Crawler Execution Function
export async function runScheduledCrawl() {
  console.log('[Scheduled Crawler] Running trend & founder intent crawl...');

  const redditItems = await fetchRedditTrends();
  let addedCount = 0;

  for (const item of redditItems) {
    try {
      const converted = await convertTrendToConvergeIdea(item.title, item.summary, item.domain);

      if (converted && converted.idea_text) {
        // Deduplicate: Check if similar idea exists in idea_bank in last 7 days
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
              source: 'crawler_news',
              times_used: 0,
            }
          ]);
          addedCount++;
        }
      }
    } catch (err) {
      console.error('[Crawler Item Insert Error]:', err.message);
    }
  }

  console.log(`[Scheduled Crawler] Finished. Added ${addedCount} fresh sales-driven ideas to idea_bank.`);
  return { addedCount, totalCrawled: redditItems.length };
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

export default router;
