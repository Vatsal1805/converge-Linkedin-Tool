import express from 'express';
import { supabase } from '../config/supabase.js';
import { runRedditRssJob, runGroundedSearchIntentJob } from '../services/intentMiner.js';

const router = express.Router();

// 1. GET /api/intent-signals/list (Filterable by service area and classification)
router.get('/list', async (req, res) => {
  const { service_area, classification } = req.query;

  try {
    let query = supabase
      .from('intent_signals')
      .select('*')
      .order('discovered_at', { ascending: false });

    if (service_area && service_area !== 'all') {
      query = query.eq('detected_service_area', service_area);
    }

    if (classification && classification !== 'all') {
      query = query.eq('ai_relevance_classification', classification);
    }

    const { data: signals, error } = await query;

    if (error) {
      if (error.message.includes('relation') || error.message.includes('intent_signals')) {
        return res.json({ success: true, count: 0, signals: [], notice: 'Run migration SQL to add intent_signals table to Supabase' });
      }
      throw error;
    }

    res.json({
      success: true,
      count: signals?.length || 0,
      signals: signals || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/intent-signals/update-status (Mark as reviewed, dismissed, or acted_on)
router.post('/update-status', async (req, res) => {
  const { signalId, status } = req.body;
  if (!signalId || !status) {
    return res.status(400).json({ success: false, message: 'signalId and status are required' });
  }

  try {
    const { error } = await supabase
      .from('intent_signals')
      .update({ status })
      .eq('id', signalId);

    if (error) throw error;

    res.json({
      success: true,
      message: `Intent signal status updated to "${status}"!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/intent-signals/trigger-crawl (Manual trigger for RSS & Grounded Intent Discovery)
router.post('/trigger-crawl', async (req, res) => {
  try {
    const rssRes = await runRedditRssJob();
    const groundedRes = await runGroundedSearchIntentJob();

    res.json({
      success: true,
      message: 'Intent signal mining completed!',
      rss: rssRes,
      groundedSearch: groundedRes
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
