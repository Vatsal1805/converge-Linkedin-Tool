import { supabase } from '../config/supabase.js';

/**
 * Safe Cron Job Logger Service: Never throws, never crashes parent background job.
 */

// 1. Record Job Start (status = 'running', started_at = now)
export async function logJobStart(jobName) {
  const startedAt = new Date().toISOString();
  try {
    const { data, error } = await supabase
      .from('cron_run_logs')
      .insert([
        {
          job_name: jobName,
          started_at: startedAt,
          status: 'running'
        }
      ])
      .select('id')
      .single();

    if (!error && data) {
      return { logId: data.id, startTime: Date.now() };
    }
  } catch (err) {
    console.warn(`[Cron Logger] Start log error for ${jobName}:`, err.message);
  }
  return { logId: null, startTime: Date.now() };
}

// 2. Record Job End (status = 'success' | 'partial' | 'failed', completed_at = now, duration_ms)
export async function logJobEnd(logId, status, recordsProcessed = 0, errorMessage = null, startTime = Date.now()) {
  const completedAt = new Date().toISOString();
  const durationMs = Math.max(0, Date.now() - startTime);

  if (!logId) {
    console.log(`[Cron Logger] Fallback log. Job: ended, Status: ${status}, Processed: ${recordsProcessed}, Duration: ${durationMs}ms`);
    return;
  }

  try {
    await supabase
      .from('cron_run_logs')
      .update({
        completed_at: completedAt,
        status: status,
        records_processed: recordsProcessed,
        error_message: errorMessage ? String(errorMessage).substring(0, 500) : null,
        duration_ms: durationMs
      })
      .eq('id', logId);
  } catch (err) {
    console.warn('[Cron Logger] End log update error:', err.message);
  }
}

// 3. Fetch Most Recent 20 Cron Logs (ordered by started_at DESC)
export async function getRecentCronLogs(limit = 20) {
  try {
    const { data: logs, error } = await supabase
      .from('cron_run_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit);

    if (!error && logs) {
      return logs;
    }
  } catch (err) {
    console.warn('[Cron Logger] Fetch logs error:', err.message);
  }
  return [];
}
