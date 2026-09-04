import dotenv from 'dotenv';
dotenv.config();

/**
 * Service to analyze website speed & performance using Google PageSpeed Insights API
 * Endpoint: https://www.googleapis.com/pagespeedonline/v5/runPagespeed
 */

/**
 * Analyzes a URL with Google PageSpeed Insights
 * @param {string} targetUrl - Full URL to analyze
 * @param {string} strategy - 'mobile' or 'desktop' (default 'mobile')
 * @returns {Promise<{lcpMs: number|null, performanceScore: number|null, rawMetrics?: Object}>}
 */
export async function analyzePageSpeed(targetUrl, strategy = 'mobile') {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey || !targetUrl) {
    return { lcpMs: null, performanceScore: null };
  }

  // Ensure targetUrl has protocol
  let urlToTest = targetUrl.trim();
  if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
    urlToTest = `https://${urlToTest}`;
  }

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(urlToTest)}&key=${apiKey}&strategy=${strategy}&category=PERFORMANCE`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s safety timeout

    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[PageSpeed API Warning] ${response.status} for ${urlToTest}: ${errText.substring(0, 150)}`);
      return { lcpMs: null, performanceScore: null };
    }

    const data = await response.json();
    const lighthouse = data?.lighthouseResult;
    if (!lighthouse) return { lcpMs: null, performanceScore: null };

    // Extract LCP in milliseconds
    const lcpAudit = lighthouse.audits?.['largest-contentful-paint'];
    const lcpMs = lcpAudit?.numericValue ? Math.round(lcpAudit.numericValue) : null;

    // Extract overall Performance Score (0-100)
    const perfCategory = lighthouse.categories?.performance;
    const performanceScore = perfCategory?.score !== undefined ? Math.round(perfCategory.score * 100) : null;

    return {
      lcpMs,
      performanceScore,
      lcpDisplayValue: lcpAudit?.displayValue || null
    };
  } catch (error) {
    console.error(`[PageSpeed Analysis Error for ${urlToTest}]:`, error.message);
    return { lcpMs: null, performanceScore: null };
  }
}
