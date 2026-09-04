import express from 'express';
import { supabase } from '../config/supabase.js';
import { runDailyAdTrackingJob, runDelayedAdAnalysisJob } from '../services/adIntelligence.js';

const router = express.Router();

// 1. GET /api/ad-intelligence/ads (Grouped by competitor, sorted by days_active desc)
router.get('/ads', async (req, res) => {
  try {
    const { data: ads, error } = await supabase
      .from('tracked_ads')
      .select('*, competitors(id, name, website_url)')
      .order('days_active', { ascending: false });

    if (error) {
      if (error.message.includes('relation') || error.message.includes('tracked_ads')) {
        return res.json({ success: true, count: 0, grouped: [], notice: 'Run migration SQL to add tracked_ads table to Supabase' });
      }
      throw error;
    }

    // Group by competitor
    const competitorMap = {};
    (ads || []).forEach(ad => {
      const compId = ad.competitors?.id || 'unknown';
      const compName = ad.competitors?.name || 'Unmapped Competitor';
      if (!competitorMap[compId]) {
        competitorMap[compId] = {
          competitorId: compId,
          competitorName: compName,
          websiteUrl: ad.competitors?.website_url || '',
          ads: []
        };
      }
      competitorMap[compId].ads.push(ad);
    });

    const groupedArray = Object.values(competitorMap);

    res.json({
      success: true,
      totalTrackedAds: ads?.length || 0,
      grouped: groupedArray
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/ad-intelligence/suggest-idea (Translate winning ad angle into Converge post saved to idea_bank)
router.post('/suggest-idea', async (req, res) => {
  const { adId } = req.body;
  try {
    const { data: ad, error } = await supabase
      .from('tracked_ads')
      .select('*, competitors(name)')
      .eq('id', adId)
      .single();

    if (error || !ad) {
      return res.status(404).json({ success: false, message: 'Tracked ad not found' });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const prompt = `Convert this high-performing competitor ad (ran for ${ad.days_active} days) into an original Converge Digitals LinkedIn post idea. DO NOT COPY — adapt the psychological hook/angle into Converge's B2B Web Dev & AI service offerings.

Competitor: "${ad.competitors?.name}"
Ad Copy: "${ad.ad_copy_text}"
Analysis Hypothesis: "${ad.ai_analysis || 'Proven high-converting hook'}"

Return PURE JSON ONLY: {"pillar": "offer" | "authority" | "aradhya" | "proof", "idea_text": "One-line punchy post idea for Converge Digitals"}`;

    let ideaObj = { pillar: 'offer', idea_text: `Original offer post inspired by competitor ad that converted for ${ad.days_active} days: "${ad.ad_copy_text?.slice(0, 80)}..."` };

    if (geminiKey && !geminiKey.includes('placeholder')) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 }
          })
        });
        if (response.ok) {
          const json = await response.json();
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const clean = text.replace(/```json|```/g, '').trim();
            const match = clean.match(/\{[\s\S]*\}/);
            if (match) ideaObj = JSON.parse(match[0]);
          }
        }
      } catch (e) {
        console.warn('[Suggest Idea Error]:', e.message);
      }
    }

    // Insert into Supabase idea_bank
    const { data: insertedIdea, error: insErr } = await supabase
      .from('idea_bank')
      .insert([
        {
          pillar: ideaObj.pillar || 'offer',
          idea_text: ideaObj.idea_text,
          source: 'competitor_research'
        }
      ])
      .select()
      .single();

    if (insErr && !insErr.message.includes('duplicate')) {
      throw insErr;
    }

    res.json({
      success: true,
      message: 'Post idea generated and saved to Idea Bank!',
      idea: insertedIdea || ideaObj
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/ad-intelligence/trigger-crawl (Manual trigger for tracking + delayed analysis)
router.post('/trigger-crawl', async (req, res) => {
  try {
    const trackRes = await runDailyAdTrackingJob();
    const analysisRes = await runDelayedAdAnalysisJob(true);

    res.json({
      success: true,
      message: 'Ad intelligence tracking & delayed analysis executed successfully!',
      tracking: trackRes,
      analysis: analysisRes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
