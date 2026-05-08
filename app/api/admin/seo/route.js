import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: "SEO_SETTINGS" },
    });
    return NextResponse.json(config ? config.value : {});
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch SEO settings" }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const config = await prisma.systemConfig.upsert({
      where: { key: "SEO_SETTINGS" },
      update: { value: data },
      create: { key: "SEO_SETTINGS", value: data },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name,
        action: `Updated SEO Settings`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update SEO settings" }, { status: 500 });
  }
}
