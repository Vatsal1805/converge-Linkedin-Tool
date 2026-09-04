import { checkMetaAds } from './adIntelligence.js';

/**
 * Evaluates alternate service opportunities for businesses with good, fast websites.
 * Performs deterministic API checks for Meta Ads, GBP freshness, and homepage HTML tags.
 * 
 * @param {Object} place - Google Place object from Place Details
 * @param {string} websiteUrl - Authoritative website URL
 * @returns {Promise<{primaryAlternateService: string, signals: Object}>}
 */
export async function evaluateAlternateSignals(place, websiteUrl) {
  const signals = {
    hasMetaAds: false,
    metaAds90DaysCount: 0,
    gbpPhotoCount: place?.photos?.length || 0,
    gbpRatingCount: place?.userRatingCount || 0,
    hasWhatsApp: false,
    hasBookingSystem: false,
    isHttps: false,
    missingSignals: []
  };

  let primaryAlternateService = 'local_seo_reputation'; // default fallback alternate service

  // 1. Meta Ad Library Check (using existing adIntelligence service if available)
  if (place?.displayName?.text || place?.displayName) {
    const businessName = typeof place.displayName === 'string' ? place.displayName : place.displayName?.text;
    try {
      const adResult = await checkMetaAds(businessName);
      if (adResult && adResult.activeAdsCount !== undefined) {
        signals.hasMetaAds = adResult.activeAdsCount > 0;
        signals.metaAds90DaysCount = adResult.activeAdsCount;
      }
    } catch (err) {
      console.warn('[Alternate Signals] Meta Ads check skipped:', err.message);
    }
  }

  // If 0 ads found in Meta Ad Library -> High intent candidate for Performance Marketing (Paid Ads)
  if (signals.metaAds90DaysCount === 0) {
    primaryAlternateService = 'performance_marketing';
    signals.missingSignals.push('No active Meta ads in last 90 days');
  }

  // 2. GBP Freshness Check
  if (signals.gbpPhotoCount < 5 || signals.gbpRatingCount < 15) {
    if (primaryAlternateService === 'local_seo_reputation' || !primaryAlternateService) {
      primaryAlternateService = 'local_seo_reputation';
    }
    signals.missingSignals.push('Stale or incomplete Google Business Profile (few photos/reviews)');
  }

  // 3. Homepage HTML Inspection
  if (websiteUrl) {
    try {
      let fullUrl = websiteUrl.trim();
      if (!fullUrl.startsWith('http')) fullUrl = `https://${fullUrl}`;

      signals.isHttps = fullUrl.startsWith('https://');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(fullUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ConvergeEngine/1.0' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = (await response.text()).toLowerCase();

        // WhatsApp check
        signals.hasWhatsApp = html.includes('wa.me/') || html.includes('api.whatsapp.com') || html.includes('whatsapp');
        if (!signals.hasWhatsApp) signals.missingSignals.push('No WhatsApp widget / wa.me link found');

        // Booking platform check (Calendly, Acuity, Mindbody, Zocdoc, Booksy, SimplyBook, etc.)
        const bookingKeywords = ['calendly.com', 'acuityscheduling.com', 'mindbodyonline.com', 'zocdoc.com', 'booksy.com', 'booking', 'schedule-appointment', 'book-now'];
        signals.hasBookingSystem = bookingKeywords.some(keyword => html.includes(keyword));
        if (!signals.hasBookingSystem) signals.missingSignals.push('No automated online booking system detected');
      }
    } catch (err) {
      console.warn(`[Alternate Signals HTML Fetch Warning] ${websiteUrl}:`, err.message);
    }
  }

  return {
    primaryAlternateService,
    signals
  };
}
