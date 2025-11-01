import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import {
  parseBookingCSV,
  createBulkBookings,
  validateBulkBookingCSV,
  BulkBookingRow
} from '../../services/bulk-booking';

const router = Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(authenticate as any);

/**
 * Get all B2B customers with pagination
 * GET /api/admin/b2b-customers
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Optional filters
    const { active, customerType, search } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search as string, mode: 'insensitive' } },
        { companyCif: { contains: search as string, mode: 'insensitive' } },
        { contactEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.b2BCustomer.findMany({
        where,
        include: {
          _count: {
            select: {
              scheduledBookings: true,
              privateBookings: true,
              invoices: true
            }
          }
        },
        orderBy: {
          companyName: 'asc'
        },
        skip,
        take: limit
      }),
      prisma.b2BCustomer.count({ where })
    ]);

    return res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching B2B customers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch B2B customers'
    });
  }
});

/**
 * Get single B2B customer by ID
 * GET /api/admin/b2b-customers/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);

    const customer = await prisma.b2BCustomer.findUnique({
      where: { id: customerId },
      include: {
        scheduledBookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            service: {
              include: {
                routePickup1: true,
                routeDropoff: true
              }
            }
          }
        },
        privateBookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            routePickup: true,
            routeDropoff: true
          }
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            scheduledBookings: true,
            privateBookings: true,
            invoices: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'B2B customer not found'
      });
    }

    return res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching B2B customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch B2B customer'
    });
  }
});

/**
 * Create new B2B customer
 * POST /api/admin/b2b-customers
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      companyName,
      companyCif,
      companyAddress,
      companyPostal,
      companyCity,
      companyRegion,
      companyCountry,
      contactName,
      contactEmail,
      contactPhone,
      customerType,
      paymentTerms,
      creditLimit,
      facturaeEnabled,
      facturaeEmail,
      discountPercentage,
      notes
    } = req.body;

    // Validate required fields
    if (!companyName || !companyCif || !contactEmail || !contactPhone) {
      return res.status(400).json({
        success: false,
        error: 'Company name, CIF, contact email, and phone are required'
      });
    }

    // Check if CIF already exists
    const existingCustomer = await prisma.b2BCustomer.findUnique({
      where: { companyCif }
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        error: 'A customer with this CIF already exists'
      });
    }

    // Create customer
    const customer = await prisma.b2BCustomer.create({
      data: {
        companyName,
        companyCif,
        companyAddress: companyAddress || '',
        companyPostal: companyPostal || '',
        companyCity: companyCity || '',
        companyRegion: companyRegion || '',
        companyCountry: companyCountry || 'España',
        contactName,
        contactEmail,
        contactPhone,
        customerType: customerType || 'other',
        paymentTerms: paymentTerms || 'prepaid',
        creditLimit: creditLimit || 0,
        currentBalance: 0,
        facturaeEnabled: facturaeEnabled !== undefined ? facturaeEnabled : true,
        facturaeEmail: facturaeEmail || contactEmail,
        discountPercentage: discountPercentage || 0,
        notes: notes || null,
        active: true,
        createdById: req.user!.userId
      }
    });

    return res.json({
      success: true,
      message: 'B2B customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating B2B customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create B2B customer'
    });
  }
});

/**
 * Update B2B customer
 * PUT /api/admin/b2b-customers/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const {
      companyName,
      companyCif,
      companyAddress,
      companyPostal,
      companyCity,
      companyRegion,
      companyCountry,
      contactName,
      contactEmail,
      contactPhone,
      customerType,
      paymentTerms,
      creditLimit,
      facturaeEnabled,
      facturaeEmail,
      discountPercentage,
      active,
      notes
    } = req.body;

    // Check if customer exists
    const existingCustomer = await prisma.b2BCustomer.findUnique({
      where: { id: customerId }
    });

    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        error: 'B2B customer not found'
      });
    }

    // If changing CIF, check for duplicates
    if (companyCif && companyCif !== existingCustomer.companyCif) {
      const duplicateCif = await prisma.b2BCustomer.findUnique({
        where: { companyCif }
      });

      if (duplicateCif) {
        return res.status(400).json({
          success: false,
          error: 'Another customer with this CIF already exists'
        });
      }
    }

    // Update customer
    const customer = await prisma.b2BCustomer.update({
      where: { id: customerId },
      data: {
        ...(companyName && { companyName }),
        ...(companyCif && { companyCif }),
        ...(companyAddress !== undefined && { companyAddress }),
        ...(companyPostal !== undefined && { companyPostal }),
        ...(companyCity !== undefined && { companyCity }),
        ...(companyRegion !== undefined && { companyRegion }),
        ...(companyCountry !== undefined && { companyCountry }),
        ...(contactName && { contactName }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(customerType && { customerType }),
        ...(paymentTerms && { paymentTerms }),
        ...(creditLimit !== undefined && { creditLimit }),
        ...(facturaeEnabled !== undefined && { facturaeEnabled }),
        ...(facturaeEmail !== undefined && { facturaeEmail }),
        ...(discountPercentage !== undefined && { discountPercentage }),
        ...(active !== undefined && { active }),
        ...(notes !== undefined && { notes })
      }
    });

    return res.json({
      success: true,
      message: 'B2B customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating B2B customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update B2B customer'
    });
  }
});

/**
 * Delete B2B customer
 * DELETE /api/admin/b2b-customers/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);

    // Check if customer exists
    const customer = await prisma.b2BCustomer.findUnique({
      where: { id: customerId },
      include: {
        _count: {
          select: {
            scheduledBookings: true,
            privateBookings: true,
            invoices: true
          }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'B2B customer not found'
      });
    }

    // Check if customer has bookings or invoices
    const hasData = customer._count.scheduledBookings > 0 ||
                    customer._count.privateBookings > 0 ||
                    customer._count.invoices > 0;

    if (hasData) {
      // Soft delete - just deactivate
      await prisma.b2BCustomer.update({
        where: { id: customerId },
        data: { active: false }
      });

      return res.json({
        success: true,
        message: 'B2B customer deactivated (has existing bookings/invoices)',
        data: { id: customerId, active: false }
      });
    } else {
      // Hard delete - no data associated
      await prisma.b2BCustomer.delete({
        where: { id: customerId }
      });

      return res.json({
        success: true,
        message: 'B2B customer deleted successfully',
        data: { id: customerId }
      });
    }
  } catch (error) {
    console.error('Error deleting B2B customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete B2B customer'
    });
  }
});

/**
 * Get B2B customer statistics
 * GET /api/admin/b2b-customers/:id/stats
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);

    // Get customer
    const customer = await prisma.b2BCustomer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'B2B customer not found'
      });
    }

    // Get bookings
    const scheduledBookings = await prisma.scheduledBooking.findMany({
      where: {
        b2bCustomerId: customerId,
        status: { in: ['confirmed', 'completed'] }
      },
      select: {
        totalAmount: true,
        seatsBooked: true,
        createdAt: true
      }
    });

    const privateBookings = await prisma.privateBooking.findMany({
      where: {
        b2bCustomerId: customerId,
        status: { in: ['confirmed', 'completed'] }
      },
      select: {
        totalAmount: true,
        passengersCount: true,
        createdAt: true
      }
    });

    // Calculate stats
    const totalBookings = scheduledBookings.length + privateBookings.length;
    const totalRevenue =
      scheduledBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0) +
      privateBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);

    const totalSeats = scheduledBookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    const totalPassengers = privateBookings.reduce((sum, b) => sum + b.passengersCount, 0);

    // This month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthBookings = [...scheduledBookings, ...privateBookings].filter(
      b => b.createdAt >= monthStart
    );

    const thisMonthRevenue = thisMonthBookings.reduce((sum, b) =>
      sum + parseFloat(b.totalAmount.toString()), 0
    );

    // Average booking value
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return res.json({
      success: true,
      data: {
        totalBookings,
        totalRevenue,
        totalSeats,
        totalPassengers,
        averageBookingValue,
        thisMonth: {
          bookings: thisMonthBookings.length,
          revenue: thisMonthRevenue
        },
        creditInfo: {
          creditLimit: parseFloat(customer.creditLimit.toString()),
          currentBalance: parseFloat(customer.currentBalance.toString()),
          available: parseFloat(customer.creditLimit.toString()) -
                    parseFloat(customer.currentBalance.toString())
        },
        discountPercentage: parseFloat(customer.discountPercentage.toString())
      }
    });
  } catch (error) {
    console.error('Error fetching B2B customer stats:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch B2B customer statistics'
    });
  }
});

/**
 * Update B2B customer balance
 * POST /api/admin/b2b-customers/:id/balance
 */
router.post('/:id/balance', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const { amount, operation, reason } = req.body;

    if (!amount || !operation) {
      return res.status(400).json({
        success: false,
        error: 'Amount and operation (add/subtract) are required'
      });
    }

    const customer = await prisma.b2BCustomer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        error: 'B2B customer not found'
      });
    }

    const amountValue = parseFloat(amount);
    const currentBalance = parseFloat(customer.currentBalance.toString());

    let newBalance: number;
    if (operation === 'add') {
      newBalance = currentBalance + amountValue;
    } else if (operation === 'subtract') {
      newBalance = currentBalance - amountValue;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Operation must be "add" or "subtract"'
      });
    }

    // Update balance
    const updatedCustomer = await prisma.b2BCustomer.update({
      where: { id: customerId },
      data: {
        currentBalance: newBalance
      }
    });

    console.log(`B2B customer ${customer.companyName} balance updated: ${currentBalance} → ${newBalance} (${operation} ${amountValue}) - Reason: ${reason || 'N/A'}`);

    return res.json({
      success: true,
      message: 'Balance updated successfully',
      data: {
        previousBalance: currentBalance,
        newBalance,
        operation,
        amount: amountValue,
        creditLimit: parseFloat(updatedCustomer.creditLimit.toString()),
        available: parseFloat(updatedCustomer.creditLimit.toString()) - newBalance
      }
    });
  } catch (error) {
    console.error('Error updating B2B customer balance:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update balance'
    });
  }
});

/**
 * Get B2B customer types summary
 * GET /api/admin/b2b-customers/summary/types
 */
router.get('/summary/types', async (_req: Request, res: Response) => {
  try {
    const byType = await prisma.b2BCustomer.groupBy({
      by: ['customerType'],
      _count: true,
      where: { active: true }
    });

    const total = await prisma.b2BCustomer.count({
      where: { active: true }
    });

    return res.json({
      success: true,
      data: {
        total,
        byType
      }
    });
  } catch (error) {
    console.error('Error fetching B2B customer summary:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch summary'
    });
  }
});

/**
 * Validate bulk booking CSV
 * POST /api/admin/b2b-customers/:id/bulk-bookings/validate
 */
router.post('/:id/bulk-bookings/validate', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const { csvContent, rows } = req.body;

    let bookingRows: BulkBookingRow[];

    if (csvContent) {
      // Parse CSV
      bookingRows = parseBookingCSV(csvContent);
    } else if (rows) {
      // Use provided rows
      bookingRows = rows;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either csvContent or rows array is required'
      });
    }

    const validation = await validateBulkBookingCSV(customerId, bookingRows);

    return res.json({
      success: validation.valid,
      data: validation
    });
  } catch (error: any) {
    console.error('Error validating bulk bookings:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to validate bulk bookings'
    });
  }
});

/**
 * Create bulk bookings from CSV
 * POST /api/admin/b2b-customers/:id/bulk-bookings
 */
router.post('/:id/bulk-bookings', async (req: Request, res: Response) => {
  try {
    const customerId = parseInt(req.params.id);
    const { csvContent, rows } = req.body;

    let bookingRows: BulkBookingRow[];

    if (csvContent) {
      // Parse CSV
      bookingRows = parseBookingCSV(csvContent);
    } else if (rows) {
      // Use provided rows
      bookingRows = rows;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either csvContent or rows array is required'
      });
    }

    // Validate first
    const validation = await validateBulkBookingCSV(customerId, bookingRows);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        data: validation
      });
    }

    // Create bookings
    const result = await createBulkBookings(customerId, bookingRows);

    return res.json({
      success: result.success,
      message: `Created ${result.created} of ${result.processed} bookings`,
      data: result
    });
  } catch (error: any) {
    console.error('Error creating bulk bookings:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create bulk bookings'
    });
  }
});

export default router;
