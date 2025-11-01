import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const route9 = await prisma.routeLocation.findUnique({
    where: { id: 9 }
  });
  
  const route10 = await prisma.routeLocation.findUnique({
    where: { id: 10 }
  });
  
  console.log('\n=== Route Location ID 9 ===');
  console.log('Name (EN):', route9?.nameEn);
  console.log('Pickup Time:', route9?.pickupTime);
  console.log('Location Type:', route9?.locationType);
  
  console.log('\n=== Route Location ID 10 ===');
  console.log('Name (EN):', route10?.nameEn);
  console.log('Pickup Time:', route10?.pickupTime);
  console.log('Location Type:', route10?.locationType);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
