const dotenv = require("dotenv");
const path = require("path");

// Load from frontend/.env
dotenv.config({ path: path.join(__dirname, ".env") });

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";

const BASE_URL = CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

console.log("--- Cashfree Diagnostics ---");
console.log("CASHFREE_ENV:", CASHFREE_ENV);
console.log("BASE_URL:", BASE_URL);
console.log("APP_ID:", CASHFREE_APP_ID ? CASHFREE_APP_ID.substring(0, 8) + "..." : "undefined");
console.log("SECRET_KEY:", CASHFREE_SECRET_KEY ? CASHFREE_SECRET_KEY.substring(0, 12) + "..." : "undefined");

async function testCreateOrder() {
  const url = `${BASE_URL}/orders`;
  const payload = {
    order_id: `TEST_XW_CF_${Date.now()}`,
    order_amount: 1.00,
    order_currency: "INR",
    customer_details: {
      customer_id: "test_cust_123",
      customer_email: "test@xpresswriters.in",
      customer_phone: "9999999999",
      customer_name: "Test User"
    },
    order_meta: {
      return_url: "https://localhost:3000/student"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": CASHFREE_APP_ID || "",
        "x-client-secret": CASHFREE_SECRET_KEY || "",
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const status = response.status;
    const text = await response.text();
    console.log("\nResponse Status:", status);
    console.log("Response Body:", text);
  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testCreateOrder();
