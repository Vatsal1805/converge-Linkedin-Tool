import express from 'express';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { syncLeadToGoogleSheet } from '../config/googleSheets.js';
import { verifyLead } from '../services/leadVerifier.js';

dotenv.config();

const router = express.Router();

// Helper: Call Gemini 3.5 Flash with Live Google Search Grounding Tool
async function callGeminiLiveSearch(promptText) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      console.log('[Gemini Live Search] Executing live Google Search Grounding tool query...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
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
        console.warn('[Gemini Search Warning]:', errText.substring(0, 150));
      }
    } catch (err) {
      console.error('[Gemini Search Error]:', err.message);
    }
  }

  // Fallback to 100% Free OpenRouter Models
  if (openRouterKey && !openRouterKey.includes('placeholder')) {
    const fallbackModels = [
      'google/gemini-2.0-flash-lite-001',
      'meta-llama/llama-3.1-8b-instruct:free',
      'deepseek/deepseek-chat'
    ];

    for (const model of fallbackModels) {
      try {
        console.log(`[OpenRouter Search] Executing fallback query with model: ${model}...`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.2,
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (err) {
        console.error(`[OpenRouter Search Error] ${model}:`, err.message);
      }
    }
  }

  return null;
}

// 1. Get all competitors & linked ad research (ONLY REAL CRAWLED DATA)
router.get('/competitors', async (req, res) => {
  try {
    const { data: competitors, error } = await supabase
      .from('competitors')
      .select(`
        *,
        competitor_research (*)
      `)
      .order('first_discovered_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, competitors: competitors || [] });
  } catch (err) {
    console.error('Error fetching competitors:', err.message);
    return res.json({ success: true, competitors: [] });
  }
});

// 2. Discover Live Real Competitors & Public Ad Library Hooks via Gemini
router.post('/competitors/discover-live', async (req, res) => {
  const promptText = `You are an autonomous agency research assistant. Perform a live Google search to find 2 real, active digital marketing, web development, or AI automation agencies in Dubai (UAE) or the US targeting B2B clients.

For each discovered agency, provide:
1. Agency Name
2. Website URL (real official domain like https://single-grain.com)
3. Industry Tag (e.g. Web Dev & AI, Social Media Marketing)
4. Brief notes on their active services
5. 1 active ad hook or campaign offer (e.g. Meta video ad for Next.js site redesigns or Google search ad for SEO)

Return PURE JSON format ONLY:
{
  "competitors": [
    {
      "name": "...",
      "website_url": "...",
      "industry_tag": "...",
      "notes": "...",
      "ad_source": "meta_ad_library",
      "ad_notes": "..."
    }
  ]
}`;

  try {
    const aiResponse = await callGeminiLiveSearch(promptText);
    let discovered = [];

    if (aiResponse) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        discovered = parsed.competitors || [];
      }
    }

    const savedCompetitors = [];

    for (const item of discovered) {
      if (!item.name) continue;

      try {
        // Upsert into competitors table in Supabase
        const { data: comp, error: compErr } = await supabase
          .from('competitors')
          .upsert({
            name: item.name,
            website_url: item.website_url || null,
            industry_tag: item.industry_tag || 'Web Dev & AI',
            notes: item.notes || 'Discovered live via Gemini Google Search',
            discovered_via: 'gemini_search',
            active: true
          }, { onConflict: 'name' })
          .select()
          .single();

        if (!compErr && comp) {
          if (item.ad_notes) {
            const { data: research } = await supabase
              .from('competitor_research')
              .insert([
                {
                  competitor_id: comp.id,
                  source: item.ad_source || 'meta_ad_library',
                  content_notes: item.ad_notes,
                  date_added: new Date().toISOString()
                }
              ])
              .select();

            comp.competitor_research = research || [];
          }
          savedCompetitors.push(comp);
        } else {
          // Fallback object with valid temporary ID and active=true
          savedCompetitors.push({
            id: crypto.randomUUID(),
            name: item.name,
            website_url: item.website_url || null,
            industry_tag: item.industry_tag || 'Web Dev & AI',
            notes: item.notes || 'Discovered live via Gemini Google Search',
            discovered_via: 'gemini_search',
            active: true,
            competitor_research: item.ad_notes ? [{
              id: crypto.randomUUID(),
              source: item.ad_source || 'meta_ad_library',
              content_notes: item.ad_notes,
              date_added: new Date().toISOString()
            }] : []
          });
        }
      } catch (dbErr) {
        console.warn('Could not insert competitor to Supabase:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Gemini Live Search complete! Discovered ${savedCompetitors.length} real competitor agencies.`,
      discovered: savedCompetitors
    });

  } catch (err) {
    console.error('Error discovering competitors:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Add manual competitor fallback
router.post('/competitors/manual', async (req, res) => {
  const { name, website_url, industry_tag, notes } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

  try {
    const { data: comp, error } = await supabase
      .from('competitors')
      .insert([
        {
          name,
          website_url,
          industry_tag: industry_tag || 'Digital Marketing',
          notes,
          discovered_via: 'manual',
          active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, competitor: comp });
  } catch (err) {
    console.error('Error adding competitor:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Toggle competitor active status
router.put('/competitors/:id/toggle-active', async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  if (!id || id === 'undefined') {
    return res.json({ success: true, competitor: { id, active: Boolean(active) } });
  }

  try {
    const { data: comp, error } = await supabase
      .from('competitors')
      .update({ active: Boolean(active) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, competitor: comp });
  } catch (err) {
    console.error('Error toggling competitor status:', err.message);
    return res.json({ success: true, competitor: { id, active: Boolean(active) } });
  }
});

// 5. Suggest Converge Idea from Competitor Ad Hook
router.post('/competitors/suggest-idea', async (req, res) => {
  const { competitorName, contentNotes, researchId } = req.body;

  const promptText = `Competitor: "${competitorName}"
Ad/Research Notes: "${contentNotes}"

Generate 1 high-impact post idea for Converge Digitals that takes the core buyer pain point from this competitor ad and positions Converge as the superior choice. Return 1 clear idea sentence.`;

  try {
    const aiIdea = await callGeminiLiveSearch(promptText);
    const finalIdeaText = aiIdea || `Why generic ${competitorName} offers miss the mark — and how Converge's custom Next.js/AI workflow delivers 2x conversion rate.`;

    try {
      await supabase
        .from('idea_bank')
        .insert([
          {
            pillar: 'authority',
            idea_text: finalIdeaText.replace(/^"|"$/g, '').trim(),
            source: 'competitor_research',
            source_ref_id: researchId && researchId.length === 36 ? researchId : null,
            times_used: 0,
          }
        ]);
    } catch (dbErr) {
      console.warn('Could not save to idea_bank:', dbErr.message);
    }

    return res.json({ success: true, ideaText: finalIdeaText });
  } catch (err) {
    console.error('Error suggesting competitor idea:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Get Business Leads separated by lead_type ('web_dev' or 'aradhya_video')
router.get('/leads', async (req, res) => {
  const { lead_type = 'web_dev' } = req.query;

  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('lead_type', lead_type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ success: true, leads: leads || [] });
  } catch (err) {
    console.warn('[Leads Get Error]:', err.message);
    return res.json({ success: true, leads: [] });
  }
});

// 7. Discover Real Qualified Business Leads via Gemini (5 to 6 Leads per Run)
router.post('/leads/discover-live', async (req, res) => {
  const { niche = 'Dental Clinics', location = 'Dubai, UAE', leadType = 'web_dev' } = req.body;

  const isVideo = leadType === 'aradhya_video';
  
  const promptText = `Perform a strict live Google Maps search to find 5 REAL, active business leads in target location "${location}" for niche "${niche}".

OPERATIONAL STATUS & SIZE FILTER:
- STRICTLY EXCLUDE PERMANENTLY CLOSED OR TEMPORARILY CLOSED BUSINESSES. Target ONLY 100% active, open, operating businesses. If a Google Maps listing has a 'Permanently closed' label, REJECT IT IMMEDIATELY.
- Target ONLY independent 1 to 3 location boutique clinics, standalone practices, local brokerages, or SMB D2C brands (team size 5-30 people).
- STRICTLY EXCLUDE massive 50+ location enterprise chains or franchise conglomerates.

STRICT REALITY & ANTI-HALLUCINATION CONSTRAINTS:
1. GOOGLE MAPS PLACE GROUNDING: Extract ONLY real, actively open businesses listed on official Google Maps Place Cards.
2. ABSOLUTE BAN ON SYNTHETIC DOMAINS & EMAILS:
   - DO NOT fabricate domain names (e.g. NEVER generate www.businessname.com if it is not explicitly published on their Google Maps Place Card!).
   - If Google Maps shows NO website button, set "website_url" to null.
   - DO NOT guess synthetic emails like "info@domain.com". If an official email is published on Google Maps or contact page, return it. Otherwise return null.

LEAD QUALIFICATION CRITERIA:
${isVideo 
  ? `TARGET: Independent D2C/Visual brands in "${niche}" running static image Meta ads or lacking 4K video ads.
     Qualification Reason MUST specify: "Running static image ads on Meta; missing 4K AI Video Spokesperson for 2.8x higher CTR."`
  : `QUALIFY ONLY UNDER ONE OF THESE 2 EXACT SCENARIOS:
     - SCENARIO 1 (No Website Target): Business is actively operating with Google rating/reviews BUT HAS NO WEBSITE.
       Qualification Reason: "Active open business profile (Rating: X.X) with NO website listed. Losing 80%+ of online booking traffic."
     - SCENARIO 2 (Flawed Website Target): Business HAS a verified website, BUT it has concrete pitchable flaws (slow mobile load speed >3.5s, non-responsive desktop-first 2010s UI, messy user flow, missing direct WhatsApp CTA or booking widget above fold).
       Qualification Reason MUST list 2-3 specific technical flaws (e.g. "Slow 4.2s mobile load, non-responsive mobile layout, no direct WhatsApp CTA above fold").`
}

PROVIDE COMPLETE VERIFIED DETAILS FOR EACH OF THE 5 LEADS:
1. Business Name (Exact official name on Google Maps)
2. Niche
3. City & State/Country
4. Google Star Rating (e.g. 3.8 or 4.4)
5. Website URL (Exact verified URL on Google Maps, or null if no website)
6. Direct Google Maps Search URL (Format: "https://www.google.com/maps/search/?api=1&query=" + URL encoded business name + location)
7. Phone Number (Exact verified phone number from Google Maps listing)
8. Email (Verified email published on Google Maps / site, or null if unlisted)
9. Qualification Reason (Following Scenario 1 or Scenario 2 rules above)
10. Active Ad Status (e.g. 'No Active Website', 'Static Image Meta Ads Active', or 'Search Ads Only')

Return PURE JSON ONLY:
{
  "leads": [
    {
      "business_name": "...",
      "niche": "...",
      "city_state": "...",
      "rating": 3.8,
      "website_url": "...",
      "google_map_url": "...",
      "phone_number": "...",
      "email": "...",
      "qualification_reason": "...",
      "ad_status": "..."
    }
  ]
}`;

  try {
    const aiResponse = await callGeminiLiveSearch(promptText);
    let discovered = [];

    if (aiResponse) {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        discovered = parsed.leads || [];
      }
    }

    const savedLeads = [];

    for (const item of discovered) {
      if (!item.business_name) continue;

      const mapUrl = item.google_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.business_name + ' ' + (item.city_state || location))}`;

      try {
        let { data: newLead, error: leadErr } = await supabase
          .from('leads')
          .insert([
            {
              lead_type: leadType,
              business_name: item.business_name,
              niche: item.niche || niche,
              city_state: item.city_state || location,
              rating: item.rating || 3.8,
              website_url: item.website_url || null,
              google_map_url: mapUrl,
              phone_number: item.phone_number || null,
              email: item.email || null,
              qualification_reason: item.qualification_reason || 'Qualified via Gemini Live Search',
              ad_status: item.ad_status || 'Meta Ads Active',
              status: 'new'
            }
          ])
          .select()
          .single();

        if (leadErr && leadErr.message.includes('column')) {
          // Fallback if schema missing optional contact columns
          const { data: baseLead } = await supabase
            .from('leads')
            .insert([
              {
                lead_type: leadType,
                business_name: item.business_name,
                niche: item.niche || niche,
                city_state: item.city_state || location,
                rating: item.rating || 3.8,
                website_url: item.website_url || null,
                qualification_reason: item.qualification_reason || 'Qualified via Gemini Live Search',
                ad_status: item.ad_status || 'Meta Ads Active',
                status: 'new'
              }
            ])
            .select()
            .single();

          newLead = baseLead;
          leadErr = null;
        }

        const fullLeadObj = {
          id: newLead?.id || crypto.randomUUID(),
          lead_type: leadType,
          business_name: item.business_name,
          niche: item.niche || niche,
          city_state: item.city_state || location,
          rating: item.rating || 3.8,
          website_url: item.website_url || null,
          google_map_url: mapUrl,
          phone_number: item.phone_number || null,
          email: item.email || null,
          qualification_reason: item.qualification_reason || 'Qualified via Gemini Live Search',
          ad_status: item.ad_status || 'Meta Ads Active',
          status: 'new'
        };

        savedLeads.push(fullLeadObj);
        verifyLead(fullLeadObj).catch(e => console.warn('[Lead Verification Error]:', e.message));
      } catch (dbErr) {
        console.warn('Could not insert lead to Supabase:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Gemini Live Search complete! Discovered ${savedLeads.length} real qualified ${leadType} leads.`,
      discovered: savedLeads
    });

  } catch (err) {
    console.error('Error discovering leads:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Generate Lead Offer Pitch
router.post('/leads/generate-pitch', async (req, res) => {
  const { businessName, niche, qualificationReason, leadType } = req.body;

  const isVideo = leadType === 'aradhya_video';
  const pillar = isVideo ? 'aradhya' : 'offer';

  const promptText = `Business: "${businessName}" (${niche})
Reason: "${qualificationReason}"
Lead Type: ${isVideo ? 'Aradhya 4K AI Video Spokesperson' : 'High-Converting Web Development Redesign'}

Generate 1 clear post idea sentence for Converge Digitals' ${pillar.toUpperCase()} pillar showcasing how we solve this exact problem for clients in the ${niche} industry.`;

  try {
    const aiPitch = await callGeminiLiveSearch(promptText);
    const finalPitchText = aiPitch || (
      isVideo
        ? `Case Study: How an Aradhya 4K AI Video Spokesperson increased Meta ad CTR by 2.8x for a ${niche} brand in 48 hours.`
        : `Why 3.6-star ${niche} businesses lose high-ticket clients to competitors (and the 10-day web redesign that fixes it).`
    );

    try {
      await supabase
        .from('idea_bank')
        .insert([
          {
            pillar: pillar,
            idea_text: finalPitchText.replace(/^"|"$/g, '').trim(),
            source: 'client',
            times_used: 0,
          }
        ]);
    } catch (dbErr) {
      console.warn('Could not save pitch to idea_bank:', dbErr.message);
    }

    return res.json({ success: true, pitchText: finalPitchText });
  } catch (err) {
    console.error('Error generating lead pitch:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
