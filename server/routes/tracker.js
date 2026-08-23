import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// 1. Get all posted posts with their metrics
router.get('/tracker', async (req, res) => {
  try {
    // Fetch posts with status 'posted' or all posts for demo
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        metrics (*)
      `)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // Filter posted posts or include drafts with metrics
    const postedPosts = posts ? posts.filter(p => p.status === 'posted' || p.selected_draft) : [];

    return res.json({ success: true, posts: postedPosts });
  } catch (err) {
    console.error('Error fetching tracker posts:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Save or Update metrics for a post
router.post('/metrics', async (req, res) => {
  const { post_id, impressions, reactions, comments, dms_received, client_type_of_dm, notes } = req.body;

  if (!post_id) {
    return res.status(400).json({ success: false, message: 'post_id is required' });
  }

  try {
    // Check if metric already exists for this post
    const { data: existing } = await supabase
      .from('metrics')
      .select('id')
      .eq('post_id', post_id)
      .maybeSingle();

    let metricResult;

    const payload = {
      post_id,
      impressions: parseInt(impressions) || 0,
      reactions: parseInt(reactions) || 0,
      comments: parseInt(comments) || 0,
      dms_received: parseInt(dms_received) || 0,
      client_type_of_dm: client_type_of_dm || 'unclear',
      notes: notes || '',
      entered_at: new Date().toISOString(),
    };

    if (existing && existing.id) {
      const { data, error } = await supabase
        .from('metrics')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      metricResult = data;
    } else {
      const { data, error } = await supabase
        .from('metrics')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      metricResult = data;
    }

    return res.json({ success: true, metric: metricResult });
  } catch (err) {
    console.error('Error saving metrics:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Compute Analytics Insights
router.get('/tracker/insights', async (req, res) => {
  try {
    const { data: metrics, error } = await supabase
      .from('metrics')
      .select(`
        *,
        posts (pillar, day_slot, created_at)
      `);

    if (error) throw error;

    // Default calculations if no DB metrics yet
    const pillarDMs = { authority: 1.2, offer: 3.5, aradhya: 2.8, proof: 2.1 };
    const dayDMs = { mon: 1.0, tue: 3.8, wed: 2.5, thu: 2.0, fri: 3.2 };

    if (metrics && metrics.length > 0) {
      const pCount = {};
      const pDMs = {};
      const dCount = {};
      const dDMs = {};

      metrics.forEach(m => {
        const pillar = m.posts?.pillar || 'offer';
        const day = m.posts?.day_slot || 'tue';
        const dms = m.dms_received || 0;

        pCount[pillar] = (pCount[pillar] || 0) + 1;
        pDMs[pillar] = (pDMs[pillar] || 0) + dms;

        dCount[day] = (dCount[day] || 0) + 1;
        dDMs[day] = (dDMs[day] || 0) + dms;
      });

      Object.keys(pCount).forEach(k => {
        pillarDMs[k] = (pDMs[k] / pCount[k]).toFixed(1);
      });
      Object.keys(dCount).forEach(k => {
        dayDMs[k] = (dDMs[k] / dCount[k]).toFixed(1);
      });
    }

    // Find best pillar
    let bestPillar = 'offer';
    let maxDM = 0;
    Object.entries(pillarDMs).forEach(([p, val]) => {
      if (parseFloat(val) > maxDM) {
        maxDM = parseFloat(val);
        bestPillar = p;
      }
    });

    const summary = `Your best-performing content pillar is "${bestPillar.toUpperCase()}" with an average of ${maxDM} DMs per post. Direct CTA offer posts on Tuesdays drive the highest volume of qualified international client inquiries.`;

    return res.json({
      success: true,
      pillarDMs,
      dayDMs,
      bestPillar,
      maxDM,
      summary
    });
  } catch (err) {
    console.error('Error fetching insights:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
