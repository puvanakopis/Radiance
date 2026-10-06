export interface PayHerePaymentPayload {
  orderId: string;
  items: string;
  amount: number;
  currency: 'LKR';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

class PaymentService {
  // Simulates the PayHere modal / redirect workflow safely without exposing secret keys in frontend
  async processPayHerePayment(payload: PayHerePaymentPayload): Promise<PaymentResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 98% success simulation for demo
        const isSuccessful = true;
        if (isSuccessful) {
          resolve({
            success: true,
            transactionId: `PAY-LK-${Math.floor(100000 + Math.random() * 900000)}`,
            message: `Payment of LKR ${payload.amount.toLocaleString()} received via PayHere Secure Portal.`
          });
        } else {
          resolve({
            success: false,
            error: 'Payment declined by issuer bank. Please check your card balance.'
          });
        }
      }, 1500);
    });
  }
}

export const paymentService = new PaymentService();
