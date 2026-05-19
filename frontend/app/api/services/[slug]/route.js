import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_SERVICES } from "@/app/api/admin/services/route";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { slug } = await params;
  try {
    let service = await prisma.service.findUnique({
      where: { slug },
    });

    // If not found in the database, check if it exists in the INITIAL_SERVICES catalog and sync it
    if (!service) {
      const match = INITIAL_SERVICES.find(item => item.slug === slug);
      if (match) {
        console.log(`[API/Services/[slug]] Auto-syncing requested service: ${match.name} (${match.slug})`);
        service = await prisma.service.create({
          data: {
            slug: match.slug,
            name: match.name,
            description: match.description,
            features: match.features,
            basePrice: match.priceMin,
            isActive: match.isActive,
            tagline: match.tagline,
            category: match.category,
            icon: match.icon,
            priceMin: match.priceMin,
            priceMax: match.priceMax,
            variantsCount: match.variantsCount,
            addonsCount: match.addonsCount,
            ordersCount: match.ordersCount,
            revenue: match.revenue,
          }
        });
      }
    }

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("[API/Services/[slug]] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}
