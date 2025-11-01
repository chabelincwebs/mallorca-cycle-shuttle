import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
import { refundPayment, getPaymentIntent } from '../../services/payment';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

/**
 * Issue a refund for a booking
 * Admin only - used for customer service operations
 */
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { bookingReference, amount, reason } = req.body;

    if (!bookingReference) {
      return res.status(400).json({
        success: false,
        error: 'Booking reference is required'
      });
    }

    // Get booking with payment info
    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
      include: { service: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Check booking has payment
    if (!booking.paymentId) {
      return res.status(400).json({
        success: false,
        error: 'Booking has no associated payment'
      });
    }

    // Check payment is completed
    if (booking.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        error: `Cannot refund payment with status: ${booking.paymentStatus}`
      });
    }

    // Validate refund amount if provided
    const totalAmount = parseFloat(booking.totalAmount.toString());
    const refundAmount = amount ? parseFloat(amount) : totalAmount;

    if (refundAmount > totalAmount) {
      return res.status(400).json({
        success: false,
        error: `Refund amount (€${refundAmount}) cannot exceed total amount (€${totalAmount})`
      });
    }

    // Issue refund through Stripe
    const refund = await refundPayment({
      paymentIntentId: booking.paymentId,
      amount: amount ? refundAmount : undefined,
      reason: reason || 'requested_by_customer'
    });

    // Update booking status
    await prisma.scheduledBooking.update({
      where: { id: booking.id },
      data: {
        paymentStatus: 'refunded',
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationRefundAmount: refundAmount
      }
    });

    // Restore seats to service
    await prisma.scheduledService.update({
      where: { id: booking.serviceId },
      data: {
        seatsAvailable: {
          increment: booking.seatsBooked
        }
      }
    });

    res.json({
      success: true,
      message: 'Refund issued successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        bookingReference: booking.bookingReference
      }
    });
  } catch (error) {
    console.error('Error issuing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to issue refund'
    });
  }
});

/**
 * Get payment details for a booking
 */
router.get('/booking/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference: reference }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (!booking.paymentId) {
      return res.json({
        success: true,
        data: {
          bookingReference: booking.bookingReference,
          paymentStatus: booking.paymentStatus,
          totalAmount: booking.totalAmount,
          paidAt: booking.paidAt,
          paymentIntent: null
        }
      });
    }

    // Get payment intent from Stripe
    const paymentIntent = await getPaymentIntent(booking.paymentId);

    res.json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        paidAt: booking.paidAt,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: new Date(paymentIntent.created * 1000),
          paymentMethod: paymentIntent.payment_method
        }
      }
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment details'
    });
  }
});

/**
 * Get refund statistics
 * Useful for admin dashboard
 */
router.get('/stats/refunds', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      paymentStatus: 'refunded'
    };

    if (startDate || endDate) {
      where.cancelledAt = {};
      if (startDate) where.cancelledAt.gte = new Date(startDate as string);
      if (endDate) where.cancelledAt.lte = new Date(endDate as string);
    }

    const refunds = await prisma.scheduledBooking.findMany({
      where,
      select: {
        bookingReference: true,
        totalAmount: true,
        cancellationRefundAmount: true,
        cancelledAt: true,
        customerEmail: true,
        service: {
          select: {
            serviceDate: true,
            routeDropoff: {
              select: { nameEn: true }
            }
          }
        }
      },
      orderBy: { cancelledAt: 'desc' }
    });

    const totalRefunded = refunds.reduce((sum, r) => {
      return sum + parseFloat((r.cancellationRefundAmount || 0).toString());
    }, 0);

    res.json({
      success: true,
      data: {
        count: refunds.length,
        totalRefunded,
        refunds
      }
    });
  } catch (error) {
    console.error('Error fetching refund stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch refund statistics'
    });
  }
});

export default router;
