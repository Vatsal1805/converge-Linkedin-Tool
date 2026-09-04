import dotenv from 'dotenv';
dotenv.config();

/**
 * Service to interact with Google Places API (New)
 * Endpoints used:
 * - Text Search: https://places.googleapis.com/v1/places:searchText
 * - Place Details: https://places.googleapis.com/v1/places/{placeId}
 */

/**
 * Searches candidate businesses for a target niche and location using Google Places API (New)
 * @param {string} niche - e.g., "Dental Clinics"
 * @param {string} location - e.g., "Miami, FL"
 * @param {number} maxResults - max results to fetch (default 10)
 * @returns {Promise<Array>} List of place objects
 */
export async function searchPlaces(niche, location, maxResults = 10) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_PLACES_API_KEY is missing in environment variables');
  }

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const query = `${niche} in ${location}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.internationalPhoneNumber,places.businessStatus,places.googleMapsUri'
      },
      body: JSON.stringify({
        textQuery: query,
        pageSize: maxResults
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Places API Text Search Error] ${response.status}: ${errText}`);
      return [];
    }

    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error('[Places API Text Search Failed]:', error.message);
    return [];
  }
}

/**
 * Fetches authoritative Place Details for a specific place_id
 * @param {string} placeId 
 * @returns {Promise<Object|null>} Detailed place object
 */
export async function getPlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !placeId) return null;

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,rating,userRatingCount,websiteUri,internationalPhoneNumber,businessStatus,googleMapsUri,photos'
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[Places Details Error] ${response.status}: ${errText}`);
      return null;
    }

    const place = await response.json();
    return place;
  } catch (error) {
    console.error('[Places Details Failed]:', error.message);
    return null;
  }
}
