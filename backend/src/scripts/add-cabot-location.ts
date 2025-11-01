/**
 * Add Cabot Pollenca Park Hotel & Spa location and update March services
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Services that need to use Cabot Pollenca as pickup1
const cabotServiceSKUs = [
  'S-PP-AX-070326-0715',  // Saturday 7th March
  'S-PP-AX-120326-0715',  // Thursday 12th March
  'S-PP-AX-140326-0715',  // Saturday 14th March
  'S-PP-AX-190326-0715',  // Thursday 19th March
  'S-PP-AX-210326-0715',  // Saturday 21st March
  'S-PP-AX-260326-0715',  // Thursday 26th March
  'S-PP-AX-280326-0715',  // Saturday 28th March
];

async function main() {
  console.log('\n=== Creating Cabot Pollenca Park Hotel & Spa Location ===\n');

  // Check if it already exists
  const existing = await prisma.route.findFirst({
    where: {
      nameEn: { contains: 'Cabot' }
    }
  });

  let cabotLocationId: number;

  if (existing) {
    console.log('✓ Cabot Pollenca location already exists with ID:', existing.id);
    cabotLocationId = existing.id;
  } else {
    // Create the new location
    const cabotLocation = await prisma.route.create({
      data: {
        nameEn: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameEs: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameDe: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameFr: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameCa: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameIt: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameNl: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameSv: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameNb: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        nameDa: 'Port de Pollença (Cabot Pollenca Park Hotel & Spa)',
        locationType: 'pickup',
        displayOrder: 9, // Same as Aparthotel Duva
        active: true,
      }
    });

    cabotLocationId = cabotLocation.id;
    console.log('✓ Created Cabot Pollenca location with ID:', cabotLocationId);
  }

  console.log('\n=== Updating March Services to Use Cabot Pollenca ===\n');

  let updated = 0;
  let notFound = 0;

  for (const sku of cabotServiceSKUs) {
    const service = await prisma.scheduledService.findFirst({
      where: { productSku: sku }
    });

    if (!service) {
      console.log(`✗ Service not found: ${sku}`);
      notFound++;
      continue;
    }

    await prisma.scheduledService.update({
      where: { id: service.id },
      data: {
        routePickup1Id: cabotLocationId,
        routePickup2Id: 10, // Alcudia: PortBlue Club Pollentia
      }
    });

    console.log(`✓ Updated ${sku} to use Cabot Pollenca (ID: ${cabotLocationId})`);
    updated++;
  }

  console.log('\n=== Summary ===');
  console.log(`✓ Updated: ${updated} services`);
  console.log(`✗ Not found: ${notFound} services`);
  console.log(`\n✓ Cabot Pollenca location ID: ${cabotLocationId}`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    throw error;
  })
  .finally(() => prisma.$disconnect());
