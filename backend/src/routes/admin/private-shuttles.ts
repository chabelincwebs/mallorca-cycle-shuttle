import { Router, Request, Response } from 'express';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      admin?: {
        id: number;
        email: string;
      };
    }
  }
}

import {
  createPrivateShuttleSlot,
  updatePrivateShuttleSlot,
  cancelPrivateShuttleSlot,
  getPrivateShuttleSlots,
  confirmPrivateBooking,
  cancelPrivateBooking,
  getPrivateBookingStats,
  getPrivateSlotStats
} from '../../services/private-booking';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// ADMIN: SLOT MANAGEMENT
// ============================================================================

/**
 * Get all private shuttle slots
 * GET /api/admin/private-shuttles/slots
 */
router.get('/slots', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      startDate,
      endDate,
      busId,
      status,
      isAvailable
    } = req.query;

    const slots = await getPrivateShuttleSlots({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      busId: busId ? parseInt(busId as string) : undefined,
      status: status as string | undefined,
      isAvailable: isAvailable ? isAvailable === 'true' : undefined
    });

    return res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Error fetching private shuttle slots:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch private shuttle slots'
    });
  }
});

/**
 * Get single private shuttle slot
 * GET /api/admin/private-shuttles/slots/:id
 */
router.get('/slots/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const slot = await prisma.privateShuttleSlot.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: {
          select: {
            name: true,
            licensePlate: true,
            capacity: true,
            bikeCapacity: true
          }
        },
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            pickupAddress: true,
            dropoffAddress: true,
            passengersCount: true,
            bikesCount: true,
            totalAmount: true,
            paymentStatus: true,
            status: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        error: 'Private shuttle slot not found'
      });
    }

    return res.json({
      success: true,
      data: slot
    });
  } catch (error) {
    console.error('Error fetching private shuttle slot:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch private shuttle slot'
    });
  }
});

/**
 * Create a new private shuttle slot
 * POST /api/admin/private-shuttles/slots
 */
router.post('/slots', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      busId,
      serviceDate,
      departureTime,
      basePrice,
      pricePerSeat,
      adminNotes
    } = req.body;

    // Validation
    if (!busId || !serviceDate || !departureTime || !basePrice || !pricePerSeat) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: busId, serviceDate, departureTime, basePrice, pricePerSeat'
      });
    }

    const slot = await createPrivateShuttleSlot({
      busId: parseInt(busId),
      serviceDate: new Date(serviceDate),
      departureTime: new Date(`1970-01-01T${departureTime}`),
      basePrice: parseFloat(basePrice),
      pricePerSeat: parseFloat(pricePerSeat),
      adminNotes
    });

    return res.status(201).json({
      success: true,
      message: 'Private shuttle slot created successfully',
      data: slot
    });
  } catch (error: any) {
    console.error('Error creating private shuttle slot:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create private shuttle slot'
    });
  }
});

/**
 * Update a private shuttle slot
 * PUT /api/admin/private-shuttles/slots/:id
 */
router.put('/slots/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      basePrice,
      pricePerSeat,
      isAvailable,
      estimatedDuration,
      adminNotes
    } = req.body;

    const updateData: any = {};
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (pricePerSeat !== undefined) updateData.pricePerSeat = parseFloat(pricePerSeat);
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = parseInt(estimatedDuration);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const slot = await updatePrivateShuttleSlot(parseInt(id), updateData);

    return res.json({
      success: true,
      message: 'Private shuttle slot updated successfully',
      data: slot
    });
  } catch (error: any) {
    console.error('Error updating private shuttle slot:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update private shuttle slot'
    });
  }
});

/**
 * Cancel a private shuttle slot
 * DELETE /api/admin/private-shuttles/slots/:id
 */
router.delete('/slots/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const slot = await cancelPrivateShuttleSlot(parseInt(id), reason);

    return res.json({
      success: true,
      message: 'Private shuttle slot cancelled successfully',
      data: slot
    });
  } catch (error: any) {
    console.error('Error cancelling private shuttle slot:', error);

    if (error.message.includes('Cannot cancel slot')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to cancel private shuttle slot'
    });
  }
});

/**
 * Get private shuttle slot statistics
 * GET /api/admin/private-shuttles/slots/stats
 */
router.get('/slots/stats', async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await getPrivateSlotStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching slot stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch slot statistics'
    });
  }
});

// ============================================================================
// ADMIN: BOOKING MANAGEMENT
// ============================================================================

/**
 * Get all private shuttle bookings
 * GET /api/admin/private-shuttles/bookings
 */
router.get('/bookings', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      page = '1',
      limit = '20',
      status,
      startDate,
      endDate,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.serviceDate = {};
      if (startDate) where.serviceDate.gte = new Date(startDate as string);
      if (endDate) where.serviceDate.lte = new Date(endDate as string);
    }

    if (search) {
      where.OR = [
        { bookingReference: { contains: search as string, mode: 'insensitive' } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [bookings, total] = await Promise.all([
      prisma.privateBooking.findMany({
        where,
        include: {
          slot: {
            select: {
              id: true,
              serviceDate: true,
              departureTime: true,
              basePrice: true,
              pricePerSeat: true
            }
          },
          bus: {
            select: { name: true, licensePlate: true }
          },
          b2bCustomer: {
            select: { companyName: true }
          }
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.privateBooking.count({ where })
    ]);

    return res.json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching private shuttle bookings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch private shuttle bookings'
    });
  }
});

/**
 * Get single private shuttle booking
 * GET /api/admin/private-shuttles/bookings/:id
 */
router.get('/bookings/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const booking = await prisma.privateBooking.findUnique({
      where: { id: parseInt(id) },
      include: {
        slot: {
          include: {
            bus: {
              select: {
                name: true,
                licensePlate: true,
                capacity: true,
                bikeCapacity: true
              }
            }
          }
        },
        bus: {
          select: {
            name: true,
            licensePlate: true
          }
        },
        b2bCustomer: true,
        confirmedBy: {
          select: {
            fullName: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Private shuttle booking not found'
      });
    }

    return res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching private shuttle booking:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch private shuttle booking'
    });
  }
});

/**
 * Confirm a private shuttle booking (manual admin approval)
 * POST /api/admin/private-shuttles/bookings/:id/confirm
 */
router.post('/bookings/:id/confirm', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.admin!.id;

    const booking = await confirmPrivateBooking(
      parseInt(id),
      adminId,
      adminNotes
    );

    // TODO: Send confirmation email to customer

    return res.json({
      success: true,
      message: 'Private shuttle booking confirmed successfully',
      data: booking
    });
  } catch (error: any) {
    console.error('Error confirming private shuttle booking:', error);

    if (error.message.includes('not found') || error.message.includes('already confirmed') || error.message.includes('cancelled')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to confirm private shuttle booking'
    });
  }
});

/**
 * Cancel a private shuttle booking
 * POST /api/admin/private-shuttles/bookings/:id/cancel
 */
router.post('/bookings/:id/cancel', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await cancelPrivateBooking(parseInt(id), reason);

    // TODO: Send cancellation email to customer
    // TODO: Process refund if payment was made

    return res.json({
      success: true,
      message: 'Private shuttle booking cancelled successfully',
      data: booking
    });
  } catch (error: any) {
    console.error('Error cancelling private shuttle booking:', error);

    if (error.message.includes('not found') || error.message.includes('already cancelled') || error.message.includes('completed')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to cancel private shuttle booking'
    });
  }
});

/**
 * Get private shuttle booking statistics
 * GET /api/admin/private-shuttles/bookings/stats
 */
router.get('/bookings/stats', async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;

    const stats = await getPrivateBookingStats(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );

    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch booking statistics'
    });
  }
});

export default router;
