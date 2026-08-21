import express from 'express';
import { supabase } from '../config/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Helper: Call OpenRouter for summarizing repo into post idea
async function generateRepoIdea(repoName, description, techStack, pillar) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    if (pillar === 'proof') return `Case Study: How we built ${repoName} using ${techStack.join(', ')} to boost client conversions.`;
    if (pillar === 'aradhya') return `Behind the scenes: Building ${repoName} — our custom AI pipeline for 4K video generation.`;
    return `Technical Breakdown: Why we chose ${techStack.slice(0, 2).join(' & ')} for scaling ${repoName}.`;
  }

  const systemPrompt = `You are a B2B LinkedIn copywriter for Converge Digitals. Generate 1 punchy post idea sentence for our ${pillar.toUpperCase()} pillar based on a shipped GitHub project.`;
  const userPrompt = `Project Name: "${repoName}"
Description: "${description || 'Web development and AI project'}"
Tech Stack: ${techStack.join(', ')}

Generate 1 idea sentence showing client value and technical capability.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices?.[0]?.message?.content || `Case Study: Shipping ${repoName} built with ${techStack.join(', ')}.`;
    }
  } catch (err) {
    console.warn('[GitHub AI Idea Error]:', err.message);
  }

  return `Case Study: Rebuilding ${repoName} platform with ${techStack.join(', ')}.`;
}

// 1. Fetch all synced GitHub projects
router.get('/github/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('github_projects')
      .select('*')
      .order('last_synced_at', { ascending: false });

    if (error) throw error;

    if (projects && projects.length > 0) {
      return res.json({ success: true, projects });
    }

    // Default mock repos if DB empty
    const mockProjects = [
      {
        id: 'gh1',
        repo_name: 'gelato-web-platform',
        description: 'High-speed Next.js e-commerce platform with Stripe integration and dynamic dark mode.',
        tech_stack: ['Next.js', 'React', 'Tailwind', 'Stripe', 'Supabase'],
        client_name: 'Gelato International',
        live_url: 'https://gelato-demo.example.com',
        last_synced_at: new Date().toISOString(),
        used_as_idea: true
      },
      {
        id: 'gh2',
        repo_name: 'aradhya-ai-video-engine',
        description: 'Neural voice synthesis and lip-sync pipeline for 4K AI video persona shorts.',
        tech_stack: ['Python', 'Node.js', 'PyTorch', 'FFmpeg', 'OpenRouter'],
        client_name: 'Converge Internal Flagship',
        live_url: 'https://aradhya-demo.example.com',
        last_synced_at: new Date().toISOString(),
        used_as_idea: true
      },
      {
        id: 'gh3',
        repo_name: 'kunj-automation-crm-sync',
        description: 'Custom Node.js webhook engine synchronizing CRM, WhatsApp, and email leads automatically.',
        tech_stack: ['Node.js', 'Express', 'Redis', 'Webhooks'],
        client_name: 'Kunj Brand',
        live_url: null,
        last_synced_at: new Date().toISOString(),
        used_as_idea: false
      }
    ];

    return res.json({ success: true, projects: mockProjects });
  } catch (err) {
    console.error('Error fetching github projects:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Trigger GitHub Sync (Pulls repos via GitHub REST API)
router.post('/github/sync', async (req, res) => {
  const token = process.env.GITHUB_PAT;
  const orgName = process.env.GITHUB_ORG || 'Converge-Digitals';

  console.log('[GitHub Sync] Syncing repositories for org/user:', orgName);

  try {
    let rawRepos = [];

    if (token && !token.includes('placeholder')) {
      // Try fetching org repos or user repos via GitHub API
      const ghRes = await fetch(`https://api.github.com/user/repos?per_page=20&sort=updated`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Converge-LinkedIn-Engine'
        }
      });

      if (ghRes.ok) {
        rawRepos = await ghRes.json();
      } else {
        console.warn('[GitHub API Warning] Could not fetch live repos, using fallback mock list');
      }
    }

    // Fallback list of shipped repos if GitHub token not set yet
    if (rawRepos.length === 0) {
      rawRepos = [
        {
          name: 'gelato-web-platform',
          description: 'High-speed Next.js e-commerce platform with Stripe integration and dynamic dark mode.',
          language: 'JavaScript',
          topics: ['nextjs', 'tailwind', 'stripe', 'supabase'],
          homepage: 'https://gelato.example.com',
          updated_at: new Date().toISOString()
        },
        {
          name: 'aradhya-ai-video-engine',
          description: 'Neural voice synthesis and lip-sync pipeline for 4K AI video persona shorts.',
          language: 'Python',
          topics: ['ai', 'video', 'pytorch', 'openrouter'],
          homepage: 'https://aradhya.example.com',
          updated_at: new Date().toISOString()
        },
        {
          name: 'ahuja-branding-system',
          description: 'Design token architecture and UI component library for Ahuja Group.',
          language: 'TypeScript',
          topics: ['react', 'tailwind', 'design-system'],
          homepage: 'https://ahuja.example.com',
          updated_at: new Date().toISOString()
        }
      ];
    }

    let syncedCount = 0;

    for (const r of rawRepos) {
      const repoName = r.name;
      const description = r.description || 'Digital marketing and web application repo.';
      const techStack = r.topics && r.topics.length > 0 ? r.topics : [r.language || 'Node.js', 'React', 'Tailwind'];
      const liveUrl = r.homepage || null;
      
      // Determine pillar
      let pillar = 'proof';
      if (repoName.toLowerCase().includes('ai') || description.toLowerCase().includes('ai')) {
        pillar = 'aradhya';
      } else if (repoName.toLowerCase().includes('tool') || repoName.toLowerCase().includes('audit')) {
        pillar = 'authority';
      }

      // Upsert to github_projects in Supabase
      const { data: project, error: upsertErr } = await supabase
        .from('github_projects')
        .upsert({
          repo_name: repoName,
          description: description,
          tech_stack: techStack,
          live_url: liveUrl,
          last_synced_at: new Date().toISOString()
        }, { onConflict: 'repo_name' })
        .select()
        .single();

      if (!upsertErr && project) {
        syncedCount++;

        // Generate idea and save to idea_bank if not already used recently
        if (!project.used_as_idea) {
          const ideaText = await generateRepoIdea(repoName, description, techStack, pillar);
          
          await supabase.from('idea_bank').insert([
            {
              pillar: pillar,
              idea_text: ideaText,
              source: 'github',
              source_ref_id: project.id,
              times_used: 0,
            }
          ]);

          // Mark used_as_idea true
          await supabase.from('github_projects').update({ used_as_idea: true }).eq('id', project.id);
        }
      }
    }

    return res.json({
      success: true,
      message: `Successfully synced ${syncedCount} GitHub repositories`,
      syncedCount
    });

  } catch (err) {
    console.error('Error syncing GitHub:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
