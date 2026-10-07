import { CartItem, Address, OrderItem } from '@/types';

export interface WhatsAppItem {
  productName: string;
  size?: string;
  price: number;
  quantity: number;
}

export interface WhatsAppOrderData {
  orderNumber?: string;
  items: (CartItem | WhatsAppItem | OrderItem)[];
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
  private businessNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER ||
    process.env.WHATSAPP_BUSINESS_NUMBER ||
    '+94712621098';

  private normalizeItem(raw: CartItem | WhatsAppItem | OrderItem): WhatsAppItem {
    if ('product' in raw && raw.product) {
      return {
        productName: raw.product.name,
        size: raw.selectedSize || raw.product.size || 'Standard',
        price: raw.product.price,
        quantity: raw.quantity,
      };
    }
    return {
      productName: (raw as any).productName || (raw as any).name || 'Botanical Formula',
      size: (raw as any).size || (raw as any).selectedSize || 'Standard',
      price: (raw as any).price || 0,
      quantity: (raw as any).quantity || 1,
    };
  }

  /**
   * Generates a grouped concise summary string in the format:
   * "Radiance Botanical Serum — 50ml × 2, 30ml × 1; Hydrating Essence — Standard × 1"
   */
  getGroupedItemsSummary(items: (CartItem | WhatsAppItem | OrderItem)[]): string {
    const productGroups = new Map<string, Array<{ size: string; quantity: number }>>();

    items.forEach((raw) => {
      const item = this.normalizeItem(raw);
      const prodName = item.productName;
      const size = item.size || 'Standard';
      const qty = item.quantity;

      if (!productGroups.has(prodName)) {
        productGroups.set(prodName, []);
      }
      productGroups.get(prodName)!.push({ size, quantity: qty });
    });

    const groupStrings: string[] = [];
    productGroups.forEach((variants, prodName) => {
      const variantStr = variants.map((v) => `${v.size} × ${v.quantity}`).join(', ');
      groupStrings.push(`${prodName} — ${variantStr}`);
    });

    return groupStrings.join('; ');
  }

  /**
   * Formats the complete structured order message for WhatsApp
   */
  getFormattedMessage(data: WhatsAppOrderData): string {
    const orderRef = data.orderNumber ? `#${data.orderNumber}` : `#VL-${Date.now().toString().slice(-6)}`;
    const conciseSummary = this.getGroupedItemsSummary(data.items);

    const header = `*✨ RADIANCE ORDER INQUIRY & CONFIRMATION ✨*\n` +
      `_Beauty, thoughtfully made._\n\n` +
      `*Order Ref:* ${orderRef}\n` +
      `*Date:* ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}\n` +
      `----------------------------------------\n\n` +
      `*🛒 ORDER ITEMS SUMMARY:*\n` +
      `${conciseSummary}\n\n` +
      `*📦 DETAILED ITEM BREAKDOWN:*\n`;

    const itemsList = data.items
      .map((raw, i) => {
        const item = this.normalizeItem(raw);
        const itemTotal = (item.quantity * item.price).toLocaleString();
        const unitPrice = item.price.toLocaleString();
        const sizeLabel = item.size ? ` (${item.size})` : '';
        return `${i + 1}. *${item.productName}*${sizeLabel}\n   Qty: ${item.quantity} × LKR ${unitPrice} = LKR ${itemTotal}`;
      })
      .join('\n\n');

    const shippingText = data.shipping === 0 ? 'FREE (Complimentary)' : `LKR ${data.shipping.toLocaleString()}`;

    const pricing = `\n\n----------------------------------------\n` +
      `*💰 FINANCIAL SUMMARY:*\n` +
      `• Subtotal: LKR ${data.subtotal.toLocaleString()}\n` +
      (data.discount > 0 ? `• Privilege Discount: -LKR ${data.discount.toLocaleString()}\n` : '') +
      `• Islandwide Delivery: ${shippingText}\n` +
      `• *FINAL TOTAL: LKR ${data.total.toLocaleString()}*\n` +
      `• *Payment Mode:* Order via WhatsApp (Cash on Delivery / Direct Bank Transfer)\n` +
      `----------------------------------------\n\n`;

    const customerDetails = `*📍 CLIENT & DESTINATION DETAILS:*\n` +
      `• *Name:* ${data.customerName}\n` +
      `• *Phone:* ${data.customerPhone}\n` +
      `• *Email:* ${data.customerEmail}\n` +
      `• *Address:* ${data.address.street}${data.address.apartment ? `, ${data.address.apartment}` : ''}\n` +
      `• *City / District:* ${data.address.city}, ${data.address.district} (${data.address.postalCode || '00100'})\n` +
      `• *Country:* ${data.address.country || 'Sri Lanka'}\n` +
      (data.notes?.trim() ? `• *Special Notes:* ${data.notes.trim()}\n` : '') +
      `\n----------------------------------------\n` +
      `_Please confirm product availability and dispatch schedule. Thank you!_`;

    return header + itemsList + pricing + customerDetails;
  }

  /**
   * Generates the direct WhatsApp chat link
   */
  generateWhatsAppUrl(data: WhatsAppOrderData): string {
    const text = this.getFormattedMessage(data);
    const cleanedNumber = this.businessNumber.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(text)}`;
  }

  getBusinessNumber(): string {
    return this.businessNumber;
  }

  getCleanedBusinessNumber(): string {
    return this.businessNumber.replace(/[^0-9]/g, '');
  }

  getFormattedDisplayNumber(): string {
    const cleaned = this.getCleanedBusinessNumber();
    if (cleaned.startsWith('94') && cleaned.length === 11) {
      return `+94 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return this.businessNumber;
  }

  getDirectChatUrl(customText?: string): string {
    const cleanedNumber = this.getCleanedBusinessNumber();
    const textParam = customText ? `?text=${encodeURIComponent(customText)}` : '';
    return `https://wa.me/${cleanedNumber}${textParam}`;
  }
}

export const whatsappService = new WhatsAppService();
