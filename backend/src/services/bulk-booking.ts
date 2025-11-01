import { PrismaClient } from '@prisma/client';
import { generateBookingReference, generateChangeToken } from '../utils/booking-reference';

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================

export interface BulkBookingRow {
  serviceDate: string;          // YYYY-MM-DD
  pickupLocation: string;        // Location name
  seats: number;
  bikes?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerLanguage?: string;
  ticketType?: 'standard' | 'flexi';
  notes?: string;
}

export interface BulkBookingResult {
  success: boolean;
  processed: number;
  created: number;
  failed: number;
  errors: {
    row: number;
    data: BulkBookingRow;
    error: string;
  }[];
  bookings: {
    bookingReference: string;
    serviceDate: string;
    seats: number;
    totalAmount: number;
  }[];
}

// ============================================================================
// CSV PARSING
// ============================================================================

/**
 * Parse CSV string to booking rows
 */
export function parseBookingCSV(csvContent: string): BulkBookingRow[] {
  const lines = csvContent.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Required columns
  const requiredColumns = ['servicedate', 'pickuplocation', 'seats', 'customername', 'customeremail', 'customerphone'];
  const missingColumns = requiredColumns.filter(col =>
    !headers.some(h => h.replace(/[_\s]/g, '') === col.replace(/[_\s]/g, ''))
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Parse data rows
  const rows: BulkBookingRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines

    const values = line.split(',').map(v => v.trim());

    const row: any = {};
    headers.forEach((header, index) => {
      const normalizedHeader = header.replace(/[_\s]/g, '').toLowerCase();
      row[normalizedHeader] = values[index] || '';
    });

    rows.push({
      serviceDate: row.servicedate,
      pickupLocation: row.pickuplocation,
      seats: parseInt(row.seats) || 1,
      bikes: parseInt(row.bikes) || 0,
      customerName: row.customername,
      customerEmail: row.customeremail,
      customerPhone: row.customerphone,
      customerLanguage: row.customerlanguage || 'en',
      ticketType: (row.tickettype || 'standard') as 'standard' | 'flexi',
      notes: row.notes || ''
    });
  }

  return rows;
}

// ============================================================================
// BULK BOOKING CREATION
// ============================================================================

/**
 * Create multiple bookings from CSV data for a B2B customer
 */
export async function createBulkBookings(
  b2bCustomerId: number,
  rows: BulkBookingRow[]
): Promise<BulkBookingResult> {
  const result: BulkBookingResult = {
    success: true,
    processed: 0,
    created: 0,
    failed: 0,
    errors: [],
    bookings: []
  };

  // Get B2B customer
  const b2bCustomer = await prisma.b2BCustomer.findUnique({
    where: { id: b2bCustomerId }
  });

  if (!b2bCustomer) {
    throw new Error(`B2B customer ${b2bCustomerId} not found`);
  }

  // Check if customer is active
  if (!b2bCustomer.active) {
    throw new Error(`B2B customer ${b2bCustomer.companyName} is inactive`);
  }

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    result.processed++;

    try {
      // Parse service date
      const serviceDate = new Date(row.serviceDate);
      if (isNaN(serviceDate.getTime())) {
        throw new Error(`Invalid service date: ${row.serviceDate}`);
      }

      // Find service for this date
      const service = await prisma.scheduledService.findFirst({
        where: {
          serviceDate: {
            gte: new Date(serviceDate.setHours(0, 0, 0, 0)),
            lt: new Date(serviceDate.setHours(23, 59, 59, 999))
          },
          status: 'active'
        },
        include: {
          routePickup1: true,
          routePickup2: true,
          routeDropoff: true
        }
      });

      if (!service) {
        throw new Error(`No active service found for date ${row.serviceDate}`);
      }

      // Find pickup location
      const pickupLocation = [service.routePickup1, service.routePickup2]
        .filter(Boolean)
        .find(route =>
          route!.nameEn.toLowerCase() === row.pickupLocation.toLowerCase() ||
          route!.nameDe?.toLowerCase() === row.pickupLocation.toLowerCase() ||
          route!.nameEs?.toLowerCase() === row.pickupLocation.toLowerCase()
        );

      if (!pickupLocation) {
        throw new Error(`Pickup location "${row.pickupLocation}" not valid for this service`);
      }

      // Check seat availability
      if (service.seatsAvailable < row.seats) {
        throw new Error(`Not enough seats available (need ${row.seats}, available ${service.seatsAvailable})`);
      }

      // Calculate pricing
      const pricePerSeat = row.ticketType === 'flexi'
        ? parseFloat(service.priceFlexi.toString())
        : parseFloat(service.priceStandard.toString());

      // Apply B2B discount
      const discountMultiplier = 1 - (parseFloat(b2bCustomer.discountPercentage.toString()) / 100);
      const discountedPrice = pricePerSeat * discountMultiplier;

      const ivaRate = parseFloat(service.ivaRate.toString());
      const subtotal = discountedPrice * row.seats;
      const ivaAmount = subtotal * ivaRate;
      const totalAmount = subtotal + ivaAmount;

      // Check credit limit if using credit payment terms
      if (b2bCustomer.paymentTerms !== 'prepaid') {
        const currentBalance = parseFloat(b2bCustomer.currentBalance.toString());
        const creditLimit = parseFloat(b2bCustomer.creditLimit.toString());
        const availableCredit = creditLimit - currentBalance;

        if (totalAmount > availableCredit) {
          throw new Error(`Exceeds available credit (need €${totalAmount}, available €${availableCredit})`);
        }
      }

      // Generate booking reference and change token
      const bookingReference = await generateBookingReference();
      const changeToken = row.ticketType === 'flexi' ? generateChangeToken() : null;

      // Create booking
      const booking = await prisma.$transaction(async (tx) => {
        // Create booking
        const newBooking = await tx.scheduledBooking.create({
          data: {
            bookingReference,
            serviceId: service.id,
            customerType: 'b2b',
            b2bCustomerId,
            ticketType: row.ticketType || 'standard',
            seatsBooked: row.seats,
            bikesCount: row.bikes || 0,
            pickupLocationId: pickupLocation.id,
            customerName: row.customerName,
            customerEmail: row.customerEmail,
            customerPhone: row.customerPhone,
            customerLanguage: row.customerLanguage || 'en',
            pricePerSeat: discountedPrice,
            ivaRate,
            ivaAmount,
            totalAmount,
            discountApplied: parseFloat(b2bCustomer.discountPercentage.toString()),
            paymentMethod: b2bCustomer.paymentTerms === 'prepaid' ? 'credit' : 'credit',
            paymentStatus: b2bCustomer.paymentTerms === 'prepaid' ? 'completed' : 'pending',
            paidAt: b2bCustomer.paymentTerms === 'prepaid' ? new Date() : null,
            changeToken,
            changesRemaining: row.ticketType === 'flexi' ? 1 : 0,
            status: 'confirmed',
            confirmationSent: false
          }
        });

        // Update service seats
        await tx.scheduledService.update({
          where: { id: service.id },
          data: {
            seatsAvailable: {
              decrement: row.seats
            }
          }
        });

        // Update B2B customer balance if using credit
        if (b2bCustomer.paymentTerms !== 'prepaid') {
          await tx.b2BCustomer.update({
            where: { id: b2bCustomerId },
            data: {
              currentBalance: {
                increment: totalAmount
              }
            }
          });
        }

        return newBooking;
      });

      result.created++;
      result.bookings.push({
        bookingReference: booking.bookingReference,
        serviceDate: row.serviceDate,
        seats: row.seats,
        totalAmount: parseFloat(booking.totalAmount.toString())
      });

      console.log(`✅ Created booking ${booking.bookingReference} for ${b2bCustomer.companyName}`);

    } catch (error: any) {
      result.failed++;
      result.errors.push({
        row: i + 2, // +2 because 1-indexed and header row
        data: row,
        error: error.message
      });

      console.error(`❌ Failed to create booking for row ${i + 2}:`, error.message);
    }
  }

  result.success = result.failed === 0;

  return result;
}

/**
 * Validate bulk booking CSV before processing
 */
export async function validateBulkBookingCSV(
  b2bCustomerId: number,
  rows: BulkBookingRow[]
): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    totalBookings: number;
    totalSeats: number;
    estimatedCost: number;
    servicesDates: string[];
  };
}> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get B2B customer
  const b2bCustomer = await prisma.b2BCustomer.findUnique({
    where: { id: b2bCustomerId }
  });

  if (!b2bCustomer) {
    errors.push(`B2B customer ${b2bCustomerId} not found`);
    return {
      valid: false,
      errors,
      warnings,
      summary: {
        totalBookings: 0,
        totalSeats: 0,
        estimatedCost: 0,
        servicesDates: []
      }
    };
  }

  if (!b2bCustomer.active) {
    errors.push(`B2B customer ${b2bCustomer.companyName} is inactive`);
  }

  let totalSeats = 0;
  let estimatedCost = 0;
  const servicesDates: Set<string> = new Set();

  // Validate each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    // Validate required fields
    if (!row.serviceDate) errors.push(`Row ${rowNum}: Service date is required`);
    if (!row.pickupLocation) errors.push(`Row ${rowNum}: Pickup location is required`);
    if (!row.seats || row.seats < 1) errors.push(`Row ${rowNum}: Seats must be at least 1`);
    if (!row.customerName) errors.push(`Row ${rowNum}: Customer name is required`);
    if (!row.customerEmail) errors.push(`Row ${rowNum}: Customer email is required`);
    if (!row.customerPhone) errors.push(`Row ${rowNum}: Customer phone is required`);

    totalSeats += row.seats || 0;

    // Estimate cost (simplified - actual cost depends on service)
    const estimatedPricePerSeat = 25; // Average price
    const discountMultiplier = 1 - (parseFloat(b2bCustomer.discountPercentage.toString()) / 100);
    const rowCost = estimatedPricePerSeat * discountMultiplier * (row.seats || 0) * 1.10; // +10% IVA
    estimatedCost += rowCost;

    if (row.serviceDate) {
      servicesDates.add(row.serviceDate);
    }
  }

  // Check credit limit
  if (b2bCustomer.paymentTerms !== 'prepaid') {
    const currentBalance = parseFloat(b2bCustomer.currentBalance.toString());
    const creditLimit = parseFloat(b2bCustomer.creditLimit.toString());
    const availableCredit = creditLimit - currentBalance;

    if (estimatedCost > availableCredit) {
      warnings.push(`Estimated cost (€${estimatedCost.toFixed(2)}) may exceed available credit (€${availableCredit.toFixed(2)})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalBookings: rows.length,
      totalSeats,
      estimatedCost,
      servicesDates: Array.from(servicesDates).sort()
    }
  };
}
