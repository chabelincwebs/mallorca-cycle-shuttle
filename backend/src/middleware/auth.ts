import { Request, Response, NextFunction } from 'express';
  import { verifyToken } from '../utils/auth';
  import { prisma } from '../config/database';

  // Extend Express Request to include user
  export interface AuthRequest extends Request {
    user?: {
      userId: number;
      email: string;
      role: string;
    };
  }

  // Authentication middleware
  export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'No token provided'
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        });
        return;
      }

      // Check if user still exists and is active
      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          role: true,
          active: true,
          totpEnabled: true
        }
      });

      if (!user || !user.active) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found or inactive'
        });
        return;
      }

      // Attach user to request
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed'
      });
    }
  };

  // Role-based access control middleware
  export const requireRole = (...allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Insufficient permissions'
        });
        return;
      }

      next();
    };
  };
