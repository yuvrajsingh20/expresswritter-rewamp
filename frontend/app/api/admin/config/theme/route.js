import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req) {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "THEME_SETTINGS" },
    });
    return NextResponse.json(config ? config.value : null);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme settings" }, { status: 500 });
  }
}

export async function POST(req) {
  const authUser = await getAuthUser(req);
  if (!authUser || authUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const config = await prisma.systemConfig.upsert({
      where: { key: "THEME_SETTINGS" },
      update: { value: data },
      create: { key: "THEME_SETTINGS", value: data },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Updated Platform Theme Settings`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update theme settings" }, { status: 500 });
  }
}
