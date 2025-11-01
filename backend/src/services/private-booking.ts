import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// ADMIN: SLOT MANAGEMENT
// ============================================================================

/**
 * Create a new private shuttle slot (admin action)
 */
export async function createPrivateShuttleSlot(data: {
  busId: number;
  serviceDate: Date;
  departureTime: Date;
  basePrice: number; // e.g., 135 EUR including IVA
  pricePerSeat: number; // e.g., 45 EUR per additional seat
  adminNotes?: string;
}): Promise<any> {
  // Get bus capacity
  const bus = await prisma.bus.findUnique({
    where: { id: data.busId },
    select: { capacity: true, name: true, serviceType: true }
  });

  if (!bus) {
    throw new Error('Bus not found');
  }

  // Validate bus service type
  if (bus.serviceType === 'scheduled_only') {
    throw new Error('This bus is designated for scheduled services only and cannot be used for private shuttles');
  }

  // Create the slot
  const slot = await prisma.privateShuttleSlot.create({
    data: {
      busId: data.busId,
      serviceDate: data.serviceDate,
      departureTime: data.departureTime,
      basePrice: data.basePrice,
      pricePerSeat: data.pricePerSeat,
      ivaRate: 0.10, // 10% IVA
      capacity: bus.capacity,
      seatsAvailable: bus.capacity,
      isAvailable: true,
      status: 'active',
      adminNotes: data.adminNotes
    },
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
  });

  return slot;
}

/**
 * Update a private shuttle slot (admin action)
 */
export async function updatePrivateShuttleSlot(
  slotId: number,
  data: {
    basePrice?: number;
    pricePerSeat?: number;
    isAvailable?: boolean;
    estimatedDuration?: number;
    adminNotes?: string;
  }
): Promise<any> {
  const slot = await prisma.privateShuttleSlot.update({
    where: { id: slotId },
    data,
    include: {
      bus: {
        select: {
          name: true,
          licensePlate: true,
          capacity: true
        }
      }
    }
  });

  return slot;
}

/**
 * Cancel a private shuttle slot (admin action)
 */
export async function cancelPrivateShuttleSlot(
  slotId: number,
  reason?: string
): Promise<any> {
  // Check for existing bookings
  const bookingCount = await prisma.privateBooking.count({
    where: {
      slotId,
      status: { in: ['pending', 'confirmed'] }
    }
  });

  if (bookingCount > 0) {
    throw new Error(`Cannot cancel slot: ${bookingCount} active booking(s) exist. Cancel bookings first.`);
  }

  const slot = await prisma.privateShuttleSlot.update({
    where: { id: slotId },
    data: {
      status: 'cancelled',
      isAvailable: false,
      adminNotes: reason
    }
  });

  return slot;
}

/**
 * Get all private shuttle slots (admin view with filters)
 */
export async function getPrivateShuttleSlots(filters: {
  startDate?: Date;
  endDate?: Date;
  busId?: number;
  status?: string;
  isAvailable?: boolean;
}): Promise<any[]> {
  const where: any = {};

  if (filters.startDate || filters.endDate) {
    where.serviceDate = {};
    if (filters.startDate) where.serviceDate.gte = filters.startDate;
    if (filters.endDate) where.serviceDate.lte = filters.endDate;
  }

  if (filters.busId) {
    where.busId = filters.busId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.isAvailable !== undefined) {
    where.isAvailable = filters.isAvailable;
  }

  const slots = await prisma.privateShuttleSlot.findMany({
    where,
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
        where: {
          status: { in: ['pending', 'confirmed'] }
        },
        select: {
          id: true,
          bookingReference: true,
          customerName: true,
          passengersCount: true,
          status: true
        }
      }
    },
    orderBy: [
      { serviceDate: 'asc' },
      { departureTime: 'asc' }
    ]
  });

  return slots;
}

// ============================================================================
// CUSTOMER: BOOKING FLOW
// ============================================================================

/**
 * Get available slots for customer booking (public view)
 */
export async function getAvailablePrivateSlots(filters: {
  startDate?: Date;
  endDate?: Date;
  minSeats?: number;
}): Promise<any[]> {
  const where: any = {
    isAvailable: true,
    status: 'active',
    serviceDate: {
      gte: filters.startDate || new Date()
    }
  };

  if (filters.endDate) {
    where.serviceDate.lte = filters.endDate;
  }

  if (filters.minSeats) {
    where.seatsAvailable = {
      gte: filters.minSeats
    };
  }

  const slots = await prisma.privateShuttleSlot.findMany({
    where,
    select: {
      id: true,
      serviceDate: true,
      departureTime: true,
      basePrice: true,
      pricePerSeat: true,
      seatsAvailable: true,
      capacity: true,
      estimatedDuration: true,
      bus: {
        select: {
          name: true,
          capacity: true,
          bikeCapacity: true
        }
      }
    },
    orderBy: [
      { serviceDate: 'asc' },
      { departureTime: 'asc' }
    ],
    take: 50 // Limit results
  });

  return slots;
}

/**
 * Calculate pricing for a private shuttle booking
 */
export function calculatePrivateShuttlePrice(
  basePrice: number,
  pricePerSeat: number,
  passengersCount: number,
  ivaRate: number = 0.10,
  b2bDiscount: number = 0
): {
  basePrice: number;
  seatCharge: number;
  subtotal: number;
  discountAmount: number;
  subtotalAfterDiscount: number;
  ivaRate: number;
  ivaAmount: number;
  totalAmount: number;
} {
  // Base price covers the shuttle
  // Additional seats are charged at pricePerSeat rate
  // First seat might be included in base price, or charge all seats
  // Based on user's example: €135 base + €45 per seat
  // This suggests base is for service, then per-seat charges apply

  const seatCharge = passengersCount * pricePerSeat;
  const subtotal = basePrice + seatCharge;

  // Apply B2B discount if applicable
  const discountAmount = b2bDiscount > 0 ? subtotal * (b2bDiscount / 100) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;

  // Calculate IVA on discounted amount
  const ivaAmount = subtotalAfterDiscount * ivaRate;
  const totalAmount = subtotalAfterDiscount + ivaAmount;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    seatCharge: Math.round(seatCharge * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    subtotalAfterDiscount: Math.round(subtotalAfterDiscount * 100) / 100,
    ivaRate,
    ivaAmount: Math.round(ivaAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

/**
 * Generate unique booking reference for private bookings
 * Format: MCS-YYYYMMDD-PRV-XXXX
 */
export async function generatePrivateBookingReference(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const datePrefix = `${year}${month}${day}`;

  // Find the highest sequence number for today
  const latestBooking = await prisma.privateBooking.findFirst({
    where: {
      bookingReference: {
        startsWith: `MCS-${datePrefix}-PRV`
      }
    },
    orderBy: {
      bookingReference: 'desc'
    }
  });

  let sequence = 1;
  if (latestBooking) {
    const match = latestBooking.bookingReference.match(/PRV-(\d+)$/);
    if (match) {
      sequence = parseInt(match[1]) + 1;
    }
  }

  const sequenceStr = String(sequence).padStart(4, '0');
  return `MCS-${datePrefix}-PRV-${sequenceStr}`;
}

/**
 * Create a private shuttle booking (customer action)
 */
export async function createPrivateShuttleBooking(data: {
  slotId: number;
  pickupAddress: string;
  dropoffAddress: string;
  passengersCount: number;
  bikesCount?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLanguage: string;
  customerType?: 'b2c' | 'b2b';
  b2bCustomerId?: number;
}): Promise<any> {
  // Get the slot with pricing and availability
  const slot = await prisma.privateShuttleSlot.findUnique({
    where: { id: data.slotId },
    include: {
      bus: {
        select: {
          capacity: true,
          bikeCapacity: true
        }
      }
    }
  });

  if (!slot) {
    throw new Error('Slot not found');
  }

  if (!slot.isAvailable || slot.status !== 'active') {
    throw new Error('Slot is not available for booking');
  }

  if (slot.seatsAvailable < data.passengersCount) {
    throw new Error(`Not enough seats available. Only ${slot.seatsAvailable} seats remaining.`);
  }

  if (data.bikesCount && data.bikesCount > slot.bus.bikeCapacity) {
    throw new Error(`Too many bikes. Maximum capacity: ${slot.bus.bikeCapacity}`);
  }

  // Get B2B discount if applicable
  let b2bDiscount = 0;
  if (data.b2bCustomerId) {
    const b2bCustomer = await prisma.b2BCustomer.findUnique({
      where: { id: data.b2bCustomerId },
      select: { discountPercentage: true }
    });
    if (b2bCustomer) {
      b2bDiscount = parseFloat(b2bCustomer.discountPercentage.toString());
    }
  }

  // Calculate pricing
  const pricing = calculatePrivateShuttlePrice(
    parseFloat(slot.basePrice.toString()),
    parseFloat(slot.pricePerSeat.toString()),
    data.passengersCount,
    parseFloat(slot.ivaRate.toString()),
    b2bDiscount
  );

  // Generate booking reference
  const bookingReference = await generatePrivateBookingReference();

  // Create the booking and update slot availability in a transaction
  const booking = await prisma.$transaction(async (tx) => {
    // Reserve seats in the slot
    await tx.privateShuttleSlot.update({
      where: { id: data.slotId },
      data: {
        seatsAvailable: {
          decrement: data.passengersCount
        }
      }
    });

    // Create the booking
    const newBooking = await tx.privateBooking.create({
      data: {
        bookingReference,
        slotId: data.slotId,
        busId: slot.busId,
        customerType: data.customerType || 'b2c',
        b2bCustomerId: data.b2bCustomerId,
        serviceDate: slot.serviceDate,
        departureTime: slot.departureTime,
        pickupAddress: data.pickupAddress,
        dropoffAddress: data.dropoffAddress,
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        customerLanguage: data.customerLanguage,
        passengersCount: data.passengersCount,
        bikesCount: data.bikesCount || 0,
        basePrice: pricing.basePrice + pricing.seatCharge, // Combined for display
        pricePerSeat: parseFloat(slot.pricePerSeat.toString()),
        ivaRate: pricing.ivaRate,
        ivaAmount: pricing.ivaAmount,
        totalAmount: pricing.totalAmount,
        discountApplied: b2bDiscount,
        paymentMethod: 'stripe', // Default, will be updated
        paymentStatus: 'pending', // Stays pending until payment
        status: 'pending' // Stays pending until admin confirms
      },
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
        b2bCustomer: true
      }
    });

    return newBooking;
  });

  return booking;
}

/**
 * Confirm a private booking (admin action)
 */
export async function confirmPrivateBooking(
  bookingId: number,
  adminId: number,
  adminNotes?: string
): Promise<any> {
  const booking = await prisma.privateBooking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'confirmed') {
    throw new Error('Booking is already confirmed');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Cannot confirm a cancelled booking');
  }

  // Admin confirms the booking
  const confirmedBooking = await prisma.privateBooking.update({
    where: { id: bookingId },
    data: {
      status: 'confirmed',
      confirmedAt: new Date(),
      confirmedById: adminId,
      adminNotes
    },
    include: {
      slot: {
        include: {
          bus: true
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

  // TODO: Send confirmation email to customer

  return confirmedBooking;
}

/**
 * Cancel a private booking
 */
export async function cancelPrivateBooking(
  bookingId: number,
  reason?: string
): Promise<any> {
  const booking = await prisma.privateBooking.findUnique({
    where: { id: bookingId },
    include: {
      slot: true
    }
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'cancelled') {
    throw new Error('Booking is already cancelled');
  }

  if (booking.status === 'completed') {
    throw new Error('Cannot cancel a completed booking');
  }

  // Cancel booking and restore seats in a transaction
  const cancelledBooking = await prisma.$transaction(async (tx) => {
    // Restore seats to the slot
    if (booking.slotId) {
      await tx.privateShuttleSlot.update({
        where: { id: booking.slotId },
        data: {
          seatsAvailable: {
            increment: booking.passengersCount
          }
        }
      });
    }

    // Update booking status
    const updated = await tx.privateBooking.update({
      where: { id: bookingId },
      data: {
        status: 'cancelled',
        adminNotes: reason,
        updatedAt: new Date()
      },
      include: {
        slot: {
          include: {
            bus: true
          }
        }
      }
    });

    return updated;
  });

  // TODO: Process refund if payment was made
  // TODO: Send cancellation email to customer

  return cancelledBooking;
}

/**
 * Update payment status after Stripe webhook
 */
export async function updatePrivateBookingPayment(
  bookingId: number,
  paymentId: string,
  paymentStatus: 'completed' | 'refunded'
): Promise<any> {
  const booking = await prisma.privateBooking.update({
    where: { id: bookingId },
    data: {
      paymentId,
      paymentStatus,
      paidAt: paymentStatus === 'completed' ? new Date() : undefined
    }
  });

  return booking;
}

/**
 * Get private booking statistics
 */
export async function getPrivateBookingStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  averagePrice: number;
}> {
  const where: any = {};

  if (startDate || endDate) {
    where.serviceDate = {};
    if (startDate) where.serviceDate.gte = startDate;
    if (endDate) where.serviceDate.lte = endDate;
  }

  const [total, pending, confirmed, completed, cancelled, revenueData] = await Promise.all([
    prisma.privateBooking.count({ where }),
    prisma.privateBooking.count({ where: { ...where, status: 'pending' } }),
    prisma.privateBooking.count({ where: { ...where, status: 'confirmed' } }),
    prisma.privateBooking.count({ where: { ...where, status: 'completed' } }),
    prisma.privateBooking.count({ where: { ...where, status: 'cancelled' } }),
    prisma.privateBooking.aggregate({
      where: {
        ...where,
        paymentStatus: 'completed'
      },
      _sum: {
        totalAmount: true
      },
      _avg: {
        totalAmount: true
      }
    })
  ]);

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    totalRevenue: parseFloat(revenueData._sum.totalAmount?.toString() || '0'),
    averagePrice: parseFloat(revenueData._avg.totalAmount?.toString() || '0')
  };
}

/**
 * Get private shuttle slot statistics
 */
export async function getPrivateSlotStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSlots: number;
  activeSlots: number;
  bookedSlots: number;
  availableSlots: number;
  totalCapacity: number;
  bookedSeats: number;
  availableSeats: number;
}> {
  const where: any = {};

  if (startDate || endDate) {
    where.serviceDate = {};
    if (startDate) where.serviceDate.gte = startDate;
    if (endDate) where.serviceDate.lte = endDate;
  }

  const [totalSlots, activeSlots, bookedSlots, capacityData, seatsData] = await Promise.all([
    prisma.privateShuttleSlot.count({ where }),
    prisma.privateShuttleSlot.count({ where: { ...where, status: 'active', isAvailable: true } }),
    prisma.privateShuttleSlot.count({ where: { ...where, status: 'booked' } }),
    prisma.privateShuttleSlot.aggregate({
      where,
      _sum: {
        capacity: true,
        seatsAvailable: true
      }
    }),
    prisma.privateBooking.aggregate({
      where: {
        ...where,
        status: { in: ['pending', 'confirmed'] }
      },
      _sum: {
        passengersCount: true
      }
    })
  ]);

  const totalCapacity = parseInt(capacityData._sum.capacity?.toString() || '0');
  const availableSeats = parseInt(capacityData._sum.seatsAvailable?.toString() || '0');
  const bookedSeats = parseInt(seatsData._sum.passengersCount?.toString() || '0');

  return {
    totalSlots,
    activeSlots,
    bookedSlots,
    availableSlots: totalSlots - bookedSlots,
    totalCapacity,
    bookedSeats,
    availableSeats
  };
}
