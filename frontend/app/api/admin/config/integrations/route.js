import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key: "INTEGRATION_SETTINGS" },
    });
    return NextResponse.json(config ? config.value : null);
  } catch (error) {
    console.error("GET /api/admin/config/integrations error:", error);
    // Return null on error to allow frontend to use default values instead of crashing with 500
    return NextResponse.json(null);
  }
}

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser || authUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const config = await prisma.systemConfig.upsert({
      where: { key: "INTEGRATION_SETTINGS" },
      update: { value: data },
      create: { key: "INTEGRATION_SETTINGS", value: data },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Updated API Integration Settings`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error("POST /api/admin/config/integrations error:", error);
    return NextResponse.json({ error: "Failed to update integration settings" }, { status: 500 });
  }
}

