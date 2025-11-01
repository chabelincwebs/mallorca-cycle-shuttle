import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding real route locations...\n');

  // Pickup locations with specific meeting points
  const routes = [
    {
      nameEn: 'Port de Pollença (Aparthotel Duva)',
      nameDe: 'Port de Pollença (Aparthotel Duva)',
      nameEs: 'Port de Pollença (Aparthotel Duva)',
      nameFr: 'Port de Pollença (Aparthotel Duva)',
      nameCa: 'Port de Pollença (Aparthotel Duva)',
      nameIt: 'Port de Pollença (Aparthotel Duva)',
      nameNl: 'Port de Pollença (Aparthotel Duva)',
      nameSv: 'Port de Pollença (Aparthotel Duva)',
      nameNb: 'Port de Pollença (Aparthotel Duva)',
      nameDa: 'Port de Pollença (Aparthotel Duva)',
      locationType: 'both',
      coordinates: { lat: 39.9025, lng: 3.0867 }
    },
    {
      nameEn: 'Alcudia (PortBlue Club Pollentia)',
      nameDe: 'Alcudia (PortBlue Club Pollentia)',
      nameEs: 'Alcudia (PortBlue Club Pollentia)',
      nameFr: 'Alcudia (PortBlue Club Pollentia)',
      nameCa: 'Alcúdia (PortBlue Club Pollentia)',
      nameIt: 'Alcudia (PortBlue Club Pollentia)',
      nameNl: 'Alcudia (PortBlue Club Pollentia)',
      nameSv: 'Alcudia (PortBlue Club Pollentia)',
      nameNb: 'Alcudia (PortBlue Club Pollentia)',
      nameDa: 'Alcudia (PortBlue Club Pollentia)',
      locationType: 'pickup',
      coordinates: { lat: 39.8494, lng: 3.1242 }
    },
    {
      nameEn: 'Peguera (La Hacienda Steak House)',
      nameDe: 'Peguera (La Hacienda Steak House)',
      nameEs: 'Peguera (La Hacienda Steak House)',
      nameFr: 'Peguera (La Hacienda Steak House)',
      nameCa: 'Peguera (La Hacienda Steak House)',
      nameIt: 'Peguera (La Hacienda Steak House)',
      nameNl: 'Peguera (La Hacienda Steak House)',
      nameSv: 'Peguera (La Hacienda Steak House)',
      nameNb: 'Peguera (La Hacienda Steak House)',
      nameDa: 'Peguera (La Hacienda Steak House)',
      locationType: 'pickup',
      coordinates: { lat: 39.5419, lng: 2.4386 }
    },
    {
      nameEn: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameDe: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameEs: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameFr: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameCa: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameIt: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameNl: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameSv: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameNb: 'Santa Ponça (Zafiro Rey Don Jaime)',
      nameDa: 'Santa Ponça (Zafiro Rey Don Jaime)',
      locationType: 'pickup',
      coordinates: { lat: 39.5358, lng: 2.4686 }
    },
    {
      nameEn: 'Playa de Muro (Playa Esperanza Resort)',
      nameDe: 'Playa de Muro (Playa Esperanza Resort)',
      nameEs: 'Playa de Muro (Playa Esperanza Resort)',
      nameFr: 'Playa de Muro (Playa Esperanza Resort)',
      nameCa: 'Platja de Muro (Playa Esperanza Resort)',
      nameIt: 'Playa de Muro (Playa Esperanza Resort)',
      nameNl: 'Playa de Muro (Playa Esperanza Resort)',
      nameSv: 'Playa de Muro (Playa Esperanza Resort)',
      nameNb: 'Playa de Muro (Playa Esperanza Resort)',
      nameDa: 'Playa de Muro (Playa Esperanza Resort)',
      locationType: 'pickup',
      coordinates: { lat: 39.7917, lng: 3.1167 }
    },
    {
      nameEn: 'Port Alcudia (Zafiro Tropic)',
      nameDe: 'Port Alcudia (Zafiro Tropic)',
      nameEs: 'Port Alcudia (Zafiro Tropic)',
      nameFr: 'Port Alcudia (Zafiro Tropic)',
      nameCa: 'Port d\'Alcúdia (Zafiro Tropic)',
      nameIt: 'Port Alcudia (Zafiro Tropic)',
      nameNl: 'Port Alcudia (Zafiro Tropic)',
      nameSv: 'Port Alcudia (Zafiro Tropic)',
      nameNb: 'Port Alcudia (Zafiro Tropic)',
      nameDa: 'Port Alcudia (Zafiro Tropic)',
      locationType: 'pickup',
      coordinates: { lat: 39.8392, lng: 3.1386 }
    },
    {
      nameEn: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameDe: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameEs: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameFr: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameCa: 'Platja de Palma (Aparthotel Fontanellas Playa)',
      nameIt: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameNl: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameSv: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameNb: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      nameDa: 'Playa de Palma (Aparthotel Fontanellas Playa)',
      locationType: 'pickup',
      coordinates: { lat: 39.5217, lng: 2.7367 }
    },
    // Dropoff locations
    {
      nameEn: 'Port d\'Andratx',
      nameDe: 'Port d\'Andratx',
      nameEs: 'Port d\'Andratx',
      nameFr: 'Port d\'Andratx',
      nameCa: 'Port d\'Andratx',
      nameIt: 'Port d\'Andratx',
      nameNl: 'Port d\'Andratx',
      nameSv: 'Port d\'Andratx',
      nameNb: 'Port d\'Andratx',
      nameDa: 'Port d\'Andratx',
      locationType: 'dropoff',
      coordinates: { lat: 39.5425, lng: 2.3886 }
    },
    {
      nameEn: 'Repsol Garage (Lluc)',
      nameDe: 'Repsol Tankstelle (Lluc)',
      nameEs: 'Gasolinera Repsol (Lluc)',
      nameFr: 'Station Repsol (Lluc)',
      nameCa: 'Benzinera Repsol (Lluc)',
      nameIt: 'Stazione Repsol (Lluc)',
      nameNl: 'Repsol Tankstation (Lluc)',
      nameSv: 'Repsol Bensinstation (Lluc)',
      nameNb: 'Repsol Bensinstasjon (Lluc)',
      nameDa: 'Repsol Tankstation (Lluc)',
      locationType: 'dropoff',
      coordinates: { lat: 39.8244, lng: 2.8900 }
    }
  ];

  // Delete existing test data in correct order (to avoid foreign key constraints)
  console.log('Deleting test bookings...');
  await prisma.scheduledBooking.deleteMany({});

  console.log('Deleting test services...');
  await prisma.scheduledService.deleteMany({});

  // Now delete existing test routes
  console.log('Deleting test routes...');
  await prisma.route.deleteMany({});

  // Add new routes
  for (const route of routes) {
    const created = await prisma.route.create({
      data: {
        ...route,
        active: true,
        displayOrder: 0
      }
    });
    console.log(`✅ Created: ${created.nameEn} (ID: ${created.id})`);
  }

  console.log('\n✅ All real routes added successfully!\n');

  // Display summary
  const allRoutes = await prisma.route.findMany({
    where: { active: true },
    orderBy: { nameEn: 'asc' }
  });

  console.log('📍 PICKUP LOCATIONS:');
  allRoutes
    .filter(r => r.locationType === 'pickup' || r.locationType === 'both')
    .forEach(r => console.log(`   ${r.id}: ${r.nameEn}`));

  console.log('\n📍 DROPOFF LOCATIONS:');
  allRoutes
    .filter(r => r.locationType === 'dropoff' || r.locationType === 'both')
    .forEach(r => console.log(`   ${r.id}: ${r.nameEn}`));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
