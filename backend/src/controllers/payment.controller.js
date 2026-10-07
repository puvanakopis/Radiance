import crypto from 'crypto';
import { ENV } from '../config/env.js';
import { OrderModel } from '../models/order.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Generate PayHere MD5 Security Hash
 * Formula: md5(merchant_id + order_id + formattedAmount + currency + md5(merchant_secret).toUpperCase()).toUpperCase()
 */
export function generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret) {
  const formattedAmount = Number(amount).toFixed(2);
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret || '')
    .digest('hex')
    .toUpperCase();

  const rawString = `${merchantId}${orderId}${formattedAmount}${currency}${hashedSecret}`;
  return crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();
}

/**
 * Verify PayHere IPN MD5 Signature
 * Formula: md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchant_secret).toUpperCase()).toUpperCase()
 */
export function verifyPayHereSignature(body, merchantSecret) {
  const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret || '')
    .digest('hex')
    .toUpperCase();

  const rawString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
  const computedSig = crypto.createHash('md5').update(rawString).digest('hex').toUpperCase();

  return computedSig === (md5sig || '').toUpperCase();
}

/**
 * 1. POST /api/payments/payhere/initiate
 * Generate full PayHere payload with security hash for SDK or form checkout
 */
export async function initiatePayHerePayment(req, res, next) {
  try {
    const {
      orderId,
      amount,
      currency = 'LKR',
      items = 'Skinova Botanical Skincare Order',
      firstName = 'Valued',
      lastName = 'Patron',
      email = '',
      phone = '',
      address = 'Colombo',
      city = 'Colombo',
      country = 'Sri Lanka',
    } = req.body;

    if (!orderId || amount === undefined || amount === null) {
      throw new AppError('Order ID and valid amount are required to initiate payment.', 400);
    }

    const merchantId = ENV.PAYHERE_MERCHANT_ID || '1211149';
    const merchantSecret = ENV.PAYHERE_MERCHANT_SECRET || '';
    const formattedAmount = Number(amount).toFixed(2);

    const hash = generatePayHereHash(merchantId, String(orderId), formattedAmount, currency, merchantSecret);

    const paymentPayload = {
      sandbox: ENV.PAYHERE_SANDBOX,
      merchant_id: merchantId,
      return_url: `${ENV.FRONTEND_URL}/order-success/${orderId}`,
      cancel_url: `${ENV.FRONTEND_URL}/checkout`,
      notify_url: ENV.PAYHERE_NOTIFY_URL,
      order_id: String(orderId),
      items: String(items),
      amount: formattedAmount,
      currency,
      hash,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address,
      city,
      country,
      delivery_address: address,
      delivery_city: city,
      delivery_country: country,
    };

    res.status(200).json({
      success: true,
      message: 'PayHere payment initiated successfully.',
      data: paymentPayload,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. POST /api/payments/payhere/notify
 * PayHere Instant Payment Notification (IPN) Webhook
 */
export async function handlePayHereNotify(req, res, next) {
  try {
    const body = req.body;
    console.log('[PayHere IPN] Received notification:', body);

    const merchantSecret = ENV.PAYHERE_MERCHANT_SECRET || '';
    const isValid = verifyPayHereSignature(body, merchantSecret);

    if (!isValid) {
      console.warn('[PayHere IPN] Invalid MD5 signature verification failed.');
      return res.status(400).send('Invalid signature');
    }

    const { order_id, payment_id, status_code } = body;

    // Status code 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    const order = await OrderModel.findOne({
      $or: [{ orderNumber: order_id }, { _id: order_id }],
    });

    if (order) {
      if (status_code === '2' || status_code === 2) {
        order.paymentStatus = 'Paid';
        order.paymentMethod = 'PayHere';
        order.status = 'Confirmed';
        order.paymentReference = payment_id || order.paymentReference;

        // Update timeline step for Confirmed
        const confirmedStep = order.timeline?.find((t) => t.status === 'Confirmed');
        if (confirmedStep) {
          confirmedStep.completed = true;
          confirmedStep.timestamp = new Date().toISOString();
          confirmedStep.description = `Payment verified via PayHere (Ref: ${payment_id || 'Approved'})`;
        }

        await order.save();
        console.log(`[PayHere IPN] Order ${order.orderNumber} successfully marked as Paid & Confirmed.`);
      } else if (status_code === '-2' || status_code === -2) {
        order.paymentStatus = 'Failed';
        await order.save();
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('[PayHere IPN Error]:', err);
    res.status(500).send('Internal Server Error');
  }
}

/**
 * 3. POST /api/payments/payhere/confirm
 * Client-side callback confirmation to immediately settle order status after modal completion
 */
export async function confirmPayHerePayment(req, res, next) {
  try {
    const { orderId, paymentId, status = 'Paid' } = req.body;

    if (!orderId) {
      throw new AppError('Order ID is required to confirm payment.', 400);
    }

    const order = await OrderModel.findOne({
      $or: [{ orderNumber: orderId }, { _id: orderId }],
    });

    if (!order) {
      throw new AppError(`Order "${orderId}" not found.`, 404);
    }

    order.paymentStatus = status;
    order.paymentMethod = 'PayHere';
    order.status = 'Confirmed';
    if (paymentId) {
      order.paymentReference = paymentId;
    }

    const confirmedStep = order.timeline?.find((t) => t.status === 'Confirmed');
    if (confirmedStep) {
      confirmedStep.completed = true;
      confirmedStep.timestamp = new Date().toISOString();
      confirmedStep.description = `Payment received & verified via PayHere Sandbox (Ref: ${paymentId || 'Approved'})`;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully.',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}
