import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth';
import {
  createInvoice,
  createInvoiceFromScheduledBooking,
  createInvoiceFromPrivateBooking,
  getInvoice,
  getInvoiceByNumber,
  verifyInvoiceIntegrity,
  generateInvoicePDF,
  InvoiceData
} from '../../services/invoice';

const router = Router();
const prisma = new PrismaClient();

// All routes require admin authentication
router.use(authenticate as any);

/**
 * Get all invoices with pagination
 * GET /api/admin/invoices
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Optional filters
    const { status, customerType, year, month, search } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (year) {
      where.invoiceYear = parseInt(year as string);
    }

    if (month) {
      const startDate = new Date(parseInt(year as string || new Date().getFullYear().toString()), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string || new Date().getFullYear().toString()), parseInt(month as string), 0);

      where.issueDate = {
        gte: startDate,
        lte: endDate
      };
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search as string } },
        { customerName: { contains: search as string, mode: 'insensitive' } },
        { customerEmail: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          series: true,
          b2bCustomer: {
            select: {
              companyName: true,
              companyCif: true
            }
          },
          lines: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

/**
 * Get single invoice by ID
 * GET /api/admin/invoices/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.id);

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
});

/**
 * Get invoice by invoice number
 * GET /api/admin/invoices/number/:invoiceNumber
 */
router.get('/number/:invoiceNumber', async (req: Request, res: Response) => {
  try {
    const { invoiceNumber } = req.params;

    const invoice = await getInvoiceByNumber(invoiceNumber);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice'
    });
  }
});

/**
 * Create invoice manually
 * POST /api/admin/invoices
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const invoiceData: InvoiceData = req.body;
    const createdById = req.user!.userId;

    const invoice = await createInvoice(invoiceData, createdById);

    res.json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
});

/**
 * Generate invoice from scheduled booking
 * POST /api/admin/invoices/from-booking/scheduled/:bookingId
 */
router.post('/from-booking/scheduled/:bookingId', async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const createdById = req.user!.userId;

    const invoice = await createInvoiceFromScheduledBooking(bookingId, createdById);

    res.json({
      success: true,
      message: 'Invoice generated from scheduled booking',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error generating invoice from booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate invoice'
    });
  }
});

/**
 * Generate invoice from private booking
 * POST /api/admin/invoices/from-booking/private/:bookingId
 */
router.post('/from-booking/private/:bookingId', async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    const createdById = req.user!.userId;

    const invoice = await createInvoiceFromPrivateBooking(bookingId, createdById);

    res.json({
      success: true,
      message: 'Invoice generated from private booking',
      data: invoice
    });
  } catch (error: any) {
    console.error('Error generating invoice from private booking:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate invoice'
    });
  }
});

/**
 * Download invoice PDF
 * GET /api/admin/invoices/:id/pdf
 */
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.id);

    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    const pdfBuffer = await generateInvoicePDF(invoiceId);

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate invoice PDF'
    });
  }
});

/**
 * Verify invoice integrity (hash chain)
 * GET /api/admin/invoices/:id/verify
 */
router.get('/:id/verify', async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.id);

    const isValid = await verifyInvoiceIntegrity(invoiceId);

    res.json({
      success: true,
      data: {
        invoiceId,
        isValid,
        message: isValid
          ? 'Invoice integrity verified - hash chain is valid'
          : 'Invoice integrity check failed - hash chain is invalid'
      }
    });
  } catch (error) {
    console.error('Error verifying invoice integrity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify invoice integrity'
    });
  }
});

/**
 * Get invoice statistics
 * GET /api/admin/invoices/stats/summary
 */
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const { year, month } = req.query;

    const where: any = {};

    if (year) {
      where.invoiceYear = parseInt(year as string);
    }

    if (month) {
      const startDate = new Date(parseInt(year as string || new Date().getFullYear().toString()), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string || new Date().getFullYear().toString()), parseInt(month as string), 0);

      where.issueDate = {
        gte: startDate,
        lte: endDate
      };
    }

    const [
      totalInvoices,
      totalAmount,
      byStatus,
      byCustomerType
    ] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.aggregate({
        where,
        _sum: {
          totalAmount: true,
          baseAmount: true,
          totalIva: true
        }
      }),
      prisma.invoice.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: {
          totalAmount: true
        }
      }),
      prisma.invoice.groupBy({
        by: ['customerType'],
        where,
        _count: true,
        _sum: {
          totalAmount: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalInvoices,
        totalAmount: totalAmount._sum.totalAmount || 0,
        totalBase: totalAmount._sum.baseAmount || 0,
        totalIva: totalAmount._sum.totalIva || 0,
        byStatus,
        byCustomerType
      }
    });
  } catch (error) {
    console.error('Error fetching invoice statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice statistics'
    });
  }
});

/**
 * Get invoice series
 * GET /api/admin/invoices/series/all
 */
router.get('/series/all', async (req: Request, res: Response) => {
  try {
    const series = await prisma.invoiceSeries.findMany({
      orderBy: [
        { year: 'desc' },
        { seriesCode: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: series
    });
  } catch (error) {
    console.error('Error fetching invoice series:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoice series'
    });
  }
});

/**
 * Update invoice status
 * PATCH /api/admin/invoices/:id/status
 */
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const validStatuses = ['draft', 'issued', 'sent', 'paid', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status }
    });

    res.json({
      success: true,
      message: 'Invoice status updated',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update invoice status'
    });
  }
});

export default router;
