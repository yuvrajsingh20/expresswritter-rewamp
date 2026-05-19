import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const data = await req.json();
    
    // Prepare update data
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.tagline !== undefined) updateData.tagline = data.tagline;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.icon !== undefined) updateData.icon = data.icon;
    
    // Calculate and override base pricing parameters dynamically if variants are provided
    if (data.variants !== undefined && Array.isArray(data.variants) && data.variants.length > 0) {
      const prices = data.variants.map(v => {
        let p = v.price || v.p || 0;
        if (typeof p === "string") p = parseFloat(p.replace(/[^0-9.]/g, '')) || 0;
        return p;
      });
      updateData.priceMin = Math.min(...prices);
      updateData.priceMax = Math.max(...prices);
      updateData.basePrice = Math.min(...prices);
      updateData.variantsCount = data.variants.length;
    } else {
      if (data.priceMin !== undefined) {
        updateData.priceMin = parseFloat(data.priceMin);
        updateData.basePrice = parseFloat(data.priceMin);
      }
      if (data.priceMax !== undefined) updateData.priceMax = parseFloat(data.priceMax);
      if (data.variantsCount !== undefined) updateData.variantsCount = parseInt(data.variantsCount);
    }

    if (data.addonsCount !== undefined) {
      updateData.addonsCount = parseInt(data.addonsCount);
    } else if (data.addonPrice !== undefined || data.customisationPrice !== undefined) {
      // Calculate dynamic addons count based on non-zero prices
      let count = 0;
      if (data.addonPrice && parseFloat(data.addonPrice) > 0) count++;
      if (data.customisationPrice && parseFloat(data.customisationPrice) > 0) count++;
      updateData.addonsCount = count;
    }

    if (data.ordersCount !== undefined) updateData.ordersCount = parseInt(data.ordersCount);
    if (data.revenue !== undefined) updateData.revenue = data.revenue;

    const service = await prisma.service.update({
      where: { id },
      data: updateData
    });

    // Update variants & service-level addons in dynamic catalog configuration
    try {
      // 1. Retrieve the existing dynamic configuration
      let servicesData = { sopVariants: {}, serviceAddons: {} };
      const config = await prisma.systemConfig.findUnique({
        where: { key: "SERVICES_CATALOG_DATA" }
      });
      if (config && config.value) {
        servicesData = typeof config.value === "string" ? JSON.parse(config.value) : config.value;
      } else {
        const jsonPath = path.join(process.cwd(), "data", "services_data.json");
        if (fs.existsSync(jsonPath)) {
          servicesData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        }
      }

      if (!servicesData.sopVariants) servicesData.sopVariants = {};
      if (!servicesData.serviceAddons) servicesData.serviceAddons = {};

      const oldName = service.name;
      const newName = data.name !== undefined ? data.name : service.name;

      // Handle name change
      if (oldName !== newName) {
        if (servicesData.sopVariants[oldName]) {
          servicesData.sopVariants[newName] = servicesData.sopVariants[oldName];
          delete servicesData.sopVariants[oldName];
        }
        if (servicesData.serviceAddons[oldName]) {
          servicesData.serviceAddons[newName] = servicesData.serviceAddons[oldName];
          delete servicesData.serviceAddons[oldName];
        }
      }

      // Write service-level addons
      if (data.addonPrice !== undefined || data.customisationPrice !== undefined) {
        const prevAddons = servicesData.serviceAddons[newName] || {};
        servicesData.serviceAddons[newName] = {
          addonPrice: data.addonPrice !== undefined ? (typeof data.addonPrice === "string" ? parseFloat(data.addonPrice.replace(/[^0-9.]/g, '')) || 0 : data.addonPrice) : (prevAddons.addonPrice ?? 499),
          customisationPrice: data.customisationPrice !== undefined ? (typeof data.customisationPrice === "string" ? parseFloat(data.customisationPrice.replace(/[^0-9.]/g, '')) || 0 : data.customisationPrice) : (prevAddons.customisationPrice ?? 799)
        };
      }

      // Write clean variants
      if (data.variants !== undefined && Array.isArray(data.variants)) {
        servicesData.sopVariants[newName] = data.variants.map(v => ({
          label: v.label || "Variant",
          wordCount: v.words || v.wordCount || "Standard Words",
          price: typeof v.price === "string" ? parseFloat(v.price.replace(/[^0-9.]/g, '')) || 0 : v.price || 0,
          delivery: v.delivery || "Standard Delivery",
          fastTrackPrice: typeof v.fastTrackPrice === "string" ? parseFloat(v.fastTrackPrice.replace(/[^0-9.]/g, '')) || 0 : v.fastTrackPrice || 0,
          fastTrackDelivery: v.fastTrackDelivery || "Express Delivery",
          addonPrice: null,
          customisation: "According to Requirements"
        }));
      }

      // 2. Save back to the database SystemConfig record (upsert)
      await prisma.systemConfig.upsert({
        where: { key: "SERVICES_CATALOG_DATA" },
        update: { value: servicesData },
        create: { key: "SERVICES_CATALOG_DATA", value: servicesData }
      });
      console.log(`[API/admin/services/[id]] Successfully saved catalog data to database (SystemConfig)`);

      // 3. Local disk backup (try-catch in case of read-only disk in cloud environments)
      try {
        const jsonPath = path.join(process.cwd(), "data", "services_data.json");
        fs.writeFileSync(jsonPath, JSON.stringify(servicesData, null, 2), "utf8");
        console.log(`[API/admin/services/[id]] Successfully backup catalog to local disk`);
      } catch (fsErr) {
        console.warn("[API/admin/services/[id]] Read-only filesystem. Disk backup skipped:", fsErr.message);
      }

    } catch (err) {
      console.error("Error updating catalog config:", err);
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        action: `Updated Service: ${service.name} (${service.slug})`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[API/Services/[id]] PATCH Error:", error);
    return NextResponse.json({ error: "Failed to update service", details: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const service = await prisma.service.delete({
      where: { id }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        action: `Deleted Service: ${service.name} (${service.slug})`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    console.error("[API/Services/[id]] DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete service", details: error.message }, { status: 500 });
  }
}
