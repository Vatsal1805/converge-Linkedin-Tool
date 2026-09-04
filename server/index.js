console.log(`[Process Start] Initializing lightweight Express process at ${new Date().toISOString()}`);

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let isFullyMounted = false;

// 1. Root & Lightweight Health Check Routes (Registered IMMEDIATELY)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Converge LinkedIn Content Engine',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Converge LinkedIn Content Engine API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Converge LinkedIn Content Engine API',
    timestamp: new Date().toISOString()
  });
});

// Team Login Password Auth
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.TEAM_PASSWORD;

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
    isFullyMounted
  });
});

// 2. Unmounted Fallback Middleware for API routes during brief startup window
app.use('/api', (req, res, next) => {
  if (!isFullyMounted) {
    return res.status(503).json({
      status: 'initializing',
      message: 'Server is still starting up, please retry in a few seconds'
    });
  }
  next();
});

// 3. Open Port IMMEDIATELY
app.listen(PORT, () => {
  console.log(`[Server Listening] Port ${PORT} open at ${new Date().toISOString()}`);

  // 4. Lazy-load heavy route modules and background cron jobs AFTER port is open
  setImmediate(async () => {
    try {
      const { default: generatorRoutes } = await import('./routes/generator.js');
      const { default: calendarRoutes } = await import('./routes/calendar.js');
      const { default: trackerRoutes } = await import('./routes/tracker.js');
      const { default: competitorRoutes } = await import('./routes/competitors.js');
      const { default: githubRoutes } = await import('./routes/github.js');
      const { default: crawlerRoutes } = await import('./routes/crawler.js');
      const { default: verificationRoutes } = await import('./routes/verification.js');
      const { default: adIntelligenceRoutes } = await import('./routes/adIntelligence.js');
      const { default: intentSignalsRoutes } = await import('./routes/intentSignals.js');
      const { default: settingsRoutes, seedDefaultDiscoverySettings } = await import('./routes/settings.js');
      const { initScheduledJobs } = await import('./cron.js');

      app.use('/api', generatorRoutes);
      app.use('/api', calendarRoutes);
      app.use('/api', trackerRoutes);
      app.use('/api', competitorRoutes);
      app.use('/api', githubRoutes);
      app.use('/api', crawlerRoutes);
      app.use('/api/verification', verificationRoutes);
      app.use('/api/ad-intelligence', adIntelligenceRoutes);
      app.use('/api/intent-signals', intentSignalsRoutes);
      app.use('/api/settings', settingsRoutes);

      seedDefaultDiscoverySettings().catch(e => console.warn('[Settings Seed Error]:', e.message));

      initScheduledJobs();

      isFullyMounted = true;
      console.log(`[Routes Mounted] All routes mounted & cron initialized at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('Error during lazy route/cron initialization:', err);
    }
  });
});
