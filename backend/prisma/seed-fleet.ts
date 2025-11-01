import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFleet() {
  console.log('🚌 Seeding fleet data...\n');

  // Create Buses
  console.log('Creating buses...');
  
  const buses = await Promise.all([
    prisma.bus.create({
      data: {
        name: 'Bus A',
        licensePlate: 'PM-1234-AB',
        capacity: 8,
        bikeCapacity: 8,
        availabilityType: 'always',
        bookingCutoffHours: 18,
        active: true,
        notes: 'Main shuttle bus - Good condition'
      }
    }),
    prisma.bus.create({
      data: {
        name: 'Bus B',
        licensePlate: 'PM-5678-CD',
        capacity: 6,
        bikeCapacity: 6,
        availabilityType: 'always',
        bookingCutoffHours: 18,
        active: true,
        notes: 'Smaller shuttle for lower demand days'
      }
    }),
    prisma.bus.create({
      data: {
        name: 'Bus C',
        licensePlate: 'PM-9012-EF',
        capacity: 10,
        bikeCapacity: 10,
        availabilityType: 'seasonal',
        availabilityRules: {
          startDate: '2025-04-01',
          endDate: '2025-10-31'
        },
        bookingCutoffHours: 18,
        active: true,
        notes: 'Large capacity bus - Seasonal (April-October)'
      }
    })
  ]);

  console.log(`✅ Created ${buses.length} buses`);
  buses.forEach(bus => console.log(`   - ${bus.name} (${bus.licensePlate})`));

  // Create Routes
  console.log('\nCreating routes...');

  const routes = await Promise.all([
    // Pickup Locations
    prisma.route.create({
      data: {
        nameEn: 'Port de Pollença',
        nameDe: 'Hafen von Pollença',
        nameEs: 'Puerto de Pollença',
        nameFr: 'Port de Pollença',
        nameCa: 'Port de Pollença',
        nameIt: 'Porto di Pollença',
        nameNl: 'Haven van Pollença',
        nameSv: 'Pollença hamn',
        nameNb: 'Pollença havn',
        nameDa: 'Pollença havn',
        locationType: 'both',
        coordinates: { lat: 39.9055, lng: 3.0897 },
        displayOrder: 1,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Pollença Town',
        nameDe: 'Pollença Stadt',
        nameEs: 'Pueblo de Pollença',
        nameFr: 'Ville de Pollença',
        nameCa: 'Pollença Ciutat',
        nameIt: 'Città di Pollença',
        nameNl: 'Pollença Stad',
        nameSv: 'Pollença stad',
        nameNb: 'Pollença by',
        nameDa: 'Pollença by',
        locationType: 'both',
        coordinates: { lat: 39.8726, lng: 2.9968 },
        displayOrder: 2,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Alcúdia',
        nameDe: 'Alcúdia',
        nameEs: 'Alcúdia',
        nameFr: 'Alcúdia',
        nameCa: 'Alcúdia',
        nameIt: 'Alcúdia',
        nameNl: 'Alcúdia',
        nameSv: 'Alcúdia',
        nameNb: 'Alcúdia',
        nameDa: 'Alcúdia',
        locationType: 'pickup',
        coordinates: { lat: 39.8526, lng: 3.1208 },
        displayOrder: 3,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Can Picafort',
        nameDe: 'Can Picafort',
        nameEs: 'Can Picafort',
        nameFr: 'Can Picafort',
        nameCa: 'Can Picafort',
        nameIt: 'Can Picafort',
        nameNl: 'Can Picafort',
        nameSv: 'Can Picafort',
        nameNb: 'Can Picafort',
        nameDa: 'Can Picafort',
        locationType: 'pickup',
        coordinates: { lat: 39.7644, lng: 3.1623 },
        displayOrder: 4,
        active: true
      }
    }),

    // Dropoff Locations
    prisma.route.create({
      data: {
        nameEn: 'Sa Calobra',
        nameDe: 'Sa Calobra',
        nameEs: 'Sa Calobra',
        nameFr: 'Sa Calobra',
        nameCa: 'Sa Calobra',
        nameIt: 'Sa Calobra',
        nameNl: 'Sa Calobra',
        nameSv: 'Sa Calobra',
        nameNb: 'Sa Calobra',
        nameDa: 'Sa Calobra',
        locationType: 'dropoff',
        coordinates: { lat: 39.8531, lng: 2.8072 },
        displayOrder: 1,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Coll dels Reis (Viewpoint)',
        nameDe: 'Coll dels Reis (Aussichtspunkt)',
        nameEs: 'Coll dels Reis (Mirador)',
        nameFr: 'Coll dels Reis (Point de vue)',
        nameCa: 'Coll dels Reis (Mirador)',
        nameIt: 'Coll dels Reis (Belvedere)',
        nameNl: 'Coll dels Reis (Uitkijkpunt)',
        nameSv: 'Coll dels Reis (Utsiktspunkt)',
        nameNb: 'Coll dels Reis (Utsiktspunkt)',
        nameDa: 'Coll dels Reis (Udsigtspunkt)',
        locationType: 'dropoff',
        coordinates: { lat: 39.8347, lng: 2.8254 },
        displayOrder: 2,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Cala Tuent',
        nameDe: 'Cala Tuent',
        nameEs: 'Cala Tuent',
        nameFr: 'Cala Tuent',
        nameCa: 'Cala Tuent',
        nameIt: 'Cala Tuent',
        nameNl: 'Cala Tuent',
        nameSv: 'Cala Tuent',
        nameNb: 'Cala Tuent',
        nameDa: 'Cala Tuent',
        locationType: 'dropoff',
        coordinates: { lat: 39.8489, lng: 2.8108 },
        displayOrder: 3,
        active: true
      }
    }),
    prisma.route.create({
      data: {
        nameEn: 'Escorca (Lluc Monastery)',
        nameDe: 'Escorca (Kloster Lluc)',
        nameEs: 'Escorca (Monasterio de Lluc)',
        nameFr: 'Escorca (Monastère de Lluc)',
        nameCa: 'Escorca (Monestir de Lluc)',
        nameIt: 'Escorca (Monastero di Lluc)',
        nameNl: 'Escorca (Klooster Lluc)',
        nameSv: 'Escorca (Lluc kloster)',
        nameNb: 'Escorca (Lluc kloster)',
        nameDa: 'Escorca (Lluc kloster)',
        locationType: 'both',
        coordinates: { lat: 39.8244, lng: 2.8847 },
        displayOrder: 4,
        active: true
      }
    })
  ]);

  console.log(`✅ Created ${routes.length} routes`);
  const pickupCount = routes.filter(r => r.locationType === 'pickup' || r.locationType === 'both').length;
  const dropoffCount = routes.filter(r => r.locationType === 'dropoff' || r.locationType === 'both').length;
  console.log(`   - ${pickupCount} pickup locations`);
  console.log(`   - ${dropoffCount} dropoff locations`);

  console.log('\n✅ Fleet seeding complete!\n');
  
  return { buses, routes };
}

// Run the seed if called directly
if (require.main === module) {
  seedFleet()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding fleet:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedFleet };
