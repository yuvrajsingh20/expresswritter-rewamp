import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { checkPermission } from "@/lib/auth-guards";

export async function PATCH(req, { params }) {
  const authUser = await getAuthUser();
  if (!authUser || !checkPermission(authUser, "promo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const data = await req.json();
    const existing = await prisma.promoCode.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
    }

    const updated = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.code !== undefined && { code: data.code }),
        ...(data.value !== undefined && { value: parseFloat(data.value) }),
        ...(data.type !== undefined && { type: data.type }),
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Updated Promo Code: ${updated.code} (Active: ${updated.isActive})`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Promo Update Error:", error);
    return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const authUser = await getAuthUser();
  if (!authUser || !checkPermission(authUser, "promo:manage")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const deleted = await prisma.promoCode.delete({
      where: { id }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: authUser.id,
        userName: authUser.name,
        action: `Deleted Promo Code: ${deleted.code}`,
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
      }
    });

    return NextResponse.json({ message: "Promo code deleted successfully", code: deleted.code });
  } catch (error) {
    console.error("Promo Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
  }
}
