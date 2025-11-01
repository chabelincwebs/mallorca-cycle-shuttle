import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// All routes require authentication
router.use(authenticate);

// ============================================================================
// LIST ALL SCHEDULED SERVICES
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      date,           // Filter by specific date (YYYY-MM-DD)
      startDate,      // Filter by date range start
      endDate,        // Filter by date range end
      status,         // Filter by status
      busId           // Filter by bus
    } = req.query;

    const where: any = {};

    // Date filters
    if (date) {
      where.serviceDate = new Date(date as string);
    } else if (startDate || endDate) {
      where.serviceDate = {};
      if (startDate) where.serviceDate.gte = new Date(startDate as string);
      if (endDate) where.serviceDate.lte = new Date(endDate as string);
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Bus filter
    if (busId) {
      where.busId = parseInt(busId as string);
    }

    const services = await prisma.scheduledService.findMany({
      where,
      include: {
        bus: {
          select: {
            id: true,
            name: true,
            licensePlate: true,
            capacity: true,
            bikeCapacity: true
          }
        },
        routePickup1: {
          select: {
            id: true,
            nameEn: true,
            nameDe: true,
            nameEs: true,
            nameFr: true,
            nameCa: true,
            locationType: true,
            coordinates: true
          }
        },
        routePickup2: {
          select: {
            id: true,
            nameEn: true,
            nameDe: true,
            nameEs: true,
            nameFr: true,
            nameCa: true,
            locationType: true,
            coordinates: true
          }
        },
        routeDropoff: {
          select: {
            id: true,
            nameEn: true,
            nameDe: true,
            nameEs: true,
            nameFr: true,
            nameCa: true,
            locationType: true,
            coordinates: true
          }
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: [
        { serviceDate: 'asc' },
        { departureTime: 'asc' }
      ]
    });

    res.json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching scheduled services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled services'
    });
  }
});

// ============================================================================
// GET SINGLE SCHEDULED SERVICE
// ============================================================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.scheduledService.findUnique({
      where: { id: parseInt(id) },
      include: {
        bus: true,
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        cancelledBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        },
        bookings: {
          select: {
            id: true,
            bookingReference: true,
            seatsBooked: true,
            bikesCount: true,
            customerName: true,
            customerEmail: true,
            status: true,
            ticketType: true
          }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled service not found'
      });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching scheduled service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduled service'
    });
  }
});

// ============================================================================
// CREATE NEW SCHEDULED SERVICE
// ============================================================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      busId,
      serviceDate,
      departureTime,
      routePickup1Id,
      routePickup2Id,
      routeDropoffId,
      priceStandard,
      priceFlexi,
      ivaRate,
      bookingCutoffTime
    } = req.body;

    // Validation
    if (!busId || !serviceDate || !departureTime || !routePickup1Id || !routeDropoffId) {
      return res.status(400).json({
        success: false,
        error: 'Bus, service date, departure time, pickup location, and dropoff location are required'
      });
    }

    if (!priceStandard || priceStandard <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid standard price is required'
      });
    }

    if (!priceFlexi || priceFlexi <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid flexi price is required'
      });
    }

    // Verify bus exists and is active
    const bus = await prisma.bus.findUnique({
      where: { id: busId }
    });

    if (!bus) {
      return res.status(404).json({
        success: false,
        error: 'Bus not found'
      });
    }

    if (!bus.active) {
      return res.status(400).json({
        success: false,
        error: 'Cannot create service with inactive bus'
      });
    }

    // Validate bus service type
    if (bus.serviceType === 'private_only') {
      return res.status(400).json({
        success: false,
        error: 'This bus is designated for private shuttles only and cannot be used for scheduled services'
      });
    }

    // Verify routes exist and are active
    const [pickup1, pickup2, dropoff] = await Promise.all([
      prisma.route.findUnique({ where: { id: routePickup1Id } }),
      routePickup2Id ? prisma.route.findUnique({ where: { id: routePickup2Id } }) : null,
      prisma.route.findUnique({ where: { id: routeDropoffId } })
    ]);

    if (!pickup1 || !pickup1.active) {
      return res.status(404).json({
        success: false,
        error: 'Primary pickup route not found or inactive'
      });
    }

    if (routePickup2Id && (!pickup2 || !pickup2.active)) {
      return res.status(404).json({
        success: false,
        error: 'Secondary pickup route not found or inactive'
      });
    }

    if (!dropoff || !dropoff.active) {
      return res.status(404).json({
        success: false,
        error: 'Dropoff route not found or inactive'
      });
    }

    // Verify pickup routes can be used as pickups
    if (!['pickup', 'both'].includes(pickup1.locationType)) {
      return res.status(400).json({
        success: false,
        error: 'Primary route is not configured as a pickup location'
      });
    }

    if (pickup2 && !['pickup', 'both'].includes(pickup2.locationType)) {
      return res.status(400).json({
        success: false,
        error: 'Secondary route is not configured as a pickup location'
      });
    }

    // Verify dropoff route can be used as dropoff
    if (!['dropoff', 'both'].includes(dropoff.locationType)) {
      return res.status(400).json({
        success: false,
        error: 'Route is not configured as a dropoff location'
      });
    }

    // Check for duplicate service (same bus, date, and time)
    const existing = await prisma.scheduledService.findFirst({
      where: {
        busId,
        serviceDate: new Date(serviceDate),
        departureTime
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A service already exists for this bus at this date and time'
      });
    }

    // Create the scheduled service
    const service = await prisma.scheduledService.create({
      data: {
        busId,
        serviceDate: new Date(serviceDate),
        departureTime,
        routePickup1Id,
        routePickup2Id: routePickup2Id || null,
        routeDropoffId,
        totalSeats: bus.capacity,
        seatsAvailable: bus.capacity,
        priceStandard: parseFloat(priceStandard),
        priceFlexi: parseFloat(priceFlexi),
        ivaRate: ivaRate ? parseFloat(ivaRate) : 0.10,
        bookingCutoffTime: bookingCutoffTime || '16:00:00',
        status: 'active',
        createdById: (req as any).user.id
      },
      include: {
        bus: true,
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Scheduled service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating scheduled service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create scheduled service'
    });
  }
});

// ============================================================================
// UPDATE SCHEDULED SERVICE
// ============================================================================
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      busId,
      serviceDate,
      departureTime,
      routePickup1Id,
      routePickup2Id,
      routeDropoffId,
      priceStandard,
      priceFlexi,
      ivaRate,
      bookingCutoffTime,
      status
    } = req.body;

    // Check if service exists
    const existingService = await prisma.scheduledService.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled service not found'
      });
    }

    // Don't allow modifying cancelled or completed services
    if (existingService.status !== 'active' && status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify cancelled or completed services'
      });
    }

    // If there are bookings, be more restrictive about changes
    const hasBookings = existingService._count.bookings > 0;

    if (hasBookings) {
      // Can only change prices, booking cutoff, and status if there are bookings
      if (busId || serviceDate || departureTime || routePickup1Id || routePickup2Id || routeDropoffId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot change bus, date, time, or routes for a service with existing bookings. Cancel and create a new service instead.'
        });
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (priceStandard !== undefined) updateData.priceStandard = parseFloat(priceStandard);
    if (priceFlexi !== undefined) updateData.priceFlexi = parseFloat(priceFlexi);
    if (ivaRate !== undefined) updateData.ivaRate = parseFloat(ivaRate);
    if (bookingCutoffTime !== undefined) updateData.bookingCutoffTime = bookingCutoffTime;
    if (status !== undefined) updateData.status = status;

    // If changing bus (and no bookings), update total seats
    if (busId && !hasBookings) {
      const newBus = await prisma.bus.findUnique({ where: { id: busId } });
      if (!newBus || !newBus.active) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or inactive bus'
        });
      }
      updateData.busId = busId;
      updateData.totalSeats = newBus.capacity;
      updateData.seatsAvailable = newBus.capacity;
    }

    if (serviceDate && !hasBookings) updateData.serviceDate = new Date(serviceDate);
    if (departureTime && !hasBookings) updateData.departureTime = departureTime;
    if (routePickup1Id && !hasBookings) updateData.routePickup1Id = routePickup1Id;
    if (routePickup2Id !== undefined && !hasBookings) updateData.routePickup2Id = routePickup2Id || null;
    if (routeDropoffId && !hasBookings) updateData.routeDropoffId = routeDropoffId;

    const service = await prisma.scheduledService.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        bus: true,
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Scheduled service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating scheduled service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scheduled service'
    });
  }
});

// ============================================================================
// CANCEL SCHEDULED SERVICE
// ============================================================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const service = await prisma.scheduledService.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled service not found'
      });
    }

    // Check if service already cancelled
    if (service.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Service is already cancelled'
      });
    }

    // If service has bookings, warn about it
    const bookingsCount = service._count.bookings;
    if (bookingsCount > 0) {
      // Don't actually delete, just cancel
      const cancelledService = await prisma.scheduledService.update({
        where: { id: parseInt(id) },
        data: {
          status: 'cancelled',
          cancellationReason: reason || 'Cancelled by admin',
          cancelledAt: new Date(),
          cancelledById: (req as any).user.id
        }
      });

      return res.json({
        success: true,
        message: `Service cancelled. ${bookingsCount} booking(s) affected. Customers should be notified.`,
        data: cancelledService,
        warning: `This service has ${bookingsCount} booking(s). Please notify customers and process refunds.`
      });
    }

    // If no bookings, can actually delete
    await prisma.scheduledService.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Scheduled service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting/cancelling scheduled service:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete/cancel scheduled service'
    });
  }
});

export default router;
