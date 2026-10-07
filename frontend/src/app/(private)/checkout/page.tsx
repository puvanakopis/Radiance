'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, MessageSquare, Check, ArrowRight, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { paymentService } from '@/services/paymentService';
import { whatsappService } from '@/services/whatsappService';
import { orderService } from '@/services/orderService';
import { Address, PaymentMethod } from '@/types';

export default function CheckoutPage() {
  const { items, subtotal, discount, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 1: Customer Information
  const [firstName, setFirstName] = useState(user?.firstName || user?.name?.split(' ')?.[0] || '');
  const [lastName, setLastName] = useState(user?.lastName || user?.name?.split(' ')?.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const fullName = `${firstName} ${lastName}`.trim() || 'Valued Customer';

  // Step 2: Delivery Details
  const [street, setStreet] = useState(user?.addresses?.[0]?.street || '');
  const [apartment, setApartment] = useState(user?.addresses?.[0]?.apartment || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || 'Colombo');
  const [district, setDistrict] = useState(user?.addresses?.[0]?.district || 'Colombo');
  const [postalCode, setPostalCode] = useState(user?.addresses?.[0]?.postalCode || '00500');
  const [notes, setNotes] = useState('');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PayHere');

  if (items.length === 0) {
    return (
      <div className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-lg mx-auto space-y-4">
          <h2 className="font-serif text-2xl text-[#1A1A1A]">No items in checkout</h2>
          <p className="text-xs text-[#1A1A1A]/60">Your shopping bag is empty.</p>
          <Button variant="primary" onClick={() => router.push('/products')}>
            Return to Products
          </Button>
        </div>
      </div>
    );
  }

  const currentAddress: Address = {
    id: `addr-${Date.now()}`,
    label: 'Checkout Destination',
    recipientName: fullName,
    phone,
    street,
    apartment,
    city,
    district,
    postalCode,
    country: 'Sri Lanka',
    isDefault: true,
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email || !phone) {
      showToast({ type: 'error', title: 'Please fill in first name, last name, and contact details' });
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !district) {
      showToast({ type: 'error', title: 'Please provide full delivery address' });
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalizeOrder = async () => {
    setIsProcessing(true);
    try {
      if (paymentMethod === 'PayHere') {
        const payResult = await paymentService.processPayHerePayment({
          orderId: `VL-${Date.now()}`,
          items: items.map(i => `${i.product.name} (${i.quantity})`).join(', '),
          amount: total,
          currency: 'LKR',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email,
          phone,
          address: street,
          city,
          country: 'Sri Lanka',
        });

        if (!payResult.success) {
          showToast({ type: 'error', title: 'Payment Failed', message: payResult.error });
          setIsProcessing(false);
          return;
        }

        const createdOrder = await orderService.createOrder({
          customer: {
            id: user?.id || `cust-${Date.now()}`,
            name: fullName,
            email,
            phone,
          },
          deliveryAddress: currentAddress,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            size: item.selectedSize,
            price: item.product.price,
            quantity: item.quantity,
            sku: item.product.id,
          })),
          subtotal,
          discount,
          shipping,
          total,
          status: 'Confirmed',
          paymentMethod: 'PayHere',
          paymentStatus: 'Paid',
          paymentReference: payResult.transactionId,
          notes,
        });

        clearCart();
        router.push(`/order-success/${createdOrder.id}`);
      } else if (paymentMethod === 'WhatsApp') {
        const createdOrder = await orderService.createOrder({
          customer: {
            id: user?.id || `cust-${Date.now()}`,
            name: fullName,
            email,
            phone,
          },
          deliveryAddress: currentAddress,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            productImage: item.product.image,
            size: item.selectedSize,
            price: item.product.price,
            quantity: item.quantity,
            sku: item.product.id,
          })),
          subtotal,
          discount,
          shipping,
          total,
          status: 'Placed',
          paymentMethod: 'WhatsApp',
          paymentStatus: 'Awaiting WhatsApp Confirmation',
          notes,
        });

        // Launch WhatsApp link
        const whatsappUrl = whatsappService.generateWhatsAppUrl({
          orderNumber: createdOrder.orderNumber,
          items,
          subtotal,
          discount,
          shipping,
          total,
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          address: currentAddress,
          notes,
        });

        clearCart();
        window.open(whatsappUrl, '_blank');
        router.push(`/order-success/${createdOrder.id}`);
      }
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', title: 'Order Placement Error', message: 'Please retry or choose another payment method.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
      <Breadcrumbs
        items={[
          { label: 'Bag', href: '/cart' },
          { label: 'Checkout' },
        ]}
      />

      {/* Stepper Header */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pb-4 border-b border-[#1A1A1A]/10">
        {[
          { num: 1, title: 'Information' },
          { num: 2, title: 'Delivery' },
          { num: 3, title: 'Payment' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                step === s.num
                  ? 'bg-[#1A1A1A] text-[#FAF8F5]'
                  : step > s.num
                  ? 'bg-[#8A9A86] text-white'
                  : 'bg-[#EAE3D9]/60 text-[#1A1A1A]/60'
              }`}
            >
              {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
            </div>
            <span
              className={`text-xs uppercase tracking-wider hidden sm:inline ${
                step === s.num ? 'font-semibold text-[#1A1A1A]' : 'text-[#1A1A1A]/50'
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Main Form & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Step Forms */}
        <div className="lg:col-span-7 bg-white border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* STEP 1: CUSTOMER INFO */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h2 className="font-serif text-2xl text-[#1A1A1A]">1. Customer Information</h2>
              <p className="text-xs text-[#1A1A1A]/60">
                Provide your contact details for order tracking notifications.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Puvanakopis"
                  />
                  <Input
                    label="Last Name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. S."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                  />
                  <Input
                    label="Phone Number (SMS / WhatsApp)"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" variant="primary" size="lg" icon={ArrowRight}>
                  Continue to Delivery
                </Button>
              </div>
            </form>
          )}

          {/* STEP 2: DELIVERY ADDRESS */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-[#1A1A1A]">2. Delivery Address</h2>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] underline"
                >
                  Edit Info
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Street Address"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 42 Lotus Road, Havelock Town"
                />
                <Input
                  label="Apartment, Suite, Unit (Optional)"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="e.g. Apt 4B"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Colombo"
                  />
                  <Input
                    label="District / Province"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Western Province"
                  />
                  <Input
                    label="Postal Code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="00500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-[0.12em] text-[#1A1A1A]/70">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Leave with building security or call upon arrival"
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-xl p-3.5 text-xs text-[#1A1A1A] placeholder:text-[#1A1A1A]/35 outline-none focus:border-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <Button type="submit" variant="primary" size="lg" icon={ArrowRight}>
                  Continue to Payment
                </Button>
              </div>
            </form>
          )}

          {/* STEP 3: PAYMENT METHOD */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl text-[#1A1A1A]">3. Payment & Confirmation</h2>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-[#1A1A1A]/60 hover:text-[#1A1A1A] underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Select Options */}
              <div className="space-y-3">
                {/* PayHere Card */}
                <label
                  onClick={() => setPaymentMethod('PayHere')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'PayHere'
                      ? 'border-[#1A1A1A] bg-[#FAF8F5]'
                      : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'PayHere'}
                    onChange={() => setPaymentMethod('PayHere')}
                    className="mt-1 text-[#1A1A1A] focus:ring-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                        PayHere Secure Gateway
                      </span>
                      <CreditCard className="w-5 h-5 text-[#1A1A1A]/70" />
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                      Instant online checkout via Visa, MasterCard, AMEX, Genie, FriMi, and LankaQR.
                    </p>
                  </div>
                </label>

                {/* WhatsApp Order Card */}
                <label
                  onClick={() => setPaymentMethod('WhatsApp')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === 'WhatsApp'
                      ? 'border-[#25D366] bg-[#25D366]/5'
                      : 'border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'WhatsApp'}
                    onChange={() => setPaymentMethod('WhatsApp')}
                    className="mt-1 text-[#25D366] focus:ring-0"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-semibold text-[#1A1A1A]">
                        Order via WhatsApp Concierge
                      </span>
                      <MessageSquare className="w-5 h-5 text-[#25D366]" />
                    </div>
                    <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                      Prefer personal concierge service? Your order and shipping details will be pre-formatted for direct WhatsApp confirmation.
                    </p>
                  </div>
                </label>
              </div>

              {/* WhatsApp Message Preview Box if selected */}
              {paymentMethod === 'WhatsApp' && (
                <div className="p-4 rounded-2xl bg-[#EAE3D9]/50 border border-[#1A1A1A]/10 text-xs space-y-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] text-[#C87D55] block">
                    Message Preview
                  </span>
                  <p className="font-mono text-[11px] text-[#1A1A1A]/80 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto p-2 bg-white/60 rounded-xl">
                    {whatsappService.getFormattedMessage({
                      items,
                      subtotal,
                      discount,
                      shipping,
                      total,
                      customerName: fullName,
                      customerPhone: phone,
                      customerEmail: email,
                      address: currentAddress,
                      notes,
                    })}
                  </p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs uppercase tracking-wider text-[#1A1A1A]/70 hover:text-[#1A1A1A] flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <Button
                  variant={paymentMethod === 'WhatsApp' ? 'whatsapp' : 'primary'}
                  size="lg"
                  isLoading={isProcessing}
                  onClick={handleFinalizeOrder}
                >
                  {paymentMethod === 'WhatsApp'
                    ? 'Send Order via WhatsApp'
                    : `Complete Order • LKR ${total.toLocaleString()}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#1A1A1A]/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="font-serif text-xl text-[#1A1A1A]">Order Breakdown</h3>

            <div className="divide-y divide-[#1A1A1A]/10 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-14 object-cover rounded-xl bg-[#EAE3D9]/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xs font-medium text-[#1A1A1A] truncate">
                      {item.product.name}
                    </p>
                    <span className="text-[10px] text-[#1A1A1A]/50 block">
                      {item.selectedSize} × {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#1A1A1A]">
                    LKR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 text-xs border-t border-[#1A1A1A]/10 pt-4">
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Subtotal</span>
                <span>LKR {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#8A9A86] font-medium">
                  <span>Discount</span>
                  <span>-LKR {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#1A1A1A]/70">
                <span>Delivery</span>
                <span>LKR {shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-semibold text-[#1A1A1A] border-t border-[#1A1A1A]/10 pt-3">
                <span>Total Amount</span>
                <span>LKR {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-[#1A1A1A]/50">
              <Lock className="w-3.5 h-3.5 text-[#8A9A86]" />
              <span>TLS / SSL Secured Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
