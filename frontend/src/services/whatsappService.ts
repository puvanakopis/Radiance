import { CartItem, Address } from '@/types';

export interface WhatsAppOrderData {
  orderNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: Address;
  notes?: string;
}

class WhatsAppService {
  private businessNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94771234567';

  getFormattedMessage(data: WhatsAppOrderData): string {
    const header = `*✨ SKINOVA ORDER INQUIRY & CONFIRMATION ✨*\n` +
      `_Beauty, thoughtfully made._\n\n` +
      (data.orderNumber ? `*Order Ref:* #${data.orderNumber}\n` : '') +
      `--------------------------------\n` +
      `*ORDER SUMMARY:*\n`;

    const itemsList = data.items
      .map((item, i) => `${i + 1}. *${item.product.name}* (${item.selectedSize})\n   Qty: ${item.quantity} × LKR ${item.product.price.toLocaleString()} = LKR ${(item.quantity * item.product.price).toLocaleString()}`)
      .join('\n\n');

    const pricing = `\n--------------------------------\n` +
      `Subtotal: LKR ${data.subtotal.toLocaleString()}\n` +
      (data.discount > 0 ? `Discount: -LKR ${data.discount.toLocaleString()}\n` : '') +
      `Shipping: LKR ${data.shipping.toLocaleString()}\n` +
      `*TOTAL: LKR ${data.total.toLocaleString()}*\n` +
      `--------------------------------\n`;

    const customerDetails = `*CUSTOMER DETAILS:*\n` +
      `Name: ${data.customerName}\n` +
      `Phone: ${data.customerPhone}\n` +
      `Email: ${data.customerEmail}\n\n` +
      `*DELIVERY DESTINATION:*\n` +
      `${data.address.street}${data.address.apartment ? `, ${data.address.apartment}` : ''}\n` +
      `${data.address.city}, ${data.address.district} (${data.address.postalCode})\n` +
      `Country: ${data.address.country}\n` +
      (data.notes ? `\nSpecial Instructions: ${data.notes}\n` : '') +
      `\n_Please confirm my order and send payment / dispatch details. Thank you!_`;

    return header + itemsList + pricing + customerDetails;
  }

  generateWhatsAppUrl(data: WhatsAppOrderData): string {
    const text = this.getFormattedMessage(data);
    const cleanedNumber = this.businessNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(text)}`;
  }

  getBusinessNumber(): string {
    return this.businessNumber;
  }
}

export const whatsappService = new WhatsAppService();
