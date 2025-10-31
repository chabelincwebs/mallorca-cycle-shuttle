import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include customer data
declare global {
  namespace Express {
    interface Request {
      customer?: {
        bookingReference: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware to authenticate customer requests using JWT
 */
export function authenticateCustomer(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authentication token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as {
      bookingReference: string;
      email: string;
      type: string;
    };

    // Verify it's a customer token (not admin)
    if (decoded.type !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token type'
      });
    }

    // Attach customer data to request
    req.customer = {
      bookingReference: decoded.bookingReference,
      email: decoded.email
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired'
      });
    }

    console.error('Error authenticating customer:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}
