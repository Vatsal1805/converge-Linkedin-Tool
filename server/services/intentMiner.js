import { XMLParser } from 'fast-xml-parser';
import { supabase } from '../config/supabase.js';

const xmlParser = new XMLParser();

// Default Subreddit RSS Config List (Easy to edit/configure)
export const SUBREDDIT_RSS_LIST = [
  { name: 'r/ecommerce', url: 'https://www.reddit.com/r/ecommerce/new/.rss', serviceArea: 'web_dev' },
  { name: 'r/shopify', url: 'https://www.reddit.com/r/shopify/new/.rss', serviceArea: 'web_dev' },
  { name: 'r/smallbusiness', url: 'https://www.reddit.com/r/smallbusiness/new/.rss', serviceArea: 'general' },
  { name: 'r/Entrepreneur', url: 'https://www.reddit.com/r/Entrepreneur/new/.rss', serviceArea: 'general' },
  { name: 'r/DTC', url: 'https://www.reddit.com/r/DTC/new/.rss', serviceArea: 'aradhya_ai_video' }
];

// Helper: Classify post via Gemini into genuine_intent, ambiguous, or noise
async function classifyIntentPost(title, excerpt, serviceArea) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const prompt = `Analyze this public forum post to determine if the author expresses genuine buying intent or a real pain point related to agency services (web development, branding, SEO, social media, or AI video ads).

Post Title: "${title}"
Post Snippet: "${excerpt || 'None'}"
Target Category: ${serviceArea}

CLASSIFICATION RULES:
- genuine_intent: The author is actively looking to hire a developer/agency, complaining about slow website load speed, asking for quote estimates, or needing video ad production.
- ambiguous: The author discusses business challenges, website tools, or ad costs, but hasn't explicitly asked to hire someone yet.
- noise: General news, self-promotion, spam, tutorial sharing, or unrelated discussion.

Be conservative — most posts are NOT genuine intent.

Return PURE JSON ONLY: {"classification": "genuine_intent" | "ambiguous" | "noise", "service_area": "web_dev" | "branding" | "seo" | "social_media" | "aradhya_ai_video" | "general", "reasoning": "Short 1-sentence explanation"}`;

  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const clean = text.replace(/```json|```/g, '').trim();
          const match = clean.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
        }
      }
    } catch (e) {
      console.warn('[Intent Classifier Error]:', e.message);
    }
  }

  // Fallback via OpenRouter
  if (openRouterKey && !openRouterKey.includes('placeholder')) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.0-flash-lite-001',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        })
      });
      if (response.ok) {
        const json = await response.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const clean = text.replace(/```json|```/g, '').trim();
          const match = clean.match(/\{[\s\S]*\}/);
          if (match) return JSON.parse(match[0]);
        }
      }
    } catch (e) {
      console.warn('[Intent Classifier OpenRouter Error]:', e.message);
    }
  }

  // Default conservative classification
  const lower = (title + ' ' + excerpt).toLowerCase();
  if (lower.includes('hire') || lower.includes('looking for developer') || lower.includes('agency recommendation')) {
    return { classification: 'genuine_intent', service_area: serviceArea, reasoning: 'Explicit keyword match for hiring/recommendation' };
  }
  return { classification: 'ambiguous', service_area: serviceArea, reasoning: 'General discussion requiring review' };
}

/**
 * 1. RSS Feed Job: Fetches & parses 5 public subreddit RSS feeds (2-3x daily)
 */
export async function runRedditRssJob() {
  console.log('[Intent Mining] Running Reddit RSS intent discovery job...');
  let addedCount = 0;

  for (const feedConfig of SUBREDDIT_RSS_LIST) {
    try {
      const response = await fetch(feedConfig.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ConvergeIntentMiner/2.0' }
      });

      if (!response.ok) continue;

      const xmlText = await response.text();
      const jsonObj = xmlParser.parse(xmlText);
      const entries = jsonObj?.feed?.entry || [];

      const feedEntries = Array.isArray(entries) ? entries : [entries];

      for (const entry of feedEntries.slice(0, 10)) { // Limit to 10 latest per feed
        const postTitle = entry.title || 'Untitled Post';
        const postUrl = entry.link?.['@_href'] || entry.link || '';
        if (!postUrl) continue;

        // Dedupe by post_url
        const { data: existing } = await supabase
          .from('intent_signals')
          .select('id')
          .eq('post_url', postUrl)
          .maybeSingle();

        if (existing) continue;

        const rawContent = typeof entry.content === 'string' ? entry.content : (entry.content?.['#text'] || '');
        const cleanExcerpt = rawContent.replace(/<[^>]*>/g, ' ').slice(0, 300).trim();

        // Classify post
        const classification = await classifyIntentPost(postTitle, cleanExcerpt, feedConfig.serviceArea);

        // Insert into Supabase
        await supabase
          .from('intent_signals')
          .insert([
            {
              source: 'reddit_rss',
              subreddit_or_platform: feedConfig.name,
              post_title: postTitle,
              post_url: postUrl,
              post_excerpt: cleanExcerpt,
              detected_service_area: classification.service_area || feedConfig.serviceArea,
              ai_relevance_classification: classification.classification || 'ambiguous',
              ai_reasoning: classification.reasoning || 'Classified via Gemini intent engine',
              status: 'new'
            }
          ]);

        addedCount++;
      }
    } catch (feedErr) {
      console.warn(`[RSS Error for ${feedConfig.name}]:`, feedErr.message);
    }
  }

  console.log(`[Intent Mining] Reddit RSS job complete. Indexed ${addedCount} new signals.`);
  return { success: true, addedCount };
}

/**
 * 2. Grounded Search Job: Search-grounded queries for buyer intent across public forums
 */
export async function runGroundedSearchIntentJob() {
  console.log('[Intent Mining] Running search-grounded intent discovery job...');
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey.includes('placeholder')) {
    return { success: true, addedCount: 0 };
  }

  const queries = [
    'recent Reddit posts ecommerce brands complaining about video ad production costs',
    'small business owners asking for web developer recommendations on Reddit',
    'D2C brands discussing AI avatar or UGC video ads on Reddit',
    'startup founders complaining about slow or outdated websites'
  ];

  const selectedQuery = queries[Math.floor(Math.random() * queries.length)];
  let addedCount = 0;

  try {
    const prompt = `Search live web for ${selectedQuery}. Return PURE JSON ONLY: {"signals": [{"subreddit_or_platform": "r/ecommerce", "post_title": "...", "post_url": "...", "post_excerpt": "...", "service_area": "web_dev", "classification": "genuine_intent", "reasoning": "..."}]}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.2 }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const clean = text.replace(/```json|```/g, '').trim();
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          for (const item of (parsed.signals || [])) {
            if (!item.post_url || !item.post_title) continue;

            const { data: existing } = await supabase
              .from('intent_signals')
              .select('id')
              .eq('post_url', item.post_url)
              .maybeSingle();

            if (!existing) {
              await supabase
                .from('intent_signals')
                .insert([
                  {
                    source: 'grounded_search',
                    subreddit_or_platform: item.subreddit_or_platform || 'Grounded Search',
                    post_title: item.post_title,
                    post_url: item.post_url,
                    post_excerpt: item.post_excerpt || 'Discovered via intent search',
                    detected_service_area: item.service_area || 'general',
                    ai_relevance_classification: item.classification || 'genuine_intent',
                    ai_reasoning: item.reasoning || 'Grounded search intent match',
                    status: 'new'
                  }
                ]);
              addedCount++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Grounded Intent Error]:', err.message);
  }

  console.log(`[Intent Mining] Grounded search job complete. Indexed ${addedCount} new signals.`);
  return { success: true, addedCount };
}
