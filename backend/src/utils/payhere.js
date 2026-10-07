import crypto from 'crypto';
import { ENV } from '../config/env.js';

export function generatePayHereHash(
  merchantId,
  orderId,
  amount,
  currency = 'LKR'
) {
  const formattedAmount = Number(amount).toLocaleString('en-us', { minimumFractionDigits: 2 }).replaceAll(',', '');
  const hashedSecret = crypto
    .createHash('md5')
    .update(ENV.PAYHERE_MERCHANT_SECRET)
    .digest('hex')
    .toUpperCase();

  const mainString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(mainString).digest('hex').toUpperCase();
}

export function verifyPayHereNotification(data) {
  const hashedSecret = crypto
    .createHash('md5')
    .update(ENV.PAYHERE_MERCHANT_SECRET)
    .digest('hex')
    .toUpperCase();

  const checkString = `${data.merchant_id}${data.order_id}${data.payhere_amount}${data.payhere_currency}${data.status_code}${hashedSecret}`;
  const localMd5sig = crypto.createHash('md5').update(checkString).digest('hex').toUpperCase();

  return localMd5sig === data.md5sig?.toUpperCase();
}
