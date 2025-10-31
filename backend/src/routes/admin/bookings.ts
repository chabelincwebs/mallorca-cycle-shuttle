import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';
import { generateBookingReference, generateChangeToken } from '../../utils/booking-reference';
import { createPaymentIntent } from '../../services/payment';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// ADMIN ENDPOINTS (require authentication)
// ============================================================================

// LIST ALL BOOKINGS (Admin only)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      status,
      customerEmail,
      startDate,
      endDate,
      reference
    } = req.query;

    const where: any = {};

    if (serviceId) where.serviceId = parseInt(serviceId as string);
    if (status) where.status = status;
    if (customerEmail) where.customerEmail = { contains: customerEmail as string, mode: 'insensitive' };
    if (reference) where.bookingReference = reference;

    // Date range filter (filter by service date)
    if (startDate || endDate) {
      where.service = {};
      if (startDate) where.service.serviceDate = { gte: new Date(startDate as string) };
      if (endDate) where.service.serviceDate = { lte: new Date(endDate as string) };
    }

    const bookings = await prisma.scheduledBooking.findMany({
      where,
      include: {
        service: {
          include: {
            bus: { select: { name: true, licensePlate: true } },
            routePickup1: { select: { nameEn: true } },
            routePickup2: { select: { nameEn: true } },
            routeDropoff: { select: { nameEn: true } }
          }
        },
        pickupLocation: {
          select: { nameEn: true, nameDe: true, nameEs: true }
        },
        b2bCustomer: {
          select: { companyName: true, contactEmail: true }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

// GET SINGLE BOOKING BY REFERENCE (Admin)
router.get('/:reference', authenticate, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference: reference },
      include: {
        service: {
          include: {
            bus: true,
            routePickup1: true,
            routePickup2: true,
            routeDropoff: true
          }
        },
        pickupLocation: true,
        b2bCustomer: true,
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

// UPDATE BOOKING STATUS (Admin only)
router.put('/:reference/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'completed', 'no_show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference: reference },
      include: { service: true }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // If marking as cancelled, restore seats to service
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await prisma.scheduledService.update({
        where: { id: booking.serviceId },
        data: {
          seatsAvailable: {
            increment: booking.seatsBooked
          }
        }
      });
    }

    const updated = await prisma.scheduledBooking.update({
      where: { bookingReference: reference },
      data: {
        status,
        ...(status === 'cancelled' && { cancelledAt: new Date() })
      },
      include: {
        service: true,
        pickupLocation: true
      }
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking'
    });
  }
});

// ============================================================================
// PUBLIC ENDPOINTS (no authentication required - for customers)
// ============================================================================

// CREATE NEW BOOKING (Public endpoint for customers)
router.post('/public/create', async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      ticketType,
      seatsBooked,
      bikesCount = 0,
      pickupLocationId,
      customerName,
      customerEmail,
      customerPhone,
      customerLanguage = 'en',
      paymentMethod = 'stripe',
      discountCode
    } = req.body;

    // Validation
    if (!serviceId || !ticketType || !seatsBooked || !pickupLocationId) {
      return res.status(400).json({
        success: false,
        error: 'Service, ticket type, seats, and pickup location are required'
      });
    }

    if (!customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Customer name, email, and phone are required'
      });
    }

    if (!['standard', 'flexi'].includes(ticketType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ticket type. Must be "standard" or "flexi"'
      });
    }

    if (seatsBooked < 1 || seatsBooked > 10) {
      return res.status(400).json({
        success: false,
        error: 'Seats booked must be between 1 and 10'
      });
    }

    // Get service with full details
    const service = await prisma.scheduledService.findUnique({
      where: { id: serviceId },
      include: {
        bus: true,
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    // Check service is active
    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This service is not available for booking'
      });
    }

    // Check seats available
    if (service.seatsAvailable < seatsBooked) {
      return res.status(400).json({
        success: false,
        error: `Only ${service.seatsAvailable} seats available. You requested ${seatsBooked}.`
      });
    }

    // Check booking cutoff time
    const now = new Date();
    const serviceDateTime = new Date(service.serviceDate);
    const cutoffTime = new Date(service.bookingCutoffTime);

    // Set cutoff to day before service at specified time
    const cutoffDateTime = new Date(serviceDateTime);
    cutoffDateTime.setDate(serviceDateTime.getDate() - 1);
    cutoffDateTime.setHours(cutoffTime.getHours(), cutoffTime.getMinutes(), 0, 0);

    if (now > cutoffDateTime) {
      return res.status(400).json({
        success: false,
        error: 'Booking deadline has passed for this service'
      });
    }

    // Verify pickup location
    const pickupLocation = await prisma.route.findUnique({
      where: { id: pickupLocationId }
    });

    if (!pickupLocation) {
      return res.status(404).json({
        success: false,
        error: 'Pickup location not found'
      });
    }

    // Verify pickup location is valid for this service
    const validPickupIds = [service.routePickup1Id, service.routePickup2Id].filter(Boolean);
    if (!validPickupIds.includes(pickupLocationId)) {
      return res.status(400).json({
        success: false,
        error: 'Selected pickup location is not available for this service'
      });
    }

    // Calculate pricing
    const pricePerSeat = ticketType === 'flexi'
      ? parseFloat(service.priceFlexi.toString())
      : parseFloat(service.priceStandard.toString());

    const ivaRate = parseFloat(service.ivaRate.toString());
    const subtotal = pricePerSeat * seatsBooked;

    // Apply discount if provided (simplified - real implementation would validate discount codes)
    let discountAmount = 0;
    let discountPercentage = 0;

    const baseAmount = subtotal - discountAmount;
    const ivaAmount = baseAmount * ivaRate;
    const totalAmount = baseAmount + ivaAmount;

    // Generate unique booking reference (with retry logic)
    let bookingReference = generateBookingReference();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.scheduledBooking.findUnique({
        where: { bookingReference }
      });
      if (!existing) break;
      bookingReference = generateBookingReference();
      attempts++;
    }

    // Generate change token for flexi tickets
    const changeToken = ticketType === 'flexi' ? generateChangeToken() : null;
    const changesRemaining = ticketType === 'flexi' ? 1 : 0;

    // Create booking and update service seats in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.scheduledBooking.create({
        data: {
          bookingReference,
          serviceId,
          customerType: 'b2c',
          ticketType,
          seatsBooked,
          bikesCount,
          pickupLocationId,
          customerName,
          customerEmail,
          customerPhone,
          customerLanguage,
          pricePerSeat,
          ivaRate,
          ivaAmount,
          totalAmount,
          discountApplied: discountPercentage,
          paymentMethod,
          paymentStatus: 'pending', // Will be updated after payment
          changeToken,
          changesRemaining,
          status: 'confirmed'
        },
        include: {
          service: {
            include: {
              bus: true,
              routePickup1: true,
              routePickup2: true,
              routeDropoff: true
            }
          },
          pickupLocation: true
        }
      });

      // Update service seats available
      await tx.scheduledService.update({
        where: { id: serviceId },
        data: {
          seatsAvailable: {
            decrement: seatsBooked
          }
        }
      });

      return newBooking;
    });

    // Create Stripe payment intent
    let paymentIntent;
    let clientSecret;

    try {
      paymentIntent = await createPaymentIntent({
        amount: parseFloat(totalAmount.toFixed(2)),
        bookingReference: booking.bookingReference,
        customerEmail,
        customerName,
        metadata: {
          serviceId: serviceId.toString(),
          ticketType,
          seatsBooked: seatsBooked.toString()
        }
      });

      clientSecret = paymentIntent.client_secret;

      // Update booking with payment intent ID
      await prisma.scheduledBooking.update({
        where: { bookingReference: booking.bookingReference },
        data: {
          paymentId: paymentIntent.id
        }
      });
    } catch (error) {
      console.error('Error creating payment intent:', error);
      // If payment intent creation fails, we should cancel the booking
      await prisma.$transaction(async (tx) => {
        await tx.scheduledBooking.update({
          where: { bookingReference: booking.bookingReference },
          data: {
            status: 'cancelled',
            cancelledAt: new Date()
          }
        });

        await tx.scheduledService.update({
          where: { id: serviceId },
          data: {
            seatsAvailable: {
              increment: seatsBooked
            }
          }
        });
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to create payment intent. Booking cancelled.'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        bookingReference: booking.bookingReference,
        service: booking.service,
        pickupLocation: booking.pickupLocation,
        seatsBooked: booking.seatsBooked,
        bikesCount: booking.bikesCount,
        ticketType: booking.ticketType,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        changeToken: booking.changeToken,
        status: booking.status,
        createdAt: booking.createdAt
      },
      payment: {
        clientSecret,
        amount: totalAmount,
        currency: 'eur'
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

// GET BOOKING BY REFERENCE (Public - for customers to check their booking)
router.get('/public/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference: reference },
      select: {
        bookingReference: true,
        serviceId: true,
        ticketType: true,
        seatsBooked: true,
        bikesCount: true,
        customerName: true,
        customerEmail: true,
        totalAmount: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        changeToken: true,
        changesRemaining: true,
        service: {
          select: {
            serviceDate: true,
            departureTime: true,
            bus: { select: { name: true } },
            routePickup1: { select: { nameEn: true, nameDe: true, nameEs: true, nameFr: true, nameCa: true } },
            routePickup2: { select: { nameEn: true, nameDe: true, nameEs: true, nameFr: true, nameCa: true } },
            routeDropoff: { select: { nameEn: true, nameDe: true, nameEs: true, nameFr: true, nameCa: true } }
          }
        },
        pickupLocation: {
          select: { nameEn: true, nameDe: true, nameEs: true, nameFr: true, nameCa: true }
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

export default router;
