import { supabase } from '../config/supabase.js';

// Helper: Call Gemini for Multimodal Ad Analysis
async function callGeminiForAdAnalysis(ad, competitorName, otherAds = []) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  const prompt = `You are a Senior B2B Marketing Strategist analyzing a competitor ad that has been running for ${ad.days_active} days.

Competitor Name: "${competitorName}"
Ad Source: ${ad.source}
Days Active: ${ad.days_active} days (Ad is currently ${ad.stopped_running_at ? 'STOPPED' : 'ACTIVE'})
Ad Copy Text: "${ad.ad_copy_text || 'No ad copy text'}"
Creative Image/Thumbnail URL: ${ad.creative_image_url || 'None'}
Other Active Ads by Competitor: ${otherAds.length > 0 ? JSON.stringify(otherAds.map(a => a.ad_copy_text?.slice(0, 100))) : 'None'}

STRICT SYSTEM INSTRUCTION:
Your analysis is a HYPOTHESIS based on limited duration signals (creative content + how long the ad has run). NEVER state performance or revenue as confirmed fact. Use cautious inference phrasing like "this suggests...", "a likely reason is...", "the creative angle indicates..." rather than definitive claims.

Return a clean structured analysis covering:
1. Visual Style & Angle: (What creative approach is used?)
2. Hook & Core Value Offer: (What pain point or price anchor does it hit?)
3. CTA & Funnel Placement: (Direct DM, booking page, or lead magnet?)
4. Hypothesis on Why This Ad Converted for ${ad.days_active} Days: (Grounded in duration data provided).`;

  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 }
        })
      });
      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn('[Ad Analysis Gemini Error]:', e.message);
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
          model: 'deepseek/deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2
        })
      });
      if (response.ok) {
        const json = await response.json();
        return json.choices?.[0]?.message?.content?.trim() || null;
      }
    } catch (e) {
      console.warn('[Ad Analysis OpenRouter Error]:', e.message);
    }
  }

  return `Analysis Hypothesis (Inference): The ad ran for ${ad.days_active} days, suggesting the hook "${ad.ad_copy_text?.slice(0, 50)}..." resonated with target prospects. The creative angle likely targets immediate service inquiries.`;
}

/**
 * Helper to check if a URL is a stock photo/placeholder domain
 */
export function isStockPhotoUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('unsplash.com') ||
    lower.includes('pexels.com') ||
    lower.includes('pixabay.com') ||
    lower.includes('placeholder.com') ||
    lower.includes('via.placeholder')
  );
}

/**
 * Purges existing fabricated Unsplash/stock photo rows from tracked_ads
 */
export async function purgeFabricatedAdData() {
  try {
    console.log('[Ad Intelligence] Purging fabricated stock photo rows from tracked_ads table...');
    const { data: fakeRows, error: findErr } = await supabase
      .from('tracked_ads')
      .select('id, creative_image_url')
      .or('creative_image_url.ilike.%unsplash.com%,creative_image_url.ilike.%pexels.com%,creative_image_url.ilike.%pixabay.com%,creative_image_url.ilike.%placeholder.com%');

    if (findErr) {
      console.warn('[Ad Intelligence Purge Warning]:', findErr.message);
      return { purgedCount: 0 };
    }

    if (fakeRows && fakeRows.length > 0) {
      const idsToDelete = fakeRows.map(r => r.id);
      const { error: delErr } = await supabase
        .from('tracked_ads')
        .delete()
        .in('id', idsToDelete);

      if (!delErr) {
        console.log(`[Ad Intelligence Purge] Successfully deleted ${idsToDelete.length} fabricated ad records.`);
        return { purgedCount: idsToDelete.length };
      }
    }

    return { purgedCount: 0 };
  } catch (err) {
    console.error('[Ad Intelligence Purge Error]:', err.message);
    return { purgedCount: 0 };
  }
}

/**
 * 1. Daily Tracking Job: Queries Meta & LinkedIn Ad Libraries for active competitor ads
 */
export async function runDailyAdTrackingJob() {
  console.log('[Ad Intelligence] Starting daily competitor ad tracking job...');
  let trackedCount = 0;

  // Purge any legacy fabricated stock photo data before tracking
  await purgeFabricatedAdData();

  try {
    let { data: competitors } = await supabase
      .from('competitors')
      .select('*')
      .neq('active', false);

    if (!competitors || competitors.length === 0) {
      const { data: allComps } = await supabase.from('competitors').select('*');
      competitors = allComps || [];
    }

    if (!competitors || competitors.length === 0) {
      console.log('[Ad Intelligence] No competitors found to track.');
      return { success: true, trackedCount: 0 };
    }

    const today = new Date().toISOString();
    const metaToken = process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN;

    for (const comp of competitors) {
      let rawAds = [];

      // 1. Direct Meta Graph API (ads_archive) if access token available
      if (metaToken && !metaToken.includes('placeholder')) {
        try {
          const graphUrl = `https://graph.facebook.com/v19.0/ads_archive?search_terms=${encodeURIComponent(comp.name)}&ad_reached_countries=['US','AE']&fields=id,ad_creative_bodies,ad_snapshot_url,ad_delivery_start_time&access_token=${metaToken}`;
          const graphRes = await fetch(graphUrl);
          if (graphRes.ok) {
            const graphData = await graphRes.json();
            const items = graphData.data || [];
            rawAds = items.map(item => ({
              platform_ad_id: `meta_${item.id}`,
              source: 'meta_ad_library',
              ad_copy_text: item.ad_creative_bodies?.[0] || `Active Meta Ad for ${comp.name}`,
              creative_image_url: item.ad_snapshot_url || null,
              first_seen_at: item.ad_delivery_start_time || today
            }));
          }
        } catch (graphErr) {
          console.warn(`[Meta Graph API Warning for ${comp.name}]:`, graphErr.message);
        }
      }

      // 2. Real search lookup fallback via Gemini Search Grounding (without stock photo defaults)
      if (rawAds.length === 0) {
        const queryPrompt = `Search public Meta Ad Library for active ads running under agency "${comp.name}" (${comp.website_url || ''}). Return PURE JSON ONLY: {"ads": [{"platform_ad_id": "...", "source": "meta_ad_library", "ad_copy_text": "...", "creative_image_url": "..."}]}. Return empty array {"ads": []} if no active ads are found online! DO NOT invent stock photo URLs!`;

        const geminiKey = process.env.GEMINI_API_KEY;
        if (geminiKey && !geminiKey.includes('placeholder')) {
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: queryPrompt }] }],
                tools: [{ google_search: {} }],
                generationConfig: { temperature: 0.1 }
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
                  rawAds = parsed.ads || [];
                }
              }
            }
          } catch (e) {
            console.warn(`[Ad Tracking Error for ${comp.name}]:`, e.message);
          }
        }
      }

      // Process Discovered Real Ads (with Strict Stock Photo Guard)
      const currentPlatformIds = new Set();

      for (let i = 0; i < rawAds.length; i++) {
        const adItem = rawAds[i];

        // Safeguard: Reject any stock photo URL
        if (isStockPhotoUrl(adItem.creative_image_url)) {
          console.warn(`[Ad Safeguard Reject] Stock photo URL rejected for "${comp.name}": ${adItem.creative_image_url}`);
          continue;
        }

        if (!adItem.platform_ad_id) {
          adItem.platform_ad_id = `ad_${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${i + 1}`;
        }
        currentPlatformIds.add(adItem.platform_ad_id);

        const { data: existing } = await supabase
          .from('tracked_ads')
          .select('*')
          .eq('competitor_id', comp.id)
          .eq('platform_ad_id', adItem.platform_ad_id)
          .maybeSingle();

        if (existing) {
          const firstSeen = new Date(existing.first_seen_at);
          const now = new Date();
          const daysActive = Math.max(1, Math.ceil((now - firstSeen) / (1000 * 60 * 60 * 24)));

          await supabase
            .from('tracked_ads')
            .update({
              last_seen_at: today,
              days_active: daysActive,
              stopped_running_at: null
            })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('tracked_ads')
            .insert([
              {
                competitor_id: comp.id,
                source: adItem.source || 'meta_ad_library',
                platform_ad_id: adItem.platform_ad_id,
                creative_image_url: adItem.creative_image_url || null,
                ad_copy_text: adItem.ad_copy_text || 'Active Ad',
                first_seen_at: adItem.first_seen_at || today,
                last_seen_at: today,
                days_active: 1,
                analysis_status: 'too_new'
              }
            ]);
          trackedCount++;
        }
      }

      // Mark missing ads as stopped
      const { data: allCompAds } = await supabase
        .from('tracked_ads')
        .select('*')
        .eq('competitor_id', comp.id)
        .is('stopped_running_at', null);

      for (const compAd of (allCompAds || [])) {
        if (!currentPlatformIds.has(compAd.platform_ad_id)) {
          await supabase
            .from('tracked_ads')
            .update({
              stopped_running_at: today,
              analysis_status: 'stopped'
            })
            .eq('id', compAd.id);
        }
      }
    }

    console.log(`[Ad Intelligence] Tracking completed. ${trackedCount} new ads indexed.`);
    return { success: true, trackedCount };
  } catch (err) {
    console.error('[Ad Tracking Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 2. Delayed Analysis Job: Runs multimodal analysis ONLY on ads with days_active >= 7 or stopped
 */
export async function runDelayedAdAnalysisJob(forceAll = false) {
  console.log('[Ad Intelligence] Starting Step 2 Multimodal AI Analysis job...');
  let analyzedCount = 0;

  try {
    let query = supabase
      .from('tracked_ads')
      .select('*, competitors(name)');

    if (!forceAll) {
      query = query.or('days_active.gte.7,analysis_status.eq.stopped').is('ai_analysis', null);
    }

    const { data: qualifyingAds } = await query;

    for (const ad of (qualifyingAds || [])) {
      const compName = ad.competitors?.name || 'Competitor';

      // Get competitor's other active ads for context
      const { data: otherAds } = await supabase
        .from('tracked_ads')
        .select('ad_copy_text, days_active')
        .eq('competitor_id', ad.competitor_id)
        .neq('id', ad.id)
        .limit(3);

      const aiAnalysisText = await callGeminiForAdAnalysis(ad, compName, otherAds || []);

      if (aiAnalysisText) {
        await supabase
          .from('tracked_ads')
          .update({
            ai_analysis: aiAnalysisText,
            analysis_status: 'analyzed',
            analyzed_at: new Date().toISOString()
          })
          .eq('id', ad.id);
        analyzedCount++;
      }
    }

    console.log(`[Ad Intelligence] Delayed analysis complete. ${analyzedCount} ads analyzed.`);
    return { success: true, analyzedCount };
  } catch (err) {
    console.error('[Delayed Analysis Error]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to check active Meta Ad Library ads count for a business name
 * @param {string} businessName 
 * @returns {Promise<{activeAdsCount: number}>}
 */
export async function checkMetaAds(businessName) {
  if (!businessName) return { activeAdsCount: 0 };
  try {
    const { data, count } = await supabase
      .from('tracked_ads')
      .select('id', { count: 'exact' })
      .ilike('ad_copy_text', `%${businessName}%`)
      .is('stopped_running_at', null);

    return { activeAdsCount: count || 0 };
  } catch (err) {
    return { activeAdsCount: 0 };
  }
}

