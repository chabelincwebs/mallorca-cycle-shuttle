import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedServices() {
  console.log('📅 Seeding scheduled services...\\n');

  // First, ensure we have the required data
  console.log('Checking for buses and routes...');

  const buses = await prisma.bus.findMany({ where: { active: true } });
  const pickupRoutes = await prisma.route.findMany({
    where: {
      locationType: { in: ['pickup', 'both'] },
      active: true
    }
  });
  const dropoffRoutes = await prisma.route.findMany({
    where: {
      locationType: { in: ['dropoff', 'both'] },
      active: true
    }
  });

  if (buses.length === 0) {
    console.error('❌ No buses found. Please run seed-fleet.ts first.');
    return;
  }

  if (pickupRoutes.length === 0 || dropoffRoutes.length === 0) {
    console.error('❌ No routes found. Please run seed-fleet.ts first.');
    return;
  }

  console.log(`✅ Found ${buses.length} buses and ${pickupRoutes.length} pickup routes, ${dropoffRoutes.length} dropoff routes\\n`);

  // Get or create an admin user for createdBy
  let adminUser = await prisma.adminUser.findFirst({
    where: { role: 'admin' }
  });

  if (!adminUser) {
    console.log('Creating admin user for service creation...');
    const bcrypt = require('bcrypt');
    adminUser = await prisma.adminUser.create({
      data: {
        email: 'admin@mallorcacycleshuttle.com',
        passwordHash: await bcrypt.hash('AdminPass123', 10),
        role: 'admin',
        fullName: 'System Admin',
        active: true
      }
    });
    console.log(`✅ Created admin user: ${adminUser.email}\\n`);
  }

  // Create scheduled services for the next 7 days
  console.log('Creating scheduled services...\\n');

  const today = new Date();
  const services = [];

  // Sa Calobra services (most popular route)
  const busA = buses.find(b => b.name === 'Bus A') || buses[0];
  const busB = buses.find(b => b.name === 'Bus B') || buses[1];

  const portPollenca = pickupRoutes.find(r => r.nameEn.includes('Port de Pollença')) || pickupRoutes[0];
  const pollencaTown = pickupRoutes.find(r => r.nameEn.includes('Pollença Town')) || pickupRoutes[1];
  const saCalobra = dropoffRoutes.find(r => r.nameEn.includes('Sa Calobra')) || dropoffRoutes[0];

  // Create services for next 7 days
  for (let i = 0; i < 7; i++) {
    const serviceDate = new Date(today);
    serviceDate.setDate(today.getDate() + i);

    // Morning Sa Calobra service (08:00)
    if (busA) {
      const morningService = await prisma.scheduledService.create({
        data: {
          busId: busA.id,
          serviceDate,
          departureTime: new Date('1970-01-01T08:00:00Z'),
          routePickup1Id: portPollenca.id,
          routePickup2Id: pollencaTown.id,
          routeDropoffId: saCalobra.id,
          totalSeats: busA.capacity,
          seatsAvailable: busA.capacity,
          priceStandard: 25.00,
          priceFlexi: 35.00,
          ivaRate: 0.10,
          bookingCutoffTime: new Date('1970-01-01T16:00:00Z'),
          status: 'active',
          createdById: adminUser.id
        }
      });
      services.push(morningService);
    }

    // Afternoon Sa Calobra service (14:00) - every other day
    if (i % 2 === 0 && busB) {
      const afternoonService = await prisma.scheduledService.create({
        data: {
          busId: busB.id,
          serviceDate,
          departureTime: new Date('1970-01-01T14:00:00Z'),
          routePickup1Id: portPollenca.id,
          routeDropoffId: saCalobra.id,
          totalSeats: busB.capacity,
          seatsAvailable: busB.capacity,
          priceStandard: 25.00,
          priceFlexi: 35.00,
          ivaRate: 0.10,
          bookingCutoffTime: new Date('1970-01-01T16:00:00Z'),
          status: 'active',
          createdById: adminUser.id
        }
      });
      services.push(afternoonService);
    }
  }

  // Add some services to other destinations
  if (dropoffRoutes.length > 1) {
    const collDelReis = dropoffRoutes.find(r => r.nameEn.includes('Coll dels Reis'));
    const escorca = dropoffRoutes.find(r => r.nameEn.includes('Escorca'));

    if (collDelReis && busA) {
      // Coll dels Reis viewpoint service - once
      const today = new Date();
      today.setDate(today.getDate() + 2);

      const viewpointService = await prisma.scheduledService.create({
        data: {
          busId: busA.id,
          serviceDate: today,
          departureTime: new Date('1970-01-01T09:30:00Z'),
          routePickup1Id: portPollenca.id,
          routeDropoffId: collDelReis.id,
          totalSeats: busA.capacity,
          seatsAvailable: busA.capacity,
          priceStandard: 18.00,
          priceFlexi: 25.00,
          ivaRate: 0.10,
          bookingCutoffTime: new Date('1970-01-01T16:00:00Z'),
          status: 'active',
          createdById: adminUser.id
        }
      });
      services.push(viewpointService);
    }

    if (escorca && busB) {
      // Lluc Monastery service
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const monasteryService = await prisma.scheduledService.create({
        data: {
          busId: busB.id,
          serviceDate: tomorrow,
          departureTime: new Date('1970-01-01T10:00:00Z'),
          routePickup1Id: portPollenca.id,
          routePickup2Id: pollencaTown.id,
          routeDropoffId: escorca.id,
          totalSeats: busB.capacity,
          seatsAvailable: busB.capacity,
          priceStandard: 20.00,
          priceFlexi: 28.00,
          ivaRate: 0.10,
          bookingCutoffTime: new Date('1970-01-01T16:00:00Z'),
          status: 'active',
          createdById: adminUser.id
        }
      });
      services.push(monasteryService);
    }
  }

  console.log(`✅ Created ${services.length} scheduled services\\n`);

  // Show summary by destination
  const byDestination: { [key: string]: number } = {};
  for (const service of services) {
    const route = await prisma.route.findUnique({
      where: { id: service.routeDropoffId }
    });
    if (route) {
      byDestination[route.nameEn] = (byDestination[route.nameEn] || 0) + 1;
    }
  }

  console.log('Services by destination:');
  for (const [dest, count] of Object.entries(byDestination)) {
    console.log(`   - ${dest}: ${count} services`);
  }

  console.log('\\n✅ Scheduled services seeding complete!\\n');

  return services;
}

// Run the seed if called directly
if (require.main === module) {
  seedServices()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding scheduled services:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedServices };
