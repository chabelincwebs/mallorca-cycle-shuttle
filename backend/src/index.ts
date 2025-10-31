import express, { Request, Response, NextFunction } from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import compression from 'compression';
  import dotenv from 'dotenv';
  import adminAuthRoutes from './routes/admin/auth';
  import fleetRoutes from './routes/admin/fleet';
  import servicesRoutes from './routes/admin/services';
  import bookingsRoutes from './routes/admin/bookings';
  import paymentsRoutes from './routes/admin/payments';
  import stripeWebhookRoutes from './routes/webhooks/stripe';
  import customerAuthRoutes from './routes/customer/auth';
  import customerPortalRoutes from './routes/customer/portal';

  dotenv.config();

  const app = express();
  const PORT = parseInt(process.env.PORT || '3001', 10);

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Stripe webhook route MUST come before body parsing middleware
  // Stripe needs the raw body for signature verification
  app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRoutes);

  // Body parsing middleware (for all other routes)
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
          auth: '/api/admin/auth',
          fleet: '/api/admin/fleet',
          services: '/api/admin/services',
          bookings: '/api/admin/bookings',
          payments: '/api/admin/payments'
        },
        customer: {
          auth: '/api/customer/auth',
          portal: '/api/customer/portal'
        },
        webhooks: {
          stripe: '/webhooks/stripe'
        }
      }
    });
  });

  // API Routes - Admin
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/admin/fleet', fleetRoutes);
  app.use('/api/admin/services', servicesRoutes);
  app.use('/api/admin/bookings', bookingsRoutes);
  app.use('/api/admin/payments', paymentsRoutes);

  // API Routes - Customer Portal
  app.use('/api/customer/auth', customerAuthRoutes);
  app.use('/api/customer/portal', customerPortalRoutes);

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
    console.log(`🚌 Fleet Management: http://0.0.0.0:${PORT}/api/admin/fleet`);
    console.log(`📅 Scheduled Services: http://0.0.0.0:${PORT}/api/admin/services`);
    console.log(`📋 Bookings: http://0.0.0.0:${PORT}/api/admin/bookings`);
    console.log(`💰 Payments: http://0.0.0.0:${PORT}/api/admin/payments`);
    console.log(`👤 Customer Portal: http://0.0.0.0:${PORT}/api/customer/portal`);
    console.log(`🔑 Customer Auth: http://0.0.0.0:${PORT}/api/customer/auth`);
    console.log(`💳 Stripe Webhook: http://0.0.0.0:${PORT}/webhooks/stripe`);
    console.log(`\n🚀 Ready to accept requests!`);
  });
