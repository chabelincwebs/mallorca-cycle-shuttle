import express, { Request, Response, Router } from 'express';
  import speakeasy from 'speakeasy';
  import { prisma } from '../../config/database';
  import { verifyPassword, generateToken } from '../../utils/auth';
  import { authenticate, AuthRequest } from '../../middleware/auth';

  const router: Router = express.Router();

  // Admin login (step 1: email + password)
  router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Email and password are required'
        });
        return;
      }

      const user = await prisma.adminUser.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user || !user.active) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials'
        });
        return;
      }

      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid credentials'
        });
        return;
      }

      await prisma.adminUser.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      if (user.totpEnabled && user.totpSecret) {
        res.json({
          success: true,
          requires2FA: true,
          userId: user.id,
          message: 'Please provide your 2FA code'
        });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        requires2FA: false,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Login failed'
      });
    }
  });

  // Verify 2FA code
  router.post('/verify-2fa', async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, token: totpToken } = req.body;

      if (!userId || !totpToken) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID and 2FA token are required'
        });
        return;
      }

      const user = await prisma.adminUser.findUnique({
        where: { id: parseInt(userId) }
      });

      if (!user || !user.active || !user.totpEnabled || !user.totpSecret) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid request'
        });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });

      if (!verified) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid 2FA code'
        });
        return;
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('2FA verification error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: '2FA verification failed'
      });
    }
  });

  // Setup 2FA
  router.post('/setup-2fa', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const secret = speakeasy.generateSecret({
        name: `Mallorca Cycle Shuttle (${req.user?.email})`,
        length: 32
      });

      await prisma.adminUser.update({
        where: { id: userId },
        data: {
          totpSecret: secret.base32,
          totpEnabled: false
        }
      });

      res.json({
        success: true,
        secret: secret.base32,
        qrCode: secret.otpauth_url,
        message: 'Scan the QR code with your authenticator app'
      });
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: '2FA setup failed'
      });
    }
  });

  // Enable 2FA
  router.post('/enable-2fa', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { token: totpToken } = req.body;

      if (!userId || !totpToken) {
        res.status(400).json({
          error: 'Bad Request',
          message: '2FA token is required'
        });
        return;
      }

      const user = await prisma.adminUser.findUnique({
        where: { id: userId }
      });

      if (!user || !user.totpSecret) {
        res.status(400).json({
          error: 'Bad Request',
          message: '2FA not set up. Call /setup-2fa first'
        });
        return;
      }

      const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: totpToken,
        window: 2
      });

      if (!verified) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid 2FA code'
        });
        return;
      }

      await prisma.adminUser.update({
        where: { id: userId },
        data: { totpEnabled: true }
      });

      res.json({
        success: true,
        message: '2FA enabled successfully'
      });
    } catch (error) {
      console.error('2FA enable error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to enable 2FA'
      });
    }
  });

  // Logout
  router.post('/logout', authenticate, async (_req: AuthRequest, res: Response): Promise<void> => {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });

  // Get current user
  router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      const user = await prisma.adminUser.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          totpEnabled: true,
          createdAt: true,
          lastLogin: true
        }
      });

      if (!user) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          twoFactorEnabled: user.totpEnabled,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLogin
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to get user'
      });
    }
  });

  export default router;
