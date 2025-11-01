import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating March 2026 scheduled services...\n');

  // Get or create a 55-seater bus
  let bus = await prisma.bus.findFirst({
    where: { capacity: { gte: 50 } }
  });

  if (!bus) {
    console.log('Creating 55-seater bus...');
    bus = await prisma.bus.create({
      data: {
        name: '55-Seater Coach',
        licensePlate: 'MCS-55-001',
        capacity: 55,
        bikeCapacity: 55,
        availabilityType: 'always',
        bookingCutoffHours: 18,
        active: true
      }
    });
    console.log(`✅ Created bus: ${bus.name} (ID: ${bus.id})\n`);
  }

  // Get all routes
  const routes = await prisma.route.findMany({
    where: { active: true }
  });

  const getRoute = (name: string) => {
    const route = routes.find(r => r.nameEn.includes(name));
    if (!route) throw new Error(`Route not found: ${name}`);
    return route;
  };

  const portPollenca = getRoute('Port de Pollença');
  const alcudia = getRoute('Alcudia (PortBlue');
  const peguera = getRoute('Peguera');
  const santaPonca = getRoute('Santa Ponça');
  const playaMuro = getRoute('Playa de Muro');
  const portAlcudia = getRoute('Port Alcudia');
  const playaPalma = getRoute('Playa de Palma');
  const andratx = getRoute('Port d\'Andratx');
  const lluc = getRoute('Repsol Garage');

  // Services to create
  const services = [
    {
      date: '2026-03-03',
      time: '07:15:00',
      pickup1: portPollenca,
      pickup2: alcudia,
      dropoff: andratx,
      priceStandard: 36.82,  // €40.50 incl. IVA
      priceFlexi: 38.64,     // €42.50 incl. IVA
      description: 'Port de Pollença/Alcudia to Port d\'Andratx'
    },
    {
      date: '2026-03-04',
      time: '07:45:00',
      pickup1: alcudia,
      pickup2: portPollenca,
      dropoff: lluc,
      priceStandard: 34.55,  // €38.00 incl. IVA
      priceFlexi: 36.36,     // €40.00 incl. IVA
      description: 'Port de Pollença/Alcudia to Repsol Garage (Lluc)'
    },
    {
      date: '2026-03-05',
      time: '07:15:00',
      pickup1: peguera,
      pickup2: santaPonca,
      dropoff: portPollenca,
      priceStandard: 36.82,
      priceFlexi: 38.64,
      description: 'Peguera/Santa Ponça to Port de Pollença'
    },
    {
      date: '2026-03-06',
      time: '07:30:00',
      pickup1: playaPalma,
      pickup2: null,
      dropoff: portPollenca,
      priceStandard: 36.82,
      priceFlexi: 38.64,
      description: 'Playa de Palma to Port de Pollença'
    },
    {
      date: '2026-03-10',
      time: '07:30:00',
      pickup1: peguera,
      pickup2: santaPonca,
      dropoff: lluc,
      priceStandard: 36.82,
      priceFlexi: 38.64,
      description: 'Santa Ponça/Peguera to Repsol Garage (Lluc/Sa Calobra)'
    },
    {
      date: '2026-03-10',
      time: '07:45:00',
      pickup1: playaMuro,
      pickup2: portAlcudia,
      dropoff: lluc,
      priceStandard: 34.55,
      priceFlexi: 36.36,
      description: 'Playa de Muro/Port Alcudia to Lluc (Sa Calobra)'
    },
    {
      date: '2026-03-11',
      time: '07:30:00',
      pickup1: playaMuro,
      pickup2: portAlcudia,
      dropoff: andratx,
      priceStandard: 36.82,
      priceFlexi: 38.64,
      description: 'Playa de Muro/Port Alcudia to Andratx'
    },
    {
      date: '2026-03-11',
      time: '07:45:00',
      pickup1: playaPalma,
      pickup2: null,
      dropoff: lluc,
      priceStandard: 36.82,
      priceFlexi: 38.64,
      description: 'Playa de Palma to Repsol Garage (Lluc/Sa Calobra)'
    }
  ];

  // Get or create admin user
  let admin = await prisma.adminUser.findFirst();
  if (!admin) {
    console.log('Creating default admin user...');
    admin = await prisma.adminUser.create({
      data: {
        email: 'admin@mallorcacycleshuttle.com',
        passwordHash: 'CHANGE_ME',
        role: 'super_admin',
        fullName: 'System Admin',
        active: true
      }
    });
  }

  // Delete existing March 2026 bookings first (foreign key constraint)
  console.log('Deleting existing March 2026 bookings...');
  await prisma.scheduledBooking.deleteMany({
    where: {
      service: {
        serviceDate: {
          gte: new Date('2026-03-01'),
          lt: new Date('2026-04-01')
        }
      }
    }
  });

  // Delete existing March 2026 services
  console.log('Deleting existing March 2026 services...');
  await prisma.scheduledService.deleteMany({
    where: {
      serviceDate: {
        gte: new Date('2026-03-01'),
        lt: new Date('2026-04-01')
      }
    }
  });

  // Create new services
  for (const svc of services) {
    const departureDateTime = new Date(`${svc.date}T${svc.time}Z`);

    const created = await prisma.scheduledService.create({
      data: {
        busId: bus.id,
        serviceDate: new Date(svc.date),
        departureTime: departureDateTime,
        routePickup1Id: svc.pickup1.id,
        routePickup2Id: svc.pickup2?.id || null,
        routeDropoffId: svc.dropoff.id,
        totalSeats: bus.capacity,
        seatsAvailable: bus.capacity,
        priceStandard: svc.priceStandard,
        priceFlexi: svc.priceFlexi,
        ivaRate: 0.10,
        bookingCutoffTime: new Date(`${svc.date}T16:00:00Z`),
        status: 'active',
        createdById: admin.id
      },
      include: {
        routePickup1: true,
        routePickup2: true,
        routeDropoff: true
      }
    });

    const pickup2Text = created.routePickup2 ? ` + ${created.routePickup2.nameEn}` : '';
    console.log(`✅ ${svc.date}: ${created.routePickup1.nameEn}${pickup2Text} → ${created.routeDropoff.nameEn}`);
    console.log(`   Departure: ${svc.time} | Standard: €${svc.priceStandard} | Flexi: €${svc.priceFlexi}\n`);
  }

  console.log(`\n✅ Created ${services.length} services for March 2026!\n`);

  // Summary
  const allServices = await prisma.scheduledService.findMany({
    where: {
      serviceDate: {
        gte: new Date('2026-03-01'),
        lt: new Date('2026-04-01')
      },
      status: 'active'
    },
    include: {
      routePickup1: true,
      routePickup2: true,
      routeDropoff: true,
      bus: true
    },
    orderBy: {
      serviceDate: 'asc'
    }
  });

  console.log('📅 MARCH 2026 SCHEDULED SERVICES:');
  allServices.forEach(s => {
    const date = s.serviceDate.toISOString().split('T')[0];
    const time = s.departureTime.toISOString().split('T')[1].substring(0, 5);
    const pickup2 = s.routePickup2 ? ` + ${s.routePickup2.nameEn}` : '';
    const totalIncl = (s.priceFlexi * 1.10).toFixed(2);
    console.log(`   ${date} ${time} | ${s.routePickup1.nameEn}${pickup2} → ${s.routeDropoff.nameEn}`);
    console.log(`   ${s.bus.name} (${s.seatsAvailable} seats) | €${totalIncl} incl. IVA`);
    console.log();
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
