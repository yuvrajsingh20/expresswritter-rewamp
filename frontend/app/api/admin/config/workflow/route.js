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
      where: { key: "WORKFLOW_SETTINGS" },
    });
    return NextResponse.json(config ? config.value : null);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workflow settings" }, { status: 500 });
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
      where: { key: "WORKFLOW_SETTINGS" },
      update: { value: data },
      create: { key: "WORKFLOW_SETTINGS", value: data },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Updated Workflow Matrix Settings`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update workflow settings" }, { status: 500 });
  }
}
