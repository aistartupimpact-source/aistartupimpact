import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import routes
import publicArticleRoutes from './routes/public/articles';
import publicToolRoutes from './routes/public/tools';
import publicStartupRoutes from './routes/public/startups';
import publicSearchRoutes from './routes/public/search';
import publicAdRoutes from './routes/public/ads';
import publicNewsletterRoutes from './routes/public/newsletter';
import publicFundingRoutes from './routes/public/funding';
import adminArticleRoutes from './routes/admin/articles';
import adminMediaRoutes from './routes/admin/media';
import adminToolRoutes from './routes/admin/tools';
import adminUserRoutes from './routes/admin/users';
import adminCampaignRoutes from './routes/admin/campaigns';
import adminNewsletterRoutes from './routes/admin/newsletter';
import adminStartupRoutes from './routes/admin/startups';
import adminFundingRoutes from './routes/admin/funding';
import adminGlossaryRoutes from './routes/admin/glossary';

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Middleware ──────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined'));

// ─── Health Check ────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Public API Routes ──────────────────────
app.use('/v1/articles', publicArticleRoutes);
app.use('/v1/tools', publicToolRoutes);
app.use('/v1/startups', publicStartupRoutes);
app.use('/v1/search', publicSearchRoutes);
app.use('/v1/ads', publicAdRoutes);
app.use('/v1/newsletter', publicNewsletterRoutes);
app.use('/v1/funding', publicFundingRoutes);

// ─── Admin API Routes ────────────────────────
app.use('/v1/admin/articles', adminArticleRoutes);
app.use('/v1/admin/media', adminMediaRoutes);
app.use('/v1/admin/tools', adminToolRoutes);
app.use('/v1/admin/users', adminUserRoutes);
app.use('/v1/admin/campaigns', adminCampaignRoutes);
app.use('/v1/admin/newsletter', adminNewsletterRoutes);
app.use('/v1/admin/startups', adminStartupRoutes);
app.use('/v1/admin/funding', adminFundingRoutes);
app.use('/v1/admin/glossary', adminGlossaryRoutes);

// ─── Error Handler ───────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── Start Server ────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 AIStartupImpact API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
