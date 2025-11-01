/**
 * Create Additional Buses for 2026 Scheduled Services
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdditionalBuses() {
  console.log('Creating additional buses...\n');

  const admin = await prisma.adminUser.findFirst();
  if (!admin) {
    throw new Error('No admin user found!');
  }

  // Create 5 additional 16-seat minibuses
  const bus16_2 = await prisma.bus.create({
    data: {
      name: 'Scheduled Minibus 2',
      licensePlate: 'PMI-0002',
      capacity: 16,
      bikeCapacity: 16,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 16-seat minibus for scheduled services',
    }
  });

  const bus16_3 = await prisma.bus.create({
    data: {
      name: 'Scheduled Minibus 3',
      licensePlate: 'PMI-0003',
      capacity: 16,
      bikeCapacity: 16,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 16-seat minibus for scheduled services',
    }
  });

  const bus16_4 = await prisma.bus.create({
    data: {
      name: 'Scheduled Minibus 4',
      licensePlate: 'PMI-0004',
      capacity: 16,
      bikeCapacity: 16,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 16-seat minibus for scheduled services',
    }
  });

  const bus16_5 = await prisma.bus.create({
    data: {
      name: 'Scheduled Minibus 5',
      licensePlate: 'PMI-0005',
      capacity: 16,
      bikeCapacity: 16,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 16-seat minibus for scheduled services',
    }
  });

  const bus16_6 = await prisma.bus.create({
    data: {
      name: 'Scheduled Minibus 6',
      licensePlate: 'PMI-0006',
      capacity: 16,
      bikeCapacity: 16,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 16-seat minibus for scheduled services',
    }
  });

  // Create 3 additional 55-seat coaches
  const bus55_2 = await prisma.bus.create({
    data: {
      name: 'Scheduled Coach 2',
      licensePlate: 'PMI-5502',
      capacity: 55,
      bikeCapacity: 55,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 55-seat coach for scheduled services',
    }
  });

  const bus55_3 = await prisma.bus.create({
    data: {
      name: 'Scheduled Coach 3',
      licensePlate: 'PMI-5503',
      capacity: 55,
      bikeCapacity: 55,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 55-seat coach for scheduled services',
    }
  });

  const bus55_4 = await prisma.bus.create({
    data: {
      name: 'Scheduled Coach 4',
      licensePlate: 'PMI-5504',
      capacity: 55,
      bikeCapacity: 55,
      serviceType: 'both',
      availabilityType: 'seasonal',
      availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
      bookingCutoffHours: 18,
      active: true,
      notes: 'Additional 55-seat coach for scheduled services',
    }
  });

  console.log('✓ Created 5 additional 16-seat minibuses');
  console.log('✓ Created 3 additional 55-seat coaches');
  console.log('\nTotal new buses: 8');
  console.log(`\n16-seat buses IDs: ${bus16_2.id}, ${bus16_3.id}, ${bus16_4.id}, ${bus16_5.id}, ${bus16_6.id}`);
  console.log(`55-seat coaches IDs: ${bus55_2.id}, ${bus55_3.id}, ${bus55_4.id}`);
}

async function main() {
  try {
    await createAdditionalBuses();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
