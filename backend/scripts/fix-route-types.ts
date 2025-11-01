import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing route location types...\n');

  // Update Port d'Andratx to dropoff only
  await prisma.route.update({
    where: { id: 16 },
    data: { locationType: 'dropoff' }
  });
  console.log('✅ Updated Port d\'Andratx to dropoff-only');

  // Update Repsol Garage to dropoff only
  await prisma.route.update({
    where: { id: 17 },
    data: { locationType: 'dropoff' }
  });
  console.log('✅ Updated Repsol Garage (Lluc) to dropoff-only');

  // Update Port de Pollença to both (can be pickup and dropoff)
  await prisma.route.update({
    where: { id: 9 },
    data: { locationType: 'both' }
  });
  console.log('✅ Updated Port de Pollença to both (pickup & dropoff)');

  // Display summary
  console.log('\n📍 ROUTE TYPES:');

  const pickupRoutes = await prisma.route.findMany({
    where: {
      OR: [
        { locationType: 'pickup' },
        { locationType: 'both' }
      ],
      active: true
    },
    orderBy: { nameEn: 'asc' }
  });

  console.log('\nPICKUP LOCATIONS:');
  pickupRoutes.forEach(r => console.log(`   ${r.id}: ${r.nameEn}`));

  const dropoffRoutes = await prisma.route.findMany({
    where: {
      OR: [
        { locationType: 'dropoff' },
        { locationType: 'both' }
      ],
      active: true
    },
    orderBy: { nameEn: 'asc' }
  });

  console.log('\nDROPOFF LOCATIONS:');
  dropoffRoutes.forEach(r => console.log(`   ${r.id}: ${r.nameEn}`));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
