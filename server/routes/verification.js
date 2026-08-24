import express from 'express';
import { supabase } from '../config/supabase.js';
import { syncLeadToGoogleSheet } from '../config/googleSheets.js';
import { verifyLead } from '../services/leadVerifier.js';

const router = express.Router();

// 1. GET /api/verification/summary (14-day default test window stats & trends)
router.get('/summary', async (req, res) => {
  const days = parseInt(req.query.days || '14', 10);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Get leads in test window
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', startDate);

    if (error) throw error;

    const totalLeads = leads?.length || 0;
    let passed = 0;
    let partial = 0;
    let failed = 0;
    let pending = 0;

    const checkFailures = {
      places_api_match: 0,
      phone_valid: 0,
      website_reachable: 0,
      no_website_claim_verified: 0
    };

    const dailyMap = {};

    (leads || []).forEach(lead => {
      const status = lead.verification_status || 'pending';
      if (status === 'passed') passed++;
      else if (status === 'partial') partial++;
      else if (status === 'failed') failed++;
      else pending++;

      // Check failure reasons
      let details = {};
      try {
        details = typeof lead.verification_details === 'string' ? JSON.parse(lead.verification_details) : (lead.verification_details || {});
      } catch (e) {}

      if (details.places_api_match === false) checkFailures.places_api_match++;
      if (details.phone_valid === false) checkFailures.phone_valid++;
      if (details.website_reachable === false) checkFailures.website_reachable++;
      if (details.no_website_claim_verified === false) checkFailures.no_website_claim_verified++;

      // Daily Trend Breakdown
      const dateKey = (lead.created_at || new Date().toISOString()).split('T')[0];
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, passed: 0, partial: 0, failed: 0, total: 0 };
      }
      dailyMap[dateKey].total++;
      if (status === 'passed') dailyMap[dateKey].passed++;
      else if (status === 'partial') dailyMap[dateKey].partial++;
      else if (status === 'failed') dailyMap[dateKey].failed++;
    });

    const trendArray = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // Also get historical verification_stats from Supabase (survives 7-day purge)
    const { data: historicalStats } = await supabase
      .from('verification_stats')
      .select('*')
      .gte('date', startDate.split('T')[0])
      .order('date', { ascending: true });

    res.json({
      success: true,
      windowDays: days,
      metrics: {
        totalLeads,
        passedCount: passed,
        partialCount: partial,
        failedCount: failed,
        pendingCount: pending,
        passPercentage: totalLeads > 0 ? ((passed / totalLeads) * 100).toFixed(1) : 0,
        partialPercentage: totalLeads > 0 ? ((partial / totalLeads) * 100).toFixed(1) : 0,
        failPercentage: totalLeads > 0 ? ((failed / totalLeads) * 100).toFixed(1) : 0,
      },
      checkFailures,
      trend: trendArray,
      historicalStats: historicalStats || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/verification/needs-review (Leads requiring manual team review)
router.get('/needs-review', async (req, res) => {
  try {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .in('verification_status', ['partial', 'failed', 'pending'])
      .order('created_at', { ascending: false });

    if (error) {
      // Graceful fallback if schema column verification_status is not yet created in Postgres
      if (error.message.includes('column') || error.message.includes('verification_status')) {
        return res.json({ success: true, count: 0, leads: [], schemaNotice: 'Run migration SQL to add verification_status column to Supabase' });
      }
      throw error;
    }

    res.json({
      success: true,
      count: leads?.length || 0,
      leads: leads || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/verification/approve/:id (Manual team override -> Approve lead to Google Sheets)
router.post('/approve/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { data: lead, error: fetchErr } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    // Update status to passed
    const { error: updateErr } = await supabase
      .from('leads')
      .update({
        verification_status: 'passed',
        verified_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Push to Google Sheets
    await syncLeadToGoogleSheet(lead);

    res.json({
      success: true,
      message: `Lead "${lead.business_name}" approved and synced to Google Sheets!`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/verification/reverify-all (Trigger verification on pending/unverified leads)
router.post('/reverify-all', async (req, res) => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .or('verification_status.eq.pending,verification_status.is.null');

    let count = 0;
    for (const lead of (leads || [])) {
      await verifyLead(lead);
      count++;
    }

    res.json({
      success: true,
      message: `Verified ${count} leads in background.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
