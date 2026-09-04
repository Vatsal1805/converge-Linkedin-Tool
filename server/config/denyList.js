/**
 * Maintained deny-list array of known large/national brands to exclude
 * from the Aradhya AI Video lead pipeline.
 * User can manually add brand names here.
 */
export const LARGE_BRAND_DENY_LIST = [
  'equinox',
  'laseraway',
  'glow recipe',
  'youth to the people',
  'sephora',
  'ultabeauty',
  'f45 training',
  'orangetheory',
  'planet fitness',
  'gold\'s gym',
  'lululemon',
  'gymshark'
];

/**
 * Checks if a business name matches any entry in the deny list
 * @param {string} businessName 
 * @returns {boolean}
 */
export function isDeniedBrand(businessName) {
  if (!businessName) return false;
  const normalized = businessName.toLowerCase().trim();
  return LARGE_BRAND_DENY_LIST.some(brand => normalized.includes(brand));
}
