const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const service = await prisma.service.create({
      data: {
        slug: 'test-service-789',
        name: 'Test Service 789',
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
    console.log("Service created");
    
    // Now fetch through the same logic as the GET API
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    const s = services.find(x => x.slug === 'test-service-789');
    console.log("Fetched service from DB:", s);
    
    // Simulate what API does
    const servicesData = { sopVariants: {}, serviceAddons: {} };
    const variants = servicesData.sopVariants?.[s.name] || [];
    const serviceAddons = servicesData.serviceAddons?.[s.name] || { addonPrice: 499, customisationPrice: 799 };
    
    const formatted = {
      ...s,
      addonPrice: serviceAddons.addonPrice ?? 499,
      customisationPrice: serviceAddons.customisationPrice ?? 799,
      variants: variants.map(v => ({
        label: v.label,
        words: v.words || v.wordCount || "1000 words",
        price: v.price || s.priceMin || 999,
        delivery: v.delivery || "5-7 days",
        fastTrackPrice: v.fastTrackPrice || 0,
        fastTrackDelivery: v.fastTrackDelivery || "24-48 hours",
        addonPrice: null,
        customisation: "According to Requirements"
      }))
    };
    
    console.log("API Formatted output:", formatted);

    await prisma.service.delete({ where: { id: service.id } });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
