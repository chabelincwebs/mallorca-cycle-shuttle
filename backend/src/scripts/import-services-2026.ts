/**
 * Import Script for 2026 Scheduled Services
 *
 * This script:
 * 1. Updates existing 8 services with correct SKUs, times, and pricing
 * 2. Bulk imports ~160 new services from CSV
 * 3. Creates missing Porto Colom location if needed
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Route mappings based on SKU prefix
const routeMap = {
  'PP': { // Port de Pollença/Alcudia
    pickup1: 9,  // Port de Pollença (Aparthotel Duva)
    pickup2: 10, // Alcudia (PortBlue Club Pollentia)
  },
  'PA': { // Playa de Muro / Port Alcudia
    pickup1: 13, // Playa de Muro (Playa Esperanza Resort)
    pickup2: 14, // Port Alcudia (Zafiro Tropic)
  },
  'FP': { // Playa de Palma
    pickup1: 15, // Playa de Palma (Aparthotel Fontanellas Playa)
    pickup2: null,
  },
  'SP': { // Santa Ponça & Peguera
    pickup1: 11, // Peguera (La Hacienda Steak House)
    pickup2: 12, // Santa Ponça (Zafiro Rey Don Jaime)
  },
};

const dropoffMap = {
  'REP': 17,  // Repsol Garage (Lluc)
  'AX': 16,   // Port d'Andratx
  'PP': 9,    // Port de Pollença
  'PC': null, // Porto Colom (will be created)
};

// Bus mapping based on capacity
async function getBusForCapacity(capacity: number): Promise<number> {
  if (capacity <= 16) {
    const bus = await prisma.bus.findFirst({
      where: { capacity: 16, active: true }
    });
    return bus?.id || 1;
  } else {
    const bus = await prisma.bus.findFirst({
      where: { capacity: 55, active: true }
    });
    return bus?.id || 2;
  }
}

// Parse SKU to extract date and time
function parseSKU(sku: string) {
  const parts = sku.split('-');
  const dateTime = parts[parts.length - 2]; // DDMMYY
  const time = parts[parts.length - 1];     // HHMM

  const day = dateTime.substring(0, 2);
  const month = dateTime.substring(2, 4);
  const year = '20' + dateTime.substring(4, 6);

  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}:00`,
    from: parts[1], // e.g., 'PP', 'FP', 'SP', 'PA'
    to: parts[2],   // e.g., 'AX', 'REP', 'PP', 'PC'
  };
}

// Calculate total seats and seats available
function calculateSeats(seatsAvailable: number) {
  if (seatsAvailable === 16) {
    return { totalSeats: 16, seatsAvailable: 16 };
  } else if (seatsAvailable < 16) {
    return { totalSeats: 16, seatsAvailable };
  } else if (seatsAvailable === 55) {
    return { totalSeats: 55, seatsAvailable: 55 };
  } else { // 17-54
    return { totalSeats: 55, seatsAvailable };
  }
}

async function createPortoColom() {
  console.log('Creating Porto Colom location...');

  const existing = await prisma.route.findFirst({
    where: { nameEn: { contains: 'Porto Colom' } }
  });

  if (existing) {
    console.log('Porto Colom already exists with ID:', existing.id);
    dropoffMap['PC'] = existing.id;
    return existing.id;
  }

  const route = await prisma.route.create({
    data: {
      nameEn: 'Porto Colom',
      nameEs: 'Porto Colom',
      nameDe: 'Porto Colom',
      nameFr: 'Porto Colom',
      nameCa: 'Porto Colom',
      nameIt: 'Porto Colom',
      nameNl: 'Porto Colom',
      nameSv: 'Porto Colom',
      nameNb: 'Porto Colom',
      nameDa: 'Porto Colom',
      locationType: 'dropoff',
      displayOrder: 100,
      active: true,
    }
  });

  dropoffMap['PC'] = route.id;
  console.log('Created Porto Colom with ID:', route.id);
  return route.id;
}

async function updateExistingServices() {
  console.log('\n=== Updating existing 7 services ===\n');

  const updates = [
    { id: 23, sku: 'S-PP-AX-030326-0715', date: '2026-03-03', time: '07:15:00', flexi: '38.636', standard: '36.363', seats: 16 },
    { id: 24, sku: 'S-PP-REP-040326-0745', date: '2026-03-04', time: '07:45:00', flexi: '36.363', standard: '36.363', seats: 16 },
    { id: 25, sku: 'S-SP-PP-050326-0715', date: '2026-03-05', time: '07:15:00', flexi: '38.636', standard: '36.363', seats: 55 },
    { id: 26, sku: 'S-FP-PP-060326-0730', date: '2026-03-06', time: '07:30:00', flexi: '38.636', standard: '36.363', seats: 55 },
    { id: 27, sku: 'S-SP-REP-100326-0730', date: '2026-03-10', time: '07:30:00', flexi: '38.636', standard: '36.363', seats: 16 },
    { id: 28, sku: 'S-PA-REP-100326-0745', date: '2026-03-10', time: '07:45:00', flexi: '36.363', standard: '36.363', seats: 16 },
    { id: 30, sku: 'S-FP-REP-110326-0745', date: '2026-03-11', time: '07:45:00', flexi: '38.636', standard: '36.363', seats: 16 },
  ];

  for (const update of updates) {
    const { totalSeats, seatsAvailable } = calculateSeats(update.seats);
    const busId = await getBusForCapacity(totalSeats);

    await prisma.scheduledService.update({
      where: { id: update.id },
      data: {
        productSku: update.sku,
        serviceDate: new Date(update.date),
        departureTime: new Date(`1970-01-01T${update.time}Z`),
        priceStandard: update.standard,
        priceFlexi: update.flexi,
        totalSeats,
        seatsAvailable,
        busId,
      }
    });

    console.log(`✓ Updated service ID ${update.id}: ${update.sku}`);
  }

  console.log('\nAll existing services updated!');
}

async function importFromCSV() {
  console.log('\n=== Importing services from CSV ===\n');

  const csvPath = '/tmp/scheduled_services_2026.csv';
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const line of lines) {
    if (!line.trim()) continue;

    const [sku, productName, flexi, standard, seatsAvailableStr] = line.split(',');

    try {
      // Check if already exists
      const existing = await prisma.scheduledService.findFirst({
        where: { productSku: sku }
      });

      if (existing) {
        console.log(`⊘ Skipped ${sku} (already exists)`);
        skipped++;
        continue;
      }

      const parsed = parseSKU(sku);
      const seatsAvailable = parseInt(seatsAvailableStr);
      const { totalSeats, seatsAvailable: actualSeats } = calculateSeats(seatsAvailable);
      const busId = await getBusForCapacity(totalSeats);

      // Get route IDs
      const pickup1Id = routeMap[parsed.from as keyof typeof routeMap]?.pickup1;
      const pickup2Id = routeMap[parsed.from as keyof typeof routeMap]?.pickup2;
      const dropoffId = dropoffMap[parsed.to as keyof typeof dropoffMap];

      if (!pickup1Id || !dropoffId) {
        console.error(`✗ ERROR: Missing route mapping for ${sku} (${parsed.from} → ${parsed.to})`);
        errors++;
        continue;
      }

      // Get admin user (first available)
      const admin = await prisma.adminUser.findFirst();
      if (!admin) {
        throw new Error('No admin user found!');
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

      console.log(`✓ Imported ${sku}`);
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
  console.log(`Total: ${imported + skipped + errors}`);
}

async function assignSkuToMar11Service() {
  console.log('\n=== Assigning SKU to Mar 11 PA→AX service ===\n');

  // Find the Mar 11 service that goes from Playa de Muro/Alcudia to Andratx
  const service = await prisma.scheduledService.findFirst({
    where: {
      serviceDate: new Date('2026-03-11'),
      routePickup1Id: { in: [13, 14] }, // Playa de Muro or Alcudia
      routeDropoffId: 16, // Andratx
      productSku: null,
    }
  });

  if (!service) {
    console.log('⊘ Mar 11 PA→AX service not found or already has SKU');
    return;
  }

  // Assign a SKU for this service
  const sku = 'S-PA-AX-110326-0745'; // Following the pattern

  await prisma.scheduledService.update({
    where: { id: service.id },
    data: { productSku: sku }
  });

  console.log(`✓ Assigned SKU ${sku} to service ID ${service.id}`);
}

async function main() {
  try {
    console.log('========================================');
    console.log('  2026 Scheduled Services Import');
    console.log('========================================\n');

    // Step 1: Create Porto Colom if needed
    await createPortoColom();

    // Step 2: Update existing 7 services
    await updateExistingServices();

    // Step 3: Assign SKU to Mar 11 PA→AX service
    await assignSkuToMar11Service();

    // Step 4: Import bulk services
    await importFromCSV();

    console.log('\n========================================');
    console.log('  Import Complete!');
    console.log('========================================\n');

  } catch (error) {
    console.error('Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
