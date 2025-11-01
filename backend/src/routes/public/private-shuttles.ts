import { Router, Request, Response } from 'express';
import {
  getAvailablePrivateSlots,
  calculatePrivateShuttlePrice,
  createPrivateShuttleBooking
} from '../../services/private-booking';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// PUBLIC: CUSTOMER BOOKING ENDPOINTS
// ============================================================================

/**
 * Get available private shuttle slots for customer booking
 * GET /api/public/private-shuttles/available
 */
router.get('/available', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      startDate,
      endDate,
      minSeats
    } = req.query;

    const slots = await getAvailablePrivateSlots({
      startDate: startDate ? new Date(startDate as string) : new Date(),
      endDate: endDate ? new Date(endDate as string) : undefined,
      minSeats: minSeats ? parseInt(minSeats as string) : undefined
    });

    return res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching available private shuttle slots:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots'
    });
  }
});

/**
 * Calculate price for a private shuttle booking
 * POST /api/public/private-shuttles/calculate-price
 */
router.post('/calculate-price', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      slotId,
      passengersCount,
      b2bCustomerId
    } = req.body;

    // Validation
    if (!slotId || !passengersCount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: slotId, passengersCount'
      });
    }

    // Get slot pricing
    const slot = await prisma.privateShuttleSlot.findUnique({
      where: { id: parseInt(slotId) },
      select: {
        basePrice: true,
        pricePerSeat: true,
        ivaRate: true,
        isAvailable: true,
        status: true
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: 'Slot not found'
      });
    }

    if (!slot.isAvailable || slot.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Slot is not available for booking'
      });
    }

    // Get B2B discount if applicable
    let b2bDiscount = 0;
    if (b2bCustomerId) {
      const b2bCustomer = await prisma.b2BCustomer.findUnique({
        where: { id: parseInt(b2bCustomerId) },
        select: { discountPercentage: true }
      });
      if (b2bCustomer) {
        b2bDiscount = parseFloat(b2bCustomer.discountPercentage.toString());
      }
    }

    const pricing = calculatePrivateShuttlePrice(
      parseFloat(slot.basePrice.toString()),
      parseFloat(slot.pricePerSeat.toString()),
      parseInt(passengersCount),
      parseFloat(slot.ivaRate.toString()),
      b2bDiscount
    );

    return res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error calculating price:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate price'
    });
  }
});

/**
 * Create a private shuttle booking
 * POST /api/public/private-shuttles/book
 */
router.post('/book', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      slotId,
      pickupAddress,
      dropoffAddress,
      passengersCount,
      bikesCount,
      customerName,
      customerEmail,
      customerPhone,
      customerLanguage,
      customerType,
      b2bCustomerId
    } = req.body;

    // Validation
    if (!slotId || !pickupAddress || !dropoffAddress || !passengersCount ||
        !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: slotId, pickupAddress, dropoffAddress, passengersCount, customerName, customerEmail, customerPhone'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    const booking = await createPrivateShuttleBooking({
      slotId: parseInt(slotId),
      pickupAddress,
      dropoffAddress,
      passengersCount: parseInt(passengersCount),
      bikesCount: bikesCount ? parseInt(bikesCount) : 0,
      customerName,
      customerEmail,
      customerPhone,
      customerLanguage: customerLanguage || 'en',
      customerType: customerType || 'b2c',
      b2bCustomerId: b2bCustomerId ? parseInt(b2bCustomerId) : undefined
    });

    // TODO: Create Stripe payment intent
    // TODO: Send booking confirmation email

    return res.status(201).json({
      success: true,
      message: 'Private shuttle booking created successfully. Booking is pending payment and admin approval.',
      data: {
        bookingReference: booking.bookingReference,
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
        serviceDate: booking.serviceDate,
        departureTime: booking.departureTime,
        pickupAddress: booking.pickupAddress,
        dropoffAddress: booking.dropoffAddress,
        passengersCount: booking.passengersCount,
        bikesCount: booking.bikesCount,
        slot: booking.slot
      }
    });
  } catch (error: any) {
    console.error('Error creating private shuttle booking:', error);

    // Handle specific errors
    if (error.message.includes('not found') ||
        error.message.includes('not available') ||
        error.message.includes('Not enough seats') ||
        error.message.includes('Too many bikes')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create booking'
    });
  }
});

/**
 * Get slot details
 * GET /api/public/private-shuttles/slots/:id
 */
router.get('/slots/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const slot = await prisma.privateShuttleSlot.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        serviceDate: true,
        departureTime: true,
        basePrice: true,
        pricePerSeat: true,
        seatsAvailable: true,
        capacity: true,
        estimatedDuration: true,
        isAvailable: true,
        status: true,
        bus: {
          select: {
            name: true,
            capacity: true,
            bikeCapacity: true
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: 'Slot not found'
      });
    }

    if (!slot.isAvailable || slot.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Slot is not available'
      });
    }

    return res.json({
      success: true,
      data: slot
    });
  } catch (error) {
    console.error('Error fetching slot details:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch slot details'
    });
  }
});

/**
 * Create an on-demand private shuttle booking (no slot required)
 * POST /api/public/private-shuttles/request
 */
router.post('/request', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      serviceDate,
      departureTime,
      pickupAddress,
      dropoffAddress,
      passengersCount,
      bikesCount,
      customerName,
      customerEmail,
      customerPhone,
      customerLanguage,
      specialRequests
    } = req.body;

    // Validation
    if (!serviceDate || !departureTime || !pickupAddress || !dropoffAddress ||
        !passengersCount || !customerName || !customerEmail || !customerPhone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serviceDate, departureTime, pickupAddress, dropoffAddress, passengersCount, customerName, customerEmail, customerPhone'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email address'
      });
    }

    // Validate date is in the future
    const requestedDate = new Date(serviceDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Service date must be in the future'
      });
    }

    // Calculate price (€50 base + €10 per passenger + €5 per bike)
    const BASE_PRICE = 50;
    const PRICE_PER_SEAT = 10;
    const PRICE_PER_BIKE = 5;
    const IVA_RATE = 0.10; // 10% IVA for transport

    const passengerCount = parseInt(passengersCount);
    const bikeCount = bikesCount ? parseInt(bikesCount) : 0;

    const subtotal = BASE_PRICE +
      (passengerCount * PRICE_PER_SEAT) +
      (bikeCount * PRICE_PER_BIKE);
    const ivaAmount = subtotal * IVA_RATE;
    const totalAmount = subtotal + ivaAmount;

    // Generate unique booking reference
    const bookingReference = `PSB-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Convert departureTime to DateTime (Prisma requires DateTime even for Time fields)
    const [hours, minutes] = departureTime.split(':');
    const departureDateTime = new Date();
    departureDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Create booking in database
    const booking = await prisma.privateBooking.create({
      data: {
        bookingReference,
        serviceDate: new Date(serviceDate),
        departureTime: departureDateTime,
        pickupAddress,
        dropoffAddress,
        passengersCount: passengerCount,
        bikesCount: bikeCount,
        basePrice: BASE_PRICE,
        pricePerSeat: PRICE_PER_SEAT,
        totalAmount,
        ivaAmount,
        ivaRate: IVA_RATE,
        customerName,
        customerEmail,
        customerPhone,
        customerLanguage: customerLanguage || 'en',
        status: 'pending_payment',
        paymentStatus: 'pending',
        paymentMethod: 'stripe',
        customerType: 'b2c'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Private shuttle booking request created successfully. Awaiting payment.',
      data: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        totalAmount: totalAmount,
        subtotal: subtotal,
        ivaAmount: ivaAmount,
        paymentStatus: 'pending',
        status: 'pending_payment'
      }
    });
  } catch (error: any) {
    console.error('Error creating on-demand private shuttle booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking request'
    });
  }
});

export default router;
