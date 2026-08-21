import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// 1. Get all posts for calendar view (grouped/ordered by day_slot or scheduled_date)
router.get('/calendar', async (req, res) => {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, posts: posts || [] });
  } catch (err) {
    console.error('Error fetching calendar posts:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Update post (status, selected_draft, post_url, day_slot, scheduled_date)
router.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    selected_draft, 
    status, 
    post_url, 
    day_slot, 
    scheduled_date, 
    posted_date,
    visual_type 
  } = req.body;

  try {
    const updatePayload = {};
    if (selected_draft !== undefined) updatePayload.selected_draft = selected_draft;
    if (status !== undefined) updatePayload.status = status;
    if (post_url !== undefined) updatePayload.post_url = post_url;
    if (day_slot !== undefined) updatePayload.day_slot = day_slot;
    if (scheduled_date !== undefined) updatePayload.scheduled_date = scheduled_date;
    if (posted_date !== undefined) updatePayload.posted_date = posted_date;
    if (visual_type !== undefined) updatePayload.visual_type = visual_type;

    // Automatically set posted_date when status changes to 'posted'
    if (status === 'posted' && !updatePayload.posted_date) {
      updatePayload.posted_date = new Date().toISOString().split('T')[0];
    }

    const { data: updatedPost, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, post: updatedPost });
  } catch (err) {
    console.error('Error updating post:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Delete a post draft
router.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
