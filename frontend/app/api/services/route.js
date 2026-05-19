import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { INITIAL_SERVICES } from "@/app/api/admin/services/route";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    // 1. Sync check: Ensure all 20 real services are present in the database
    for (const item of INITIAL_SERVICES) {
      const existing = await prisma.service.findUnique({
        where: { slug: item.slug }
      });
      if (!existing) {
        console.log(`[API/Services/Client] Syncing missing service: ${item.name} (${item.slug})`);
        await prisma.service.create({
          data: {
            slug: item.slug,
            name: item.name,
            description: item.description,
            features: item.features,
            basePrice: item.priceMin,
            isActive: item.isActive,
            tagline: item.tagline,
            category: item.category,
            icon: item.icon,
            priceMin: item.priceMin,
            priceMax: item.priceMax,
            variantsCount: item.variantsCount,
            addonsCount: item.addonsCount,
            ordersCount: item.ordersCount,
            revenue: item.revenue,
          }
        });
      }
    }

    // 2. Fetch all active services from database
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    });

    // 3. Load catalog configuration dynamically (prefer database SystemConfig, fallback to disk)
    let servicesData = { sopVariants: {}, serviceAddons: {} };
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: "SERVICES_CATALOG_DATA" }
      });
      if (config && config.value) {
        servicesData = typeof config.value === "string" ? JSON.parse(config.value) : config.value;
      } else {
        // Fallback to disk and seed
        const jsonPath = path.join(process.cwd(), "data", "services_data.json");
        if (fs.existsSync(jsonPath)) {
          servicesData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
          await prisma.systemConfig.create({
            data: {
              key: "SERVICES_CATALOG_DATA",
              value: servicesData
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Catalog Data GET Client] Database SystemConfig check failed, falling back to disk:", dbErr);
      const jsonPath = path.join(process.cwd(), "data", "services_data.json");
      if (fs.existsSync(jsonPath)) {
        servicesData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      }
    }

    // If type=catalog is specified, return the base database services with variants attached
    if (type === "catalog") {
      const catalogWithVariants = dbServices.map(s => {
        const variantsData = servicesData.sopVariants?.[s.name] || [];
        const serviceAddons = servicesData.serviceAddons?.[s.name] || { addonPrice: 499, customisationPrice: 799 };
        
        return {
          ...s,
          addonPrice: serviceAddons.addonPrice ?? 499,
          customisationPrice: serviceAddons.customisationPrice ?? 799,
          variants: variantsData.map((v, index) => {
            let parsedPrice = v.price;
            if (typeof parsedPrice === "string") {
              const num = parseFloat(parsedPrice.replace(/[^0-9.]/g, ''));
              if (num) parsedPrice = num;
            }
            if (!parsedPrice) parsedPrice = s.priceMin || s.basePrice || 2499;

            let parsedFast = v.fastTrackPrice;
            if (typeof parsedFast === "string") {
              const num = parseFloat(parsedFast.replace(/[^0-9.]/g, ''));
              if (num) parsedFast = num;
            }
            if (parsedFast === undefined || parsedFast === null) parsedFast = Math.round(parsedPrice * 0.3);

            return {
              id: `${s.slug}_var_${index}`,
              label: v.label,
              words: v.wordCount || v.words || '1000 words',
              delivery: v.delivery || '5-7 days',
              price: parsedPrice,
              fast: parsedFast,
              addon: serviceAddons.addonPrice ?? 499,
              custom: serviceAddons.customisationPrice ?? 799,
              ats: s.category.toLowerCase() === 'resume' || s.category.toLowerCase() === 'career' ? 299 : undefined
            };
          })
        };
      });
      return NextResponse.json(catalogWithVariants);
    }

    const allServices = [];

    dbServices.forEach((service) => {
      const variants = servicesData.sopVariants?.[service.name];

      if (variants && variants.length > 0) {
        variants.forEach((v, index) => {
           let parsedPrice = 0;
           if (typeof v.price === "string") {
             const numericPart = v.price.replace(/[^0-9.]/g, '');
             if (numericPart) parsedPrice = parseFloat(numericPart);
           } else if (typeof v.price === "number") {
             parsedPrice = v.price;
           }

           if (!parsedPrice) parsedPrice = service.basePrice;

           allServices.push({
             id: `${service.slug || service.id}-var-${index}`,
             name: `${service.name} - ${v.label}`,
             basePrice: parsedPrice
           });
         });
      } else {
        allServices.push({
          id: service.slug || service.id,
          name: service.name,
          basePrice: service.basePrice
        });
      }
    });

    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Error fetching database services catalog for client:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
