import jwt, { SignOptions } from 'jsonwebtoken';
  import bcrypt from 'bcrypt';
  import crypto from 'crypto';

  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  // JWT token generation
  export const generateToken = (payload: { userId: number; email: string; role: string }): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  };

  // JWT token verification
  export const verifyToken = (token: string): any => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  };

  // Password hashing
  export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  };

  // Password verification
  export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  };

  // Generate secure random string
  export const generateSecureToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  };
