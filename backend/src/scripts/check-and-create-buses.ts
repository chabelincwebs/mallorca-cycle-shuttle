/**
 * Check and Create Additional Buses
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check existing buses
  const existing = await prisma.bus.findMany({
    orderBy: { id: 'asc' }
  });

  console.log(`\nExisting buses (${existing.length}):`);
  existing.forEach(bus => {
    console.log(`  ID ${bus.id}: ${bus.name} (${bus.capacity} seats) - ${bus.licensePlate}`);
  });

  // Determine how many buses to create
  const existing16 = existing.filter(b => b.capacity === 16).length;
  const existing55 = existing.filter(b => b.capacity === 55).length;

  console.log(`\n16-seat buses: ${existing16}`);
  console.log(`55-seat buses: ${existing55}`);

  const needed16 = Math.max(0, 6 - existing16);
  const needed55 = Math.max(0, 4 - existing55);

  console.log(`\nNeed to create:`);
  console.log(`  ${needed16} x 16-seat minibuses`);
  console.log(`  ${needed55} x 55-seat coaches`);

  if (needed16 === 0 && needed55 === 0) {
    console.log('\n✓ All buses already exist!');
    return;
  }

  console.log('\nCreating buses...\n');

  // Create 16-seat buses
  for (let i = 0; i < needed16; i++) {
    const busNumber = existing16 + i + 1;
    const bus = await prisma.bus.create({
      data: {
        name: `Scheduled Minibus ${busNumber}`,
        licensePlate: `PMI-00${busNumber.toString().padStart(2, '0')}`,
        capacity: 16,
        bikeCapacity: 16,
        serviceType: 'both',
        availabilityType: 'seasonal',
        availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
        bookingCutoffHours: 18,
        active: true,
        notes: `16-seat minibus for scheduled services`,
      }
    });
    console.log(`✓ Created ${bus.name} (ID: ${bus.id})`);
  }

  // Create 55-seat buses
  for (let i = 0; i < needed55; i++) {
    const busNumber = existing55 + i + 1;
    const bus = await prisma.bus.create({
      data: {
        name: `Scheduled Coach ${busNumber}`,
        licensePlate: `PMI-55${busNumber.toString().padStart(2, '0')}`,
        capacity: 55,
        bikeCapacity: 55,
        serviceType: 'both',
        availabilityType: 'seasonal',
        availabilityRules: { start_date: '2026-03-01', end_date: '2026-06-30' },
        bookingCutoffHours: 18,
        active: true,
        notes: `55-seat coach for scheduled services`,
      }
    });
    console.log(`✓ Created ${bus.name} (ID: ${bus.id})`);
  }

  console.log('\n✓ All buses created!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
