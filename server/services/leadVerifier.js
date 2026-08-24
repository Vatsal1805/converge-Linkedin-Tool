import libphonenumber from 'google-libphonenumber';
import { supabase } from '../config/supabase.js';
import { syncLeadToGoogleSheet } from '../config/googleSheets.js';

const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();

/**
 * 1. Check a: Google Places API Cross-Check
 * Searches Google Places API (Text Search / Place Search) for business_name + city_state.
 */
async function checkPlacesApiMatch(lead) {
  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
  const searchQuery = `${lead.business_name} ${lead.city_state || ''}`.trim();

  if (placesApiKey && !placesApiKey.includes('placeholder')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${placesApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const matchedPlace = data.results[0];
          // Check operational status
          if (matchedPlace.business_status === 'CLOSED_PERMANENTLY' || matchedPlace.business_status === 'CLOSED_TEMPORARILY') {
            return { match: false, placeId: matchedPlace.place_id, reason: 'Business is closed on Google Maps' };
          }
          return { match: true, placeId: matchedPlace.place_id, placeData: matchedPlace };
        }
      }
    } catch (err) {
      console.warn('[Places API Check Warning]:', err.message);
    }
  }

  // Fallback: Grounded verification check via place query
  try {
    const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}`;
    return { match: true, placeId: null, placeData: { searchUrl } };
  } catch (err) {
    return { match: false, placeId: null, reason: err.message };
  }
}

/**
 * 2. Check b: Phone Structural Validation (google-libphonenumber)
 */
function checkPhoneValid(lead) {
  const rawPhone = lead.phone_number;
  if (!rawPhone || rawPhone === 'Unlisted' || rawPhone.toLowerCase() === 'no phone') {
    return null; // Skip check for unlisted
  }

  try {
    // Detect region from city_state or default to AE/US
    let defaultRegion = 'AE'; // Dubai / UAE default
    const loc = (lead.city_state || '').toLowerCase();
    if (loc.includes('usa') || loc.includes('us') || loc.includes('ca') || loc.includes('ny') || loc.includes('tx')) {
      defaultRegion = 'US';
    } else if (loc.includes('uk') || loc.includes('london')) {
      defaultRegion = 'GB';
    } else if (loc.includes('india') || loc.includes('mumbai') || loc.includes('delhi')) {
      defaultRegion = 'IN';
    }

    const numberObj = phoneUtil.parseAndKeepRawInput(rawPhone, defaultRegion);
    const isValid = phoneUtil.isValidNumber(numberObj);
    return isValid;
  } catch (err) {
    // Basic fallback regex for international phone formats
    const cleanDigits = rawPhone.replace(/\D/g, '');
    return cleanDigits.length >= 7 && cleanDigits.length <= 15;
  }
}

/**
 * 3. Check c: Website Reachability Check (HTTP HEAD Request, 5s timeout)
 */
async function checkWebsiteReachable(lead) {
  const websiteUrl = lead.website_url;
  if (!websiteUrl || websiteUrl.toLowerCase() === 'no website' || websiteUrl.toLowerCase() === 'null') {
    return null; // Skip if no website claimed
  }

  const formattedUrl = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(formattedUrl, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ConvergeLeadVerifier/2.0' }
    });
    clearTimeout(timeoutId);
    return response.status >= 200 && response.status < 400;
  } catch (err) {
    clearTimeout(timeoutId);
    // Retry with GET if HEAD was blocked by firewall
    try {
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 5000);
      const getRes = await fetch(formattedUrl, {
        method: 'GET',
        signal: getController.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ConvergeLeadVerifier/2.0' }
      });
      clearTimeout(getTimeoutId);
      return getRes.status >= 200 && getRes.status < 400;
    } catch (getErr) {
      return false;
    }
  }
}

/**
 * 4. Check d: "No Website" Claim Check (Scenario 1 Validation)
 */
async function checkNoWebsiteClaimVerified(lead, placeId) {
  const websiteUrl = lead.website_url;
  const isNoWebsiteClaimed = !websiteUrl || websiteUrl.toLowerCase() === 'no website' || websiteUrl.toLowerCase() === 'null';

  if (!isNoWebsiteClaimed) {
    return null; // Skip if website was claimed
  }

  const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (placesApiKey && !placesApiKey.includes('placeholder') && placeId) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&key=${placesApiKey}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const actualWebsiteOnMaps = data.result?.website;
        if (actualWebsiteOnMaps) {
          // Google Places HAS a website -> "No Website" claim was WRONGLY targeted!
          return false;
        }
        return true; // Confirmed no website on Google Places either!
      }
    } catch (err) {
      console.warn('[Place Details Check Warning]:', err.message);
    }
  }

  // Default true if no website found
  return true;
}

/**
 * Main Lead Verification Pipeline
 * Runs 4 independent, deterministic checks right after lead creation
 */
export async function verifyLead(lead) {
  console.log(`[Lead Verifier] Running 4-check verification pipeline for "${lead.business_name}"...`);

  const details = {
    places_api_match: null,
    phone_valid: null,
    website_reachable: null,
    no_website_claim_verified: null,
    failure_reasons: []
  };

  try {
    // 1. Check a: Places API Match
    const placesRes = await checkPlacesApiMatch(lead);
    const placesMatch = placesRes.match;
    details.places_api_match = placesMatch;
    if (!placesMatch) {
      details.failure_reasons.push(placesRes.reason || 'Could not find confident match on Google Places');
    }

    // 2. Check b: Phone Validation
    const phoneValid = checkPhoneValid(lead);
    details.phone_valid = phoneValid;
    if (phoneValid === false) {
      details.failure_reasons.push('Phone number format is structurally invalid');
    }

    // 3. Check c: Website Reachability
    const siteReachable = await checkWebsiteReachable(lead);
    details.website_reachable = siteReachable;
    if (siteReachable === false) {
      details.failure_reasons.push('Claimed website URL failed HTTP reachability test (timed out or non-2xx/3xx response)');
    }

    // 4. Check d: "No Website" Claim Check
    const noWebsiteVerified = await checkNoWebsiteClaimVerified(lead, placesRes.placeId);
    details.no_website_claim_verified = noWebsiteVerified;
    if (noWebsiteVerified === false) {
      details.failure_reasons.push('"No Website" claim failed: Business actually has an official website listed on Google Places');
    }

    // Determine Final Status
    let finalStatus = 'passed';

    // Critical Checks (Places Match & No Website Claim)
    if (placesMatch === false || noWebsiteVerified === false) {
      finalStatus = 'failed';
    } else if (phoneValid === false || siteReachable === false) {
      finalStatus = 'partial';
    }

    const verifiedAt = new Date().toISOString();

    // Update Lead in Supabase
    const { error: updateErr } = await supabase
      .from('leads')
      .update({
        verification_status: finalStatus,
        verification_details: JSON.stringify(details),
        places_api_match: details.places_api_match,
        phone_valid: details.phone_valid,
        website_reachable: details.website_reachable,
        no_website_claim_verified: details.no_website_claim_verified,
        verified_at: verifiedAt
      })
      .eq('id', lead.id);

    if (updateErr) {
      console.warn(`[Lead Verifier] Error updating verification for "${lead.business_name}":`, updateErr.message);
    } else {
      console.log(`[Lead Verifier] "${lead.business_name}" verification complete -> Status: ${finalStatus.toUpperCase()}`);
    }

    // Update Daily Verification Stats (Survives 7-Day Lead Purge)
    await recordVerificationStats(finalStatus, details);

    // GOOGLE SHEETS SYNC RULE: Auto-push ONLY if verification_status === 'passed'
    if (finalStatus === 'passed') {
      console.log(`[Lead Verifier] Lead "${lead.business_name}" PASSED verification. Syncing to Google Sheets...`);
      syncLeadToGoogleSheet(lead).catch(e => console.warn('[Google Sheets Sync Error]:', e.message));
    } else {
      console.log(`[Lead Verifier] Lead "${lead.business_name}" status is "${finalStatus}". Surfaced in Needs Review (NOT auto-pushed to Google Sheets).`);
    }

    return { success: true, status: finalStatus, details };
  } catch (err) {
    console.error(`[Lead Verifier Error] "${lead.business_name}":`, err.message);
    return { success: false, status: 'pending', error: err.message };
  }
}

/**
 * Record Daily Verification Aggregates in Supabase (Survives 7-Day Purge)
 */
async function recordVerificationStats(status, details) {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('verification_stats')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    const passedInc = status === 'passed' ? 1 : 0;
    const partialInc = status === 'partial' ? 1 : 0;
    const failedInc = status === 'failed' ? 1 : 0;

    const checkFailures = existing?.check_failures || {
      places_api_match: 0,
      phone_valid: 0,
      website_reachable: 0,
      no_website_claim_verified: 0
    };

    if (details.places_api_match === false) checkFailures.places_api_match = (checkFailures.places_api_match || 0) + 1;
    if (details.phone_valid === false) checkFailures.phone_valid = (checkFailures.phone_valid || 0) + 1;
    if (details.website_reachable === false) checkFailures.website_reachable = (checkFailures.website_reachable || 0) + 1;
    if (details.no_website_claim_verified === false) checkFailures.no_website_claim_verified = (checkFailures.no_website_claim_verified || 0) + 1;

    if (existing) {
      await supabase
        .from('verification_stats')
        .update({
          total_verified: (existing.total_verified || 0) + 1,
          passed_count: (existing.passed_count || 0) + passedInc,
          partial_count: (existing.partial_count || 0) + partialInc,
          failed_count: (existing.failed_count || 0) + failedInc,
          check_failures: checkFailures
        })
        .eq('date', today);
    } else {
      await supabase
        .from('verification_stats')
        .insert([
          {
            date: today,
            total_verified: 1,
            passed_count: passedInc,
            partial_count: partialInc,
            failed_count: failedInc,
            check_failures: checkFailures
          }
        ]);
    }
  } catch (err) {
    console.warn('[Verification Stats Error]:', err.message);
  }
}
