import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createPaymentIntent } from '../../services/payment';

const router = Router();
const prisma = new PrismaClient();

/**
 * Create payment intent for a booking
 * POST /api/public/payments/create-intent
 */
router.post('/create-intent', async (req: Request, res: Response) => {
  try {
    const { bookingReference, bookingType } = req.body;

    if (!bookingReference) {
      return res.status(400).json({
        success: false,
        error: 'Booking reference is required'
      });
    }

    if (!bookingType || !['scheduled', 'private'].includes(bookingType)) {
      return res.status(400).json({
        success: false,
        error: 'Valid booking type is required (scheduled or private)'
      });
    }

    // Find the booking based on type
    let booking: any;
    let amount: number;
    let customerEmail: string;
    let customerName: string;

    if (bookingType === 'scheduled') {
      booking = await prisma.scheduledBooking.findUnique({
        where: { bookingReference }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      // Check if already paid
      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'This booking has already been paid'
        });
      }

      amount = parseFloat(booking.totalAmount.toString());
      customerEmail = booking.customerEmail;
      customerName = booking.customerName;
    } else {
      // Private booking
      booking = await prisma.privateBooking.findUnique({
        where: { bookingReference }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      // Check if already paid
      if (booking.paymentStatus === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'This booking has already been paid'
        });
      }

      amount = parseFloat(booking.totalAmount.toString());
      customerEmail = booking.customerEmail;
      customerName = booking.customerName;
    }

    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount,
      currency: 'eur',
      bookingReference,
      customerEmail,
      customerName,
      metadata: {
        bookingType,
        bookingId: booking.id.toString()
      }
    });

    // Update booking with payment intent ID
    if (bookingType === 'scheduled') {
      await prisma.scheduledBooking.update({
        where: { bookingReference },
        data: {
          paymentId: paymentIntent.id,
          paymentStatus: 'pending'
        }
      });
    } else {
      await prisma.privateBooking.update({
        where: { bookingReference },
        data: {
          paymentId: paymentIntent.id,
          paymentStatus: 'pending'
        }
      });
    }

    return res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100 // Convert back to euros
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

/**
 * Get payment status for a booking
 * GET /api/public/payments/status/:bookingReference
 */
router.get('/status/:bookingReference', async (req: Request, res: Response) => {
  try {
    const { bookingReference } = req.params;
    const { bookingType } = req.query;

    if (!bookingType || !['scheduled', 'private'].includes(bookingType as string)) {
      return res.status(400).json({
        success: false,
        error: 'Valid booking type is required (scheduled or private)'
      });
    }

    let booking: any;

    if (bookingType === 'scheduled') {
      booking = await prisma.scheduledBooking.findUnique({
        where: { bookingReference }
      });
    } else {
      booking = await prisma.privateBooking.findUnique({
        where: { bookingReference }
      });
    }

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    return res.json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        paymentStatus: booking.paymentStatus,
        paymentId: booking.paymentId,
        totalAmount: parseFloat(booking.totalAmount.toString()),
        paidAt: booking.paidAt
      }
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status'
    });
  }
});

export default router;
