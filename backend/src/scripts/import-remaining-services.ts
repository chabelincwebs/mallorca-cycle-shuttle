/**
 * Import Remaining Services with Smart Bus Assignment
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

// Route mappings
const routeMap = {
  'PP': { pickup1: 9, pickup2: 10 },
  'PA': { pickup1: 13, pickup2: 14 },
  'FP': { pickup1: 15, pickup2: null },
  'SP': { pickup1: 11, pickup2: 12 },
};

const dropoffMap = {
  'REP': 17,
  'AX': 16,
  'PP': 9,
  'PC': 18,
};

function parseSKU(sku: string) {
  const parts = sku.split('-');
  const dateTime = parts[parts.length - 2];
  const time = parts[parts.length - 1];

  const day = dateTime.substring(0, 2);
  const month = dateTime.substring(2, 4);
  const year = '20' + dateTime.substring(4, 6);

  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:00`,
    from: parts[1],
    to: parts[2],
  };
}

function calculateSeats(seatsAvailable: number) {
  if (seatsAvailable === 16) {
    return { totalSeats: 16, seatsAvailable: 16 };
  } else if (seatsAvailable < 16) {
    return { totalSeats: 16, seatsAvailable };
  } else if (seatsAvailable === 55) {
    return { totalSeats: 55, seatsAvailable: 55 };
  } else {
    return { totalSeats: 55, seatsAvailable };
  }
}

/**
 * Find an available bus for the given capacity, date, and time
 */
async function findAvailableBus(capacity: number, serviceDate: string, departureTime: string): Promise<number> {
  // Get all buses with this capacity
  const buses = await prisma.bus.findMany({
    where: {
      capacity,
      active: true
    },
    orderBy: { id: 'asc' }
  });

  if (buses.length === 0) {
    throw new Error(`No buses found with capacity ${capacity}`);
  }

  // Check each bus for availability
  for (const bus of buses) {
    const conflict = await prisma.scheduledService.findFirst({
      where: {
        busId: bus.id,
        serviceDate: new Date(serviceDate),
        departureTime: new Date(`1970-01-01T${departureTime}Z`)
      }
    });

    if (!conflict) {
      // This bus is available
      return bus.id;
    }
  }

  throw new Error(`No available ${capacity}-seat bus found for ${serviceDate} at ${departureTime}`);
}

async function importRemainingServices() {
  console.log('\n=== Importing Remaining Services ===\n');

  const csvPath = '/tmp/scheduled_services_2026.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  const admin = await prisma.adminUser.findFirst();
  if (!admin) {
    throw new Error('No admin user found!');
  }

  for (const line of lines) {
    if (!line.trim()) continue;

    const [sku, productName, flexi, standard, seatsAvailableStr] = line.split(',');

    try {
      // Check if already exists
      const existing = await prisma.scheduledService.findFirst({
        where: { productSku: sku }
      });

      if (existing) {
        skipped++;
        continue;
      }

      const parsed = parseSKU(sku);
      const seatsAvailable = parseInt(seatsAvailableStr);
      const { totalSeats, seatsAvailable: actualSeats } = calculateSeats(seatsAvailable);

      // Find an available bus
      const busId = await findAvailableBus(totalSeats, parsed.date, parsed.time);

      // Get route IDs
      const pickup1Id = routeMap[parsed.from as keyof typeof routeMap]?.pickup1;
      const pickup2Id = routeMap[parsed.from as keyof typeof routeMap]?.pickup2;
      const dropoffId = dropoffMap[parsed.to as keyof typeof dropoffMap];

      if (!pickup1Id || !dropoffId) {
        console.error(`✗ ERROR: Missing route mapping for ${sku}`);
        errors++;
        continue;
      }

      await prisma.scheduledService.create({
        data: {
          productSku: sku,
          busId,
          serviceDate: new Date(parsed.date),
          departureTime: new Date(`1970-01-01T${parsed.time}Z`),
          routePickup1Id: pickup1Id,
          routePickup2Id: pickup2Id || undefined,
          routeDropoffId: dropoffId,
          totalSeats,
          seatsAvailable: actualSeats,
          priceStandard: standard,
          priceFlexi: flexi,
          ivaRate: 0.10,
          bookingCutoffTime: new Date('1970-01-01T16:00:00Z'),
          status: 'active',
          createdById: admin.id,
        }
      });

      console.log(`✓ Imported ${sku} (Bus ID: ${busId})`);
      imported++;

    } catch (error: any) {
      console.error(`✗ ERROR importing ${sku}:`, error.message);
      errors++;
    }
  }

  console.log(`\n=== Import Summary ===`);
  console.log(`✓ Imported: ${imported}`);
  console.log(`⊘ Skipped: ${skipped}`);
  console.log(`✗ Errors: ${errors}`);
}

async function main() {
  try {
    await importRemainingServices();
    console.log('\n✓ Import complete!');
  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
