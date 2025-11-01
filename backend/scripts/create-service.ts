import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get buses
  const buses = await prisma.bus.findMany({
    select: { id: true, name: true, capacity: true, serviceType: true }
  });
  console.log('Buses:', JSON.stringify(buses, null, 2));

  // Get routes
  const routes = await prisma.route.findMany({
    select: { id: true, nameEn: true, locationType: true }
  });
  console.log('\nRoutes:', JSON.stringify(routes, null, 2));

  // Find the 55-seater bus
  const bus55 = buses.find(b => b.capacity === 55);
  if (!bus55) {
    console.log('\nERROR: No 55-seater bus found');
    return;
  }

  // Find Port de Pollença (pickup)
  const pollenca = routes.find(r => r.nameEn.includes('Pollença') || r.nameEn.includes('Pollenca'));
  if (!pollenca) {
    console.log('\nERROR: Port de Pollença route not found');
    return;
  }

  // Find Sa Calobra (dropoff)
  const saCalobra = routes.find(r => r.nameEn.includes('Sa Calobra'));
  if (!saCalobra) {
    console.log('\nERROR: Sa Calobra route not found');
    return;
  }

  console.log(`\nCreating service:`);
  console.log(`- Bus: ${bus55.name} (ID: ${bus55.id}, Capacity: ${bus55.capacity})`);
  console.log(`- Route: ${pollenca.nameEn} → ${saCalobra.nameEn}`);
  console.log(`- Date: 2026-03-01`);
  console.log(`- Time: 07:15`);

  // Create the service
  // Create DateTime for departureTime (Prisma requires DateTime for Time fields)
  const departureDateTime = new Date('2026-03-01T07:15:00Z');

  const service = await prisma.scheduledService.create({
    data: {
      busId: bus55.id,
      serviceDate: new Date('2026-03-01'),
      departureTime: departureDateTime,
      routePickup1Id: pollenca.id,
      routeDropoffId: saCalobra.id,
      totalSeats: bus55.capacity,
      seatsAvailable: bus55.capacity,
      priceStandard: 25.00,
      priceFlexi: 27.00,
      ivaRate: 0.10,
      status: 'active',
      createdById: 1
    }
  });

  console.log(`\n✅ Service created successfully!`);
  console.log(`Service ID: ${service.id}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
