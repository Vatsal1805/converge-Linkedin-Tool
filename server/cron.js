import cron from 'node-cron';
import { runScheduledCrawl } from './routes/crawler.js';
import { supabase } from './config/supabase.js';
import { syncLeadToGoogleSheet } from './config/googleSheets.js';
import { verifyLead } from './services/leadVerifier.js';

let lastCrawlTime = null;
let lastCrawlStatus = 'Idle (Scheduled 8am, 2pm, 8pm)';

// Helper: Call Gemini 3.5 Flash Live Grounding Search (with OpenRouter Fallback)
async function callGeminiGrounding(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // 1. Primary: Direct Gemini 3.5 Flash with Live Google Search Grounding Tool
  if (apiKey && !apiKey.includes('placeholder')) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.2 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        console.warn('[Cron Gemini Warning]:', errText.substring(0, 150));
      }
    } catch (err) {
      console.error('[Cron Gemini Error]:', err.message);
    }
  }

  // 2. Secondary Fallback: 100% Free OpenRouter Models
  if (openRouterKey && !openRouterKey.includes('placeholder')) {
    const fallbackModels = [
      'google/gemini-2.0-flash-lite-001',
      'meta-llama/llama-3.1-8b-instruct:free',
      'deepseek/deepseek-chat'
    ];

    for (const model of fallbackModels) {
      try {
        console.log(`[Cron Fallback] Trying OpenRouter model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.5
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (err) {
        console.error(`[Cron Fallback Error] ${model}:`, err.message);
      }
    }
  }

  return null;
}

// 1. Automated Competitor Discovery Job (5 Competitors / Day)
export async function runDailyCompetitorCrawl() {
  console.log('[Cron Job] Running Daily Competitor Discovery (Gemini Live Search)...');
  const promptText = `Find 3 real active digital marketing or web development agencies in Dubai (UAE) or the US targeting B2B clients. Return PURE JSON ONLY: {"competitors": [{"name": "...", "website_url": "...", "industry_tag": "...", "notes": "...", "ad_notes": "..."}]}`;

  try {
    const rawResult = await callGeminiGrounding(promptText);
    if (!rawResult) {
      console.warn('[Cron Job] No raw result returned from AI models.');
      return { added: 0 };
    }

    const cleanResult = rawResult.replace(/```json|```/g, '').trim();
    const jsonMatch = cleanResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('[Cron Job] Could not match JSON in AI response:', cleanResult.substring(0, 150));
      return { added: 0 };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const competitors = parsed.competitors || [];
    let added = 0;

    for (const comp of competitors) {
      if (!comp.name) continue;

      const { data: inserted, error } = await supabase
        .from('competitors')
        .upsert({
          name: comp.name,
          website_url: comp.website_url || null,
          industry_tag: comp.industry_tag || 'Web Dev & AI',
          notes: comp.notes || 'Discovered automatically via scheduled daily Gemini crawl',
          discovered_via: 'cron_gemini_search',
          active: true
        }, { onConflict: 'name' })
        .select()
        .single();

      if (!error && inserted) {
        added++;
        if (comp.ad_notes) {
          await supabase.from('competitor_research').insert([
            {
              competitor_id: inserted.id,
              source: 'meta_ad_library',
              content_notes: comp.ad_notes,
              date_added: new Date().toISOString()
            }
          ]);
        }
      } else if (error) {
        console.warn(`[Cron Job] Supabase error inserting competitor "${comp.name}":`, error.message);
      }
    }
    console.log(`[Cron Job] Completed competitor crawl. Added/updated ${added} competitors to Supabase.`);
    return { added };
  } catch (err) {
    console.error('[Cron Competitor Error]:', err.message);
    return { added: 0, error: err.message };
  }
}

// 2. Automated Lead Discovery Job (10 to 12 Qualified Leads / Day)
export async function runDailyLeadCrawl() {
  console.log('[Cron Job] Running Daily Lead Discovery (10 Qualified Leads)...');

  const nichesWeb = ['Dental Clinics', 'Law Firms', 'Real Estate Agencies'];
  const nichesAradhya = ['D2C Skincare & Beauty', 'Luxury Real Estate', 'MedSpas & Aesthetics'];

  const selectedWebNiche = nichesWeb[Math.floor(Math.random() * nichesWeb.length)];
  const selectedAradhyaNiche = nichesAradhya[Math.floor(Math.random() * nichesAradhya.length)];

  let webAdded = 0;
  let aradhyaAdded = 0;

  // A. Crawl 5 to 6 Web Dev Leads (Scenario 1 & Scenario 2 Grounded)
  const webPrompt = `Perform a strict live Google Maps search to find 5 REAL, active business leads in niche "${selectedWebNiche}" in Dubai or US.

OPERATIONAL STATUS & SIZE FILTER:
- STRICTLY EXCLUDE PERMANENTLY CLOSED OR TEMPORARILY CLOSED BUSINESSES. Target ONLY 100% active, open, operating businesses. If a Google Maps listing has a 'Permanently closed' label, REJECT IT IMMEDIATELY.
- Target ONLY independent 1 to 3 location boutique clinics, standalone practices, local brokerages, or SMB D2C brands (team size 5-30 people).
- STRICTLY EXCLUDE massive 50+ location enterprise chains or franchise conglomerates.

STRICT REALITY & ANTI-HALLUCINATION CONSTRAINTS:
1. GOOGLE MAPS GROUNDING: Extract ONLY real, actively open businesses listed on official Google Maps Place Cards.
2. BAN ON SYNTHETIC DOMAINS & EMAILS: DO NOT fabricate domain names (e.g. NEVER generate www.businessname.com if not on Google Maps!). If no website button on Maps, set "website_url" to null. DO NOT guess synthetic emails.
3. QUALIFICATION SCENARIOS:
   - SCENARIO 1 (No Website Target): Active open business profile (3.0-4.8★) BUT HAS NO WEBSITE. Qualification Reason: "Active open Google Business profile with NO website listed. Losing 80%+ of online booking traffic."
   - SCENARIO 2 (Flawed Website Target): HAS verified website, BUT it has concrete pitchable flaws (slow mobile load speed >3.5s, non-responsive desktop-first 2010s UI, missing WhatsApp CTA or booking widget). Qualification Reason MUST list 2-3 specific technical flaws.

Return PURE JSON ONLY: {"leads": [{"business_name": "...", "niche": "${selectedWebNiche}", "city_state": "Dubai, UAE", "rating": 3.8, "website_url": "...", "qualification_reason": "...", "phone_number": "...", "email": "..."}]}`;
  
  try {
    const rawWeb = await callGeminiGrounding(webPrompt);
    if (rawWeb) {
      const cleanWeb = rawWeb.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanWeb.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of (parsed.leads || [])) {
          if (!item.business_name) continue;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.business_name + ' ' + (item.city_state || 'Dubai'))}`;
          
          const leadObj = {
            lead_type: 'web_dev',
            business_name: item.business_name,
            niche: item.niche || selectedWebNiche,
            city_state: item.city_state || 'Dubai, UAE',
            rating: item.rating || 3.8,
            website_url: item.website_url || null,
            google_map_url: mapUrl,
            phone_number: item.phone_number || null,
            email: item.email || null,
            qualification_reason: item.qualification_reason || 'Qualified via daily Gemini lead crawler',
            ad_status: item.website_url ? 'Flawed Website Redesign Target' : 'No Active Website',
            status: 'new'
          };
          
          // 1. Check if lead already exists in Supabase
          const { data: existingLead } = await supabase
            .from('leads')
            .select('id')
            .eq('business_name', item.business_name)
            .maybeSingle();

          let insertedRecord = null;
          let error = null;

          if (!existingLead) {
            // 2. Insert new lead into Supabase
            const { data: inserted, error: insErr } = await supabase
              .from('leads')
              .insert([
                {
                  lead_type: 'web_dev',
                  business_name: item.business_name,
                  niche: item.niche || selectedWebNiche,
                  city_state: item.city_state || 'Dubai, UAE',
                  rating: item.rating || 3.8,
                  website_url: item.website_url || null,
                  qualification_reason: item.qualification_reason || 'Qualified via daily Gemini lead crawler',
                  ad_status: item.website_url ? 'Flawed Website Redesign Target' : 'No Active Website',
                  status: 'new'
                }
              ])
              .select()
              .single();
            error = insErr;
            insertedRecord = inserted;
          }

          if (!error && (insertedRecord || existingLead)) {
            webAdded++;
            const leadToVerify = insertedRecord || { ...leadObj, id: existingLead.id };
            verifyLead(leadToVerify).catch(e => console.warn('[Verification Error]:', e.message));
          } else if (error) {
            console.warn(`[Cron Job] Supabase lead insert error "${item.business_name}":`, error.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Cron Web Lead Error]:', err.message);
  }

  // B. Crawl 5 to 6 Aradhya Video Leads (SMB D2C Brands Only)
  const aradhyaPrompt = `Perform a strict live web search to find 5 REAL independent D2C/Visual brand leads (team size 5-30 people) in niche "${selectedAradhyaNiche}" in US/Dubai running static image Meta ads. DO NOT include massive 50+ location enterprise chains. DO NOT fabricate URLs or emails. Return PURE JSON ONLY: {"leads": [{"business_name": "...", "niche": "${selectedAradhyaNiche}", "city_state": "Los Angeles, CA", "rating": 4.6, "website_url": "...", "qualification_reason": "Running static image ads on Meta; missing 4K AI Video Spokesperson for 2.8x higher CTR.", "phone_number": "...", "email": "..."}]}`;
  
  try {
    const rawAradhya = await callGeminiGrounding(aradhyaPrompt);
    if (rawAradhya) {
      const cleanAradhya = rawAradhya.replace(/```json|```/g, '').trim();
      const jsonMatch = cleanAradhya.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of (parsed.leads || [])) {
          if (!item.business_name) continue;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.business_name + ' ' + (item.city_state || 'USA'))}`;
          
          const leadObj = {
            lead_type: 'aradhya_video',
            business_name: item.business_name,
            niche: item.niche || selectedAradhyaNiche,
            city_state: item.city_state || 'USA',
            rating: item.rating || 4.5,
            website_url: item.website_url || null,
            google_map_url: mapUrl,
            phone_number: item.phone_number || null,
            email: item.email || null,
            qualification_reason: item.qualification_reason || 'Qualified via daily Gemini video lead crawler',
            ad_status: 'Static Meta Image Ads Active',
            status: 'new'
          };
          
          // 1. Check if lead already exists in Supabase
          const { data: existingLead } = await supabase
            .from('leads')
            .select('id')
            .eq('business_name', item.business_name)
            .maybeSingle();

          let insertedRecord = null;
          let error = null;

          if (!existingLead) {
            // 2. Insert new lead into Supabase
            const { data: inserted, error: insErr } = await supabase
              .from('leads')
              .insert([
                {
                  lead_type: 'aradhya_video',
                  business_name: item.business_name,
                  niche: item.niche || selectedAradhyaNiche,
                  city_state: item.city_state || 'USA',
                  rating: item.rating || 4.5,
                  website_url: item.website_url || null,
                  qualification_reason: item.qualification_reason || 'Qualified via daily Gemini video lead crawler',
                  ad_status: 'Static Meta Image Ads Active',
                  status: 'new'
                }
              ])
              .select()
              .single();
            error = insErr;
            insertedRecord = inserted;
          }

          if (!error && (insertedRecord || existingLead)) {
            aradhyaAdded++;
            const leadToVerify = insertedRecord || { ...leadObj, id: existingLead.id };
            verifyLead(leadToVerify).catch(e => console.warn('[Verification Error]:', e.message));
          } else if (error) {
            console.warn(`[Cron Job] Supabase Aradhya lead insert error "${item.business_name}":`, error.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[Cron Aradhya Lead Error]:', err.message);
  }

  console.log(`[Cron Job] Completed lead discovery. Added ${webAdded + aradhyaAdded} leads to Supabase.`);
  return { webAdded, aradhyaAdded };
}

// Master Function: Run All Crawlers Immediately
export async function runFullAutoCrawlRoutine() {
  console.log('[Cron Engine] Starting full automated crawl routine...');
  lastCrawlTime = new Date().toISOString();
  lastCrawlStatus = 'Crawling in progress...';

  try {
    const trendRes = await runScheduledCrawl();
    const compRes = await runDailyCompetitorCrawl();
    const leadRes = await runDailyLeadCrawl();

    lastCrawlStatus = `Success (Last run: ${new Date().toLocaleTimeString()})`;
    return {
      success: true,
      lastCrawlTime,
      trendsAdded: trendRes?.addedCount || 0,
      competitorsAdded: compRes?.added || 0,
      webLeadsAdded: leadRes?.webAdded || 0,
      aradhyaLeadsAdded: leadRes?.aradhyaAdded || 0
    };
  } catch (err) {
    console.error('[Cron Routine Error]:', err.message);
    lastCrawlStatus = `Error: ${err.message}`;
    return { success: false, error: err.message };
  }
}

// Get Database Audit Counts from Supabase
export async function getCronStatusAudit() {
  try {
    const { count: ideasCount } = await supabase.from('idea_bank').select('*', { count: 'exact', head: true });
    const { count: competitorsCount } = await supabase.from('competitors').select('*', { count: 'exact', head: true });
    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: projectsCount } = await supabase.from('github_projects').select('*', { count: 'exact', head: true });

    return {
      success: true,
      lastCrawlTime: lastCrawlTime || 'Not run yet today',
      lastCrawlStatus,
      databaseAudit: {
        ideasInBank: ideasCount || 0,
        competitorsDiscovered: competitorsCount || 0,
        leadsDiscovered: leadsCount || 0,
        githubProjectsSynced: projectsCount || 0
      }
    };
  } catch (err) {
    return {
      success: false,
      lastCrawlTime,
      lastCrawlStatus,
      error: err.message
    };
  }
}

// 3. Weekly 7-Day Supabase Database Cleanup Routine (PAUSED FOR 10-20 DAY TESTING WINDOW)
export async function runWeeklyDatabasePurge() {
  console.log('[Cron Job] Weekly 7-Day Lead Purge is PAUSED during current testing window (0 leads deleted).');
  return { purgedCount: 0, status: 'paused_for_testing' };
}
import { runDailyAdTrackingJob, runDelayedAdAnalysisJob } from './services/adIntelligence.js';
import { runRedditRssJob, runGroundedSearchIntentJob } from './services/intentMiner.js';

// Schedule Cron Jobs: Runs 3x Daily (8:00 AM, 2:00 PM, 8:00 PM) + Ad Intelligence & Intent Mining
export function initScheduledJobs() {
  console.log('[Cron Engine] Initializing automated background schedules (8am, 2pm, 8pm, 10am, 6pm)...');

  // Main Lead & Trend Discovery (8:00 AM, 2:00 PM, 8:00 PM) + Reddit RSS Intent Mining
  cron.schedule('0 8,14,20 * * *', async () => {
    console.log('[Cron Engine] Triggering automated crawl routine & RSS intent mining...');
    await runFullAutoCrawlRoutine();
    await runRedditRssJob();
  });

  // Daily Ad Longevity Tracking Job at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('[Cron Engine] Triggering 10:00 AM Daily Competitor Ad Tracking Job...');
    await runDailyAdTrackingJob();
  });

  // Daily Delayed Multimodal Ad Analysis Job at 6:00 PM (days_active >= 7)
  cron.schedule('0 18 * * *', async () => {
    console.log('[Cron Engine] Triggering 6:00 PM Daily Delayed Ad Analysis Job...');
    await runDelayedAdAnalysisJob();
    await runGroundedSearchIntentJob();
  });

  // Weekly Sunday Night DB Cleanup at 11:59 PM (PAUSED for testing)
  cron.schedule('59 23 * * 0', async () => {
    console.log('[Cron Engine] Triggering Sunday Night 7-Day Lead Database Cleanup...');
    await runWeeklyDatabasePurge();
  });
}
