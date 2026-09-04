import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Seed Default Settings if tables are empty
export async function seedDefaultDiscoverySettings() {
  try {
    // 1. Seed Locations
    const { count: locCount } = await supabase
      .from('discovery_locations')
      .select('id', { count: 'exact', head: true });

    if (locCount === 0 || locCount === null) {
      console.log('[Discovery Settings] Seeding default discovery_locations...');
      await supabase.from('discovery_locations').insert([
        { location_name: 'Dubai, UAE', scope: 'global', is_active: true },
        { location_name: 'Miami, FL', scope: 'global', is_active: true },
        { location_name: 'London, UK', scope: 'global', is_active: false },
        { location_name: 'Austin, TX', scope: 'global', is_active: false },
        { location_name: 'Los Angeles, CA', scope: 'global', is_active: false }
      ]);
    }

    // 2. Seed Categories
    const { count: catCount } = await supabase
      .from('discovery_categories')
      .select('id', { count: 'exact', head: true });

    if (catCount === 0 || catCount === null) {
      console.log('[Discovery Settings] Seeding default discovery_categories...');

      const webDevCategories = [
        'Dental Clinics', 'Law Firms', 'Real Estate Agencies', 'Restaurants & Hospitality',
        'Medical & Aesthetic Practices', 'Home Services (Plumbing/HVAC/Electrical)',
        'Fitness Studios & Gyms', 'Salons & Spas', 'Veterinary Clinics', 'Accounting & Tax Firms',
        'Insurance Agencies', 'Auto Repair Shops', 'Wedding & Event Planners',
        'Interior Design Studios', 'Education & Tutoring Centers'
      ];

      const aradhyaCategories = [
        'D2C Skincare & Beauty', 'Luxury Real Estate', 'MedSpas & Aesthetics',
        'Fitness & Wellness Studios', 'Fashion & Apparel D2C', 'Jewelry Brands',
        'Home Decor & Furniture D2C', 'Specialty Food & Beverage Brands', 'Pet Products D2C',
        'Supplements & Nutrition Brands', 'Boutique Travel & Hospitality',
        'Wedding Photography/Videography Studios', 'Art Galleries', 'Boutique Hotels',
        'Luxury Auto Detailing/Customization'
      ];

      const competitorCategories = [
        'Digital Marketing Agencies', 'Web Development Agencies', 'Branding & Design Studios',
        'AI/Automation Agencies', 'Social Media Management Agencies', 'SEO Agencies',
        'Video Production Studios', 'Full-Service Creative Agencies'
      ];

      const webDevInserts = webDevCategories.map((cat, idx) => ({
        category_name: cat,
        scope: 'web_dev',
        is_active: idx < 5
      }));

      const aradhyaInserts = aradhyaCategories.map((cat, idx) => ({
        category_name: cat,
        scope: 'aradhya',
        is_active: idx < 5
      }));

      const competitorInserts = competitorCategories.map((cat, idx) => ({
        category_name: cat,
        scope: 'competitor_research',
        is_active: idx < 5
      }));

      await supabase.from('discovery_categories').insert([
        ...webDevInserts,
        ...aradhyaInserts,
        ...competitorInserts
      ]);
    }
  } catch (err) {
    console.warn('[Discovery Settings Seed Warning]:', err.message);
  }
}

// GET /api/settings/locations?scope=X
router.get('/locations', async (req, res) => {
  const { scope = 'global' } = req.query;
  try {
    let query = supabase.from('discovery_locations').select('*');
    if (scope !== 'all') {
      query = query.or(`scope.eq.${scope},scope.eq.global`);
    }
    const { data: locations, error } = await query.order('created_at', { ascending: true });

    if (error) {
      if (error.message.includes('relation')) {
        await seedDefaultDiscoverySettings();
        return res.json({ success: true, locations: [] });
      }
      throw error;
    }

    return res.json({ success: true, locations: locations || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/locations
router.post('/locations', async (req, res) => {
  const { location_name, scope = 'global' } = req.body;
  if (!location_name) return res.status(400).json({ success: false, message: 'location_name is required' });

  try {
    // Set all previous locations to inactive so selected location is active
    await supabase.from('discovery_locations').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000');

    // Check if location already exists
    const { data: existing } = await supabase
      .from('discovery_locations')
      .select('*')
      .eq('location_name', location_name)
      .maybeSingle();

    if (existing) {
      const { data: updated } = await supabase
        .from('discovery_locations')
        .update({ is_active: true })
        .eq('id', existing.id)
        .select()
        .single();
      return res.json({ success: true, location: updated });
    }

    const { data, error } = await supabase
      .from('discovery_locations')
      .insert([{ location_name, scope, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, location: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/settings/locations/:id
router.patch('/locations/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active, scope } = req.body;

  try {
    const payload = {};
    if (is_active !== undefined) payload.is_active = is_active;
    if (scope !== undefined) payload.scope = scope;

    const { data, error } = await supabase
      .from('discovery_locations')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, location: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/settings/locations/:id
router.delete('/locations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('discovery_locations').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Location deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/settings/categories?scope=X
router.get('/categories', async (req, res) => {
  const { scope = 'web_dev' } = req.query;
  try {
    let { data: categories, error } = await supabase
      .from('discovery_categories')
      .select('*')
      .eq('scope', scope)
      .order('created_at', { ascending: true });

    if (error || !categories || categories.length === 0) {
      await seedDefaultDiscoverySettings();
      const { data: reFetched } = await supabase
        .from('discovery_categories')
        .select('*')
        .eq('scope', scope)
        .order('created_at', { ascending: true });
      categories = reFetched || [];
    }

    return res.json({ success: true, categories: categories || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/settings/categories
router.post('/categories', async (req, res) => {
  const { category_name, scope = 'web_dev' } = req.body;
  if (!category_name) return res.status(400).json({ success: false, message: 'category_name is required' });

  try {
    const { data, error } = await supabase
      .from('discovery_categories')
      .insert([{ category_name, scope, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, category: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/settings/categories/:id
router.patch('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const { data, error } = await supabase
      .from('discovery_categories')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, category: data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/settings/categories/:id
router.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('discovery_categories').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
