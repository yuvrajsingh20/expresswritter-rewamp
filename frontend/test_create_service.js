const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const service = await prisma.service.create({
      data: {
        slug: 'test-service-123',
        name: 'Test Service',
        description: '',
        features: [],
        basePrice: 999,
        isActive: true,
        tagline: 'Test Tagline',
        category: 'Academic',
        icon: '🎓',
        priceMin: 999,
        priceMax: 2999,
        variantsCount: 1,
        addonsCount: 0,
        ordersCount: 0,
        revenue: '₹0',
      }
    });
    console.log("Service created successfully:", service);
    
    // Now delete it
    await prisma.service.delete({ where: { id: service.id } });
    console.log("Service deleted.");
  } catch (err) {
    console.error("Error creating service:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
