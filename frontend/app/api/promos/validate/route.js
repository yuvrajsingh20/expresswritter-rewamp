import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, amount } = await req.json();

    if (!code || typeof code !== "string" || code.trim() === "") {
      return NextResponse.json({ error: "Please enter a valid coupon code" }, { status: 400 });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    // Find the promo code (case insensitive matching)
    const promo = await prisma.promoCode.findFirst({
      where: {
        code: {
          equals: code.trim(),
          mode: "insensitive"
        }
      }
    });

    if (!promo) {
      return NextResponse.json({ error: "This coupon code does not exist" }, { status: 404 });
    }

    if (!promo.isActive) {
      return NextResponse.json({ error: "This coupon code is inactive or disabled" }, { status: 400 });
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return NextResponse.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json({ error: "This coupon code has reached its maximum usage limit" }, { status: 400 });
    }

    if (amount < promo.minOrderValue) {
      return NextResponse.json({
        error: `Minimum order value of ₹${promo.minOrderValue.toLocaleString()} is required to use this coupon.`
      }, { status: 400 });
    }

    // Calculate discount details
    let discountAmount = 0;
    if (promo.type === "PERCENTAGE") {
      discountAmount = (amount * promo.value) / 100;
    } else if (promo.type === "FIXED") {
      discountAmount = promo.value;
    }

    // Safeguard to avoid negative numbers
    const finalAmount = Math.max(0, amount - discountAmount);

    return NextResponse.json({
      valid: true,
      code: promo.code,
      id: promo.id,
      type: promo.type,
      value: promo.value,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      finalAmount: parseFloat(finalAmount.toFixed(2))
    }, { status: 200 });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
