import express from 'express';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Helper: Call AI (Direct Gemini 3.5 Flash first, then OpenRouter fallbacks)
async function callAI(systemPrompt, userPrompt, messagesHistory = []) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openRouterKey = process.env.OPENROUTER_API_KEY;

  // 1. Primary: Direct Gemini 3.5 Flash API Call (Free & Ultra Fast)
  if (geminiKey && !geminiKey.includes('placeholder')) {
    try {
      console.log('[AI Call] Trying direct Gemini 3.5 Flash API...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const fullPrompt = `${systemPrompt}\n\nUser Request: ${userPrompt}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature: 0.65, maxOutputTokens: 1200 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const errText = await response.text();
        console.warn('[Gemini Generator Warning]:', errText.substring(0, 150));
      }
    } catch (err) {
      console.error('[Gemini Generator Error]:', err.message);
    }
  }

  // 2. Secondary: OpenRouter Fallback Chain (Active Free/Valid Slugs)
  if (openRouterKey && !openRouterKey.includes('placeholder')) {
    const openRouterModels = [
      'google/gemini-2.5-flash-lite',
      'deepseek/deepseek-chat',
      'qwen/qwen-2.5-72b-instruct'
    ];

    const payloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messagesHistory,
      { role: 'user', content: userPrompt }
    ];

    for (const model of openRouterModels) {
      try {
        console.log(`[AI Call] Trying OpenRouter model: ${model}`);
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://convergedigitals.com',
            'X-Title': 'Converge LinkedIn Engine',
          },
          body: JSON.stringify({
            model: model,
            messages: payloadMessages,
            temperature: 0.65,
            max_tokens: 1200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) return content;
        } else {
          const errText = await response.text();
          console.warn(`[AI Warning] Model ${model} returned error:`, errText.substring(0, 150));
        }
      } catch (err) {
        console.error(`[AI Error] Failed calling ${model}:`, err.message);
      }
    }
  }

  return null;
}

// Build 210-Character Hook Library & Humanized System Prompt
function getHumanizedSystemPrompt(pillar, formatMode) {
  const isOffer = pillar === 'offer';
  const isProof = pillar === 'proof';
  const isAradhya = pillar === 'aradhya';

  return `You are an elite B2B LinkedIn copywriter and partner at Converge Digitals, a digital marketing & AI engineering agency. You write high-authority, authentic posts that convert cold international and local prospects into inbound DMs.

CRITICAL HOOK MECHANIC (THE FIRST 210 CHARACTERS):
LinkedIn cuts off every post after ~210 characters (lines 1-2) with a "...see more" button. You MUST obsess over lines 1 & 2. The hook MUST trigger curiosity or state a specific result to force the reader to click "...see more".

PILLAR-SPECIFIC HOOK FORMULAS:
${isOffer ? '- OFFER HOOK: Specific price anchor + turnaround + targeted pain point. Example: "Web Development starting at $1,500. 10-day turnaround. If your homepage takes >3s to load, you are losing international deals."' : ''}
${isProof ? '- PROOF HOOK: Concrete numbers + before-state transformation. Example: "Gelato\'s website was taking 3.4 seconds to load. We swapped their CMS to Next.js + Supabase. Result: 380ms load time and 140% traffic boost."' : ''}
${isAradhya ? '- ARADHYA HOOK: Transformation curiosity + AI video comparison. Example: "We spent 20 hours testing AI video shorts vs $5k studio shoots. Here is what viewer retention graphs showed."' : ''}
${pillar === 'authority' ? '- AUTHORITY HOOK: Contrarian industry truth or uncomfortable fact. Example: "Unpopular opinion: 90% of agency website redesigns fail because founders focus on logo colors instead of LCP load speed."' : ''}

STRICT ANTI-AI SLOP BANNED WORDS LIST:
Never use any of these cliché AI words: "delve", "game-changer", "unleash", "harness", "tapestry", "revolutionize", "secret sauce", "mastering", "in today's digital world", "let that sink in". If you use any of these, the output is invalid.

TONE & FORMAT RULES:
- Write like a sharp agency builder texting a peer — confident, concise, zero corporate fluff.
- Vary sentence length (mix short punchy lines like "We tested it. It failed." with medium explanatory lines).
- EMOJI RULE: Maximum 1 or 2 functional emojis per post (e.g. 💰 or ⏱ for offer pricing). STRICTLY BAN emoji bullet points (🚀, 💡, 🔥 at line starts).
${isOffer ? '- CTA & PRICING: Include price anchor ("starting at $X") and turnaround time ("delivered in Y business days"). Direct CTA ("DM us \'GROWTH\' to claim your slot").' : '- CTA: Soft engagement CTA ("Sound familiar? What\'s your take?").'}
${formatMode === 'outline' ? '- FORMAT: Generate bulleted structural outline and key talking points.' : '- FORMAT: Generate full ready-to-post LinkedIn text.'}

FEW-SHOT HUMAN POST EXAMPLES:

Example 1 (Proof):
"Gelato's website was taking 3.4 seconds to load.

We rebuilt their platform using Next.js, Tailwind, and Supabase.

The results:
- 380ms load time
- 140% organic traffic increase in 60 days
- 8 new inbound DM inquiries in week 1

If your site takes more than 3 seconds to load on mobile, you're handing clients to your competitors.

Sound familiar? Drop a comment below."

Example 2 (Offer):
"High-Converting Web Development for growing brands.

Starting at $1,500 | 10-day turnaround.

What's included:
- Custom Next.js & React architecture
- Core Web Vitals optimization (<500ms load time)
- Seamless DM conversion funnel setup

If your current site looks like a 2020 brochure, it's time to upgrade.

DM us 'WEB' to view our recent client demos."

TASK: Generate EXACTLY 3 distinct draft variations for the requested topic under the ${pillar.toUpperCase()} pillar.
Return PURE JSON format: {"draft_1": "...", "draft_2": "...", "draft_3": "..."}`;
}

// 1. Fetch 5 Idea Cards for today's pillar from Supabase
router.get('/ideas', async (req, res) => {
  const { pillar = 'offer' } = req.query;

  try {
    const { data: ideas, error } = await supabase
      .from('idea_bank')
      .select('*')
      .eq('pillar', pillar)
      .order('times_used', { ascending: true })
      .order('last_used_date', { ascending: true, nullsFirst: true })
      .limit(5);

    if (error) throw error;
    return res.json({ success: true, ideas: ideas || [] });
  } catch (err) {
    console.error('Error fetching ideas:', err.message);
    return res.json({ success: true, ideas: [] });
  }
});

// 2. Generate 3 Draft Variations using OpenRouter with Humanized 210-Char Hook System Prompt
router.post('/generate', async (req, res) => {
  const { ideaText, pillar = 'offer', formatMode = 'full' } = req.body;

  if (!ideaText) {
    return res.status(400).json({ success: false, message: 'Idea text is required' });
  }

  const systemPrompt = getHumanizedSystemPrompt(pillar, formatMode);
  const userPrompt = `Topic: "${ideaText}". Generate 3 distinct draft variations for the "${pillar}" pillar. Return pure JSON: {"draft_1": "...", "draft_2": "...", "draft_3": "..."}`;

  try {
    const rawResult = await callAI(systemPrompt, userPrompt);

    if (rawResult) {
      try {
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            success: true,
            draft_1: parsed.draft_1,
            draft_2: parsed.draft_2,
            draft_3: parsed.draft_3,
          });
        }
      } catch (parseErr) {
        console.warn('Could not parse AI JSON, building formatted variations');
      }
    }

    // High quality human fallback
    const isOffer = pillar === 'offer';
    const cta = isOffer ? 'DM us "GROWTH" to claim your slot.' : 'Sound familiar? What\'s your take?';
    const priceLine = isOffer ? '\n\n💰 Packages starting at $1,500 | ⏱ Delivered in 10 business days.\n' : '';

    return res.json({
      success: true,
      draft_1: `Most brands make this fatal mistake on LinkedIn:\n\nThey pitch before proving value.\n\nRegarding "${ideaText}":\n\n1. Audit conversion friction\n2. Ship custom Next.js/React architecture\n3. Automate inbound lead qualification${priceLine}\n${cta}`,
      draft_2: `Stop building websites that look like 2020 brochures.\n\nInternational clients care about 3 things:\n- Speed (<500ms load time)\n- Clean modern aesthetics\n- Seamless DM conversion funnels\n\nRegarding ${ideaText}:${priceLine}\nReady to transform your online presence? ${cta}`,
      draft_3: `3 things we learned shipping ${ideaText} for our agency clients:\n\n- Aesthetics sell the first impression\n- Page speed closes international deals\n- Automated workflows keep ops lean${priceLine}\n${cta}`
    });

  } catch (err) {
    console.error('Error generating drafts:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Conversational Draft Refinement Chat
router.post('/refine-chat', async (req, res) => {
  const { postId, currentDraft, pillar, userMessage, chatHistory = [] } = req.body;

  if (!userMessage || !currentDraft) {
    return res.status(400).json({ success: false, message: 'Current draft and user message are required' });
  }

  const systemPrompt = `You are an expert B2B LinkedIn copywriter for Converge Digitals assisting the team in refining a post draft.
Pillar: ${pillar?.toUpperCase() || 'GENERAL'}

CURRENT DRAFT:
"""
${currentDraft}
"""

REFINEMENT RULES:
1. Apply the user's requested edit (e.g. "make it 20% shorter", "make the hook punchier", "remove pricing").
2. Retain the 210-character hook obsession and humanized agency voice (no cliché words like 'delve', 'game-changer', or emoji spam).
3. Return the COMPLETE updated draft text in your reply so the user can click "Use This Version".`;

  const historyForAI = chatHistory.map(item => ({
    role: item.role === 'user' ? 'user' : 'assistant',
    content: item.message || item.content
  }));

  try {
    const updatedDraft = await callAI(systemPrompt, userMessage, historyForAI);
    const finalResponseText = updatedDraft || `Here is the refined version of your draft based on your request ("${userMessage}"):\n\n${currentDraft}`;

    if (postId && !postId.startsWith('temp-')) {
      try {
        await supabase.from('draft_chats').insert([
          { post_id: postId, role: 'user', message: userMessage },
          { post_id: postId, role: 'assistant', message: finalResponseText }
        ]);
      } catch (dbErr) {
        console.warn('Could not save draft chat:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: finalResponseText,
      updatedDraft: finalResponseText
    });
  } catch (err) {
    console.error('Error in refine-chat:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Save Selected Draft to Supabase
router.post('/save-post', async (req, res) => {
  const { pillar, daySlot, ideaText, selectedDraft, draft1, draft2, draft3, ideaId } = req.body;

  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          pillar: pillar || 'offer',
          day_slot: daySlot || 'tue',
          idea_text: ideaText,
          selected_draft: selectedDraft,
          draft_1: draft1,
          draft_2: draft2,
          draft_3: draft3,
          status: 'draft',
        }
      ])
      .select()
      .single();

    if (error) throw error;

    if (ideaId) {
      await supabase
        .from('idea_bank')
        .update({
          times_used: 1,
          last_used_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', ideaId);
    }

    return res.json({ success: true, post });
  } catch (err) {
    console.error('Error saving post:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
