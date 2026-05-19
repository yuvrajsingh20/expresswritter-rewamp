import redis from './redis';

const PAYMENT_SESSION_TTL = 7200;

export async function createPaymentSession(razorpayOrderId, data) {
  const key = `payment_session:${razorpayOrderId}`;
  await redis.set(key, JSON.stringify(data), 'EX', PAYMENT_SESSION_TTL);
}

export async function getPaymentSession(razorpayOrderId) {
  const key = `payment_session:${razorpayOrderId}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deletePaymentSession(razorpayOrderId) {
  const key = `payment_session:${razorpayOrderId}`;
  await redis.del(key);
}

export async function getAndDeletePaymentSession(razorpayOrderId) {
  const key = `payment_session:${razorpayOrderId}`;
  const data = await redis.getdel(key);
  return data ? JSON.parse(data) : null;
}

export async function getSessionByIdempotencyKey(idempotencyKey) {
  const pattern = `payment_session:*`;
  const keys = await redis.keys(pattern);
  
  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.idempotencyKey === idempotencyKey) {
        const razorpayOrderId = key.replace('payment_session:', '');
        return { razorpayOrderId, ...parsed };
      }
    }
  }
  return null;
}