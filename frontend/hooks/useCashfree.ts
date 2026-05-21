"use client";

import { useCallback } from "react";

export const useCashfree = () => {
  const loadScript = useCallback((src: string) => {
    return new Promise((resolve) => {
      if ((window as any).Cashfree) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }, []);

  /**
   * Processes a standard package order checkout
   */
  const processPayment = useCallback(async ({
    amount,
    projectId,
    couponCode,
    baseAmount,
    onSuccess,
    onError,
  }: {
    amount: number;
    projectId: string;
    couponCode?: string;
    baseAmount?: number;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  }) => {
    const loaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");

    if (!loaded) {
      alert("Cashfree SDK failed to load. Are you online?");
      return;
    }

    try {
      // Create a unique idempotency key
      const idempotencyKey = crypto.randomUUID 
        ? crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });

      // Contact API endpoint to register standard checkout transaction session
      const orderRes = await fetch("/api/payments/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount, 
          idempotencyKey,
          title: `Order Initiation - Project ${projectId.slice(-5).toUpperCase()}`,
          description: `Payment for project initiation ${projectId}`,
          serviceType: "SOP", 
          couponCode,
          baseAmount,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.payment_session_id) {
        throw new Error(orderData.message || "Failed to register checkout transaction");
      }

      // Initialize Cashfree client SDK instance
      const envMode = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";
      const cashfree = (window as any).Cashfree({
        mode: envMode,
      });

      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self", // Smooth standard redirect
      };

      await cashfree.checkout(checkoutOptions);
      onSuccess(orderData);
    } catch (error: any) {
      console.error("Cashfree order processing error:", error);
      onError(error);
    }
  }, [loadScript]);

  /**
   * Processes a custom pre-configured checkout session invoice payment
   */
  const processCheckoutSessionPayment = useCallback(async ({
    planKey,
    planName,
    priceText,
    sessionId,
    onSuccess,
    onError,
  }: {
    planKey?: string;
    planName?: string;
    priceText?: string;
    sessionId: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  }) => {
    const loaded = await loadScript("https://sdk.cashfree.com/js/v3/cashfree.js");

    if (!loaded) {
      alert("Cashfree SDK failed to load. Are you online?");
      return;
    }

    try {
      const orderRes = await fetch("/api/payments/cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          planKey,
          planName,
          priceText,
          sessionId,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.payment_session_id) {
        throw new Error(orderData.message || "Failed to create invoice transaction");
      }

      // Initialize Cashfree client SDK instance
      const envMode = process.env.NEXT_PUBLIC_CASHFREE_ENV === "production" ? "production" : "sandbox";
      const cashfree = (window as any).Cashfree({
        mode: envMode,
      });

      const checkoutOptions = {
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self", // Standard redirection
      };

      await cashfree.checkout(checkoutOptions);
      onSuccess(orderData);
    } catch (error: any) {
      console.error("Cashfree invoice processing error:", error);
      onError(error);
    }
  }, [loadScript]);

  return { processPayment, processCheckoutSessionPayment };
};
