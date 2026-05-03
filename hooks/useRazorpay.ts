"use client";

import { useCallback } from "react";

export const useRazorpay = () => {
  const loadScript = useCallback((src: string) => {
    return new Promise((resolve) => {
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

  const processPayment = useCallback(async ({
    amount,
    projectId,
    currency = "INR",
    name = "Express Writer",
    description = "Writing Service Payment",
    onSuccess,
    onError,
  }: {
    amount: number;
    projectId: string;
    currency?: string;
    name?: string;
    description?: string;
    onSuccess: (response: any) => void;
    onError: (error: any) => void;
  }) => {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    try {
      const orderRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, projectId }),
      });

      const orderData = await orderRes.json();

      if (!orderData.id) {
        throw new Error("Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name,
        description,
        order_id: orderData.id,
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              projectId,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyRes.ok) {
            onSuccess(response);
          } else {
            onError(verifyData);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#000000",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      onError(error);
    }
  }, [loadScript]);

  return { processPayment };
};
