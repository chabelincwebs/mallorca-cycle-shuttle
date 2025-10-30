import express, { Request, Response, NextFunction } from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import compression from 'compression';
  import dotenv from 'dotenv';
  import adminAuthRoutes from './routes/admin/auth';

  dotenv.config();

  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Compression middleware
  app.use(compression());

  // Request logging middleware
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected'
    });
  });

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Mallorca Cycle Shuttle API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        health: '/health',
        admin: {
          auth: '/api/admin/auth'
        }
      }
    });
  });

  // API Routes
  app.use('/api/admin/auth', adminAuthRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not Found',
      message: `Cannot ${req.method} ${req.path}`
    });
  });

  // Error handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
  });

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🗄️  Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
    console.log(`🔐 Admin Auth: http://0.0.0.0:${PORT}/api/admin/auth`);
    console.log(`\n🚀 Ready to accept requests!`);
  });
