import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Option A: Direct Google Sheets API Integration (using Google Service Account)
 * Also supports Webhook URL as fallback.
 */
/**
 * Universal Phone Sanitizer for all Global Country Codes (+1 US, +971 UAE, +44 UK, +91 India, +61 AU)
 * Ensures Google Sheets NEVER evaluates international phone numbers as subtraction formulas.
 */
function formatUniversalPhoneNumber(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return 'No Phone';
  
  // Clean whitespace & control characters
  let clean = rawPhone.trim();
  if (!clean || clean.toLowerCase() === 'n/a' || clean.toLowerCase() === 'null') return 'No Phone';

  // Always prefix with single quote `'` so Google Sheets treats all country codes (+1, +971, +44, +91, +61) as plain text
  if (!clean.startsWith("'")) {
    clean = `'${clean}`;
  }
  return clean;
}

export async function syncLeadToGoogleSheet(lead) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

  const cleanPhone = formatUniversalPhoneNumber(lead.phone_number);

  // Exact column order matching user's Google Sheet
  const leadRow = {
    Date: new Date().toLocaleDateString(),
    Type: lead.lead_type || 'web_dev',
    'Business Name': lead.business_name || '',
    Niche: lead.niche || '',
    Location: lead.city_state || '',
    Rating: lead.rating || '',
    'Google Maps URL': lead.google_map_url || '',
    Phone: cleanPhone,
    Email: lead.email || '',
    'Website URL': lead.website_url || 'No Website',
    'Qualification Reason': lead.qualification_reason || ''
  };

  // 1. Direct Option A: Google Sheets API
  if (sheetId && clientEmail && privateKey && !sheetId.includes('placeholder')) {
    try {
      console.log(`[Google Sheets API] Syncing "${lead.business_name}" to Sheet ID ${sheetId}...`);
      
      const serviceAccountAuth = new JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
      await doc.loadInfo();

      const sheet = doc.sheetsByIndex[0];
      await sheet.addRow(leadRow);

      console.log(`[Google Sheets API] Successfully appended "${lead.business_name}" to Google Sheet.`);
      return true;
    } catch (err) {
      console.error('[Google Sheets API Error]:', err.message);
    }
  }

  // 2. Fallback: Google Apps Script Webhook
  if (webhookUrl && !webhookUrl.includes('placeholder')) {
    try {
      console.log(`[Google Sheets Webhook] Syncing "${lead.business_name}" to Webhook...`);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: leadRow.Date,
          lead_type: leadRow.Type,
          business_name: leadRow['Business Name'],
          niche: leadRow.Niche,
          city_state: leadRow.Location,
          rating: leadRow.Rating,
          google_map_url: leadRow['Google Maps URL'],
          phone_number: leadRow.Phone,
          email: leadRow.Email,
          website_url: leadRow['Website URL'],
          qualification_reason: leadRow['Qualification Reason']
        })
      });

      if (response.ok) {
        console.log(`[Google Sheets Webhook] Successfully synced "${lead.business_name}".`);
        return true;
      }
    } catch (err) {
      console.error('[Google Sheets Webhook Error]:', err.message);
    }
  }

  return false;
}
