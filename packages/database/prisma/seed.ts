import { PrismaClient, VehicleType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NaviGet database...');

  // ===================== FARE MATRIX =====================
  // Fixed fares — NO surge, NO time modifiers, NO location modifiers
  const fareData = [
    {
      vehicleType: VehicleType.AUTO,
      baseFare: 25,
      perKmRate: 12,
      perMinRate: 1,
      minimumFare: 50,
    },
    {
      vehicleType: VehicleType.BIKE,
      baseFare: 15,
      perKmRate: 8,
      perMinRate: 0.5,
      minimumFare: 30,
    },
    {
      vehicleType: VehicleType.MINI,
      baseFare: 40,
      perKmRate: 14,
      perMinRate: 1.5,
      minimumFare: 80,
    },
    {
      vehicleType: VehicleType.SEDAN,
      baseFare: 60,
      perKmRate: 18,
      perMinRate: 2,
      minimumFare: 120,
    },
    {
      vehicleType: VehicleType.SUV,
      baseFare: 80,
      perKmRate: 22,
      perMinRate: 2.5,
      minimumFare: 150,
    },
  ];

  for (const fare of fareData) {
    await prisma.fareMatrix.upsert({
      where: { vehicleType: fare.vehicleType },
      update: fare,
      create: fare,
    });
  }
  console.log('✅ Fare matrix seeded (FIXED — no surge fields)');

  // ===================== ZONES =====================
  const zones = [
    {
      name: 'Delhi-NCR',
      city: 'Delhi',
      polygon: JSON.stringify([
        [28.4040, 76.8380],
        [28.8830, 76.8380],
        [28.8830, 77.3460],
        [28.4040, 77.3460],
      ]),
    },
    {
      name: 'Mumbai Metropolitan',
      city: 'Mumbai',
      polygon: JSON.stringify([
        [18.8930, 72.7760],
        [19.2710, 72.7760],
        [19.2710, 73.0430],
        [18.8930, 73.0430],
      ]),
    },
    {
      name: 'Bangalore Urban',
      city: 'Bangalore',
      polygon: JSON.stringify([
        [12.8340, 77.4600],
        [13.1390, 77.4600],
        [13.1390, 77.7840],
        [12.8340, 77.7840],
      ]),
    },
  ];

  for (const zone of zones) {
    await prisma.zone.create({ data: zone });
  }
  console.log('✅ Zones seeded');

  // ===================== ADMIN USER =====================
  const adminUser = await prisma.user.upsert({
    where: { phone: '+919999999999' },
    update: {},
    create: {
      phone: '+919999999999',
      name: 'NaviGet Admin',
      email: 'admin@navigate.in',
      role: 'ADMIN',
      isVerified: true,
      wallet: {
        create: { balance: 0 },
      },
    },
  });
  console.log('✅ Admin user created:', adminUser.id);

  // ===================== TEST RIDER =====================
  const testRider = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      name: 'Test Rider',
      email: 'rider@test.com',
      role: 'RIDER',
      isVerified: true,
      wallet: {
        create: { balance: 1000 },
      },
    },
  });
  console.log('✅ Test rider created:', testRider.id);

  // ===================== TEST DRIVER =====================
  const testDriverUser = await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {},
    create: {
      phone: '+919876543211',
      name: 'Test Driver',
      email: 'driver@test.com',
      role: 'DRIVER',
      isVerified: true,
      wallet: {
        create: { balance: 500 },
      },
    },
  });

  await prisma.driver.upsert({
    where: { userId: testDriverUser.id },
    update: {},
    create: {
      userId: testDriverUser.id,
      licenseNumber: 'DL-0420110012345',
      licenseExpiryDate: new Date('2028-12-31'),
      status: 'ONLINE',
      isApproved: true,
      currentLat: 28.6139,
      currentLng: 77.2090,
      vehicle: {
        create: {
          type: 'SEDAN',
          make: 'Maruti',
          model: 'Swift Dzire',
          year: 2023,
          color: 'White',
          plateNumber: 'DL-01-AB-1234',
        },
      },
    },
  });
  console.log('✅ Test driver created:', testDriverUser.id);

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
