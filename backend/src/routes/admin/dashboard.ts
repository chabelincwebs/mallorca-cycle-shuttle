import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/auth';
import {
  getDashboardStats,
  getRevenueStats,
  getOccupancyStats,
  getRecentBookings,
  getUpcomingServices,
  getCustomerStats
} from '../../services/statistics';

const router = Router();

// All routes require admin authentication
router.use(authenticate as any);

/**
 * Get dashboard overview
 * GET /api/admin/dashboard
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const stats = await getDashboardStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics'
    });
  }
});

/**
 * Get revenue analytics
 * GET /api/admin/dashboard/revenue
 * Query params: startDate, endDate (ISO format)
 */
router.get('/revenue', async (req: Request, res: Response) => {
  try {
    // Default to last 30 days
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = await getRevenueStats(startDate, endDate);

    res.json({
      success: true,
      data: {
        ...stats,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue statistics'
    });
  }
});

/**
 * Get occupancy analytics
 * GET /api/admin/dashboard/occupancy
 * Query params: startDate, endDate (ISO format)
 */
router.get('/occupancy', async (req: Request, res: Response) => {
  try {
    // Default to next 30 days
    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : new Date();

    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const stats = await getOccupancyStats(startDate, endDate);

    res.json({
      success: true,
      data: {
        ...stats,
        period: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      }
    });
  } catch (error) {
    console.error('Error fetching occupancy stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch occupancy statistics'
    });
  }
});

/**
 * Get recent bookings
 * GET /api/admin/dashboard/recent-bookings
 * Query params: limit (default: 20)
 */
router.get('/recent-bookings', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : 20;

    const bookings = await getRecentBookings(limit);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching recent bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent bookings'
    });
  }
});

/**
 * Get upcoming services
 * GET /api/admin/dashboard/upcoming-services
 * Query params: limit (default: 20)
 */
router.get('/upcoming-services', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit
      ? parseInt(req.query.limit as string)
      : 20;

    const services = await getUpcomingServices(limit);

    // Add occupancy percentage to each service
    const servicesWithOccupancy = services.map(service => {
      const bookedSeats = service.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
      const occupancyRate = service.totalSeats > 0
        ? (bookedSeats / service.totalSeats) * 100
        : 0;

      return {
        ...service,
        bookedSeats,
        occupancyRate: Math.round(occupancyRate * 10) / 10 // Round to 1 decimal
      };
    });

    res.json({
      success: true,
      data: servicesWithOccupancy
    });
  } catch (error) {
    console.error('Error fetching upcoming services:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch upcoming services'
    });
  }
});

/**
 * Get customer analytics
 * GET /api/admin/dashboard/customers
 */
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const stats = await getCustomerStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer statistics'
    });
  }
});

/**
 * Get quick stats summary
 * GET /api/admin/dashboard/quick-stats
 */
router.get('/quick-stats', async (req: Request, res: Response) => {
  try {
    const [dashboardStats, customerStats] = await Promise.all([
      getDashboardStats(),
      getCustomerStats()
    ]);

    res.json({
      success: true,
      data: {
        today: dashboardStats.today,
        thisWeek: dashboardStats.thisWeek,
        thisMonth: dashboardStats.thisMonth,
        customers: {
          total: customerStats.totalCustomers,
          newThisMonth: customerStats.newThisMonth,
          repeat: customerStats.repeatCustomers
        },
        nextService: dashboardStats.upcoming.nextService ? {
          id: dashboardStats.upcoming.nextService.id,
          date: dashboardStats.upcoming.nextService.serviceDate,
          route: `${dashboardStats.upcoming.nextService.routePickup1.nameEn} → ${dashboardStats.upcoming.nextService.routeDropoff.nameEn}`,
          bookings: dashboardStats.upcoming.nextService.bookings.length,
          totalSeats: dashboardStats.upcoming.nextService.totalSeats
        } : null
      }
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quick statistics'
    });
  }
});

export default router;
