import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const modelsToTest = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest'
];

async function testWorkingModels() {
  console.log('[Gemini Test] Testing active models...');

  for (const model of modelsToTest) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello, respond with "OK"' }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        console.log(`✅ Model '${model}' WORKS PERFECTLY! Response: "${text}"`);
      } else {
        const err = await response.text();
        console.warn(`❌ Model '${model}' error: ${err.substring(0, 100)}`);
      }
    } catch (e) {
      console.error(`❌ Model '${model}' error: ${e.message}`);
    }
  }
}

testWorkingModels();
