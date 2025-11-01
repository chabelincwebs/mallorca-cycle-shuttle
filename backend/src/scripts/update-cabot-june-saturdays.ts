/**
 * Update Saturday PP services in June to use Cabot Pollenca
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Finding Saturday PP Services in June 2026 ===\n');

  // Find all PP services from June 1 to June 30, 2026
  const services = await prisma.scheduledService.findMany({
    where: {
      productSku: { startsWith: 'S-PP-' },
      serviceDate: {
        gte: new Date('2026-06-01'),
        lte: new Date('2026-06-30'),
      }
    },
    orderBy: { serviceDate: 'asc' }
  });

  console.log(`Found ${services.length} PP services in June 2026`);

  const toUpdate: { sku: string; date: Date; dayOfWeek: string }[] = [];

  for (const service of services) {
    const dayOfWeek = service.serviceDate.getDay(); // 0=Sunday, 6=Saturday
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

    if (dayOfWeek === 6) { // Saturday
      toUpdate.push({
        sku: service.productSku,
        date: service.serviceDate,
        dayOfWeek: dayName
      });
    }
  }

  console.log(`\nFound ${toUpdate.length} Saturday services to update:\n`);

  let updated = 0;

  for (const item of toUpdate) {
    const service = await prisma.scheduledService.findFirst({
      where: { productSku: item.sku }
    });

    if (!service) {
      console.log(`✗ Service not found: ${item.sku}`);
      continue;
    }

    await prisma.scheduledService.update({
      where: { id: service.id },
      data: {
        routePickup1Id: 19, // Cabot Pollenca Park Hotel & Spa
        routePickup2Id: 10, // Alcudia: PortBlue Club Pollentia
      }
    });

    const dateStr = item.date.toISOString().substring(0, 10);
    console.log(`✓ ${item.sku} - ${item.dayOfWeek} ${dateStr}`);
    updated++;
  }

  console.log(`\n=== Summary ===`);
  console.log(`✓ Updated: ${updated} Saturday services to use Cabot Pollenca (Route ID: 19)`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    throw error;
  })
  .finally(() => prisma.$disconnect());
