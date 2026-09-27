import fs from 'fs';
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { db } from './db/client';

import complaintsRouter from './routes/complaints';
import dashboardRouter from './routes/dashboard';
import propertiesRouter from './routes/properties';
import tenantsRouter from './routes/tenants';
import vendorsRouter from './routes/vendors';
import categoriesRouter from './routes/categories';
import uploadRouter from './routes/upload';
import authRouter from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads serving
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Direct APK download route
app.get(['/download/apk', '/mngroups-debug.apk'], (_req, res) => {
  const apkPath = path.resolve(__dirname, '..', '..', 'mngroups-debug.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="mngroups-debug.apk"');
    res.sendFile(apkPath);
  } else {
    res.status(404).json({ error: 'APK file not found on server' });
  }
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'MN Groups Property Maintenance API', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to MN GROUPS Property Maintenance API',
    endpoints: {
      complaints: '/complaints',
      dashboard: '/dashboard/summary',
      properties: '/properties',
      tenants: '/tenants',
      vendors: '/vendors',
      categories: '/categories',
      upload: '/upload',
      auth: '/auth/personas'
    }
  });
});

// API Routes
app.use('/complaints', complaintsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/properties', propertiesRouter);
app.use('/tenants', tenantsRouter);
app.use('/vendors', vendorsRouter);
app.use('/categories', categoriesRouter);
app.use('/upload', uploadRouter);
app.use('/auth', authRouter);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start server after DB initialization
async function start() {
  try {
    await db.init();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` MN GROUPS API Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/health`);
      console.log(` Dashboard summary: http://localhost:${PORT}/dashboard/summary`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
