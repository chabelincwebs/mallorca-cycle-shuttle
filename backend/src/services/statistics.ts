import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// DASHBOARD OVERVIEW STATISTICS
// ============================================================================

export interface DashboardStats {
  today: {
    bookings: number;
    revenue: number;
    seats: number;
    services: number;
  };
  thisWeek: {
    bookings: number;
    revenue: number;
    seats: number;
    services: number;
  };
  thisMonth: {
    bookings: number;
    revenue: number;
    seats: number;
    services: number;
  };
  upcoming: {
    nextService: any;
    bookingsToday: any[];
    servicesTomorrow: number;
  };
}

/**
 * Get comprehensive dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Week boundaries (Monday to Sunday)
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  // Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Today's stats
  const [todayBookings, todayServices] = await Promise.all([
    prisma.scheduledBooking.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: {
          in: ['confirmed', 'completed']
        }
      },
      select: {
        totalAmount: true,
        seatsBooked: true
      }
    }),
    prisma.scheduledService.count({
      where: {
        serviceDate: today,
        status: 'active'
      }
    })
  ]);

  const todayRevenue = todayBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  const todaySeats = todayBookings.reduce((sum, b) => sum + b.seatsBooked, 0);

  // This week's stats
  const [weekBookings, weekServices] = await Promise.all([
    prisma.scheduledBooking.findMany({
      where: {
        createdAt: {
          gte: weekStart,
          lt: weekEnd
        },
        status: {
          in: ['confirmed', 'completed']
        }
      },
      select: {
        totalAmount: true,
        seatsBooked: true
      }
    }),
    prisma.scheduledService.count({
      where: {
        serviceDate: {
          gte: weekStart,
          lt: weekEnd
        },
        status: 'active'
      }
    })
  ]);

  const weekRevenue = weekBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  const weekSeats = weekBookings.reduce((sum, b) => sum + b.seatsBooked, 0);

  // This month's stats
  const [monthBookings, monthServices] = await Promise.all([
    prisma.scheduledBooking.findMany({
      where: {
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        },
        status: {
          in: ['confirmed', 'completed']
        }
      },
      select: {
        totalAmount: true,
        seatsBooked: true
      }
    }),
    prisma.scheduledService.count({
      where: {
        serviceDate: {
          gte: monthStart,
          lte: monthEnd
        },
        status: 'active'
      }
    })
  ]);

  const monthRevenue = monthBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  const monthSeats = monthBookings.reduce((sum, b) => sum + b.seatsBooked, 0);

  // Upcoming services
  const nextService = await prisma.scheduledService.findFirst({
    where: {
      serviceDate: {
        gte: now
      },
      status: 'active'
    },
    include: {
      bus: true,
      routePickup1: true,
      routeDropoff: true,
      bookings: {
        where: {
          status: {
            in: ['confirmed', 'completed']
          }
        }
      }
    },
    orderBy: {
      serviceDate: 'asc'
    }
  });

  // Today's bookings
  const bookingsToday = await prisma.scheduledBooking.findMany({
    where: {
      service: {
        serviceDate: today
      },
      status: {
        in: ['confirmed', 'completed']
      }
    },
    include: {
      service: {
        include: {
          routePickup1: true,
          routeDropoff: true
        }
      },
      pickupLocation: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  });

  // Tomorrow's services
  const servicesTomorrow = await prisma.scheduledService.count({
    where: {
      serviceDate: tomorrow,
      status: 'active'
    }
  });

  return {
    today: {
      bookings: todayBookings.length,
      revenue: todayRevenue,
      seats: todaySeats,
      services: todayServices
    },
    thisWeek: {
      bookings: weekBookings.length,
      revenue: weekRevenue,
      seats: weekSeats,
      services: weekServices
    },
    thisMonth: {
      bookings: monthBookings.length,
      revenue: monthRevenue,
      seats: monthSeats,
      services: monthServices
    },
    upcoming: {
      nextService,
      bookingsToday,
      servicesTomorrow
    }
  };
}

// ============================================================================
// REVENUE ANALYTICS
// ============================================================================

export interface RevenueStats {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  byTicketType: {
    standard: { count: number; revenue: number };
    flexi: { count: number; revenue: number };
  };
  byCustomerType: {
    b2c: { count: number; revenue: number };
    b2b: { count: number; revenue: number };
  };
  byPaymentMethod: {
    [key: string]: { count: number; revenue: number };
  };
  timeline: {
    date: string;
    revenue: number;
    bookings: number;
  }[];
}

/**
 * Get revenue statistics for date range
 */
export async function getRevenueStats(
  startDate: Date,
  endDate: Date
): Promise<RevenueStats> {
  // Get all bookings in range
  const bookings = await prisma.scheduledBooking.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['confirmed', 'completed']
      },
      paymentStatus: 'completed'
    },
    select: {
      totalAmount: true,
      ticketType: true,
      customerType: true,
      paymentMethod: true,
      createdAt: true
    }
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0);
  const averageBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // By ticket type
  const standardBookings = bookings.filter(b => b.ticketType === 'standard');
  const flexiBookings = bookings.filter(b => b.ticketType === 'flexi');

  // By customer type
  const b2cBookings = bookings.filter(b => b.customerType === 'b2c');
  const b2bBookings = bookings.filter(b => b.customerType === 'b2b');

  // By payment method
  const byPaymentMethod: { [key: string]: { count: number; revenue: number } } = {};
  bookings.forEach(b => {
    if (!byPaymentMethod[b.paymentMethod]) {
      byPaymentMethod[b.paymentMethod] = { count: 0, revenue: 0 };
    }
    byPaymentMethod[b.paymentMethod].count++;
    byPaymentMethod[b.paymentMethod].revenue += parseFloat(b.totalAmount.toString());
  });

  // Timeline (daily aggregation)
  const timelineMap = new Map<string, { revenue: number; bookings: number }>();
  bookings.forEach(b => {
    const dateKey = b.createdAt.toISOString().split('T')[0];
    if (!timelineMap.has(dateKey)) {
      timelineMap.set(dateKey, { revenue: 0, bookings: 0 });
    }
    const day = timelineMap.get(dateKey)!;
    day.revenue += parseFloat(b.totalAmount.toString());
    day.bookings++;
  });

  const timeline = Array.from(timelineMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    totalBookings: bookings.length,
    averageBookingValue,
    byTicketType: {
      standard: {
        count: standardBookings.length,
        revenue: standardBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0)
      },
      flexi: {
        count: flexiBookings.length,
        revenue: flexiBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0)
      }
    },
    byCustomerType: {
      b2c: {
        count: b2cBookings.length,
        revenue: b2cBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0)
      },
      b2b: {
        count: b2bBookings.length,
        revenue: b2bBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount.toString()), 0)
      }
    },
    byPaymentMethod,
    timeline
  };
}

// ============================================================================
// OCCUPANCY ANALYTICS
// ============================================================================

export interface OccupancyStats {
  averageOccupancy: number;
  totalSeatsAvailable: number;
  totalSeatsBooked: number;
  byRoute: {
    routeName: string;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
    servicesCount: number;
  }[];
  byDay: {
    date: string;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
    servicesCount: number;
  }[];
  topServices: {
    id: number;
    date: string;
    route: string;
    totalSeats: number;
    bookedSeats: number;
    occupancyRate: number;
  }[];
}

/**
 * Get occupancy statistics for date range
 */
export async function getOccupancyStats(
  startDate: Date,
  endDate: Date
): Promise<OccupancyStats> {
  // Get all services in range
  const services = await prisma.scheduledService.findMany({
    where: {
      serviceDate: {
        gte: startDate,
        lte: endDate
      },
      status: {
        in: ['active', 'completed']
      }
    },
    include: {
      routePickup1: true,
      routeDropoff: true,
      bookings: {
        where: {
          status: {
            in: ['confirmed', 'completed']
          }
        },
        select: {
          seatsBooked: true
        }
      }
    }
  });

  const totalSeatsAvailable = services.reduce((sum, s) => sum + s.totalSeats, 0);
  const totalSeatsBooked = services.reduce((sum, s) => {
    const booked = s.bookings.reduce((bSum, b) => bSum + b.seatsBooked, 0);
    return sum + booked;
  }, 0);

  const averageOccupancy = totalSeatsAvailable > 0
    ? (totalSeatsBooked / totalSeatsAvailable) * 100
    : 0;

  // By route
  const routeMap = new Map<string, {
    totalSeats: number;
    bookedSeats: number;
    servicesCount: number;
  }>();

  services.forEach(s => {
    const routeKey = `${s.routePickup1.nameEn} → ${s.routeDropoff.nameEn}`;
    if (!routeMap.has(routeKey)) {
      routeMap.set(routeKey, { totalSeats: 0, bookedSeats: 0, servicesCount: 0 });
    }
    const route = routeMap.get(routeKey)!;
    route.totalSeats += s.totalSeats;
    route.bookedSeats += s.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    route.servicesCount++;
  });

  const byRoute = Array.from(routeMap.entries()).map(([routeName, data]) => ({
    routeName,
    ...data,
    occupancyRate: data.totalSeats > 0 ? (data.bookedSeats / data.totalSeats) * 100 : 0
  })).sort((a, b) => b.occupancyRate - a.occupancyRate);

  // By day
  const dayMap = new Map<string, {
    totalSeats: number;
    bookedSeats: number;
    servicesCount: number;
  }>();

  services.forEach(s => {
    const dateKey = s.serviceDate.toISOString().split('T')[0];
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, { totalSeats: 0, bookedSeats: 0, servicesCount: 0 });
    }
    const day = dayMap.get(dateKey)!;
    day.totalSeats += s.totalSeats;
    day.bookedSeats += s.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
    day.servicesCount++;
  });

  const byDay = Array.from(dayMap.entries()).map(([date, data]) => ({
    date,
    ...data,
    occupancyRate: data.totalSeats > 0 ? (data.bookedSeats / data.totalSeats) * 100 : 0
  })).sort((a, b) => a.date.localeCompare(b.date));

  // Top services by occupancy
  const topServices = services
    .map(s => {
      const bookedSeats = s.bookings.reduce((sum, b) => sum + b.seatsBooked, 0);
      return {
        id: s.id,
        date: s.serviceDate.toISOString().split('T')[0],
        route: `${s.routePickup1.nameEn} → ${s.routeDropoff.nameEn}`,
        totalSeats: s.totalSeats,
        bookedSeats,
        occupancyRate: s.totalSeats > 0 ? (bookedSeats / s.totalSeats) * 100 : 0
      };
    })
    .sort((a, b) => b.occupancyRate - a.occupancyRate)
    .slice(0, 10);

  return {
    averageOccupancy,
    totalSeatsAvailable,
    totalSeatsBooked,
    byRoute,
    byDay,
    topServices
  };
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

/**
 * Get recent bookings
 */
export async function getRecentBookings(limit: number = 20) {
  return await prisma.scheduledBooking.findMany({
    include: {
      service: {
        include: {
          routePickup1: true,
          routeDropoff: true,
          bus: true
        }
      },
      pickupLocation: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  });
}

/**
 * Get upcoming services
 */
export async function getUpcomingServices(limit: number = 20) {
  const now = new Date();

  return await prisma.scheduledService.findMany({
    where: {
      serviceDate: {
        gte: now
      },
      status: 'active'
    },
    include: {
      bus: true,
      routePickup1: true,
      routeDropoff: true,
      bookings: {
        where: {
          status: {
            in: ['confirmed', 'completed']
          }
        }
      }
    },
    orderBy: [
      { serviceDate: 'asc' },
      { departureTime: 'asc' }
    ],
    take: limit
  });
}

// ============================================================================
// CUSTOMER ANALYTICS
// ============================================================================

export interface CustomerStats {
  totalCustomers: number;
  newThisMonth: number;
  repeatCustomers: number;
  topCustomers: {
    email: string;
    name: string;
    bookings: number;
    totalSpent: number;
  }[];
  byLanguage: {
    [key: string]: number;
  };
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(): Promise<CustomerStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all bookings
  const allBookings = await prisma.scheduledBooking.findMany({
    where: {
      status: {
        in: ['confirmed', 'completed']
      }
    },
    select: {
      customerEmail: true,
      customerName: true,
      totalAmount: true,
      createdAt: true,
      customerLanguage: true
    }
  });

  // Unique customers
  const uniqueEmails = new Set(allBookings.map(b => b.customerEmail));
  const totalCustomers = uniqueEmails.size;

  // New this month
  const newThisMonth = new Set(
    allBookings
      .filter(b => b.createdAt >= monthStart)
      .map(b => b.customerEmail)
  ).size;

  // Repeat customers (more than 1 booking)
  const customerBookingCounts = new Map<string, number>();
  allBookings.forEach(b => {
    customerBookingCounts.set(
      b.customerEmail,
      (customerBookingCounts.get(b.customerEmail) || 0) + 1
    );
  });
  const repeatCustomers = Array.from(customerBookingCounts.values())
    .filter(count => count > 1).length;

  // Top customers
  const customerStats = new Map<string, { name: string; bookings: number; totalSpent: number }>();
  allBookings.forEach(b => {
    if (!customerStats.has(b.customerEmail)) {
      customerStats.set(b.customerEmail, { name: b.customerName, bookings: 0, totalSpent: 0 });
    }
    const stats = customerStats.get(b.customerEmail)!;
    stats.bookings++;
    stats.totalSpent += parseFloat(b.totalAmount.toString());
  });

  const topCustomers = Array.from(customerStats.entries())
    .map(([email, stats]) => ({ email, ...stats }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // By language
  const byLanguage: { [key: string]: number } = {};
  allBookings.forEach(b => {
    byLanguage[b.customerLanguage] = (byLanguage[b.customerLanguage] || 0) + 1;
  });

  return {
    totalCustomers,
    newThisMonth,
    repeatCustomers,
    topCustomers,
    byLanguage
  };
}
