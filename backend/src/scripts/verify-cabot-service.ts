import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const service = await prisma.scheduledService.findFirst({
    where: { productSku: 'S-PP-AX-070326-0715' },
    include: {
      routePickup1: true,
      routePickup2: true,
      routeDropoff: true
    }
  });

  if (!service) {
    console.log('Service not found!');
    return;
  }

  console.log('\n=== Service: S-PP-AX-070326-0715 ===');
  console.log('Date:', service.serviceDate.toISOString().substring(0, 10));
  console.log('Departure:', service.departureTime.toISOString().substring(11, 16));
  console.log('\nPickup 1:', service.routePickup1.nameEn);
  console.log('Pickup 2:', service.routePickup2?.nameEn);
  console.log('Dropoff:', service.routeDropoff.nameEn);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
