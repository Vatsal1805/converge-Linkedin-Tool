import React, { useState, useEffect } from 'react';
import { MapPin, Tag, Plus, Trash2, CheckCircle2, XCircle, RefreshCw, Shield, Globe, Layers, AlertCircle } from 'lucide-react';

export default function Settings() {
  const [locations, setLocations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeScope, setActiveScope] = useState('web_dev'); // 'web_dev' | 'aradhya' | 'competitor_research'
  const [loadingLocs, setLoadingLocs] = useState(false);
  const [loadingCats, setLoadingCats] = useState(false);

  // New location/category input state
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Locations
  const fetchLocations = async () => {
    setLoadingLocs(true);
    try {
      const res = await fetch('/api/settings/locations?scope=all');
      const data = await res.json();
      if (data.success) {
        setLocations(data.locations || []);
      }
    } catch (err) {
      console.error('Failed to load locations:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async (scope) => {
    setLoadingCats(true);
    try {
      const res = await fetch(`/api/settings/categories?scope=${scope}`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingCats(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchCategories(activeScope);
  }, [activeScope]);

  // Toggle Location Active
  const toggleLocation = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/settings/locations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setLocations(locations.map(loc => loc.id === id ? data.location : loc));
        showSuccess('Location updated!');
      }
    } catch (err) {
      showError('Failed to update location');
    }
  };

  // Add Location
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    try {
      const res = await fetch('/api/settings/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_name: newLocation.trim(), scope: 'global' })
      });
      const data = await res.json();
      if (data.success) {
        setLocations([...locations, data.location]);
        setNewLocation('');
        showSuccess(`Added location "${data.location.location_name}"`);
      }
    } catch (err) {
      showError('Failed to add location');
    }
  };

  // Delete Location
  const handleDeleteLocation = async (id) => {
    try {
      const res = await fetch(`/api/settings/locations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLocations(locations.filter(loc => loc.id !== id));
        showSuccess('Location removed');
      }
    } catch (err) {
      showError('Failed to delete location');
    }
  };

  // Toggle Category Active
  const toggleCategory = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/settings/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.map(cat => cat.id === id ? data.category : cat));
        showSuccess('Category updated!');
      }
    } catch (err) {
      showError('Failed to update category');
    }
  };

  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const res = await fetch('/api/settings/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: newCategory.trim(), scope: activeScope })
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.category]);
        setNewCategory('');
        showSuccess(`Added category "${data.category.category_name}"`);
      }
    } catch (err) {
      showError('Failed to add category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`/api/settings/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories(categories.filter(cat => cat.id !== id));
        showSuccess('Category removed');
      }
    } catch (err) {
      showError('Failed to delete category');
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary-400" />
            Lead Discovery & Target Settings
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Configure dynamic search locations & target niches for automated daily lead discovery.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          {errorMsg}
        </div>
      )}

      {/* SECTION 1: DYNAMIC TARGET LOCATIONS */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[#23232F] pb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Target Discovery Locations</h2>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {locations.filter(l => l.is_active).length} Active Locations
          </span>
        </div>

        {/* Add Location Form */}
        <form onSubmit={handleAddLocation} className="flex gap-3">
          <input
            type="text"
            placeholder="Add new location (e.g. New York, NY or Toronto, Canada)"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            className="flex-1 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Locations Grid */}
        {loadingLocs ? (
          <div className="text-center py-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading locations...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  loc.is_active
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                    : 'bg-[#1A1A22]/50 border-[#23232F] text-gray-400 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLocation(loc.id, loc.is_active)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                      loc.is_active
                        ? 'bg-indigo-500 border-indigo-400 text-white'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {loc.is_active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm font-medium">{loc.location_name}</span>
                </div>

                <button
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-1 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 rounded transition"
                  title="Remove location"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: DYNAMIC NICHE CATEGORIES */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#23232F] pb-4 gap-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Target Niche Categories</h2>
          </div>

          {/* Scope Selector Tabs */}
          <div className="flex items-center gap-1 bg-[#1A1A22] p-1 rounded-xl border border-[#2B2B3A]">
            <button
              onClick={() => setActiveScope('web_dev')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeScope === 'web_dev'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Web Dev & Speed
            </button>
            <button
              onClick={() => setActiveScope('aradhya')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeScope === 'aradhya'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Aradhya AI Video
            </button>
            <button
              onClick={() => setActiveScope('competitor_research')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeScope === 'competitor_research'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Competitor Research
            </button>
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAddCategory} className="flex gap-3">
          <input
            type="text"
            placeholder={`Add new ${activeScope.replace('_', ' ')} category (e.g. MedSpas, Dental Clinics...)`}
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </form>

        {/* Categories Grid */}
        {loadingCats ? (
          <div className="text-center py-6 text-gray-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                  cat.is_active
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                    : 'bg-[#1A1A22]/50 border-[#23232F] text-gray-400 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleCategory(cat.id, cat.is_active)}
                    className={`w-5 h-5 rounded flex items-center justify-center border transition ${
                      cat.is_active
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-gray-600 bg-transparent'
                    }`}
                  >
                    {cat.is_active && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-sm font-medium">{cat.category_name}</span>
                </div>

                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1 hover:bg-rose-500/20 text-gray-500 hover:text-rose-400 rounded transition"
                  title="Remove category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: SYSTEM INTEGRATIONS */}
      <div className="bg-[#121216] border border-[#23232F] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#23232F] pb-3">
          <Shield className="w-5 h-5 text-sky-400" />
          <h2 className="text-lg font-semibold text-white">System APIs & Integrations Status</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl text-sm font-mono">
            <span>Supabase Database (Leads, Comps)</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Connected</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl text-sm font-mono">
            <span>Google Places API (New)</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl text-sm font-mono">
            <span>Google PageSpeed Insights API</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#1A1A22] border border-[#2B2B3A] rounded-xl text-sm font-mono">
            <span>Meta Ad Library API</span>
            <span className="px-2.5 py-1 rounded bg-sky-500/10 text-sky-400 text-xs border border-sky-500/20">Grounded Search</span>
          </div>
        </div>
      </div>
    </div>
  );
}
