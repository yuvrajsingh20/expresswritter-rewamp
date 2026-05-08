import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "CURRENCY_SETTINGS" },
    });
    return NextResponse.json(config ? config.value : null);
  } catch (error) {
    console.error("Failed to fetch currency settings:", error);
    return NextResponse.json({ error: "Failed to fetch currency settings" }, { status: 500 });
  }
}

export async function POST(req) {
  const authUser = await getAuthUser();
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const config = await prisma.systemConfig.upsert({
      where: { key: "CURRENCY_SETTINGS" },
      update: { value: data },
      create: { key: "CURRENCY_SETTINGS", value: data },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Updated Currency Settings`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update currency settings" }, { status: 500 });
  }
}
