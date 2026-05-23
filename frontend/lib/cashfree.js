const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || "cf_app_placeholder";
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || "cf_secret_placeholder";
const CASHFREE_ENV = process.env.NEXT_PUBLIC_CASHFREE_ENV || "sandbox";

const BASE_URL = CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

/**
 * Communicates with Cashfree PG to register a checkout transaction session
 */
export async function createCashfreeOrder({ orderId, amount, customer, returnUrl }) {
  const url = `${BASE_URL}/orders`;
  
  // Format customer phone: Strip all non-digits and normalize to exactly 10 digits
  let phone = customer.phone || "9999999999";
  phone = phone.replace(/\D/g, '');
  if (phone.length < 10) {
    phone = "9999999999";
  } else if (phone.length > 10) {
    phone = phone.slice(-10);
  }

  const payload = {
    order_id: orderId,
    order_amount: parseFloat(amount.toFixed(2)),
    order_currency: "INR",
    customer_details: {
      customer_id: customer.id,
      customer_email: customer.email || "student@xpresswriters.in",
      customer_phone: phone,
      customer_name: customer.name || "Student User",
    },
    order_meta: {
      return_url: returnUrl
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": CASHFREE_APP_ID,
      "x-client-secret": CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Cashfree order creation failed:", errText);
    throw new Error(`Cashfree error: ${errText}`);
  }

  return await response.json();
}

/**
 * Fetches order ledger status from Cashfree for secure server-side verification
 */
export async function fetchCashfreeOrder(orderId) {
  const url = `${BASE_URL}/orders/${orderId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-client-id": CASHFREE_APP_ID,
      "x-client-secret": CASHFREE_SECRET_KEY,
      "x-api-version": "2023-08-01",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`Cashfree order fetch failed for ${orderId}:`, errText);
    throw new Error(`Cashfree fetch error: ${errText}`);
  }

  return await response.json();
}
