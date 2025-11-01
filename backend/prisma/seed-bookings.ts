import { PrismaClient } from '@prisma/client';
import { generateBookingReference, generateChangeToken } from '../src/utils/booking-reference';

const prisma = new PrismaClient();

async function seedBookings() {
  console.log('📋 Seeding bookings...\n');

  // Get active services
  const services = await prisma.scheduledService.findMany({
    where: { status: 'active' },
    include: {
      routePickup1: true,
      routePickup2: true
    },
    take: 10,
    orderBy: { serviceDate: 'asc' }
  });

  if (services.length === 0) {
    console.error('❌ No active services found. Please run seed-services.ts first.');
    return;
  }

  console.log(`✅ Found ${services.length} active services\n`);
  console.log('Creating sample bookings...\n');

  const bookings = [];
  let totalSeatsBooked = 0;

  // Sample customer data
  const customers = [
    { name: 'John Smith', email: 'john.smith@example.com', phone: '+44 7700 900123', language: 'en' },
    { name: 'Anna Müller', email: 'anna.mueller@example.de', phone: '+49 170 1234567', language: 'de' },
    { name: 'Carlos García', email: 'carlos.garcia@example.es', phone: '+34 612 345 678', language: 'es' },
    { name: 'Sophie Martin', email: 'sophie.martin@example.fr', phone: '+33 6 12 34 56 78', language: 'fr' },
    { name: 'Marco Rossi', email: 'marco.rossi@example.it', phone: '+39 333 1234567', language: 'it' },
    { name: 'Emma Johnson', email: 'emma.johnson@example.com', phone: '+44 7700 900456', language: 'en' },
    { name: 'Lars Andersson', email: 'lars.andersson@example.se', phone: '+46 70 123 4567', language: 'en' },
    { name: 'Marie Dubois', email: 'marie.dubois@example.fr', phone: '+33 6 23 45 67 89', language: 'fr' }
  ];

  // Create bookings for each service (vary the number)
  for (let i = 0; i < services.length; i++) {
    const service = services[i];
    const bookingsPerService = Math.floor(Math.random() * 3) + 1; // 1-3 bookings per service

    for (let j = 0; j < bookingsPerService; j++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const ticketType = Math.random() > 0.6 ? 'flexi' : 'standard';
      const seatsBooked = Math.floor(Math.random() * 3) + 1; // 1-3 seats
      const bikesCount = Math.random() > 0.3 ? seatsBooked : 0; // 70% chance of bikes

      // Check if we have enough seats
      if (totalSeatsBooked + seatsBooked > service.seatsAvailable) {
        continue;
      }

      // Determine pickup location (random between pickup1 and pickup2 if available)
      const pickupLocationId = service.routePickup2Id && Math.random() > 0.5
        ? service.routePickup2Id
        : service.routePickup1Id;

      // Calculate pricing
      const pricePerSeat = ticketType === 'flexi'
        ? parseFloat(service.priceFlexi.toString())
        : parseFloat(service.priceStandard.toString());

      const ivaRate = parseFloat(service.ivaRate.toString());
      const subtotal = pricePerSeat * seatsBooked;
      const baseAmount = subtotal;
      const ivaAmount = baseAmount * ivaRate;
      const totalAmount = baseAmount + ivaAmount;

      // Generate unique booking reference
      let bookingReference = generateBookingReference();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await prisma.scheduledBooking.findUnique({
          where: { bookingReference }
        });
        if (!existing) break;
        bookingReference = generateBookingReference();
        attempts++;
      }

      // Generate change token for flexi tickets
      const changeToken = ticketType === 'flexi' ? generateChangeToken() : null;
      const changesRemaining = ticketType === 'flexi' ? 1 : 0;

      // Determine booking status (90% confirmed, 10% cancelled)
      const status = Math.random() > 0.1 ? 'confirmed' : 'cancelled';
      const paymentStatus = status === 'confirmed' ? 'completed' : 'refunded';

      // Create booking and update service seats in a transaction
      const booking = await prisma.$transaction(async (tx) => {
        const newBooking = await tx.scheduledBooking.create({
          data: {
            bookingReference,
            serviceId: service.id,
            customerType: 'b2c',
            ticketType,
            seatsBooked,
            bikesCount,
            pickupLocationId,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            customerLanguage: customer.language,
            pricePerSeat,
            ivaRate,
            ivaAmount,
            totalAmount,
            discountApplied: 0,
            paymentMethod: 'stripe',
            paymentStatus,
            changeToken,
            changesRemaining,
            status,
            ...(status === 'cancelled' && { cancelledAt: new Date() })
          }
        });

        // Update service seats available (only for confirmed bookings)
        if (status === 'confirmed') {
          await tx.scheduledService.update({
            where: { id: service.id },
            data: {
              seatsAvailable: {
                decrement: seatsBooked
              }
            }
          });
          totalSeatsBooked += seatsBooked;
        }

        return newBooking;
      });

      bookings.push(booking);
      console.log(`   ✓ Created ${status} booking: ${bookingReference} - ${customer.name} (${seatsBooked} seats, ${ticketType})`);
    }
  }

  console.log(`\n✅ Created ${bookings.length} bookings\n`);

  // Show summary statistics
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const flexi = bookings.filter(b => b.ticketType === 'flexi').length;
  const standard = bookings.filter(b => b.ticketType === 'standard').length;

  console.log('Booking Statistics:');
  console.log(`   - Confirmed: ${confirmed}`);
  console.log(`   - Cancelled: ${cancelled}`);
  console.log(`   - Flexi tickets: ${flexi}`);
  console.log(`   - Standard tickets: ${standard}`);
  console.log(`   - Total seats booked: ${totalSeatsBooked}`);

  console.log('\n✅ Bookings seeding complete!\n');

  return bookings;
}

// Run the seed if called directly
if (require.main === module) {
  seedBookings()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding bookings:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedBookings };
