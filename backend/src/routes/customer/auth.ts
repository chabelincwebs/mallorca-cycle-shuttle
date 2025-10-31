import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../../services/email';

const router = Router();
const prisma = new PrismaClient();

// Store for magic link tokens (in production, use Redis)
const magicLinkTokens = new Map<string, { bookingReference: string; email: string; expiresAt: Date }>();

/**
 * Request magic link for booking access
 * POST /api/customer/auth/request-link
 */
router.post('/request-link', async (req: Request, res: Response) => {
  try {
    const { bookingReference, email } = req.body;

    if (!bookingReference || !email) {
      return res.status(400).json({
        success: false,
        error: 'Booking reference and email are required'
      });
    }

    // Verify booking exists and email matches
    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
      select: {
        id: true,
        customerEmail: true,
        customerName: true,
        customerLanguage: true,
        status: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify email matches (case insensitive)
    if (booking.customerEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Email does not match booking'
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token
    magicLinkTokens.set(token, {
      bookingReference,
      email: booking.customerEmail,
      expiresAt
    });

    // Generate magic link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/portal/auth/${token}`;

    // Send magic link email
    try {
      const translations = {
        en: {
          subject: `Access Your Booking - ${bookingReference}`,
          greeting: `Hello ${booking.customerName},`,
          body: `Click the link below to access your booking:`,
          button: 'Access My Booking',
          validity: 'This link is valid for 1 hour.',
          ignore: 'If you did not request this link, please ignore this email.'
        },
        de: {
          subject: `Zugriff auf Ihre Buchung - ${bookingReference}`,
          greeting: `Hallo ${booking.customerName},`,
          body: `Klicken Sie auf den untenstehenden Link, um auf Ihre Buchung zuzugreifen:`,
          button: 'Zu meiner Buchung',
          validity: 'Dieser Link ist 1 Stunde gültig.',
          ignore: 'Wenn Sie diesen Link nicht angefordert haben, ignorieren Sie diese E-Mail bitte.'
        },
        es: {
          subject: `Accede a tu Reserva - ${bookingReference}`,
          greeting: `Hola ${booking.customerName},`,
          body: `Haz clic en el enlace a continuación para acceder a tu reserva:`,
          button: 'Acceder a Mi Reserva',
          validity: 'Este enlace es válido durante 1 hora.',
          ignore: 'Si no solicitaste este enlace, ignora este correo electrónico.'
        }
      };

      const lang = booking.customerLanguage as 'en' | 'de' | 'es';
      const t = translations[lang] || translations.en;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">

                  <!-- Header -->
                  <tr>
                    <td style="background-color: #2563eb; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Mallorca Cycle Shuttle</h1>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="margin: 0 0 20px; font-size: 16px; color: #333333;">${t.greeting}</p>
                      <p style="margin: 0 0 30px; font-size: 16px; color: #333333;">${t.body}</p>

                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${magicLink}" style="display: inline-block; padding: 15px 40px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">${t.button}</a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 30px 0 10px; font-size: 14px; color: #666666;">${t.validity}</p>
                      <p style="margin: 0; font-size: 14px; color: #666666;">${t.ignore}</p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        Mallorca Cycle Shuttle<br>
                        © ${new Date().getFullYear()} All rights reserved
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      await sendEmail({
        to: booking.customerEmail,
        subject: t.subject,
        html
      });

      console.log(`Magic link sent to ${booking.customerEmail} for booking ${bookingReference}`);
    } catch (emailError) {
      console.error('Error sending magic link email:', emailError);
      // Don't fail the request - return success anyway
    }

    res.json({
      success: true,
      message: 'Access link sent to your email',
      expiresIn: 3600 // seconds
    });
  } catch (error) {
    console.error('Error requesting magic link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send access link'
    });
  }
});

/**
 * Verify magic link token and return JWT
 * POST /api/customer/auth/verify-token
 */
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Check if token exists
    const tokenData = magicLinkTokens.get(token);
    if (!tokenData) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Check if token is expired
    if (new Date() > tokenData.expiresAt) {
      magicLinkTokens.delete(token);
      return res.status(401).json({
        success: false,
        error: 'Token has expired'
      });
    }

    // Verify booking still exists
    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference: tokenData.bookingReference },
      select: {
        id: true,
        bookingReference: true,
        customerEmail: true,
        status: true
      }
    });

    if (!booking) {
      magicLinkTokens.delete(token);
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Delete token (one-time use)
    magicLinkTokens.delete(token);

    // Generate JWT for authenticated access
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const accessToken = jwt.sign(
      {
        bookingReference: booking.bookingReference,
        email: booking.customerEmail,
        type: 'customer'
      },
      jwtSecret,
      { expiresIn: '7d' } // 7 days
    );

    res.json({
      success: true,
      accessToken,
      bookingReference: booking.bookingReference,
      expiresIn: 604800 // 7 days in seconds
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify token'
    });
  }
});

/**
 * Cleanup expired tokens (should be called periodically)
 */
export function cleanupExpiredTokens() {
  const now = new Date();
  for (const [token, data] of magicLinkTokens.entries()) {
    if (now > data.expiresAt) {
      magicLinkTokens.delete(token);
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000);

export default router;
