import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateCustomer } from '../../middleware/customer-auth';
import { refundPayment } from '../../services/payment';
import { sendCancellationConfirmation, sendRefundConfirmation } from '../../services/email';

const router = Router();
const prisma = new PrismaClient();

// All routes require customer authentication
router.use(authenticateCustomer);

/**
 * Get booking details
 * GET /api/customer/portal/booking
 */
router.get('/booking', async (req: Request, res: Response) => {
  try {
    const bookingReference = req.customer!.bookingReference;

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
      include: {
        service: {
          include: {
            bus: { select: { name: true, licensePlate: true } },
            routePickup1: true,
            routePickup2: true,
            routeDropoff: true
          }
        },
        pickupLocation: true,
        originalBooking: {
          select: {
            bookingReference: true,
            serviceId: true,
            createdAt: true
          }
        },
        changedBookings: {
          select: {
            bookingReference: true,
            serviceId: true,
            createdAt: true,
            status: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

/**
 * Change booking to different service (flexi tickets only)
 * POST /api/customer/portal/booking/change
 */
router.post('/booking/change', async (req: Request, res: Response) => {
  try {
    const bookingReference = req.customer!.bookingReference;
    const { newServiceId, changeToken } = req.body;

    if (!newServiceId || !changeToken) {
      return res.status(400).json({
        success: false,
        error: 'New service ID and change token are required'
      });
    }

    // Get current booking
    const currentBooking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
      include: {
        service: true,
        pickupLocation: true
      }
    });

    if (!currentBooking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify booking is flexi type
    if (currentBooking.ticketType !== 'flexi') {
      return res.status(403).json({
        success: false,
        error: 'Only flexi tickets can be changed'
      });
    }

    // Verify change token
    if (currentBooking.changeToken !== changeToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid change token'
      });
    }

    // Verify has changes remaining
    if (currentBooking.changesRemaining <= 0) {
      return res.status(403).json({
        success: false,
        error: 'No changes remaining for this booking'
      });
    }

    // Verify booking is not cancelled
    if (currentBooking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot change a cancelled booking'
      });
    }

    // Get new service
    const newService = await prisma.scheduledService.findUnique({
      where: { id: newServiceId },
      include: {
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true
      }
    });

    if (!newService) {
      return res.status(404).json({
        success: false,
        error: 'New service not found'
      });
    }

    // Verify new service is active
    if (newService.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Selected service is not available'
      });
    }

    // Verify new service has enough seats
    if (newService.seatsAvailable < currentBooking.seatsBooked) {
      return res.status(400).json({
        success: false,
        error: `New service only has ${newService.seatsAvailable} seats available. You need ${currentBooking.seatsBooked}.`
      });
    }

    // Verify pickup location is valid for new service
    const validPickupIds = [newService.routePickup1Id, newService.routePickup2Id].filter(Boolean);
    if (!validPickupIds.includes(currentBooking.pickupLocationId)) {
      return res.status(400).json({
        success: false,
        error: 'Your pickup location is not available for the new service'
      });
    }

    // Verify booking cutoff time
    const now = new Date();
    const serviceDateTime = new Date(newService.serviceDate);
    const cutoffTime = new Date(newService.bookingCutoffTime);
    const cutoffDateTime = new Date(serviceDateTime);
    cutoffDateTime.setDate(serviceDateTime.getDate() - 1);
    cutoffDateTime.setHours(cutoffTime.getHours(), cutoffTime.getMinutes(), 0, 0);

    if (now > cutoffDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Booking deadline has passed for the new service'
      });
    }

    // Perform change in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mark current booking as cancelled
      await tx.scheduledBooking.update({
        where: { id: currentBooking.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date()
        }
      });

      // Restore seats to original service
      await tx.scheduledService.update({
        where: { id: currentBooking.serviceId },
        data: {
          seatsAvailable: {
            increment: currentBooking.seatsBooked
          }
        }
      });

      // Create new booking with same details
      const newBookingReference = `${bookingReference}-C${currentBooking.changesRemaining}`;

      const newBooking = await tx.scheduledBooking.create({
        data: {
          bookingReference: newBookingReference,
          serviceId: newServiceId,
          customerType: currentBooking.customerType,
          ticketType: currentBooking.ticketType,
          seatsBooked: currentBooking.seatsBooked,
          bikesCount: currentBooking.bikesCount,
          pickupLocationId: currentBooking.pickupLocationId,
          customerName: currentBooking.customerName,
          customerEmail: currentBooking.customerEmail,
          customerPhone: currentBooking.customerPhone,
          customerLanguage: currentBooking.customerLanguage,
          pricePerSeat: currentBooking.pricePerSeat,
          ivaRate: currentBooking.ivaRate,
          ivaAmount: currentBooking.ivaAmount,
          totalAmount: currentBooking.totalAmount,
          discountApplied: currentBooking.discountApplied,
          paymentMethod: currentBooking.paymentMethod,
          paymentStatus: currentBooking.paymentStatus,
          paymentId: currentBooking.paymentId,
          paidAt: currentBooking.paidAt,
          changeToken: currentBooking.changeToken,
          changesRemaining: currentBooking.changesRemaining - 1,
          originalBookingId: currentBooking.originalBookingId || currentBooking.id,
          status: 'confirmed'
        },
        include: {
          service: {
            include: {
              routePickup1: true,
              routePickup2: true,
              routeDropoff: true
            }
          },
          pickupLocation: true
        }
      });

      // Reserve seats on new service
      await tx.scheduledService.update({
        where: { id: newServiceId },
        data: {
          seatsAvailable: {
            decrement: currentBooking.seatsBooked
          }
        }
      });

      return newBooking;
    });

    res.json({
      success: true,
      message: 'Booking changed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error changing booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change booking'
    });
  }
});

/**
 * Cancel booking and request refund
 * POST /api/customer/portal/booking/cancel
 */
router.post('/booking/cancel', async (req: Request, res: Response) => {
  try {
    const bookingReference = req.customer!.bookingReference;
    const { reason } = req.body;

    // Get booking
    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
      include: {
        service: {
          include: {
            routeDropoff: true
          }
        },
        pickupLocation: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify booking is not already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    // Verify service hasn't already been completed
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel a completed service'
      });
    }

    // Calculate refund amount based on cancellation policy
    let refundAmount = 0;
    let refundPercentage = 0;

    const serviceDate = new Date(booking.service.serviceDate);
    const now = new Date();
    const hoursUntilService = (serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Refund policy:
    // - More than 48h before: 100% refund
    // - 24-48h before: 50% refund
    // - Less than 24h: No refund (except flexi)
    // - Flexi tickets: Always full refund (minus small admin fee)

    if (booking.ticketType === 'flexi') {
      refundPercentage = 90; // 90% refund for flexi (10% admin fee)
    } else if (hoursUntilService >= 48) {
      refundPercentage = 100;
    } else if (hoursUntilService >= 24) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const totalPaid = parseFloat(booking.totalAmount.toString());
    refundAmount = totalPaid * (refundPercentage / 100);

    // Process cancellation and refund in transaction
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.scheduledBooking.update({
        where: { id: booking.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: reason,
          cancellationRefundAmount: refundAmount
        }
      });

      // Restore seats to service
      await tx.scheduledService.update({
        where: { id: booking.serviceId },
        data: {
          seatsAvailable: {
            increment: booking.seatsBooked
          }
        }
      });

      // Issue refund if payment was completed and refund amount > 0
      if (booking.paymentStatus === 'completed' && booking.paymentId && refundAmount > 0) {
        try {
          await refundPayment({
            paymentIntentId: booking.paymentId,
            amount: refundAmount,
            reason: 'requested_by_customer'
          });

          // Update payment status
          await tx.scheduledBooking.update({
            where: { id: booking.id },
            data: {
              paymentStatus: 'refunded'
            }
          });

          console.log(`Refund of €${refundAmount} issued for booking ${bookingReference}`);
        } catch (refundError) {
          console.error('Error issuing refund:', refundError);
          // Don't fail the cancellation - admin can process refund manually
        }
      }
    });

    // Send cancellation confirmation email
    try {
      const emailData = {
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerLanguage: booking.customerLanguage,
        serviceDate: booking.service.serviceDate,
        departureTime: booking.service.departureTime,
        pickupLocation: booking.pickupLocation.nameEn,
        dropoffLocation: booking.service.routeDropoff.nameEn,
        seatsBooked: booking.seatsBooked,
        bikesCount: booking.bikesCount,
        totalAmount: totalPaid,
        ticketType: booking.ticketType,
        paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus,
        changeToken: booking.changeToken
      };

      await sendCancellationConfirmation(emailData);

      if (refundAmount > 0) {
        await sendRefundConfirmation({
          ...emailData,
          refundAmount
        });
      }

      console.log(`Cancellation confirmation sent to ${booking.customerEmail}`);
    } catch (emailError) {
      console.error('Error sending cancellation confirmation:', emailError);
      // Don't fail the request
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingReference,
        status: 'cancelled',
        refundAmount,
        refundPercentage,
        processingTime: refundAmount > 0 ? '5-10 business days' : null
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

export default router;
