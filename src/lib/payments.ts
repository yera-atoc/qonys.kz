import crypto from 'crypto';

export type CreatePaymentInput = {
  amount: number;
  orderId: string;
  description: string;
  returnUrl: string;
};

export type CreatePaymentResult = { redirectUrl: string; externalId: string };

/**
 * Адаптер платежей. По умолчанию mock — оплата подтверждается вручную
 * со страницы /cabinet/billing. Подключите Kaspi Bank или Robokassa,
 * заполнив PAYMENT_* в .env.
 */
export async function createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
  const provider = process.env.PAYMENT_PROVIDER ?? 'mock';

  if (provider === 'robokassa') {
    const login = process.env.PAYMENT_MERCHANT_ID!;
    const pass1 = process.env.PAYMENT_SECRET!;
    const sum = input.amount.toFixed(2);
    const signature = crypto
      .createHash('md5')
      .update(`${login}:${sum}:${input.orderId}:${pass1}`)
      .digest('hex');
    const url =
      `https://auth.robokassa.kz/Merchant/Index.aspx?MerchantLogin=${login}` +
      `&OutSum=${sum}&InvId=${input.orderId}&SignatureValue=${signature}` +
      `&Description=${encodeURIComponent(input.description)}`;
    return { redirectUrl: url, externalId: input.orderId };
  }

  if (provider === 'kaspi') {
    // Kaspi Business выдаёт эквайринговый endpoint индивидуально.
    const base = process.env.PAYMENT_KASPI_URL ?? 'https://kaspi.kz/pay';
    const url = `${base}?merchant=${process.env.PAYMENT_MERCHANT_ID}&order=${input.orderId}&amount=${input.amount}`;
    return { redirectUrl: url, externalId: input.orderId };
  }

  return { redirectUrl: `${input.returnUrl}?mock=1&order=${input.orderId}`, externalId: `mock_${input.orderId}` };
}

/** Проверка подписи входящего вебхука. */
export function verifyWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== 'production';
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
