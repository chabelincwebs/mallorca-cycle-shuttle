import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get available services with seat availability
 * GET /api/public/scheduled-bookings/services/available
 */
router.get('/services/available', async (req: Request, res: Response) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        success: false,
        error: 'from, to, and date parameters are required'
      });
    }

    const targetDate = new Date(date as string);

    // Find services matching the criteria
    const services = await prisma.scheduledService.findMany({
      where: {
        serviceDate: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
        },
        status: 'active',
        OR: [
          {
            routePickup1: {
              id: parseInt(from as string)
            }
          },
          {
            routePickup2: {
              id: parseInt(from as string)
            }
          }
        ],
        routeDropoff: {
          id: parseInt(to as string)
        }
      },
      include: {
        bus: true,
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true,
        bookings: {
          where: {
            status: {
              in: ['pending', 'confirmed']
            }
          },
          select: {
            seatsBooked: true
          }
        }
      },
      orderBy: {
        departureTime: 'asc'
      }
    });

    // Calculate available seats for each service
    const servicesWithAvailability = services.map(service => {
      const bookedSeats = service.bookings.reduce(
        (sum, booking) => sum + booking.seatsBooked,
        0
      );
      const availableSeats = service.bus.passengerCapacity - bookedSeats;

      return {
        id: service.id,
        serviceDate: service.serviceDate,
        departureTime: service.departureTime,
        pickupLocations: [
          {
            id: service.routePickup1.id,
            name: service.routePickup1.nameEn,
            nameEs: service.routePickup1.nameEs,
            nameDe: service.routePickup1.nameDe
          },
          service.routePickup2 ? {
            id: service.routePickup2.id,
            name: service.routePickup2.nameEn,
            nameEs: service.routePickup2.nameEs,
            nameDe: service.routePickup2.nameDe
          } : null
        ].filter(Boolean),
        dropoffLocation: {
          id: service.routeDropoff.id,
          name: service.routeDropoff.nameEn,
          nameEs: service.routeDropoff.nameEs,
          nameDe: service.routeDropoff.nameDe
        },
        bus: {
          name: service.bus.name,
          passengerCapacity: service.bus.passengerCapacity,
          bikeCapacity: service.bus.bikeCapacity
        },
        pricing: {
          standardPrice: parseFloat(service.standardPrice.toString()),
          flexiPrice: parseFloat(service.flexiPrice.toString())
        },
        availability: {
          totalSeats: service.bus.passengerCapacity,
          bookedSeats,
          availableSeats,
          isAvailable: availableSeats > 0
        }
      };
    });

    return res.json({
      success: true,
      data: servicesWithAvailability
    });
  } catch (error) {
    console.error('Error fetching available services:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch available services'
    });
  }
});

/**
 * Get all available routes
 * GET /api/public/scheduled-bookings/routes
 */
router.get('/routes', async (req: Request, res: Response) => {
  try {
    const routes = await prisma.route.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        nameEn: 'asc'
      }
    });

    return res.json({
      success: true,
      data: routes.map(route => ({
        id: route.id,
        name: route.nameEn,
        nameEs: route.nameEs,
        nameDe: route.nameDe,
        nameFr: route.nameFr,
        nameCa: route.nameCa,
        nameIt: route.nameIt,
        nameNl: route.nameNl
      }))
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch routes'
    });
  }
});

/**
 * Create a new scheduled booking
 * POST /api/public/scheduled-bookings
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      serviceId,
      pickupLocationId,
      seatsBooked,
      bikesCount,
      ticketType,
      customerName,
      customerEmail,
      customerPhone,
      customerLanguage
    } = req.body;

    // Validate required fields
    if (!serviceId || !pickupLocationId || !seatsBooked || !ticketType ||
        !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    if (!['standard', 'flexi'].includes(ticketType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ticket type. Must be "standard" or "flexi"'
      });
    }

    // Get service with availability
    const service = await prisma.scheduledService.findUnique({
      where: { id: serviceId },
      include: {
        bus: true,
        bookings: {
          where: {
            status: {
              in: ['pending', 'confirmed']
            }
          },
          select: {
            seatsBooked: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found'
      });
    }

    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Service is not available for booking'
      });
    }

    // Check availability
    const bookedSeats = service.bookings.reduce(
      (sum, booking) => sum + booking.seatsBooked,
      0
    );
    const availableSeats = service.bus.passengerCapacity - bookedSeats;

    if (seatsBooked > availableSeats) {
      return res.status(400).json({
        success: false,
        error: `Only ${availableSeats} seats available`
      });
    }

    // Calculate total amount
    const pricePerSeat = ticketType === 'flexi'
      ? parseFloat(service.flexiPrice.toString())
      : parseFloat(service.standardPrice.toString());
    const totalAmount = pricePerSeat * seatsBooked;

    // Generate booking reference
    const bookingReference = `SB-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Generate change token for flexi tickets
    const changeToken = ticketType === 'flexi'
      ? crypto.randomBytes(16).toString('hex').toUpperCase()
      : null;

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.scheduledBooking.create({
        data: {
          bookingReference,
          serviceId,
          pickupLocationId,
          seatsBooked,
          bikesCount: bikesCount || 0,
          ticketType,
          totalAmount,
          customerName,
          customerEmail,
          customerPhone,
          customerLanguage: customerLanguage || 'en',
          status: 'pending',
          paymentStatus: 'pending',
          changeToken,
          notes: null
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

      return newBooking;
    });

    return res.status(201).json({
      success: true,
      data: {
        bookingReference: booking.bookingReference,
        serviceDate: booking.service.serviceDate,
        departureTime: booking.service.departureTime,
        pickupLocation: {
          id: booking.pickupLocation.id,
          name: booking.pickupLocation.nameEn
        },
        dropoffLocation: {
          id: booking.service.routeDropoff.id,
          name: booking.service.routeDropoff.nameEn
        },
        seatsBooked: booking.seatsBooked,
        bikesCount: booking.bikesCount,
        ticketType: booking.ticketType,
        totalAmount: parseFloat(booking.totalAmount.toString()),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        changeToken: booking.changeToken,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail
      }
    });
  } catch (error) {
    console.error('Error creating scheduled booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

/**
 * Get booking details by reference
 * GET /api/public/scheduled-bookings/:bookingReference
 */
router.get('/:bookingReference', async (req: Request, res: Response) => {
  try {
    const { bookingReference } = req.params;

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference },
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
        serviceDate: booking.service.serviceDate,
        departureTime: booking.service.departureTime,
        pickupLocation: {
          id: booking.pickupLocation.id,
          name: booking.pickupLocation.nameEn,
          nameEs: booking.pickupLocation.nameEs,
          nameDe: booking.pickupLocation.nameDe
        },
        dropoffLocation: {
          id: booking.service.routeDropoff.id,
          name: booking.service.routeDropoff.nameEn,
          nameEs: booking.service.routeDropoff.nameEs,
          nameDe: booking.service.routeDropoff.nameDe
        },
        seatsBooked: booking.seatsBooked,
        bikesCount: booking.bikesCount,
        ticketType: booking.ticketType,
        totalAmount: parseFloat(booking.totalAmount.toString()),
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        createdAt: booking.createdAt,
        paidAt: booking.paidAt
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch booking'
    });
  }
});

/**
 * Cancel a booking (flexi tickets only)
 * POST /api/public/scheduled-bookings/:bookingReference/cancel
 */
router.post('/:bookingReference/cancel', async (req: Request, res: Response) => {
  try {
    const { bookingReference } = req.params;
    const { changeToken } = req.body;

    if (!changeToken) {
      return res.status(400).json({
        success: false,
        error: 'Change token is required'
      });
    }

    const booking = await prisma.scheduledBooking.findUnique({
      where: { bookingReference }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    // Verify ticket type and token
    if (booking.ticketType !== 'flexi') {
      return res.status(400).json({
        success: false,
        error: 'Only flexi tickets can be cancelled'
      });
    }

    if (booking.changeToken !== changeToken) {
      return res.status(403).json({
        success: false,
        error: 'Invalid change token'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Booking is already cancelled'
      });
    }

    // Update booking status
    const updatedBooking = await prisma.scheduledBooking.update({
      where: { bookingReference },
      data: {
        status: 'cancelled',
        cancellationDate: new Date()
      }
    });

    // TODO: Initiate refund process if payment was completed

    return res.json({
      success: true,
      data: {
        bookingReference: updatedBooking.bookingReference,
        status: updatedBooking.status,
        cancellationDate: updatedBooking.cancellationDate
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel booking'
    });
  }
});

export default router;
