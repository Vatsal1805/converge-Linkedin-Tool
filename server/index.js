import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import generatorRoutes from './routes/generator.js';
import calendarRoutes from './routes/calendar.js';
import trackerRoutes from './routes/tracker.js';
import competitorRoutes from './routes/competitors.js';
import githubRoutes from './routes/github.js';
import crawlerRoutes from './routes/crawler.js';
import verificationRoutes from './routes/verification.js';
import adIntelligenceRoutes from './routes/adIntelligence.js';
import intentSignalsRoutes from './routes/intentSignals.js';
import { initScheduledJobs } from './cron.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api', generatorRoutes);
app.use('/api', calendarRoutes);
app.use('/api', trackerRoutes);
app.use('/api', competitorRoutes);
app.use('/api', githubRoutes);
app.use('/api', crawlerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/ad-intelligence', adIntelligenceRoutes);
app.use('/api/intent-signals', intentSignalsRoutes);

// Initialize Automated Background Cron Jobs
initScheduledJobs();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Converge LinkedIn Content Engine API',
    timestamp: new Date().toISOString(),
  });
});

// Team Login Password Auth
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.TEAM_PASSWORD || 'converge2026';

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password === expectedPassword) {
    return res.json({
      success: true,
      message: 'Authenticated successfully',
      team: 'Converge Digitals Team',
      token: 'converge-team-valid-session-token',
    });
  } else {
    return res.status(401).json({ success: false, message: 'Incorrect team password' });
  }
});

// System Status / Config Check
app.get('/api/status', (req, res) => {
  res.json({
    supabaseConnected: Boolean(process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('placeholder')),
    openRouterConfigured: Boolean(process.env.OPENROUTER_API_KEY && !process.env.OPENROUTER_API_KEY.includes('placeholder')),
    perplexityConfigured: Boolean(process.env.PERPLEXITY_API_KEY && !process.env.PERPLEXITY_API_KEY.includes('placeholder')),
    githubConfigured: Boolean(process.env.GITHUB_PAT && !process.env.GITHUB_PAT.includes('placeholder')),
  });
});

app.listen(PORT, () => {
  console.log(`[Converge LinkedIn Engine] Server running on port ${PORT}`);
});
