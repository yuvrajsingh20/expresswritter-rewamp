import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser || !checkPermission(authUser, "promo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
  }
}

export async function POST(req) {
  const authUser = await getAuthUser();
  if (!authUser || !checkPermission(authUser, "promo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();
    const value = parseFloat(data.value);
    const usageLimit = data.usageLimit ? parseInt(data.usageLimit) : null;

    // Sub-admin promo abuse prevention: cap percentage discounts at 25% and usage at 100
    if (authUser.role === "SUB_ADMIN") {
      if (data.type === "PERCENTAGE" && value > 25) {
        return NextResponse.json({ error: "Sub-admins cannot create discounts over 25%. Contact an Admin." }, { status: 403 });
      }
      if (usageLimit !== null && usageLimit > 100) {
        return NextResponse.json({ error: "Sub-admins cannot set usage limits over 100. Contact an Admin." }, { status: 403 });
      }
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: data.code,
        type: data.type,
        value,
        minOrderValue: parseFloat(data.minOrderValue || 0),
        usageLimit,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Created Promo Code: ${data.code}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(promo);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
  }
}
