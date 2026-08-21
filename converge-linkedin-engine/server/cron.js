import cron from 'node-cron';
import { runScheduledCrawl } from './routes/crawler.js';
import { supabase } from './config/supabase.js';

// Helper: Call Gemini 3.5 Flash Live Grounding Search
async function callGeminiGrounding(promptText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) return null;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.5 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (err) {
    console.error('[Cron Gemini Error]:', err.message);
  }
  return null;
}

// 1. Automated Competitor Discovery Job (5 Competitors / Day)
async function runDailyCompetitorCrawl() {
  console.log('[Cron Job] Running Daily Competitor Discovery (Gemini Live Search)...');
  const promptText = `Find 3 real active digital marketing or web development agencies in Dubai (UAE) or the US targeting B2B clients. Return PURE JSON ONLY: {"competitors": [{"name": "...", "website_url": "...", "industry_tag": "...", "notes": "...", "ad_notes": "..."}]}`;

  try {
    const rawResult = await callGeminiGrounding(promptText);
    if (!rawResult) return;

    const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return;

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
      }
    }
    console.log(`[Cron Job] Completed. Added/updated ${added} competitors in database.`);
  } catch (err) {
    console.error('[Cron Competitor Error]:', err.message);
  }
}

// 2. Automated Lead Discovery Job (10 to 12 Qualified Leads / Day)
async function runDailyLeadCrawl() {
  console.log('[Cron Job] Running Daily Lead Discovery (10 Qualified Leads)...');

  const nichesWeb = ['Dental Clinics', 'Law Firms', 'Real Estate Agencies'];
  const nichesAradhya = ['D2C Skincare & Beauty', 'Luxury Real Estate', 'MedSpas & Aesthetics'];

  const selectedWebNiche = nichesWeb[Math.floor(Math.random() * nichesWeb.length)];
  const selectedAradhyaNiche = nichesAradhya[Math.floor(Math.random() * nichesAradhya.length)];

  // A. Crawl 5 Web Dev Leads
  const webPrompt = `Find 3 real business leads in niche "${selectedWebNiche}" in Dubai or US with 3.0-4.2 rating or slow sites. Return PURE JSON ONLY: {"leads": [{"business_name": "...", "niche": "${selectedWebNiche}", "city_state": "Dubai, UAE", "rating": 3.8, "website_url": "...", "qualification_reason": "...", "phone_number": "...", "email": "..."}]}`;
  
  try {
    const rawWeb = await callGeminiGrounding(webPrompt);
    if (rawWeb) {
      const jsonMatch = rawWeb.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of (parsed.leads || [])) {
          if (!item.business_name) continue;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.business_name + ' ' + (item.city_state || 'Dubai'))}`;
          
          await supabase.from('leads').upsert({
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
            ad_status: 'No Active Ads',
            status: 'new'
          }, { onConflict: 'business_name' });
        }
      }
    }
  } catch (err) {
    console.error('[Cron Web Lead Error]:', err.message);
  }

  // B. Crawl 5 Aradhya Video Leads
  const aradhyaPrompt = `Find 3 real D2C/Visual brand leads in niche "${selectedAradhyaNiche}" in US/Dubai running static image Meta ads. Return PURE JSON ONLY: {"leads": [{"business_name": "...", "niche": "${selectedAradhyaNiche}", "city_state": "Los Angeles, CA", "rating": 4.6, "website_url": "...", "qualification_reason": "...", "phone_number": "...", "email": "..."}]}`;
  
  try {
    const rawAradhya = await callGeminiGrounding(aradhyaPrompt);
    if (rawAradhya) {
      const jsonMatch = rawAradhya.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        for (const item of (parsed.leads || [])) {
          if (!item.business_name) continue;
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.business_name + ' ' + (item.city_state || 'USA'))}`;
          
          await supabase.from('leads').upsert({
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
          }, { onConflict: 'business_name' });
        }
      }
    }
  } catch (err) {
    console.error('[Cron Aradhya Lead Error]:', err.message);
  }

  console.log('[Cron Job] Completed daily lead discovery. Leads database updated.');
}

// Schedule Cron Jobs: Runs 3x Daily (8:00 AM, 2:00 PM, 8:00 PM)
export function initScheduledJobs() {
  console.log('[Cron Engine] Initializing automated background schedules (8am, 2pm, 8pm)...');

  // Schedule every 8 hours (0 8,14,20 * * *)
  cron.schedule('0 8,14,20 * * *', async () => {
    console.log('[Cron Engine] Triggering 3x daily automated crawl routine...');
    await runScheduledCrawl();
    await runDailyCompetitorCrawl();
    await runDailyLeadCrawl();
  });
}
